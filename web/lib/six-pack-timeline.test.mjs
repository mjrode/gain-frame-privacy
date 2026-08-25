import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateSixPackTimeline,
  targetBodyFatForSixPack,
} from "./six-pack-timeline.ts";

test("uses sex-specific defined-abs thresholds", () => {
  assert.equal(targetBodyFatForSixPack("male"), 12);
  assert.equal(targetBodyFatForSixPack("female"), 19);
});
test("calculates a range from photo uncertainty and adherence", () => {
  const result = calculateSixPackTimeline({
    sex: "male",
    weightLbs: 180,
    estimatedBodyFatLow: 19,
    estimatedBodyFatHigh: 23,
    dailyDeficit: 500,
  });

  assert.equal(result.targetBodyFat, 12);
  assert.equal(result.weeklyLossLbs, 1);
  assert.ok(result.weightLossLowLbs > 10);
  assert.ok(result.weightLossHighLbs > result.weightLossLowLbs);
  assert.ok(result.weeksHigh > result.weeksLow);
  assert.equal(result.alreadyVisible, false);
  assert.equal(result.paceWarning, false);
});

test("returns zero weeks when the full estimate range is already at target", () => {
  const result = calculateSixPackTimeline({
    sex: "female",
    weightLbs: 140,
    estimatedBodyFatLow: 17,
    estimatedBodyFatHigh: 19,
    dailyDeficit: 250,
  });

  assert.equal(result.alreadyVisible, true);
  assert.equal(result.weeksLow, 0);
  assert.equal(result.weeksHigh, 0);
});

test("flags a selected pace above one percent of bodyweight per week", () => {
  const result = calculateSixPackTimeline({
    sex: "male",
    weightLbs: 120,
    estimatedBodyFatLow: 18,
    estimatedBodyFatHigh: 20,
    dailyDeficit: 750,
  });

  assert.equal(result.paceWarning, true);
});

test("rejects impossible inputs", () => {
  assert.throws(
    () =>
      calculateSixPackTimeline({
        sex: "male",
        weightLbs: 0,
        estimatedBodyFatLow: 18,
        estimatedBodyFatHigh: 20,
        dailyDeficit: 500,
      }),
    /Weight/,
  );
});
