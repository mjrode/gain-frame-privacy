import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BODY_FAT_CTA_CONTENT,
  bodyFatBridgeCtaElement,
  createBodyFatBridgeAnalytics,
  emitBodyFatBridgeEvent,
} from "./body-fat-bridge-analytics.ts";
import { clearQueuedAnalyticsEvents, flushQueuedAnalyticsEvents } from "./analytics.ts";

function replaceGlobal(t, name, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete globalThis[name];
  });
}

function observationFixture() {
  const observations = [];
  const events = [];
  return {
    observations,
    events,
    observe(element, callback) {
      const observation = { element, callback, stopped: false };
      observations.push(observation);
      return () => { observation.stopped = true; };
    },
    emit(...args) {
      events.push(args);
      return false; // Delivery being queued must not permit duplicate reach events.
    },
  };
}

test("qualified reach records each bridge element once, even after delivery queues and refs remount", () => {
  const f = observationFixture();
  const analytics = createBodyFatBridgeAnalytics("ios", f.emit, f.observe);
  for (const [element, ref] of Object.entries(analytics.refs)) {
    const node = { element };
    ref(node);
    const observation = f.observations.at(-1);
    assert.equal(observation.element, node);
    observation.callback();
    observation.callback();
    ref(null);
    assert.equal(observation.stopped, true);
    ref({ element, remounted: true });
  }

  assert.equal(f.observations.length, 4, "seen elements are not observed again on remount");
  assert.deepEqual(f.events.map(([event, properties]) => [event, properties.element]), [
    ["body_fat_bridge_viewed", "main_cta"],
    ["body_fat_bridge_viewed", "walkthrough"],
    ["body_fat_bridge_viewed", "result_cta"],
    ["body_fat_bridge_viewed", "video"],
  ]);
  for (const [, properties] of f.events) {
    assert.equal(properties.tool, "bf_from_photo");
    assert.equal(properties.campaign, "seo-physique-cpp-v1");
    assert.equal(properties.bridge_version, "analysis_walkthrough_v1");
    assert.equal(properties.platform, "ios");
    assert.equal(properties.visibility_ratio, 0.5);
    assert.equal(properties.visible_ms, 1000);
    assert.equal(properties.cta_content, undefined, "reach and click metadata stay distinct");
  }

  const nextPage = createBodyFatBridgeAnalytics("ios", f.emit, f.observe);
  nextPage.refs.walkthrough({});
  f.observations.at(-1).callback();
  assert.equal(f.events.length, 5, "a new page controller can record a new visit");
});

test("detaching or replacing an unqualified ref cleans up observation and permits a fresh exposure", () => {
  const f = observationFixture();
  const analytics = createBodyFatBridgeAnalytics("desktop", f.emit, f.observe);
  analytics.refs.video({ version: 1 });
  analytics.refs.video(null);
  assert.equal(f.observations[0].stopped, true);
  assert.deepEqual(f.events, []);

  analytics.refs.video({ version: 2 });
  analytics.refs.video({ version: 3 });
  assert.equal(f.observations[1].stopped, true);
  assert.equal(f.observations[2].stopped, false);
  f.observations[2].callback();
  assert.equal(f.events.length, 1);
  assert.equal(f.events[0][1].element, "video");
  assert.equal(f.events[0][1].platform, "desktop");
  analytics.refs.video(null);
  assert.equal(f.observations[2].stopped, true);
});

test("unknown platforms wait, while Android records content reach without unavailable CTA impressions", () => {
  for (const [platform, expectedElements] of [
    ["unknown", []],
    ["android", ["walkthrough", "video"]],
  ]) {
    const f = observationFixture();
    const analytics = createBodyFatBridgeAnalytics(platform, f.emit, f.observe);
    Object.values(analytics.refs).forEach((ref) => ref({}));
    f.observations.forEach(({ callback }) => callback());
    assert.equal(f.observations.length, expectedElements.length, platform);
    assert.deepEqual(f.events.map(([, props]) => props.element), expectedElements, platform);
    assert.ok(f.events.every(([, props]) => props.platform === platform));
  }
});

class FakeElement {
  constructor({ content = null, anchor = null } = {}) {
    this.content = content;
    this.anchor = anchor;
  }
  closest(selector) {
    assert.equal(selector, "a[data-cta-content]");
    return this.anchor ?? (this.content === null ? null : this);
  }
  getAttribute(name) {
    assert.equal(name, "data-cta-content");
    return this.content;
  }
}

test("both analysis buttons have exact placement identities, excluding unrelated or modified link content", () => {
  assert.equal(bodyFatBridgeCtaElement("body_fat_analysis_walkthrough_v1_main"), "main_cta");
  assert.equal(bodyFatBridgeCtaElement("body_fat_analysis_walkthrough_v1_result"), "result_cta");
  for (const content of [
    null, "", "cta_primary", "future_you_walkthrough_result",
    "body_fat_analysis_preview_result",
    "body_fat_analysis_preview_walkthrough",
    "body_fat_analysis_walkthrough_v1_main_android_tool",
    "body_fat_analysis_walkthrough_v1_result_other",
    "BODY_FAT_ANALYSIS_WALKTHROUGH_V1_MAIN",
    " body_fat_analysis_walkthrough_v1_main",
  ]) {
    assert.equal(bodyFatBridgeCtaElement(content), null, String(content));
  }
});

test("nested button clicks identify main versus result and count repeated intentional clicks", (t) => {
  replaceGlobal(t, "Element", FakeElement);
  const f = observationFixture();
  const analytics = createBodyFatBridgeAnalytics("desktop", f.emit, f.observe);
  const main = new FakeElement({ content: BODY_FAT_CTA_CONTENT.main_cta });
  const result = new FakeElement({ content: BODY_FAT_CTA_CONTENT.result_cta });
  analytics.onClick({ target: new FakeElement({ anchor: main }) });
  analytics.onClick({ target: new FakeElement({ anchor: result }) });
  analytics.onClick({ target: main });

  assert.deepEqual(f.events.map(([event, props]) => [event, props.element, props.cta_content]), [
    ["body_fat_bridge_cta_clicked", "main_cta", "body_fat_analysis_walkthrough_v1_main"],
    ["body_fat_bridge_cta_clicked", "result_cta", "body_fat_analysis_walkthrough_v1_result"],
    ["body_fat_bridge_cta_clicked", "main_cta", "body_fat_analysis_walkthrough_v1_main"],
  ]);
  for (const [, props] of f.events) {
    assert.equal(props.tool, "bf_from_photo");
    assert.equal(props.campaign, "seo-physique-cpp-v1");
    assert.equal(props.bridge_version, "analysis_walkthrough_v1");
    assert.equal(props.platform, "desktop");
    assert.equal(props.visible_ms, undefined);
  }
  assert.equal(f.observations.length, 0, "clicks do not invent reach events");
});

test("See-how, screenshot, video links, and unrelated CTAs do not count as analysis button clicks", (t) => {
  replaceGlobal(t, "Element", FakeElement);
  const f = observationFixture();
  const analytics = createBodyFatBridgeAnalytics("ios", f.emit, f.observe);
  for (const target of [
    null,
    {},
    new FakeElement(), // Section, screenshot, and video links have no CTA content.
    new FakeElement({ anchor: new FakeElement() }),
    new FakeElement({ content: "cta_primary" }),
    new FakeElement({ content: "future_you_walkthrough_result" }),
    new FakeElement({ content: `${BODY_FAT_CTA_CONTENT.main_cta}_android_tool` }),
  ]) {
    analytics.onClick({ target });
  }
  assert.deepEqual(f.events, []);
});

test("unknown and Android platforms never record analysis button clicks", (t) => {
  replaceGlobal(t, "Element", FakeElement);
  for (const platform of ["unknown", "android"]) {
    const f = observationFixture();
    const analytics = createBodyFatBridgeAnalytics(platform, f.emit, f.observe);
    for (const content of Object.values(BODY_FAT_CTA_CONTENT)) {
      analytics.onClick({ target: new FakeElement({ content }) });
    }
    assert.deepEqual(f.events, [], platform);
  }
});

function deliveryFixture(t, hostname) {
  const ga = [];
  const posthog = [];
  const debug = [];
  clearQueuedAnalyticsEvents();
  t.after(clearQueuedAnalyticsEvents);
  replaceGlobal(t, "window", {
    location: { hostname },
    gtag: (...args) => ga.push(args),
    posthog: { capture: (...args) => posthog.push(args) },
  });
  const previousDebug = console.debug;
  console.debug = (...args) => debug.push(args);
  t.after(() => { console.debug = previousDebug; });
  return { ga, posthog, debug };
}

for (const hostname of ["localhost", "127.0.0.1", "::1", "[::1]"]) {
  test(`${hostname} logs preview events without sending or leaving live events queued`, (t) => {
    const f = deliveryFixture(t, hostname);
    emitBodyFatBridgeEvent("body_fat_bridge_viewed", { element: "video", preview_only: false });
    assert.equal(f.debug.length, 1);
    assert.equal(f.debug[0][0], "[Body Fat app bridge]");
    assert.deepEqual(JSON.parse(f.debug[0][1]), {
      event: "body_fat_bridge_viewed", element: "video", preview_only: true,
    });
    assert.deepEqual(f.ga, []);
    assert.deepEqual(f.posthog, []);
    window.location.hostname = "gainframe.app";
    assert.equal(flushQueuedAnalyticsEvents(), 0, "local events must not leak on later production flush");
    assert.deepEqual(f.ga, []);
    assert.deepEqual(f.posthog, []);
  });
}

for (const hostname of ["gainframe.app", "www.gainframe.app"]) {
  test(`${hostname} sends one event per provider when explicitly invoked`, (t) => {
    const f = deliveryFixture(t, hostname);
    emitBodyFatBridgeEvent("body_fat_bridge_cta_clicked", { element: "result_cta", preview_only: true });
    const props = { element: "result_cta", preview_only: false };
    assert.deepEqual(f.ga, [["event", "body_fat_bridge_cta_clicked", props]]);
    assert.deepEqual(f.posthog, [["body_fat_bridge_cta_clicked", props]]);
    assert.deepEqual(f.debug, []);
    assert.equal(flushQueuedAnalyticsEvents(), 0);
    assert.equal(f.ga.length, 1);
    assert.equal(f.posthog.length, 1);
  });
}

for (const hostname of ["preview.gainframe.app", "localhost.example.com", "gainframe.app.example.com", "0.0.0.0"]) {
  test(`unsupported host ${hostname} is ignored even when analytics SDKs exist`, (t) => {
    const f = deliveryFixture(t, hostname);
    emitBodyFatBridgeEvent("body_fat_bridge_viewed", { element: "walkthrough" });
    assert.deepEqual(f.ga, []);
    assert.deepEqual(f.posthog, []);
    assert.deepEqual(f.debug, []);
    window.location.hostname = "gainframe.app";
    assert.equal(flushQueuedAnalyticsEvents(), 0);
    assert.deepEqual(f.ga, []);
    assert.deepEqual(f.posthog, []);
  });
}

test("server rendering does not emit bridge analytics", (t) => {
  replaceGlobal(t, "window", undefined);
  assert.doesNotThrow(() => emitBodyFatBridgeEvent("body_fat_bridge_viewed", { element: "walkthrough" }));
});
