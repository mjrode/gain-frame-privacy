import assert from "node:assert/strict";
import test from "node:test";

import {
  captureException,
  getPosthogDistinctId,
  getWebAnalyticsContext,
  track,
  trackOncePerDay,
} from "./analytics.ts";

function setWindow(value) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value,
    writable: true,
  });
}

test("track isolates GA failures and still delivers to PostHog", () => {
  const captured = [];
  setWindow({
    gtag() {
      throw new Error("GA unavailable");
    },
    posthog: {
      capture(event, properties) {
        captured.push([event, properties]);
      },
    },
  });

  assert.equal(track("bt_tool_view", { test: true }), true);
  assert.deepEqual(captured, [["bt_tool_view", { test: true }]]);
});

test("track and captureException never propagate PostHog failures", () => {
  setWindow({
    posthog: {
      capture() {
        throw new Error("capture failed");
      },
      captureException() {
        throw new Error("exception capture failed");
      },
      get_distinct_id() {
        throw new Error("identity unavailable");
      },
    },
  });

  assert.doesNotThrow(() => track("bf_tool_view"));
  assert.equal(track("bf_tool_view"), false);
  assert.equal(captureException(new Error("handled")), false);
  assert.equal(getPosthogDistinctId(), null);
});

test("trackOncePerDay uses the memory guard when storage writes fail", () => {
  let captures = 0;
  const key = `storage-failure-${Date.now()}-${Math.random()}`;
  setWindow({
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error("quota exceeded");
      },
    },
    posthog: {
      capture() {
        captures += 1;
      },
    },
  });

  assert.equal(trackOncePerDay("outbound_app_store_click", {}, key), true);
  assert.equal(trackOncePerDay("outbound_app_store_click", {}, key), false);
  assert.equal(captures, 1);
});

test("web analytics context strips query strings and keeps acquisition details", () => {
  const properties = new Map([
    ["$initial_referrer", "https://www.google.com/search?q=private+term"],
    ["$initial_referring_domain", "www.google.com"],
    ["$initial_pathname", "/blog/body-fat-guide/"],
    ["$browser", "Mobile Safari"],
    ["$os", "iOS"],
    ["$device_type", "Mobile"],
    ["utm_source", "newsletter"],
  ]);
  setWindow({
    document: { referrer: "https://example.com/ignored?token=secret" },
    location: {
      pathname: "/tools/physique-rater/",
      search: "?utm_campaign=launch&utm_content=hero",
    },
    posthog: {
      get_property(name) {
        return properties.get(name);
      },
      get_session_id() {
        return "session-123";
      },
    },
  });

  assert.deepEqual(getWebAnalyticsContext(), {
    referrer: "https://www.google.com/search",
    referring_domain: "www.google.com",
    landing_path: "/blog/body-fat-guide/",
    current_path: "/tools/physique-rater/",
    browser: "Mobile Safari",
    os: "iOS",
    device_type: "Mobile",
    session_id: "session-123",
    utm_source: "newsletter",
    utm_campaign: "launch",
    utm_content: "hero",
  });
});
