import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateProportions,
  regionalAdjustments,
  suggestTargets,
  toCentimeters,
  validateMeasurements,
} from "./body-proportions.ts";

const measurements = {
  height: 180,
  wrist: 18,
  shoulders: 122,
  chest: 104,
  waist: 82,
  arms: 40,
  thighs: 60,
};

test("converts imperial measurements to centimeters", () => {
  assert.equal(toCentimeters(10, "in"), 25.4);
  assert.equal(toCentimeters(25.4, "cm"), 25.4);
});

test("calculates all five reference ratios and a bounded score", () => {
  const result = calculateProportions(measurements, "male");
  assert.equal(result.metrics.length, 5);
  assert.equal(result.metrics[0].value.toFixed(2), "1.49");
  assert.equal(result.metrics[1].value.toFixed(2), "0.46");
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.ok(result.score < 100);
  assert.ok(result.focus.score <= result.strongest.score);
});

test("suggested targets preserve frame measurements and cap changes", () => {
  const targets = suggestTargets(measurements, "male");
  assert.equal(targets.height, measurements.height);
  assert.equal(targets.wrist, measurements.wrist);
  for (const key of ["shoulders", "chest", "arms", "thighs"]) {
    assert.ok(targets[key] <= measurements[key] * 1.15 + 0.001);
    assert.ok(targets[key] >= measurements[key] * 0.92 - 0.001);
  }
  assert.ok(targets.waist >= measurements.waist * 0.85 - 0.001);
});

test("maps tape targets to bounded regional percentage changes", () => {
  const target = { ...measurements, shoulders: 134.2, waist: 73.8 };
  assert.deepEqual(regionalAdjustments(measurements, target), {
    shoulders: 10,
    waist: -10,
  });
});

test("rejects missing and implausible values", () => {
  const errors = validateMeasurements({ ...measurements, wrist: 2 });
  assert.equal(errors.wrist, "Use 10–30 cm");
  assert.deepEqual(validateMeasurements(measurements), {});
});
