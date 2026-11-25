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

test("paired result example restores its arm and keeps forced previews out of storage", async () => {
  const { pairedCtaAssignment } = await import("./paired-cta-assignment.ts");
  const key = "gainframe:experiment:visualizer_result_example:v1";
  const saved = new Map([[key, "control"]]);
  const before = globalThis.window;
  try {
    globalThis.window = { localStorage: { getItem: k => saved.get(k), setItem: (k, v) => saved.set(k, v) } };
    assert.deepEqual(pairedCtaAssignment("visualizer_result_example", "treatment"), { treatment: true, forced: true });
    assert.deepEqual(pairedCtaAssignment("visualizer_result_example", null), { treatment: false, forced: false });
    assert.equal(saved.get(key), "control");
  } finally {
    if (before === undefined) delete globalThis.window;
    else globalThis.window = before;
  }
});

test("the closed screen test previews every arm and enrols nobody", async (t) => {
  const { SCREEN_ARMS, SCREEN_TEST_PHASE, screenPreview, visualizerScreenPreview } = await import("./visualizer-screen-test.ts");
  const key = `gainframe:experiment:visualizer_result_example:${SCREEN_TEST_PHASE}`;
  const saved = new Map([[key, "future_you"]]);
  const before = globalThis.window;
  t.after(() => { if (before === undefined) delete globalThis.window; else globalThis.window = before; });
  globalThis.window = {
    localStorage: {
      getItem: k => saved.get(k),
      setItem: () => assert.fail("a closed test must not write an assignment"),
    },
  };
  for (const arm of SCREEN_ARMS) {
    const assignment = visualizerScreenPreview(screenPreview("?visualizer_result_example=" + arm));
    assert.equal(assignment.variant, arm);
    assert.equal(assignment.forced, true);
  }
  assert.equal(screenPreview("?visualizer_result_example=treatment"), "score_example");
  assert.equal(screenPreview("?visualizer_result_example=unknown"), undefined);
  // A visitor with a saved arm from the randomized phase gets no offer screen.
  assert.equal(visualizerScreenPreview(), null);
  assert.equal(visualizerScreenPreview(undefined, undefined), null);
  assert.equal(saved.get(key), "future_you");
});

test("placement survives only as a Future You preview, never as a live draw", async (t) => {
  const { FUTURE_YOU_PLACEMENT_PHASE, placementPreview, visualizerScreenPreview } =
    await import("./visualizer-screen-test.ts");
  const before = globalThis.window;
  t.after(() => { if (before === undefined) delete globalThis.window; else globalThis.window = before; });
  globalThis.window = {
    localStorage: {
      getItem: () => assert.fail("a closed placement test must not read an assignment"),
      setItem: () => assert.fail("a closed placement test must not write an assignment"),
    },
  };
  for (const position of ["above_image", "below_image"]) {
    const arm = visualizerScreenPreview(undefined, placementPreview(`?future_you_button=${position}`));
    assert.equal(arm.variant, "future_you");
    assert.equal(arm.forced, true);
    assert.equal(arm.buttonPlacement.phase, FUTURE_YOU_PLACEMENT_PHASE);
    assert.equal(assignedCtaProperties(arm).button_placement, position);
  }
  assert.equal(placementPreview("?future_you_button=invalid"), undefined);
  // Forcing the parent arm alone falls back to the original position.
  assert.equal(visualizerScreenPreview("future_you").buttonPlacement.variant, "below_image");
  // No other arm carries a placement, and nobody is drawn into one.
  assert.equal(visualizerScreenPreview("score_example").buttonPlacement, undefined);
  assert.equal(visualizerScreenPreview(), null);
});

test("eligible iOS result visitors all receive the winning inline arm", async (t) => {
  const {
    BODY_FAT_RESULT_CTA_PHASE,
    BODY_FAT_RESULT_CTA_TEST_PHASE,
    bodyFatResultCtaExperiment,
    getBodyFatResultCtaAssignment,
  } = await import("./body-fat-result-cta-experiment.ts");
  const before = globalThis.window;
  t.after(() => { if (before === undefined) delete globalThis.window; else globalThis.window = before; });
  globalThis.window = {
    location: { search: "" },
    get localStorage() {
      throw Error("the rollout must not read or rewrite historical assignments");
    },
  };
  assert.notEqual(BODY_FAT_RESULT_CTA_PHASE, BODY_FAT_RESULT_CTA_TEST_PHASE);
  for (const search of ["", "?bf_cta=unknown", "?bf_cta="]) {
    assert.deepEqual(getBodyFatResultCtaAssignment(search), { variant: "analysis", forced: false });
  }
  for (const variant of ["control", "analysis", "goal", "sticky"]) {
    assert.deepEqual(getBodyFatResultCtaAssignment(`?bf_cta=${variant}`), { variant, forced: true });
  }
  const props = assignedCtaProperties(bodyFatResultCtaExperiment(getBodyFatResultCtaAssignment("")));
  assert.equal(props.experiment_id, "body_fat_result_cta_v1");
  assert.equal(props.experiment_phase, "inline_result_rollout_v1");
  assert.equal(props.experiment_variant, "analysis");
  assert.equal(props.experiment_forced, false);
  assert.equal(props.cta_style, "inline_result");
});
