import assert from "node:assert/strict";
import test from "node:test";
import {
  BRIDGE_RESULT_CTA_CONTENT,
  bridgeCtaElement,
  createBodyVisualizerBridgeAnalytics,
  emitBodyVisualizerBridgeEvent,
  observeBridgeVisibility,
} from "./body-visualizer-bridge-analytics.ts";
import { bodyVisualizerCtaPlacement } from "./body-visualizer-cta-experiment.ts";
import {
  BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID,
  BODY_VISUALIZER_BRIDGE_MAIN_CTA,
  BODY_VISUALIZER_BRIDGE_PHASE,
} from "./body-visualizer-bridge-rollout.ts";
import { clearQueuedAnalyticsEvents, flushQueuedAnalyticsEvents } from "./analytics.ts";

function replaceGlobal(t, name, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete globalThis[name];
  });
}

function visibilityFixture(t, initialVisibility = "visible") {
  let now = 0;
  let nextId = 1;
  const timers = new Map();
  const listeners = new Set();
  const observers = [];
  const element = {};
  const document = {
    visibilityState: initialVisibility,
    addEventListener(name, callback) {
      assert.equal(name, "visibilitychange");
      listeners.add(callback);
    },
    removeEventListener(name, callback) {
      assert.equal(name, "visibilitychange");
      listeners.delete(callback);
    },
  };
  replaceGlobal(t, "document", document);
  replaceGlobal(t, "setTimeout", (callback, delay) => {
    const id = nextId++;
    timers.set(id, { at: now + delay, callback });
    return id;
  });
  replaceGlobal(t, "clearTimeout", (id) => timers.delete(id));
  replaceGlobal(t, "IntersectionObserver", class {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.disconnected = false;
      observers.push(this);
    }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  });

  return {
    element, timers, listeners, observers,
    intersect(ratio, isIntersecting = true, target = element) {
      observers[0].callback([{ target, intersectionRatio: ratio, isIntersecting }]);
    },
    visibility(value) {
      document.visibilityState = value;
      for (const callback of [...listeners]) callback();
    },
    advance(ms) {
      const end = now + ms;
      while (true) {
        const next = [...timers.entries()]
          .filter(([, timer]) => timer.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        const [id, timer] = next;
        now = timer.at;
        timers.delete(id);
        timer.callback();
      }
      now = end;
    },
  };
}

test("reach requires the correct element to be at least half visible for a full second", (t) => {
  const f = visibilityFixture(t);
  let reached = 0;
  observeBridgeVisibility(f.element, () => reached++);
  assert.equal(f.observers[0].target, f.element);
  assert.equal(f.observers[0].options.threshold, 0.5);

  f.intersect(1, true, {});
  f.intersect(1, false);
  f.intersect(0.49);
  f.advance(2000);
  assert.equal(reached, 0);
  assert.equal(f.timers.size, 0);

  f.intersect(0.5);
  f.advance(500);
  f.intersect(0.8); // An updated observer callback must not restart dwell.
  f.advance(499);
  assert.equal(reached, 0);
  f.advance(1);
  assert.equal(reached, 1);
  assert.equal(f.observers[0].disconnected, true);
  assert.equal(f.listeners.size, 0);
  f.intersect(1);
  f.advance(5000);
  assert.equal(reached, 1);
});

test("quick scrolls do not accumulate into a qualified view", (t) => {
  const f = visibilityFixture(t);
  let reached = 0;
  observeBridgeVisibility(f.element, () => reached++);
  f.intersect(0.75);
  f.advance(800);
  f.intersect(0.49);
  f.advance(3000);
  assert.equal(reached, 0);
  f.intersect(0.5);
  f.advance(999);
  assert.equal(reached, 0);
  f.advance(1);
  assert.equal(reached, 1);
});

test("background time is excluded and returning to the tab starts a fresh dwell", (t) => {
  const f = visibilityFixture(t);
  let reached = 0;
  observeBridgeVisibility(f.element, () => reached++);
  f.intersect(1);
  f.advance(800);
  f.visibility("hidden");
  f.advance(10000);
  assert.equal(reached, 0);
  assert.equal(f.timers.size, 0);
  f.visibility("visible");
  f.advance(999);
  assert.equal(reached, 0);
  f.advance(1);
  assert.equal(reached, 1);
});

test("an initially backgrounded page cannot report exposure", (t) => {
  const f = visibilityFixture(t, "hidden");
  let reached = 0;
  observeBridgeVisibility(f.element, () => reached++);
  f.intersect(1);
  f.advance(10000);
  assert.equal(reached, 0);
  f.visibility("visible");
  f.advance(1000);
  assert.equal(reached, 1);
});

test("unmount cancels pending exposure and ignores late observer callbacks", (t) => {
  const f = visibilityFixture(t);
  let reached = 0;
  const stop = observeBridgeVisibility(f.element, () => reached++);
  f.intersect(1);
  f.advance(500);
  stop();
  assert.equal(f.observers[0].disconnected, true);
  assert.equal(f.listeners.size, 0);
  assert.equal(f.timers.size, 0);
  f.intersect(1);
  f.visibility("visible");
  f.advance(5000);
  assert.equal(reached, 0);
});

test("missing observer support does not invent a reached section", (t) => {
  replaceGlobal(t, "IntersectionObserver", undefined);
  let reached = 0;
  const stop = observeBridgeVisibility({}, () => reached++);
  assert.equal(typeof stop, "function");
  stop();
  assert.equal(reached, 0);
});

function observerSpy() {
  const observed = [];
  return {
    observed,
    observe(element, callback) {
      const record = { element, callback, stopped: false };
      observed.push(record);
      return () => { record.stopped = true; };
    },
  };
}

test("each element is reported once per page controller, even when delivery queues and refs remount", () => {
  const spy = observerSpy();
  const captures = [];
  const analytics = createBodyVisualizerBridgeAnalytics("ios", (...args) => {
    captures.push(args);
    return false; // Analytics queues may not be delivered yet.
  }, spy.observe);

  for (const [name, ref] of Object.entries(analytics.refs)) {
    ref({ name });
    const observation = spy.observed.at(-1);
    observation.callback();
    observation.callback();
    ref(null);
    ref({ name, remounted: true });
    assert.equal(observation.stopped, true);
  }
  assert.equal(spy.observed.length, 4);
  assert.deepEqual(captures.map(([event, props]) => [event, props.element]), [
    ["body_visualizer_bridge_viewed", "main_cta"],
    ["body_visualizer_bridge_viewed", "walkthrough"],
    ["body_visualizer_bridge_viewed", "result_cta"],
    ["body_visualizer_bridge_viewed", "video"],
  ]);
  assert.ok(captures.every(([, props]) => props.platform === "ios" && props.visible_ms === 1000));
  assert.ok(captures.every(([, props]) =>
    props.experiment_id === BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID &&
    props.experiment_phase === BODY_VISUALIZER_BRIDGE_PHASE &&
    props.experiment_variant === "analysis" && props.experiment_forced === false));
  assert.equal(captures.find(([, props]) => props.element === "main_cta")[1].cta_angle, "analysis");
  assert.equal(captures.find(([, props]) => props.element === "result_cta")[1].cta_angle, "future");

  const nextVisit = createBodyVisualizerBridgeAnalytics("ios", (...args) => captures.push(args), spy.observe);
  nextVisit.refs.walkthrough({});
  spy.observed.at(-1).callback();
  assert.equal(captures.length, 5);
});

test("detaching an unqualified element cancels its observer and allows a fresh attempt", () => {
  const spy = observerSpy();
  const captures = [];
  const analytics = createBodyVisualizerBridgeAnalytics("desktop", (...args) => captures.push(args), spy.observe);
  analytics.refs.video({});
  const old = spy.observed[0];
  analytics.refs.video(null);
  assert.equal(old.stopped, true);
  assert.equal(captures.length, 0);
  analytics.refs.video({});
  assert.equal(spy.observed.length, 2);
  spy.observed[1].callback();
  assert.equal(captures.length, 1);
});

test("unknown platforms wait and Android does not create unavailable CTA impressions", () => {
  const unknown = observerSpy();
  const pending = createBodyVisualizerBridgeAnalytics("unknown", () => assert.fail("not eligible"), unknown.observe);
  Object.values(pending.refs).forEach((ref) => ref({}));
  assert.equal(unknown.observed.length, 0);

  const android = observerSpy();
  const captures = [];
  const analytics = createBodyVisualizerBridgeAnalytics("android", (...args) => captures.push(args), android.observe);
  Object.values(analytics.refs).forEach((ref) => ref({}));
  assert.equal(android.observed.length, 2);
  android.observed.forEach(({ callback }) => callback());
  assert.deepEqual(captures.map(([, props]) => props.element), ["walkthrough", "video"]);
});

class FakeElement {
  constructor({ content = null, primary = false, anchor = null } = {}) {
    this.content = content;
    this.anchor = anchor;
    this.classList = { contains: (name) => primary && name === "tcc-primary" };
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

test("click tracking distinguishes both buttons while ignoring walkthrough, screenshot, and QR links", (t) => {
  replaceGlobal(t, "Element", FakeElement);
  const captures = [];
  const analytics = createBodyVisualizerBridgeAnalytics("desktop", (...args) => captures.push(args));
  const mainContent = BODY_VISUALIZER_BRIDGE_MAIN_CTA;
  const main = new FakeElement({ content: mainContent, primary: true });
  const result = new FakeElement({ content: BRIDGE_RESULT_CTA_CONTENT });
  analytics.onClick({ target: new FakeElement({ anchor: main }) });
  analytics.onClick({ target: result });
  analytics.onClick({ target: null });
  analytics.onClick({ target: {} });
  analytics.onClick({ target: new FakeElement() }); // Walkthrough and screenshot links have no CTA content.
  analytics.onClick({ target: new FakeElement({ content: mainContent }) }); // QR's App Store link.
  analytics.onClick({ target: new FakeElement({ content: "closing_app_store", primary: true }) });

  assert.deepEqual(captures.map(([event, props]) => [event, props.element, props.cta_content]), [
    ["body_visualizer_bridge_cta_clicked", "main_cta", mainContent],
    ["body_visualizer_bridge_cta_clicked", "result_cta", BRIDGE_RESULT_CTA_CONTENT],
  ]);
  assert.ok(captures.every(([event]) => !["web_download_clicked", "outbound_app_store_click"].includes(event)));
  assert.ok(captures.every(([, props]) =>
    props.experiment_id === BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID &&
    props.experiment_phase === BODY_VISUALIZER_BRIDGE_PHASE &&
    props.experiment_variant === "analysis"));
  assert.deepEqual(captures.map(([, props]) => props.cta_angle), ["analysis", "future"]);
  analytics.onClick({ target: main });
  assert.equal(captures.length, 3, "a separate deliberate click remains measurable");

  for (const platform of ["unknown", "android"]) {
    const ineligible = createBodyVisualizerBridgeAnalytics(platform, () => assert.fail("ineligible click"));
    ineligible.onClick({ target: result });
  }
});

test("CTA classification does not mistake arbitrary or historical links for either bridge button", () => {
  assert.equal(bridgeCtaElement(null, false), null);
  assert.equal(bridgeCtaElement("body_visualizer_future_you_walkthrough_v1_main", true), null);
  assert.equal(bridgeCtaElement("body_visualizer_future_you_walkthrough_v1_result", false), null);
  assert.equal(bridgeCtaElement("future_you_walkthrough_result_other", false), null);
  assert.equal(bridgeCtaElement("future_you_walkthrough_result", false), null);
  assert.equal(bridgeCtaElement(bodyVisualizerCtaPlacement("analysis"), true), null);
  assert.equal(bridgeCtaElement(bodyVisualizerCtaPlacement("future"), true), null);
  assert.equal(bridgeCtaElement(bodyVisualizerCtaPlacement("future"), false), null);
  assert.equal(bridgeCtaElement(`${BODY_VISUALIZER_BRIDGE_MAIN_CTA}_desktop_link`, true), null);
  assert.equal(bridgeCtaElement(`${BODY_VISUALIZER_BRIDGE_MAIN_CTA}_qr`, true), null);
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

for (const host of ["localhost", "127.0.0.1", "::1", "[::1]"]) {
  test(`local tracking on ${host} only logs and never sends or queues live events`, (t) => {
    const f = deliveryFixture(t, host);
    emitBodyVisualizerBridgeEvent("body_visualizer_bridge_viewed", { element: "video" });
    assert.equal(f.debug.length, 1);
    assert.deepEqual(JSON.parse(f.debug[0][1]), {
      event: "body_visualizer_bridge_viewed", element: "video", experiment_forced: true, preview_only: true,
    });
    assert.equal(flushQueuedAnalyticsEvents(), 0);
    assert.deepEqual(f.ga, []);
    assert.deepEqual(f.posthog, []);
  });
}

for (const host of ["gainframe.app", "www.gainframe.app"]) {
  test(`production tracking on ${host} delivers once per provider`, (t) => {
    const f = deliveryFixture(t, host);
    emitBodyVisualizerBridgeEvent("body_visualizer_bridge_cta_clicked", { element: "result_cta" });
    const props = { element: "result_cta", preview_only: false };
    assert.deepEqual(f.ga, [["event", "body_visualizer_bridge_cta_clicked", props]]);
    assert.deepEqual(f.posthog, [["body_visualizer_bridge_cta_clicked", props]]);
    assert.deepEqual(f.debug, []);
    assert.equal(flushQueuedAnalyticsEvents(), 0);
    assert.equal(f.posthog.length, 1);
  });
}

for (const host of ["preview.gainframe.app", "localhost.example.com", "gainframe.app.example.com"]) {
  test(`unsupported host ${host} emits nothing even with installed SDKs`, (t) => {
    const f = deliveryFixture(t, host);
    emitBodyVisualizerBridgeEvent("body_visualizer_bridge_viewed", { element: "walkthrough" });
    assert.deepEqual(f.ga, []);
    assert.deepEqual(f.posthog, []);
    assert.deepEqual(f.debug, []);
    assert.equal(flushQueuedAnalyticsEvents(), 0);
  });
}

test("server rendering cannot emit bridge analytics", (t) => {
  replaceGlobal(t, "window", undefined);
  assert.doesNotThrow(() => emitBodyVisualizerBridgeEvent("body_visualizer_bridge_viewed", { element: "walkthrough" }));
});
