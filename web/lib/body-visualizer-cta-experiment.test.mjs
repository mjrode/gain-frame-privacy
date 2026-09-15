import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  BODY_VISUALIZER_CTA_STORAGE_KEY,
  BODY_VISUALIZER_CTA_TREATMENTS,
  BODY_VISUALIZER_CTA_VARIANTS,
  bodyVisualizerAssignedExperiment,
  bodyVisualizerCtaPlacement,
  bodyVisualizerCtaVariantForRandom,
  clearBodyVisualizerCtaAssignmentMemory,
  getBodyVisualizerCtaAssignment,
  isBodyVisualizerCtaPreviewHost,
} from "./body-visualizer-cta-experiment.ts";
import {
  assignedCtaProperties,
  isAssignedCtaVisible,
} from "./assigned-cta-experiment.ts";
import { TOOL_CTA_EXPERIMENT_STORAGE_KEY } from "./tool-cta-experiment.ts";

afterEach(clearBodyVisualizerCtaAssignmentMemory);
function mockStorage(initial = []) {
  const values = new Map(initial);
  return {
    values,
    storage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  };
}

test("four equal allocation buckets cover boundaries without an undefined arm", () => {
  for (const [value, expected] of [
    [0, "direct"],
    [0.24999, "direct"],
    [0.25, "analysis"],
    [0.49999, "analysis"],
    [0.5, "progress"],
    [0.74999, "progress"],
    [0.75, "future"],
    [1, "future"],
    [-1, "direct"],
    [NaN, "direct"],
  ]) {
    assert.equal(bodyVisualizerCtaVariantForRandom(value), expected);
  }
  const counts = Object.fromEntries(
    BODY_VISUALIZER_CTA_VARIANTS.map((v) => [v, 0]),
  );
  for (let i = 0; i < 1000; i++)
    counts[bodyVisualizerCtaVariantForRandom(i / 1000)]++;
  assert.deepEqual(Object.values(counts), [250, 250, 250, 250]);
});

test("the stored arm survives reloads and never consumes the site-wide assignment", () => {
  const { values, storage } = mockStorage([
    [TOOL_CTA_EXPERIMENT_STORAGE_KEY, "future"],
  ]);
  assert.notEqual(
    BODY_VISUALIZER_CTA_STORAGE_KEY,
    TOOL_CTA_EXPERIMENT_STORAGE_KEY,
  );
  assert.equal(
    getBodyVisualizerCtaAssignment(storage, "", () => 0.3).variant,
    "analysis",
  );
  clearBodyVisualizerCtaAssignmentMemory();
  assert.equal(
    getBodyVisualizerCtaAssignment(storage, "", () => 0.9).variant,
    "analysis",
  );
  assert.equal(values.get(TOOL_CTA_EXPERIMENT_STORAGE_KEY), "future");
});

test("all four preview links are forced and never overwrite live assignment", () => {
  const { storage, values } = mockStorage([
    [BODY_VISUALIZER_CTA_STORAGE_KEY, "progress"],
  ]);
  for (const variant of BODY_VISUALIZER_CTA_VARIANTS) {
    assert.deepEqual(
      getBodyVisualizerCtaAssignment(storage, `?bv_cta=${variant}`),
      { variant, forced: true },
    );
  }
  assert.equal(values.get(BODY_VISUALIZER_CTA_STORAGE_KEY), "progress");
  assert.deepEqual(getBodyVisualizerCtaAssignment(storage, "?bv_cta=unknown"), {
    variant: "progress",
    forced: false,
  });
});

test("blocked storage is stable within the page and saved storage wins when restored", () => {
  const blocked = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
  };
  const first = getBodyVisualizerCtaAssignment(blocked, "", () => 0.8);
  assert.deepEqual(
    getBodyVisualizerCtaAssignment(blocked, "", () => 0.1),
    first,
  );
  const { storage } = mockStorage([
    [BODY_VISUALIZER_CTA_STORAGE_KEY, "analysis"],
  ]);
  assert.equal(
    getBodyVisualizerCtaAssignment(storage, "", () => 0.1).variant,
    "analysis",
  );
});

test("unknown stored values recover into a valid current-phase arm", () => {
  const { storage, values } = mockStorage([
    [BODY_VISUALIZER_CTA_STORAGE_KEY, "retired_arm"],
  ]);
  assert.equal(
    getBodyVisualizerCtaAssignment(storage, "", () => 0.6).variant,
    "progress",
  );
  assert.equal(values.get(BODY_VISUALIZER_CTA_STORAGE_KEY), "progress");
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
    assert.equal(props.experiment_phase, "four_treatments_v1");
    assert.equal(props.experiment_variant, variant);
    assert.equal(props.experiment_forced, true);
    assert.equal(props.cta_style, copy.style);
    assert.ok(copy.headline && copy.body && copy.iosLabel);
    assert.ok(bodyVisualizerCtaPlacement(variant).includes(variant));
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
