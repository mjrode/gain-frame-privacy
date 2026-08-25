import { test } from "node:test";
import assert from "node:assert/strict";

import {
  TOOL_CTA_EXPERIMENT_STORAGE_KEY,
  getToolCtaAssignment,
  toolCtaVariantForRandom,
} from "./tool-cta-experiment.ts";

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
  );
  assert.deepEqual(assignment, { variant: "future", forced: true });
  assert.equal(storage.get(TOOL_CTA_EXPERIMENT_STORAGE_KEY), "improve");
});
