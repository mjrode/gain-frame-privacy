import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBodyShapeProfile,
  buildBodyShapeSilhouette,
  compareBodyShapes,
  convertBodyShapeValue,
  normalizeBodyShapeInput,
  validateBodyShapeMeasurements,
} from "./body-shape-compare.ts";

const current = {
  heightCm: 180,
  weightKg: 82,
  shouldersCm: 122,
  chestCm: 104,
  waistCm: 86,
  hipsCm: 101,
  inseamCm: 82,
  bodyFatPercent: 22,
};

const goal = {
  ...current,
  weightKg: 77,
  shouldersCm: 124,
  waistCm: 80,
  bodyFatPercent: 18,
};

test("normalizes U.S. inputs and converts display values in both directions", () => {
  const normalized = normalizeBodyShapeInput(
    {
      height: 70,
      weight: 180,
      shoulders: 48,
      chest: 41,
      waist: 34,
      hips: 40,
      inseam: 32,
      bodyFat: 20,
    },
    "us",
  );

  assert.equal(normalized.heightCm, 177.8);
  assert.equal(normalized.shouldersCm, 121.92);
  assert.equal(normalized.bodyFatPercent, 20);
  assert.ok(Math.abs(normalized.weightKg - 81.6466) < 0.001);
  assert.equal(convertBodyShapeValue("waist", 25.4, "metric", "us"), 10);
  assert.ok(
    Math.abs(convertBodyShapeValue("weight", 220.46226218, "us", "metric") - 100) < 0.001,
  );
});

test("validates required ranges, optional body fat, and inseam coherence", () => {
  assert.deepEqual(validateBodyShapeMeasurements(current), {});

  const errors = validateBodyShapeMeasurements({
    ...current,
    weightKg: 900,
    inseamCm: 125,
    bodyFatPercent: 80,
  });
  assert.equal(errors.weightKg, "Outside the supported illustration range");
  assert.equal(errors.inseamCm, "Check inseam against height");
  assert.equal(errors.bodyFatPercent, "Use 3–70% or leave blank");
  assert.equal(
    validateBodyShapeMeasurements({ ...current, bodyFatPercent: undefined })
      .bodyFatPercent,
    undefined,
  );
});

test("builds a deterministic, bounded silhouette from proportions", () => {
  const profile = buildBodyShapeProfile(current);
  const repeat = buildBodyShapeProfile({ ...current });
  assert.deepEqual(profile, repeat);
  assert.deepEqual(profile, {
    bmi: 25.309,
    shoulderToWaist: 1.419,
    waistToHeight: 0.478,
    hipToWaist: 1.174,
    inseamToHeight: 0.456,
    shoulderHalf: 50.93,
    chestHalf: 41.77,
    waistHalf: 32.93,
    hipHalf: 40.66,
    crotchY: 214.44,
    limbWidth: 11.2,
  });

  const silhouette = buildBodyShapeSilhouette(profile);
  assert.deepEqual(silhouette, buildBodyShapeSilhouette(repeat));
  assert.match(silhouette.torsoPath, /^M 97\.78 55 C/);
  assert.match(silhouette.leftLegPath, /334 L .* 342/);
  assert.equal(silhouette.head.radius, 19);
});

test("reports neutral raw deltas and responds to changed measurements", () => {
  const summaries = compareBodyShapes(current, goal);
  assert.deepEqual(summaries, [
    {
      key: "weight",
      label: "Entered weight",
      current: 82,
      goal: 77,
      delta: -5,
    },
    {
      key: "waist_to_height",
      label: "Waist-to-height",
      current: 0.478,
      goal: 0.444,
      delta: -0.033,
    },
    {
      key: "shoulder_to_waist",
      label: "Shoulder-to-waist",
      current: 1.419,
      goal: 1.55,
      delta: 0.131,
    },
    {
      key: "body_fat",
      label: "Entered body fat",
      current: 22,
      goal: 18,
      delta: -4,
    },
  ]);

  const currentProfile = buildBodyShapeProfile(current);
  const goalProfile = buildBodyShapeProfile(goal);
  assert.ok(goalProfile.waistHalf < currentProfile.waistHalf);
  assert.ok(goalProfile.shoulderHalf > currentProfile.shoulderHalf);
});
