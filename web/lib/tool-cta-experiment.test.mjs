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
  assert.equal(toolCtaVariantForRandom(0.3332), "improve");
  assert.equal(toolCtaVariantForRandom(0.3334), "track");
  assert.equal(toolCtaVariantForRandom(0.6665), "track");
  assert.equal(toolCtaVariantForRandom(0.6667), "future");
  assert.equal(toolCtaVariantForRandom(0.9999), "future");
});

test("tool CTA assignment reuses a stored variant", () => {
  const storage = new Map([[TOOL_CTA_EXPERIMENT_STORAGE_KEY, "track"]]);
  const assignment = getToolCtaAssignment(
    {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    "",
    () => 0.9,
    true,
  );
  assert.deepEqual(assignment, { variant: "track", forced: false });
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
    true,
  );
  assert.deepEqual(assignment, { variant: "future", forced: true });
  assert.equal(storage.get(TOOL_CTA_EXPERIMENT_STORAGE_KEY), "improve");
});

test("keeps assignment in memory and never touches storage before consent", () => {
  let reads = 0;
  let writes = 0;
  const storage = {
    getItem() {
      reads += 1;
      return "future";
    },
    setItem() {
      writes += 1;
    },
  };

  const first = getToolCtaAssignment(storage, "", () => 0.4, false);
  const second = getToolCtaAssignment(storage, "", () => 0.9, false);

  assert.deepEqual(first, { variant: "track", forced: false });
  assert.deepEqual(second, first);
  assert.equal(reads, 0);
  assert.equal(writes, 0);
});

test("a later consent grant persists the existing in-memory assignment", () => {
  const storage = new Map([[TOOL_CTA_EXPERIMENT_STORAGE_KEY, "future"]]);
  const adapter = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };

  const pending = getToolCtaAssignment(adapter, "", () => 0.1, false);
  const granted = getToolCtaAssignment(adapter, "", () => 0.9, true);

  assert.deepEqual(pending, { variant: "improve", forced: false });
  assert.deepEqual(granted, pending);
  assert.equal(storage.get(TOOL_CTA_EXPERIMENT_STORAGE_KEY), "improve");
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
  assert.match(bodyFat.variants.track.headline, /18%/);

  const rater = buildToolResultCtaExperiment({
    tool: "physique_rater",
    score: 72,
    opportunity: "Upper chest",
  });
  assert.match(rater.variants.improve.body, /Upper chest/);
  assert.match(rater.variants.track.headline, /72/);

  const photoCompare = buildToolResultCtaExperiment({
    tool: "progress_photo_compare",
  });
  assert.match(photoCompare.variants.track.headline, /timeline/i);

  const recomp = buildToolResultCtaExperiment({
    tool: "recomp_reality_checker",
  });
  assert.match(recomp.variants.track.headline, /trend/i);

  const shape = buildToolResultCtaExperiment({ tool: "body_shape_compare" });
  assert.match(shape.variants.improve.headline, /ratios/i);
});
