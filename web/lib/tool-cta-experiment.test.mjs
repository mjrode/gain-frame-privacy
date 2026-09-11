import { test } from "node:test";
import assert from "node:assert/strict";

import {
  TOOL_CTA_EXPERIMENT_ID,
  TOOL_CTA_EXPERIMENT_STORAGE_KEY,
  TOOL_CTA_VARIANTS,
  buildToolResultCtaExperiment,
  clearToolCtaAssignmentMemory,
  getToolCtaAssignment,
  toolCtaVariantForRandom,
} from "./tool-cta-experiment.ts";

test.beforeEach(() => {
  clearToolCtaAssignmentMemory();
});

test("tool CTA buckets split the random range evenly", () => {
  assert.equal(toolCtaVariantForRandom(0), "improve");
  assert.equal(toolCtaVariantForRandom(0.4999), "improve");
  assert.equal(toolCtaVariantForRandom(0.5), "future");
  assert.equal(toolCtaVariantForRandom(0.9999), "future");
});

test("tool CTA assignment reuses a stored variant", () => {
  for (const variant of ["improve", "future"]) {
    clearToolCtaAssignmentMemory();
    const storage = new Map([[TOOL_CTA_EXPERIMENT_STORAGE_KEY, variant]]);
    const assignment = getToolCtaAssignment(
      {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
      "",
      () => variant === "improve" ? 0.9 : 0.1,
      );
    assert.deepEqual(assignment, { variant, forced: false });
  }
});

test("retired Track assignments migrate to an active variant and survive reload", () => {
  for (const [random, variant] of [[0.1, "improve"], [0.9, "future"]]) {
    clearToolCtaAssignmentMemory();
    const storage = new Map([[TOOL_CTA_EXPERIMENT_STORAGE_KEY, "track"]]);
    const adapter = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    };
    const assignment = getToolCtaAssignment(adapter, "", () => random);
    assert.deepEqual(assignment, { variant, forced: false });
    assert.equal(storage.get(TOOL_CTA_EXPERIMENT_STORAGE_KEY), variant);

    clearToolCtaAssignmentMemory();
    assert.deepEqual(
      getToolCtaAssignment(adapter, "", () => 1 - random),
      assignment,
    );
  }
});

test("a retired Track QA override cannot render the retired variant", () => {
  const assignment = getToolCtaAssignment(
    null, "?gf_cta_variant=track", () => 0.9, false,
  );
  assert.deepEqual(assignment, { variant: "future", forced: false });
});

test("QA override is marked forced and does not replace stable assignment", () => {
  const storage = new Map([[TOOL_CTA_EXPERIMENT_STORAGE_KEY, "improve"]]);
  const assignment = getToolCtaAssignment(
    {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    "?gf_cta_variant=future",
    () => 0.1,
  );
  assert.deepEqual(assignment, { variant: "future", forced: true });
  assert.equal(storage.get(TOOL_CTA_EXPERIMENT_STORAGE_KEY), "improve");
});

test("a saved choice replaces a temporary storage fallback across pages", () => {
  const values = new Map([[TOOL_CTA_EXPERIMENT_STORAGE_KEY, "future"]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(getToolCtaAssignment(null, "", () => 0.1).variant, "improve");
  assert.equal(getToolCtaAssignment(storage, "", () => 0.1).variant, "future");
  assert.equal(values.get(TOOL_CTA_EXPERIMENT_STORAGE_KEY), "future");
  clearToolCtaAssignmentMemory();
  assert.equal(getToolCtaAssignment(storage, "", () => 0.1).variant, "future");
});

test("new visitors persist their assignment immediately and reuse it on reload", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const first = getToolCtaAssignment(storage, "", () => 0.1);
  assert.equal(values.get(TOOL_CTA_EXPERIMENT_STORAGE_KEY), first.variant);
  clearToolCtaAssignmentMemory();
  assert.deepEqual(getToolCtaAssignment(storage, "", () => 0.9), first);
});

test("blocked browser storage keeps a stable page choice without throwing", () => {
  const storage = {getItem() {throw new Error("blocked");}, setItem() {throw new Error("blocked");}};
  const first = getToolCtaAssignment(storage, "", () => 0.1);
  assert.deepEqual(getToolCtaAssignment(storage, "", () => 0.9), first);
});

test("every major result card uses the same complete message-angle experiment", () => {
  const contexts = [
    { tool: "physique_rater", score: 72, opportunity: "Upper chest" },
    { tool: "bf_from_photo", estimate: "18" },
    {
      tool: "ab_analyzer",
      score: 64,
      biggestLever: "Lower-ab definition",
      timeline: "8–12 weeks",
    },
    { tool: "six_pack_timeline", timeline: "8–12 weeks" },
    { tool: "body_visualizer", bmi: "23.5" },
    { tool: "body_fat_visualizer" },
    { tool: "ai_body_transformation" },
    { tool: "body_measurements" },
    { tool: "progress_photo_compare" },
    { tool: "recomp_reality_checker" },
    { tool: "body_shape_compare" },
  ];

  for (const context of contexts) {
    const experiment = buildToolResultCtaExperiment(context);
    assert.equal(experiment.id, TOOL_CTA_EXPERIMENT_ID);
    assert.deepEqual(Object.keys(experiment.variants), [...TOOL_CTA_VARIANTS]);
    for (const copy of Object.values(experiment.variants)) {
      assert.ok(copy.eyebrow);
      assert.ok(copy.headline);
      assert.ok(copy.body);
      assert.ok(copy.iosLabel);
    }
  }
});

test("result-specific facts are safely interpolated into the matching copy", () => {
  const bodyFat = buildToolResultCtaExperiment({
    tool: "bf_from_photo",
    estimate: "18",
  });
  assert.match(bodyFat.variants.improve.body, /18%/);

  const rater = buildToolResultCtaExperiment({
    tool: "physique_rater",
    score: 72,
    opportunity: "Upper chest",
  });
  assert.match(rater.variants.improve.body, /Upper chest/);

  const photoCompare = buildToolResultCtaExperiment({
    tool: "progress_photo_compare",
  });
  assert.match(photoCompare.variants.improve.headline, /attention/i);

  const recomp = buildToolResultCtaExperiment({
    tool: "recomp_reality_checker",
  });
  assert.match(recomp.variants.future.headline, /12 weeks/i);

  const shape = buildToolResultCtaExperiment({ tool: "body_shape_compare" });
  assert.match(shape.variants.improve.headline, /ratios/i);
});


test("clean phase ignores assignments from the contaminated phase", () => {
  const values = new Map([["gainframe:experiment:tool_result_cta_v1", "future"]]);
  const storage = {getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};
  assert.notEqual(TOOL_CTA_EXPERIMENT_STORAGE_KEY, "gainframe:experiment:tool_result_cta_v1");
  assert.equal(getToolCtaAssignment(storage, "", () => 0.1).variant, "improve");
  assert.equal(values.get("gainframe:experiment:tool_result_cta_v1"), "future");
});
