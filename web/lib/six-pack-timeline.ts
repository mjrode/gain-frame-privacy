export type SixPackSex = "male" | "female";

export type SixPackTimelineInput = {
  sex: SixPackSex;
  weightLbs: number;
  estimatedBodyFatLow: number;
  estimatedBodyFatHigh: number;
  dailyDeficit: number;
};

export type SixPackTimeline = {
  targetBodyFat: number;
  weeksLow: number;
  weeksHigh: number;
  weightLossLowLbs: number;
  weightLossHighLbs: number;
  weeklyLossLbs: number;
  weeklyLossPercent: number;
  alreadyVisible: boolean;
  paceWarning: boolean;
};

export const DEFICIT_PRESETS = [
  { calories: 250, label: "Gentle", note: "~0.5 lb / week" },
  { calories: 400, label: "Moderate", note: "~0.8 lb / week" },
  { calories: 500, label: "Standard", note: "~1 lb / week" },
  { calories: 750, label: "Aggressive", note: "~1.5 lb / week" },
] as const;

export function targetBodyFatForSixPack(sex: SixPackSex): number {
  return sex === "male" ? 12 : 19;
}

function poundsToTarget(
  weightLbs: number,
  bodyFat: number,
  targetBodyFat: number,
): number {
  if (bodyFat <= targetBodyFat) return 0;
  const leanMass = weightLbs * (1 - bodyFat / 100);
  const targetWeight = leanMass / (1 - targetBodyFat / 100);
  return Math.max(0, weightLbs - targetWeight);
}

/**
 * Turns a photo-derived body-fat range into a transparent timeline range.
 *
 * The fast end assumes the selected deficit is sustained. The slow end adds
 * a 20% allowance for normal adherence misses and metabolic adaptation. This
 * remains a planning estimate: the photo range and personal ab-visibility
 * threshold are both meaningful sources of uncertainty.
 */
export function calculateSixPackTimeline(
  input: SixPackTimelineInput,
): SixPackTimeline {
  const {
    sex,
    weightLbs,
    dailyDeficit,
  } = input;
  const estimatedBodyFatLow = Math.min(
    input.estimatedBodyFatLow,
    input.estimatedBodyFatHigh,
  );
  const estimatedBodyFatHigh = Math.max(
    input.estimatedBodyFatLow,
    input.estimatedBodyFatHigh,
  );

  if (!Number.isFinite(weightLbs) || weightLbs <= 0) {
    throw new RangeError("Weight must be greater than zero.");
  }
  if (!Number.isFinite(dailyDeficit) || dailyDeficit <= 0) {
    throw new RangeError("Daily deficit must be greater than zero.");
  }
  if (
    estimatedBodyFatLow <= 0 ||
    estimatedBodyFatHigh >= 70 ||
    !Number.isFinite(estimatedBodyFatLow) ||
    !Number.isFinite(estimatedBodyFatHigh)
  ) {
    throw new RangeError("Body-fat estimates are outside the supported range.");
  }

  const targetBodyFat = targetBodyFatForSixPack(sex);
  const weightLossLowLbs = poundsToTarget(
    weightLbs,
    estimatedBodyFatLow,
    targetBodyFat,
  );
  const weightLossHighLbs = poundsToTarget(
    weightLbs,
    estimatedBodyFatHigh,
    targetBodyFat,
  );
  const weeklyLossLbs = (dailyDeficit * 7) / 3500;
  const weeklyLossPercent = (weeklyLossLbs / weightLbs) * 100;
  const alreadyVisible = weightLossHighLbs === 0;

  return {
    targetBodyFat,
    weeksLow: alreadyVisible || weightLossLowLbs === 0
      ? 0
      : Math.max(1, Math.ceil(weightLossLowLbs / weeklyLossLbs)),
    weeksHigh: alreadyVisible
      ? 0
      : Math.max(1, Math.ceil(weightLossHighLbs / (weeklyLossLbs * 0.8))),
    weightLossLowLbs,
    weightLossHighLbs,
    weeklyLossLbs,
    weeklyLossPercent,
    alreadyVisible,
    paceWarning: weeklyLossPercent > 1,
  };
}
