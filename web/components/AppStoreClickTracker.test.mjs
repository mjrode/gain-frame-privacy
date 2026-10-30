import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { isGainFrameDownloadUrl } from "../lib/web-attribution.ts";

const source = readFileSync(new URL("./AppStoreClickTracker.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});
const listing = "https://apps.apple.com/us/app/gainframe-gym-progress-photos/id6759252082";
const attributedLink = "https://go.gainframe.app/WufP?web_click_id=test-click";

function trackerFixture() {
  const events = [];
  const builds = [];
  const acquisitionReads = [];
  let clickHandler;
  const imports = {
    react: { useEffect: (effect) => effect() },
    "@/lib/analytics": {
      track: (name, properties) => events.push({ name, properties }),
      trackOncePerDay: (name, properties, key) => events.push({ name, properties, key }),
    },
    "@/lib/site": { campaignForPath: () => "web-home" },
    "@/lib/web-attribution": {
      isGainFrameDownloadUrl,
      rememberAcquisitionParams: (search) => acquisitionReads.push(search),
      buildWebAttributionLink: (options) => {
        builds.push(options);
        return { href: attributedLink, payload: { web_click_id: "test-click" } };
      },
    },
    "@/lib/download-cta-context": { describeDownloadCta: () => "Homepage download" },
    "@/lib/article-assistance": { getArticleAssistanceProperties: () => ({}) },
  };
  const module = { exports: {} };
  runInNewContext(outputText, {
    exports: module.exports,
    require(name) {
      assert.ok(name in imports, `Unexpected tracker dependency: ${name}`);
      return imports[name];
    },
    window: { location: { pathname: "/", search: "?utm_source=campaign", origin: "https://gainframe.app" } },
    document: {
      addEventListener(name, handler, capture) {
        assert.equal(name, "click");
        assert.equal(capture, true);
        clickHandler = handler;
      },
    },
  });
  assert.equal(module.exports.default(), null);
  return { events, builds, acquisitionReads, click: (target) => clickHandler({ target }) };
}

function anchorFixture(attributes = {}, href = listing) {
  return {
    href,
    textContent: "Download GainFrame",
    classList: { contains: () => false },
    closest(selector) { return selector === "a[href]" ? this : null; },
    getAttribute(name) { return attributes[name] ?? null; },
    hasAttribute(name) { return Object.hasOwn(attributes, name); },
    querySelector() { return null; },
  };
}

test("rating and review links retain their public destination and skip download events", () => {
  const fixture = trackerFixture();
  for (const href of [listing, `${listing}?see-all=reviews`]) {
    const anchor = anchorFixture({ "data-app-store-intent": "reviews" }, href);
    fixture.click(anchor);
    fixture.click({ closest: () => anchor }); // A nested star or review label.
    assert.equal(anchor.href, href);
  }
  assert.deepEqual(fixture.events, []);
  assert.deepEqual(fixture.builds, []);
  assert.equal(fixture.acquisitionReads.length, 1, "only mount remembers acquisition, not review clicks");
});

test("ordinary download links still receive attribution and both existing click events", () => {
  const fixture = trackerFixture();
  const anchor = anchorFixture({ "data-cta-content": "homepage_hero" });
  fixture.click(anchor);
  assert.equal(anchor.href, attributedLink);
  assert.equal(fixture.builds.length, 1);
  assert.equal(fixture.builds[0].campaign, "web-home");
  assert.equal(fixture.builds[0].cta, "homepage_hero");
  assert.deepEqual(fixture.events.map(({ name }) => name), ["web_download_clicked", "outbound_app_store_click"]);
  assert.equal(fixture.events[0].properties.web_click_id, "test-click");
  assert.equal(fixture.events[1].key, "/:homepage_hero:none");
  assert.equal(fixture.acquisitionReads.length, 2);
});

test("legacy track exemption still rewrites the link and only skips the legacy event", () => {
  const fixture = trackerFixture();
  const anchor = anchorFixture({ "data-track-exempt": "" });
  fixture.click(anchor);
  assert.equal(anchor.href, attributedLink);
  assert.equal(fixture.builds.length, 1);
  assert.deepEqual(fixture.events.map(({ name }) => name), ["web_download_clicked"]);
  assert.equal(fixture.acquisitionReads.length, 2);
});
