import assert from "node:assert/strict";
import test from "node:test";

import {
  bodyFatVisualizerDeepLinkSource,
  normalizeToolFunnelId,
  trackToolFunnelStep,
} from "./tool-funnel.ts";

function setWindow(value) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value,
    writable: true,
  });
}

test("normalizes legacy calculator slugs into stable funnel ids", () => {
  assert.equal(
    normalizeToolFunnelId("body-fat-estimator"),
    "body_fat_calculator",
  );
  assert.equal(normalizeToolFunnelId("bf_from_photo"), "bf_from_photo");
  assert.equal(
    normalizeToolFunnelId("body-measurements-calculator"),
    "body_measurements",
  );
  assert.equal(normalizeToolFunnelId("physique_rater"), "physique_rater");
  assert.equal(
    normalizeToolFunnelId("progress-photo-compare"),
    "progress_photo_compare",
  );
  assert.equal(
    normalizeToolFunnelId("recomp-reality-checker"),
    "recomp_reality_checker",
  );
  assert.equal(
    normalizeToolFunnelId("body-shape-compare"),
    "body_shape_compare",
  );
});

test("recognizes body-fat visualizer query and hash journeys without treating attribution as a result", () => {
  assert.equal(
    bodyFatVisualizerDeepLinkSource("?g=female&bf=25", ""),
    "query",
  );
  assert.equal(
    bodyFatVisualizerDeepLinkSource("", "#g=male&view=back"),
    "hash",
  );
  assert.equal(
    bodyFatVisualizerDeepLinkSource("?sex=female", "#age=40s"),
    "query_and_hash",
  );
  assert.equal(
    bodyFatVisualizerDeepLinkSource("?utm_source=article", "#faq"),
    null,
  );
});

test("emits the typed funnel event with controlled tool and step fields", () => {
  const captures = [];
  setWindow({
    posthog: {
      capture(event, properties) {
        captures.push([event, properties]);
      },
    },
  });

  assert.equal(
    trackToolFunnelStep("body-visualizer", "result_shown", {
      tool: "wrong",
      funnel_step: "wrong",
      input_mode: "calculator",
    }),
    true,
  );
  assert.deepEqual(captures, [
    [
      "tool_funnel_result_shown",
      {
        tool: "body_visualizer",
        funnel_step: "result_shown",
        input_mode: "calculator",
      },
    ],
  ]);
});
