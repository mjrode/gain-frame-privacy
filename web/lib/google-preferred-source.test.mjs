import assert from "node:assert/strict";
import test from "node:test";
import {
  initializePreferredSource,
  openPreferredSource,
  PREFERRED_SOURCE_URL,
} from "./google-preferred-source.ts";

function browserFixture(t, hostname = "gainframe.app") {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const scripts = [];
  const navigations = [];
  const calls = [];
  const source = {
    init: (options) => calls.push(["init", options]),
    addPreferredSource: () => calls.push(["open"]),
  };
  globalThis.window = {
    location: { hostname, assign: (url) => navigations.push(url) },
  };
  globalThis.document = {
    getElementById: (id) => scripts.find((script) => script.id === id),
    createElement: () => Object.assign(new EventTarget(), {
      dataset: {},
      attributes: {},
      setAttribute(name, value) { this.attributes[name] = value; },
    }),
    head: { appendChild: (script) => scripts.push(script) },
  };
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  });
  return {
    scripts, navigations, calls,
    ready() {
      const queue = window.PREFERRED_SOURCE;
      window.PREFERRED_SOURCE = { push: (callback) => callback(source) };
      for (const callback of queue) callback(source);
    },
  };
}

test("server rendering does not require browser globals", () => {
  assert.doesNotThrow(initializePreferredSource);
  assert.equal(openPreferredSource(), false);
});

test("multiple placements and remounts load one async manual-mode script", (t) => {
  const fixture = browserFixture(t);
  initializePreferredSource();
  initializePreferredSource();
  assert.equal(fixture.scripts.length, 1);
  assert.equal(fixture.scripts[0].async, true);
  assert.equal(fixture.scripts[0].attributes["preferred-sources-control"], "manual");
  assert.equal(fixture.scripts[0].src, "https://news.google.com/swg/js/v1/publisher.js");
  assert.deepEqual(fixture.calls, []);
  fixture.ready();
  assert.deepEqual(fixture.calls, [
    ["init", { theme: "light", lang: "en" }],
    ["init", { theme: "light", lang: "en" }],
  ]);
  initializePreferredSource();
  assert.equal(fixture.scripts.length, 1);
  assert.equal(fixture.calls.length, 3);
});

test("an early click is replayed once, after initialization", (t) => {
  const fixture = browserFixture(t);
  assert.equal(openPreferredSource(), true);
  assert.deepEqual(fixture.calls, []);
  fixture.ready();
  assert.deepEqual(fixture.calls, [
    ["init", { theme: "light", lang: "en" }], ["open"],
  ]);
  assert.equal(openPreferredSource(), true);
  assert.equal(fixture.calls.filter(([name]) => name === "open").length, 2);
  assert.deepEqual(fixture.navigations, []);
});

test("a load failure after an early click follows the deeplink", (t) => {
  const fixture = browserFixture(t);
  openPreferredSource();
  fixture.scripts[0].dispatchEvent(new Event("error"));
  assert.deepEqual(fixture.navigations, [PREFERRED_SOURCE_URL]);
  assert.equal(openPreferredSource(), false);
  assert.equal(fixture.scripts.length, 1);
});

test("a blocked script leaves the link usable without opening anything automatically", (t) => {
  const fixture = browserFixture(t);
  initializePreferredSource();
  fixture.scripts[0].dispatchEvent(new Event("error"));
  assert.deepEqual(fixture.navigations, []);
  assert.equal(openPreferredSource(), false);
});

test("local and preview links always select the production domain", (t) => {
  const fixture = browserFixture(t, "localhost");
  initializePreferredSource();
  assert.equal(openPreferredSource(), false);
  assert.deepEqual(fixture.scripts, []);
  assert.equal(PREFERRED_SOURCE_URL, "https://www.google.com/preferences/source?q=gainframe.app");
});
