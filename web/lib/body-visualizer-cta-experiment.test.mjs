import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BODY_VISUALIZER_CTA_TREATMENTS,
  BODY_VISUALIZER_CTA_VARIANTS,
  bodyVisualizerAssignedExperiment,
  bodyVisualizerCtaPlacement,
  getBodyVisualizerCtaAssignment,
  isBodyVisualizerCtaPreviewHost,
} from "./body-visualizer-cta-experiment.ts";
import {
  assignedCtaProperties,
  isAssignedCtaVisible,
} from "./assigned-cta-experiment.ts";

test("eligible visitors receive analysis without consuming historical or shared storage", () => {
  const previousWindow = globalThis.window;
  try {
    globalThis.window = {
      location: { search: "" },
      get localStorage() {
        throw Error("rollout must not read or rewrite historical assignments");
      },
    };
    assert.deepEqual(getBodyVisualizerCtaAssignment(), {
      variant: "analysis", forced: false,
    });
    assert.deepEqual(getBodyVisualizerCtaAssignment("?bv_cta=unknown"), {
      variant: "analysis", forced: false,
    });
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("all four explicit QA treatments stay forced and do not affect the rollout", () => {
  for (const variant of BODY_VISUALIZER_CTA_VARIANTS) {
    assert.deepEqual(getBodyVisualizerCtaAssignment(`?bv_cta=${variant}`), {
      variant, forced: true,
    });
    assert.deepEqual(getBodyVisualizerCtaAssignment(""), {
      variant: "analysis", forced: false,
    });
  }
});

test("preview controls can only render on exact local hostnames", () => {
  for (const host of ["localhost", "127.0.0.1", "::1", "[::1]"])
    assert.equal(isBodyVisualizerCtaPreviewHost(host), true);
  for (const host of [
    "gainframe.app",
    "www.gainframe.app",
    "localhost.example.com",
    "preview.gainframe.app",
  ])
    assert.equal(isBodyVisualizerCtaPreviewHost(host), false);
});

test("copy, style, phase and outbound placement identify each treatment independently", () => {
  const placements = new Set();
  for (const variant of BODY_VISUALIZER_CTA_VARIANTS) {
    const copy = BODY_VISUALIZER_CTA_TREATMENTS[variant];
    const props = assignedCtaProperties(
      bodyVisualizerAssignedExperiment({ variant, forced: true }),
    );
    assert.equal(props.experiment_id, "body_visualizer_cta_v1");
    assert.equal(props.experiment_phase, "analysis_rollout_v2");
    assert.equal(props.experiment_variant, variant);
    assert.equal(props.experiment_forced, true);
    assert.equal(props.cta_style, copy.style);
    assert.ok(copy.headline && copy.body && copy.iosLabel);
    assert.equal(bodyVisualizerCtaPlacement(variant), `atlas_v6_analysis_rollout_v2_${variant}`);
    placements.add(bodyVisualizerCtaPlacement(variant));
  }
  assert.equal(placements.size, 4);
});

test("a sliver intersecting the viewport is not a qualified exposure", () => {
  assert.equal(
    isAssignedCtaVisible({ isIntersecting: false, intersectionRatio: 1 }),
    false,
  );
  assert.equal(
    isAssignedCtaVisible({ isIntersecting: true, intersectionRatio: 0.01 }),
    false,
  );
  assert.equal(
    isAssignedCtaVisible({ isIntersecting: true, intersectionRatio: 0.399 }),
    false,
  );
  assert.equal(
    isAssignedCtaVisible({ isIntersecting: true, intersectionRatio: 0.4 }),
    true,
  );
  assert.equal(
    isAssignedCtaVisible({ isIntersecting: true, intersectionRatio: 1 }),
    true,
  );
});
