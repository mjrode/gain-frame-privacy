import assert from "node:assert/strict";
import test from "node:test";

import {
  captureException,
  getPosthogDistinctId,
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
