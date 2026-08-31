import test from "node:test";
import assert from "node:assert/strict";

import {
  RECOMP_SIGNAL_THRESHOLDS,
  RecompRealityInputError,
  assessRecompReality,
  validateRecompRealityInputs,
} from "./recomp-reality-checker.ts";

function base(overrides = {}) {
  return {
    weeks: 8,
    beginningWeight: 200,
    currentWeight: 200,
    beginningWaist: 36,
    currentWaist: 36,
    strengthTrend: "stable",
    beginningBodyFat: null,
    currentBodyFat: null,
    ...overrides,
  };
}

function signal(result, key) {
  return result.signals.find((item) => item.key === key);
}

test("classifies a stable-weight, smaller-waist pattern as likely recomp", () => {
  const result = assessRecompReality(base({
    currentWeight: 200.8,
    currentWaist: 35,
  }));

  assert.equal(result.classification, "likely_recomp");
  assert.equal(result.confidence, "medium");
  assert.equal(signal(result, "weight").direction, "stable");
  assert.equal(signal(result, "waist").direction, "down");
  assert.match(result.summary, /indirect evidence/i);
});

test("allows a rising-weight recomp pattern only with leaner and performance support", () => {
  const supported = assessRecompReality(base({
    currentWeight: 204,
    currentWaist: 35,
    strengthTrend: "improved",
  }));
  const unsupported = assessRecompReality(base({
    currentWeight: 204,
    currentWaist: 35,
    strengthTrend: "stable",
  }));

  assert.equal(supported.classification, "likely_recomp");
  assert.equal(unsupported.classification, "insufficient_or_mixed");
});

test("assigns high confidence to four agreeing recomp signals over eight weeks", () => {
  const result = assessRecompReality(base({
    weeks: 10,
    currentWeight: 201,
    currentWaist: 35,
    strengthTrend: "improved",
    beginningBodyFat: 20,
    currentBodyFat: 18.5,
  }));

  assert.equal(result.classification, "likely_recomp");
  assert.equal(result.confidence, "high");
  assert.match(result.confidenceRationale, /4 entered signals/i);
});

test("classifies agreeing downward weight and waist signals as likely cut", () => {
  const result = assessRecompReality(base({
    currentWeight: 194,
    currentWaist: 34.5,
    beginningBodyFat: 20,
    currentBodyFat: 18.5,
  }));

  assert.equal(result.classification, "likely_cut");
  assert.equal(result.confidence, "high");
  assert.ok(result.agreeingSignals.every((item) => !/down \+/.test(item)));
  assert.match(result.agreeingSignals.join(" "), /moved down 0\.38% per week/i);
});

test("classifies agreeing upward signals as likely surplus without claiming tissue gain", () => {
  const result = assessRecompReality(base({
    currentWeight: 204,
    currentWaist: 37,
    strengthTrend: "improved",
    beginningBodyFat: 15,
    currentBodyFat: 16.5,
  }));

  assert.equal(result.classification, "likely_surplus");
  assert.equal(result.confidence, "high");
  assert.doesNotMatch(JSON.stringify(result), /(?:gained|lost) \d/i);
  assert.match(result.summary, /water, glycogen, and food mass/i);
});

test("returns mixed evidence when weight and waist directly disagree", () => {
  const result = assessRecompReality(base({
    currentWeight: 196,
    currentWaist: 37,
  }));

  assert.equal(result.classification, "insufficient_or_mixed");
  assert.equal(result.confidence, "low");
  assert.match(result.conflictingSignals.join(" "), /core measurements disagree/i);
  assert.equal(result.checkAgainInWeeks, 2);
});

test("does not call stable measurements a recomp solely because performance improved", () => {
  const result = assessRecompReality(base({ strengthTrend: "improved" }));

  assert.equal(result.classification, "insufficient_or_mixed");
  assert.match(result.conflictingSignals.join(" "), /noise guard/i);
});

test("a consistent downward body-fat estimate can add the missing leaner signal", () => {
  const result = assessRecompReality(base({
    beginningBodyFat: 20,
    currentBodyFat: 18.8,
  }));

  assert.equal(result.classification, "likely_recomp");
  assert.equal(signal(result, "body_fat").direction, "down");
  assert.equal(result.confidence, "medium");
});

test("an upward body-fat estimate blocks a cut call even when weight and waist fall", () => {
  const result = assessRecompReality(base({
    currentWeight: 194,
    currentWaist: 35,
    beginningBodyFat: 18,
    currentBodyFat: 19.2,
  }));

  assert.equal(result.classification, "insufficient_or_mixed");
  assert.match(result.conflictingSignals.join(" "), /different direction/i);
});

test("threshold boundaries are directional while values just inside remain neutral", () => {
  assert.deepEqual(RECOMP_SIGNAL_THRESHOLDS, {
    weeklyWeightPercent: 0.15,
    waistPercent: 1.25,
    bodyFatPoints: 1,
  });

  const atWeightBoundary = assessRecompReality(base({
    weeks: 4,
    currentWeight: 201.2,
    strengthTrend: "improved",
  }));
  const insideWeightBoundary = assessRecompReality(base({
    weeks: 4,
    currentWeight: 201.19,
    strengthTrend: "improved",
  }));
  const atWaistBoundary = assessRecompReality(base({
    beginningWaist: 40,
    currentWaist: 39.5,
  }));
  const atBodyFatBoundary = assessRecompReality(base({
    beginningBodyFat: 20,
    currentBodyFat: 19,
  }));

  assert.equal(signal(atWeightBoundary, "weight").direction, "up");
  assert.equal(signal(insideWeightBoundary, "weight").direction, "stable");
  assert.equal(signal(atWaistBoundary, "waist").direction, "down");
  assert.equal(signal(atBodyFatBoundary, "body_fat").direction, "down");
});

test("validates the 4 to 12 week boundary and requires whole weeks", () => {
  for (const weeks of [3, 4.5, 13, Number.NaN]) {
    const issues = validateRecompRealityInputs(base({ weeks }));
    assert.ok(issues.some((issue) => issue.field === "weeks"));
  }

  assert.equal(validateRecompRealityInputs(base({ weeks: 4 })).length, 0);
  assert.equal(validateRecompRealityInputs(base({ weeks: 12 })).length, 0);
});

test("requires both optional body-fat values and rejects out-of-range estimates", () => {
  const halfPair = validateRecompRealityInputs(base({
    beginningBodyFat: 20,
    currentBodyFat: null,
  }));
  const badRange = validateRecompRealityInputs(base({
    beginningBodyFat: 1.9,
    currentBodyFat: 71,
  }));

  assert.ok(halfPair.some((issue) => issue.field === "currentBodyFat"));
  assert.ok(badRange.some((issue) => issue.field === "beginningBodyFat"));
  assert.ok(badRange.some((issue) => issue.field === "currentBodyFat"));
});

test("rejects invalid and mismatched-unit inputs with structured errors", () => {
  const invalid = base({
    beginningWeight: 0,
    currentWaist: Number.NaN,
    strengthTrend: "unknown",
  });
  const issues = validateRecompRealityInputs(invalid);

  assert.deepEqual(
    issues.slice(0, 3).map((issue) => issue.field),
    ["beginningWeight", "currentWaist", "strengthTrend"],
  );
  assert.throws(
    () => assessRecompReality(invalid),
    (error) =>
      error instanceof RecompRealityInputError && error.issues.length >= 3,
  );

  const mismatchedUnits = validateRecompRealityInputs(base({
    beginningWeight: 90,
    currentWeight: 200,
  }));
  assert.ok(mismatchedUnits.some((issue) => /same unit/i.test(issue.message)));
});

test("assessment output is deterministic and always includes a non-medical boundary", () => {
  const input = base({
    currentWeight: 198,
    currentWaist: 35,
    strengthTrend: "improved",
  });
  const first = assessRecompReality(input);
  const second = assessRecompReality({ ...input });

  assert.deepEqual(first, second);
  assert.match(first.disclaimer, /cannot diagnose body composition/i);
  assert.match(first.disclaimer, /cannot.*prove muscle gain or fat loss/i);
  assert.ok(first.checkAgainInWeeks >= 2 && first.checkAgainInWeeks <= 4);
});
