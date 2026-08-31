export const RECOMP_CLASSIFICATIONS = [
  "likely_recomp",
  "likely_cut",
  "likely_surplus",
  "insufficient_or_mixed",
] as const;

export type RecompClassification = (typeof RECOMP_CLASSIFICATIONS)[number];
export type RecompConfidence = "low" | "medium" | "high";
export type StrengthPerformanceTrend = "improved" | "stable" | "declined";
export type RecompSignalDirection = "down" | "stable" | "up" | "not_used";

export type RecompRealityInputs = {
  weeks: number;
  beginningWeight: number;
  currentWeight: number;
  beginningWaist: number;
  currentWaist: number;
  strengthTrend: StrengthPerformanceTrend;
  beginningBodyFat?: number | null;
  currentBodyFat?: number | null;
};

export type RecompRealityField =
  | "weeks"
  | "beginningWeight"
  | "currentWeight"
  | "beginningWaist"
  | "currentWaist"
  | "strengthTrend"
  | "beginningBodyFat"
  | "currentBodyFat";

export type RecompValidationIssue = {
  field: RecompRealityField;
  message: string;
};

export type RecompTrendSignal = {
  key: "weight" | "waist" | "strength" | "body_fat";
  label: string;
  direction: RecompSignalDirection;
  displayValue: string;
  note: string;
};

export type RecompRealityAssessment = {
  classification: RecompClassification;
  label: string;
  confidence: RecompConfidence;
  confidenceRationale: string;
  summary: string;
  signals: RecompTrendSignal[];
  agreeingSignals: string[];
  conflictingSignals: string[];
  checkAgainInWeeks: number;
  checkAgain: string;
  metrics: {
    totalWeightChangePercent: number;
    weeklyWeightChangePercent: number;
    waistChangePercent: number;
    bodyFatChangePoints: number | null;
  };
  disclaimer: string;
};

/**
 * These are deliberately conservative noise guards, not physiological laws.
 * Weekly-average weight is normalized by period length; tape and body-fat
 * inputs need a larger movement before they are treated as directional.
 */
export const RECOMP_SIGNAL_THRESHOLDS = {
  weeklyWeightPercent: 0.15,
  waistPercent: 1.25,
  bodyFatPoints: 1,
} as const;

const DISCLAIMER =
  "This pattern check cannot diagnose body composition, prove muscle gain or fat loss, or replace medical advice. It only compares trends in the numbers you enter.";

const LABELS: Record<RecompClassification, string> = {
  likely_recomp: "Likely recomp pattern",
  likely_cut: "Likely cut pattern",
  likely_surplus: "Likely surplus pattern",
  insufficient_or_mixed: "Insufficient or mixed evidence",
};

function isFinitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function percentChange(beginning: number, current: number): number {
  return ((current - beginning) / beginning) * 100;
}

function direction(
  value: number,
  threshold: number,
): Exclude<RecompSignalDirection, "not_used"> {
  const floatingPointTolerance = 1e-9;
  if (value <= -threshold + floatingPointTolerance) return "down";
  if (value >= threshold - floatingPointTolerance) return "up";
  return "stable";
}

function signed(value: number, digits = 1): string {
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(digits)}%`;
}

function signedPoints(value: number): string {
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)} points`;
}

function magnitude(value: number, digits = 1): string {
  return `${Math.abs(value).toFixed(digits)}%`;
}

function magnitudePoints(value: number): string {
  return `${Math.abs(value).toFixed(1)} points`;
}

function directionLabel(value: RecompSignalDirection): string {
  if (value === "up") return "Moved up";
  if (value === "down") return "Moved down";
  if (value === "stable") return "Inside neutral band";
  return "Not included";
}

export function validateRecompRealityInputs(
  input: RecompRealityInputs,
): RecompValidationIssue[] {
  const issues: RecompValidationIssue[] = [];

  if (!Number.isInteger(input.weeks) || input.weeks < 4 || input.weeks > 12) {
    issues.push({
      field: "weeks",
      message: "Choose a whole period from 4 to 12 weeks.",
    });
  }

  if (!isFinitePositive(input.beginningWeight)) {
    issues.push({
      field: "beginningWeight",
      message: "Enter a beginning weekly-average weight above zero.",
    });
  }
  if (!isFinitePositive(input.currentWeight)) {
    issues.push({
      field: "currentWeight",
      message: "Enter a current weekly-average weight above zero.",
    });
  }
  if (!isFinitePositive(input.beginningWaist)) {
    issues.push({
      field: "beginningWaist",
      message: "Enter a beginning waist measurement above zero.",
    });
  }
  if (!isFinitePositive(input.currentWaist)) {
    issues.push({
      field: "currentWaist",
      message: "Enter a current waist measurement above zero.",
    });
  }
  if (
    input.strengthTrend !== "improved" &&
    input.strengthTrend !== "stable" &&
    input.strengthTrend !== "declined"
  ) {
    issues.push({
      field: "strengthTrend",
      message: "Choose how comparable training performance changed.",
    });
  }

  const hasBeginningBodyFat = input.beginningBodyFat != null;
  const hasCurrentBodyFat = input.currentBodyFat != null;
  if (hasBeginningBodyFat !== hasCurrentBodyFat) {
    issues.push({
      field: hasBeginningBodyFat ? "currentBodyFat" : "beginningBodyFat",
      message: "Enter both body-fat estimates, or leave both out.",
    });
  } else if (hasBeginningBodyFat && hasCurrentBodyFat) {
    if (
      !Number.isFinite(input.beginningBodyFat) ||
      input.beginningBodyFat! < 2 ||
      input.beginningBodyFat! > 70
    ) {
      issues.push({
        field: "beginningBodyFat",
        message: "Use a body-fat estimate from 2% to 70%.",
      });
    }
    if (
      !Number.isFinite(input.currentBodyFat) ||
      input.currentBodyFat! < 2 ||
      input.currentBodyFat! > 70
    ) {
      issues.push({
        field: "currentBodyFat",
        message: "Use a body-fat estimate from 2% to 70%.",
      });
    }
  }

  if (
    isFinitePositive(input.beginningWeight) &&
    isFinitePositive(input.currentWeight) &&
    Math.abs(percentChange(input.beginningWeight, input.currentWeight)) > 40
  ) {
    issues.push({
      field: "currentWeight",
      message: "That change is unusually large. Check that both weights use the same unit.",
    });
  }
  if (
    isFinitePositive(input.beginningWaist) &&
    isFinitePositive(input.currentWaist) &&
    Math.abs(percentChange(input.beginningWaist, input.currentWaist)) > 40
  ) {
    issues.push({
      field: "currentWaist",
      message: "That change is unusually large. Check that both waist measurements use the same unit.",
    });
  }

  return issues;
}

export class RecompRealityInputError extends Error {
  readonly issues: RecompValidationIssue[];

  constructor(issues: RecompValidationIssue[]) {
    super(issues[0]?.message ?? "Invalid recomp checker inputs.");
    this.name = "RecompRealityInputError";
    this.issues = issues;
  }
}

type CalculatedSignals = {
  totalWeightChangePercent: number;
  weeklyWeightChangePercent: number;
  waistChangePercent: number;
  bodyFatChangePoints: number | null;
  weightDirection: Exclude<RecompSignalDirection, "not_used">;
  waistDirection: Exclude<RecompSignalDirection, "not_used">;
  bodyFatDirection: RecompSignalDirection;
};

function calculateSignals(input: RecompRealityInputs): CalculatedSignals {
  const totalWeightChangePercent = percentChange(
    input.beginningWeight,
    input.currentWeight,
  );
  const weeklyWeightChangePercent = totalWeightChangePercent / input.weeks;
  const waistChangePercent = percentChange(
    input.beginningWaist,
    input.currentWaist,
  );
  const hasBodyFat =
    input.beginningBodyFat != null && input.currentBodyFat != null;
  const bodyFatChangePoints = hasBodyFat
    ? input.currentBodyFat! - input.beginningBodyFat!
    : null;

  return {
    totalWeightChangePercent,
    weeklyWeightChangePercent,
    waistChangePercent,
    bodyFatChangePoints,
    weightDirection: direction(
      weeklyWeightChangePercent,
      RECOMP_SIGNAL_THRESHOLDS.weeklyWeightPercent,
    ),
    waistDirection: direction(
      waistChangePercent,
      RECOMP_SIGNAL_THRESHOLDS.waistPercent,
    ),
    bodyFatDirection: bodyFatChangePoints == null
      ? "not_used"
      : direction(
          bodyFatChangePoints,
          RECOMP_SIGNAL_THRESHOLDS.bodyFatPoints,
        ),
  };
}

function classify(
  input: RecompRealityInputs,
  signal: CalculatedSignals,
): RecompClassification {
  const { weightDirection, waistDirection, bodyFatDirection } = signal;
  const bodyFatSupportsDown = bodyFatDirection === "down";
  const bodyFatContradictsDown = bodyFatDirection === "up";

  const cutPattern =
    weightDirection === "down" &&
    waistDirection !== "up" &&
    !bodyFatContradictsDown &&
    (
      waistDirection === "down" ||
      bodyFatSupportsDown ||
      input.strengthTrend !== "declined"
    );
  if (cutPattern) return "likely_cut";

  const surplusPattern =
    weightDirection === "up" &&
    waistDirection !== "down" &&
    bodyFatDirection !== "down" &&
    (
      waistDirection === "up" ||
      bodyFatDirection === "up" ||
      input.strengthTrend === "improved"
    );
  if (surplusPattern) return "likely_surplus";

  const hasLeanerSignal =
    waistDirection === "down" || bodyFatDirection === "down";
  const performanceSupportsRecomp =
    input.strengthTrend === "improved" ||
    (
      weightDirection === "stable" &&
      input.strengthTrend === "stable"
    ) ||
    bodyFatDirection === "down";
  const recompPattern =
    weightDirection !== "down" &&
    waistDirection !== "up" &&
    bodyFatDirection !== "up" &&
    input.strengthTrend !== "declined" &&
    hasLeanerSignal &&
    performanceSupportsRecomp;
  if (recompPattern) return "likely_recomp";

  return "insufficient_or_mixed";
}

function supportAndConflictCounts(
  classification: RecompClassification,
  input: RecompRealityInputs,
  signal: CalculatedSignals,
): { support: number; conflict: number } {
  const { weightDirection, waistDirection, bodyFatDirection } = signal;

  if (classification === "likely_cut") {
    return {
      support:
        1 +
        Number(waistDirection === "down") +
        Number(input.strengthTrend !== "declined") +
        Number(bodyFatDirection === "down"),
      conflict:
        Number(waistDirection === "up") +
        Number(input.strengthTrend === "declined") +
        Number(bodyFatDirection === "up"),
    };
  }
  if (classification === "likely_surplus") {
    return {
      support:
        1 +
        Number(waistDirection === "up") +
        Number(input.strengthTrend === "improved") +
        Number(bodyFatDirection === "up"),
      conflict:
        Number(waistDirection === "down") +
        Number(input.strengthTrend === "declined") +
        Number(bodyFatDirection === "down"),
    };
  }
  if (classification === "likely_recomp") {
    return {
      support:
        Number(weightDirection === "stable" || weightDirection === "up") +
        Number(waistDirection === "down") +
        Number(input.strengthTrend !== "declined") +
        Number(bodyFatDirection === "down"),
      conflict:
        Number(weightDirection === "down") +
        Number(waistDirection === "up") +
        Number(input.strengthTrend === "declined") +
        Number(bodyFatDirection === "up"),
    };
  }
  return { support: 0, conflict: 0 };
}

function confidenceFor(
  classification: RecompClassification,
  input: RecompRealityInputs,
  signal: CalculatedSignals,
): { level: RecompConfidence; rationale: string } {
  if (classification === "insufficient_or_mixed") {
    return {
      level: "low",
      rationale:
        "The entered signals do not support one direction strongly enough yet.",
    };
  }

  const { support, conflict } = supportAndConflictCounts(
    classification,
    input,
    signal,
  );
  if (input.weeks >= 8 && support >= 4 && conflict === 0) {
    return {
      level: "high",
      rationale: `${support} entered signals agree across at least eight weeks without a direct contradiction.`,
    };
  }
  if (input.weeks >= 6 && support >= 3 && conflict <= 1) {
    return {
      level: "medium",
      rationale: `${support} entered signals point the same way, with limited conflicting evidence.`,
    };
  }
  return {
    level: "low",
    rationale:
      "The pattern is plausible, but it needs more time or another agreeing signal before it is sturdy.",
  };
}

function signalCards(
  input: RecompRealityInputs,
  signal: CalculatedSignals,
): RecompTrendSignal[] {
  const strengthDirection = input.strengthTrend === "improved"
    ? "up"
    : input.strengthTrend === "declined"
      ? "down"
      : "stable";
  return [
    {
      key: "weight",
      label: "Weekly-average weight",
      direction: signal.weightDirection,
      displayValue: `${signed(signal.totalWeightChangePercent)} total`,
      note: `${signed(signal.weeklyWeightChangePercent, 2)} per week · ${directionLabel(signal.weightDirection)}`,
    },
    {
      key: "waist",
      label: "Waist measurement",
      direction: signal.waistDirection,
      displayValue: signed(signal.waistChangePercent),
      note: `${directionLabel(signal.waistDirection)} using the same tape landmark`,
    },
    {
      key: "strength",
      label: "Training performance",
      direction: strengthDirection,
      displayValue: input.strengthTrend === "improved"
        ? "Improved"
        : input.strengthTrend === "declined"
          ? "Declined"
          : "About the same",
      note: "Comparable exercises, sets, reps, and effort",
    },
    {
      key: "body_fat",
      label: "Body-fat estimate",
      direction: signal.bodyFatDirection,
      displayValue: signal.bodyFatChangePoints == null
        ? "Not included"
        : signedPoints(signal.bodyFatChangePoints),
      note: signal.bodyFatChangePoints == null
        ? "Optional signal"
        : `${directionLabel(signal.bodyFatDirection)} with one consistent method`,
    },
  ];
}

function explanations(
  classification: RecompClassification,
  input: RecompRealityInputs,
  signal: CalculatedSignals,
): { agreeing: string[]; conflicting: string[]; summary: string } {
  const agreeing: string[] = [];
  const conflicting: string[] = [];
  const {
    weightDirection,
    waistDirection,
    bodyFatDirection,
    weeklyWeightChangePercent,
    waistChangePercent,
    bodyFatChangePoints,
  } = signal;

  if (classification === "likely_cut") {
    agreeing.push(
      `Weekly-average weight moved down ${magnitude(weeklyWeightChangePercent, 2)} per week.`,
    );
    if (waistDirection === "down") {
      agreeing.push(
        `Waist moved down ${magnitude(waistChangePercent)}, which agrees with the weight trend.`,
      );
    } else {
      conflicting.push(
        "Waist stayed inside the neutral band, so the tape does not confirm the weight trend yet.",
      );
    }
    if (input.strengthTrend === "declined") {
      conflicting.push(
        "Comparable training performance declined, which may reflect fatigue, programming, or an aggressive deficit.",
      );
    } else {
      agreeing.push(
        `Training performance ${input.strengthTrend === "improved" ? "improved" : "held steady"} while weight moved down.`,
      );
    }
    if (bodyFatDirection === "down" && bodyFatChangePoints != null) {
      agreeing.push(
        `The consistently measured body-fat estimate moved down ${magnitudePoints(bodyFatChangePoints)}.`,
      );
    } else if (bodyFatDirection === "stable") {
      conflicting.push(
        "The body-fat estimate stayed inside its noise guard, so it adds no directional confirmation.",
      );
    }
    return {
      agreeing,
      conflicting,
      summary:
        "The pattern looks most like a cut. That describes the direction of the trend, not how much fat or muscle changed.",
    };
  }

  if (classification === "likely_surplus") {
    agreeing.push(
      `Weekly-average weight moved up ${magnitude(weeklyWeightChangePercent, 2)} per week.`,
    );
    if (waistDirection === "up") {
      agreeing.push(
        `Waist moved up ${magnitude(waistChangePercent)}, which agrees with a surplus pattern.`,
      );
    } else {
      conflicting.push(
        "Waist stayed inside the neutral band, so the tape does not confirm the weight trend yet.",
      );
    }
    if (input.strengthTrend === "improved") {
      agreeing.push("Comparable training performance improved during the period.");
    } else if (input.strengthTrend === "declined") {
      conflicting.push(
        "Comparable training performance declined despite the rising weight trend.",
      );
    }
    if (bodyFatDirection === "up" && bodyFatChangePoints != null) {
      agreeing.push(
        `The consistently measured body-fat estimate moved up ${magnitudePoints(bodyFatChangePoints)}.`,
      );
    } else if (bodyFatDirection === "stable") {
      conflicting.push(
        "The body-fat estimate stayed inside its noise guard, so it adds no directional confirmation.",
      );
    }
    return {
      agreeing,
      conflicting,
      summary:
        "The pattern looks most like a surplus. It does not show how the added weight was divided between tissue, water, glycogen, and food mass.",
    };
  }

  if (classification === "likely_recomp") {
    if (weightDirection === "stable") {
      agreeing.push(
        `Weekly-average weight stayed inside the neutral band at ${signed(weeklyWeightChangePercent, 2)} per week.`,
      );
    } else {
      agreeing.push(
        `Weight moved up while the waist moved down and performance did not decline.`,
      );
    }
    if (waistDirection === "down") {
      agreeing.push(
        `Waist moved down ${magnitude(waistChangePercent)}.`,
      );
    }
    if (input.strengthTrend === "improved") {
      agreeing.push("Comparable training performance improved.");
    } else {
      agreeing.push("Comparable training performance held steady.");
    }
    if (bodyFatDirection === "down" && bodyFatChangePoints != null) {
      agreeing.push(
        `The consistently measured body-fat estimate moved down ${magnitudePoints(bodyFatChangePoints)}.`,
      );
    } else if (bodyFatDirection === "stable") {
      conflicting.push(
        "The body-fat estimate stayed inside its noise guard, so it does not independently confirm the pattern.",
      );
    }
    return {
      agreeing,
      conflicting,
      summary:
        "The combination looks most like recomp: a leaner measurement trend without a meaningful drop in weekly-average weight. It is still indirect evidence, not proof of exact tissue change.",
    };
  }

  if (weightDirection === "stable" && waistDirection === "stable") {
    agreeing.push(
      "Weight and waist both stayed inside their neutral bands.",
    );
  } else if (weightDirection === waistDirection) {
    agreeing.push(
      `Weight and waist both moved ${weightDirection}.`,
    );
  } else {
    agreeing.push(
      "No two core measurement signals formed a clean directional pattern.",
    );
  }

  if (weightDirection === "down" && waistDirection === "up") {
    conflicting.push(
      "Weight moved down while waist moved up, so the two core measurements disagree.",
    );
  } else if (weightDirection === "up" && waistDirection === "down") {
    conflicting.push(
      "Weight rose while waist fell, but the performance or body-fat signal did not confirm a recomp pattern.",
    );
  } else if (weightDirection === "stable" && waistDirection === "stable") {
    conflicting.push(
      "Neither core measurement moved beyond its noise guard yet.",
    );
  }
  if (input.strengthTrend === "declined") {
    conflicting.push(
      "Comparable training performance declined, which weakens a recomp or productive-surplus interpretation.",
    );
  }
  if (
    bodyFatDirection !== "not_used" &&
    bodyFatDirection !== "stable" &&
    bodyFatDirection !== waistDirection
  ) {
    conflicting.push(
      "The body-fat estimate points in a different direction from the waist measurement.",
    );
  }
  if (bodyFatDirection === "not_used") {
    conflicting.push(
      "No consistent body-fat trend was included, so the read relies on weight, tape, and performance.",
    );
  }
  return {
    agreeing,
    conflicting,
    summary:
      "The evidence is mixed or too quiet to call a recomp, cut, or surplus pattern responsibly.",
  };
}

export function assessRecompReality(
  input: RecompRealityInputs,
): RecompRealityAssessment {
  const issues = validateRecompRealityInputs(input);
  if (issues.length > 0) throw new RecompRealityInputError(issues);

  const calculated = calculateSignals(input);
  const classification = classify(input, calculated);
  const confidence = confidenceFor(classification, input, calculated);
  const explanation = explanations(classification, input, calculated);
  const checkAgainInWeeks = classification === "insufficient_or_mixed"
    ? input.weeks <= 5
      ? 4
      : 2
    : 4;
  const checkAgain = classification === "insufficient_or_mixed"
    ? `Keep the setup consistent and check again after ${checkAgainInWeeks} more weeks. A fresh weekly weight average and waist measurement should show whether the conflict persists.`
    : `Check again after ${checkAgainInWeeks} more weeks using the same scale schedule, waist landmark, and comparable lifts. Look for the pattern to repeat, not for one perfect reading.`;

  return {
    classification,
    label: LABELS[classification],
    confidence: confidence.level,
    confidenceRationale: confidence.rationale,
    summary: explanation.summary,
    signals: signalCards(input, calculated),
    agreeingSignals: explanation.agreeing,
    conflictingSignals: explanation.conflicting,
    checkAgainInWeeks,
    checkAgain,
    metrics: {
      totalWeightChangePercent: calculated.totalWeightChangePercent,
      weeklyWeightChangePercent: calculated.weeklyWeightChangePercent,
      waistChangePercent: calculated.waistChangePercent,
      bodyFatChangePoints: calculated.bodyFatChangePoints,
    },
    disclaimer: DISCLAIMER,
  };
}
