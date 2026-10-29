import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

import {
  ARTICLE_ASSISTANCE_TTL_MS,
  getArticleAssistanceProperties,
  parseArticleAssistance,
  rememberArticleAssistance,
} from "./article-assistance.ts";

const NOW = Date.parse("2026-10-29T17:30:00.000Z");
const assistance = {
  article_slug: "average-bicep-size",
  journey_intent: "progress",
  destination_kind: "tool",
  destination_path: "/tools/progress-photo-compare/",
  placement: "after_chart",
  rollout: "measurement_v1",
  clicked_at_ms: NOW,
};

function browserFixture(t, sessionStorage) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const values = new Map();
  const browser = {
    location: {
      origin: "https://gainframe.app",
      pathname: "/blog/average-bicep-size/",
    },
    sessionStorage: sessionStorage ?? {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true, writable: true, value: browser,
  });
  t.mock.method(Date, "now", () => NOW);
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else delete globalThis.window;
  });
  return { browser, values };
}

test("article assistance accepts tool and guide journeys and strips extra fields", () => {
  assert.deepEqual(parseArticleAssistance({
    ...assistance,
    photo: "private-photo-data",
    measurement: 34,
    query: "?email=private@example.com",
  }, NOW), assistance);
  const guide = {
    ...assistance,
    journey_intent: "proportions",
    destination_kind: "guide",
    destination_path: "/blog/best-body-scanning-measurement-apps/",
    placement: "after_answer",
  };
  assert.deepEqual(parseArticleAssistance(guide, NOW), guide);
});

test("article assistance expires at 30 minutes and rejects future or invalid dates", () => {
  assert.equal(ARTICLE_ASSISTANCE_TTL_MS, 30 * 60 * 1000);
  assert.ok(parseArticleAssistance(assistance, NOW + ARTICLE_ASSISTANCE_TTL_MS - 1));
  assert.equal(parseArticleAssistance(assistance, NOW + ARTICLE_ASSISTANCE_TTL_MS), null);
  assert.equal(parseArticleAssistance(assistance, NOW + ARTICLE_ASSISTANCE_TTL_MS + 1), null);
  for (const clicked_at_ms of [NOW + 1, NaN, Infinity, -Infinity, "2026-10-29"]) {
    assert.equal(parseArticleAssistance({ ...assistance, clicked_at_ms }, NOW), null);
  }
});

test("article assistance rejects unsafe paths, undeclared identifiers and mismatched destinations", () => {
  for (const article_slug of ["", "a".repeat(121), "../../private", "Person@example.com", "average?email=person"]) {
    assert.equal(parseArticleAssistance({ ...assistance, article_slug }, NOW), null);
  }
  for (const destination_path of [
    "https://other.example/tools/body-fat-from-photo/",
    "//other.example/tools/body-fat-from-photo/",
    "/tools/body-fat-from-photo/?photo=private",
    "/tools/body-fat-from-photo/#private",
    "/tools/../private/",
    "/tools/Photo/",
    "/tools/a/b/",
    "/blog/best-free-progress-photo-apps/",
  ]) {
    assert.equal(parseArticleAssistance({ ...assistance, destination_path }, NOW), null);
  }
  assert.equal(parseArticleAssistance({ ...assistance, destination_kind: "guide" }, NOW), null);
  assert.equal(parseArticleAssistance({ ...assistance, rollout: "unreleased" }, NOW), null);
  assert.equal(parseArticleAssistance({ ...assistance, placement: "footer" }, NOW), null);
  assert.equal(parseArticleAssistance({ ...assistance, journey_intent: "unknown" }, NOW), null);
});

test("malformed assistance fails closed without coercing enums into strings", () => {
  for (const value of [null, undefined, false, 42, "json", [], {}]) {
    assert.equal(parseArticleAssistance(value, NOW), null);
  }
  for (const key of ["journey_intent", "destination_kind", "placement"]) {
    for (const value of [[assistance[key]], { toString: () => assistance[key] }, {
      toString() { throw new Error("Must not coerce untrusted values"); },
    }]) {
      assert.equal(parseArticleAssistance({ ...assistance, [key]: value }, NOW), null);
    }
  }
});

test("stored assistance returns a safe analytics snapshot and follows the last explicit click", (t) => {
  const { values } = browserFixture(t);
  rememberArticleAssistance({ ...assistance, photo: "private-photo-data" });
  assert.equal(values.size, 1);
  assert.deepEqual(JSON.parse([...values.values()][0]), assistance);
  assert.deepEqual(getArticleAssistanceProperties(), {
    assisted_article: "average-bicep-size",
    assisted_intent: "progress",
    assisted_destination_kind: "tool",
    assisted_destination_path: "/tools/progress-photo-compare/",
    assisted_placement: "after_chart",
    assisted_rollout: "measurement_v1",
    assisted_clicked_at: "2026-10-29T17:30:00.000Z",
  });

  rememberArticleAssistance({
    ...assistance,
    article_slug: "average-waist-size-men",
    journey_intent: "body-fat",
    destination_path: "/tools/body-fat-from-photo/",
    placement: "after_answer",
  });
  assert.equal(values.size, 1);
  assert.equal(getArticleAssistanceProperties().assisted_article, "average-waist-size-men");
  assert.equal(getArticleAssistanceProperties().assisted_intent, "body-fat");
});

test("expired or malformed storage never contributes assisted attribution", (t) => {
  let raw = null;
  browserFixture(t, { getItem: () => raw, setItem() {} });
  for (const stored of [null, "{bad json", "null", "[]", JSON.stringify({
    ...assistance, clicked_at_ms: NOW - ARTICLE_ASSISTANCE_TTL_MS,
  }), JSON.stringify({ ...assistance, destination_path: "/tools/a/?private=1" })]) {
    raw = stored;
    assert.deepEqual(getArticleAssistanceProperties(), {});
  }
});

test("blocked storage cannot break navigation or create assisted metadata", (t) => {
  const { browser } = browserFixture(t, {
    setItem() { throw new Error("Storage blocked"); },
    getItem() { throw new Error("Storage blocked"); },
  });
  assert.doesNotThrow(() => rememberArticleAssistance(assistance));
  assert.deepEqual(getArticleAssistanceProperties(), {});
  Object.defineProperty(browser, "sessionStorage", {
    get() { throw new Error("Storage access blocked"); },
  });
  assert.doesNotThrow(() => rememberArticleAssistance(assistance));
  assert.deepEqual(getArticleAssistanceProperties(), {});
});

test("invalid new records do not overwrite valid assistance, and server reads stay empty", (t) => {
  browserFixture(t);
  rememberArticleAssistance(assistance);
  rememberArticleAssistance({ ...assistance, article_slug: "invalid/slug" });
  assert.equal(getArticleAssistanceProperties().assisted_article, assistance.article_slug);
  delete globalThis.window;
  assert.deepEqual(getArticleAssistanceProperties(), {});
  assert.doesNotThrow(() => rememberArticleAssistance(assistance));
});

function trackerFixture(t, sessionStorage) {
  const { browser } = browserFixture(t, sessionStorage);
  const listeners = new Map();
  const events = [];
  let cleanup;
  const source = readFileSync(new URL("../components/ArticleJourneyTracker.tsx", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const imports = {
    react: { useEffect: (effect) => { cleanup = effect(); } },
    "@/lib/analytics": {
      getWebAnalyticsContext: () => ({ current_path: browser.location.pathname, session_id: "session-test" }),
      track: (name, properties) => events.push([name, structuredClone(properties)]),
    },
    "@/lib/article-assistance": { parseArticleAssistance, rememberArticleAssistance },
  };
  const module = { exports: {} };
  runInNewContext(outputText, {
    exports: module.exports,
    require(name) {
      assert.ok(name in imports, `Unexpected tracker dependency: ${name}`);
      return imports[name];
    },
    Date,
    window: browser,
    document: {
      addEventListener(name, callback, capture) { listeners.set(name, { callback, capture }); },
      removeEventListener(name, callback) {
        if (listeners.get(name)?.callback === callback) listeners.delete(name);
      },
    },
  });
  module.exports.default();
  t.after(() => cleanup?.());
  const anchor = {
    origin: browser.location.origin,
    pathname: assistance.destination_path,
    dataset: {
      articleSlug: assistance.article_slug,
      journeyIntent: assistance.journey_intent,
      destinationKind: assistance.destination_kind,
      placement: assistance.placement,
      articleNextStep: assistance.rollout,
    },
  };
  return {
    browser, anchor, events, listeners,
    cleanup: () => cleanup(),
    click({ type = "click", button = 0, target = { closest: () => anchor } } = {}) {
      listeners.get(type)?.callback({ type, button, target });
    },
  };
}

test("editorial link clicks record their origin and preserve assistance for downstream events", (t) => {
  const f = trackerFixture(t);
  f.click();
  assert.deepEqual(f.events, [["article_next_step_clicked", {
    current_path: "/blog/average-bicep-size/",
    session_id: "session-test",
    ...assistance,
  }]]);
  assert.equal(getArticleAssistanceProperties().assisted_article, assistance.article_slug);
  assert.equal(f.listeners.get("click").capture, true);
  f.cleanup();
  assert.equal(f.listeners.size, 0);
});

test("delegated tracking ignores external, mismatched, undeclared and right-button links", (t) => {
  const f = trackerFixture(t);
  f.click({ type: "auxclick", button: 2 });
  f.click({ target: null });
  f.click({ target: {} });
  f.click({ target: { closest: () => null } });
  f.anchor.origin = "https://other.example";
  f.click();
  f.anchor.origin = f.browser.location.origin;
  f.browser.location.pathname = "/blog/different-article/";
  f.click();
  f.browser.location.pathname = "/blog/average-bicep-size/";
  f.anchor.dataset.articleNextStep = "unreleased";
  f.click();
  assert.deepEqual(f.events, []);
  assert.deepEqual(getArticleAssistanceProperties(), {});
});

test("middle-click records the intent, including when optional storage is unavailable", (t) => {
  const f = trackerFixture(t, {
    setItem() { throw new Error("Storage blocked"); },
    getItem() { throw new Error("Storage blocked"); },
  });
  f.click({ type: "auxclick", button: 1 });
  assert.equal(f.events.length, 1);
  assert.equal(f.events[0][0], "article_next_step_clicked");
  assert.equal(f.events[0][1].article_slug, assistance.article_slug);
  assert.deepEqual(getArticleAssistanceProperties(), {});
});
