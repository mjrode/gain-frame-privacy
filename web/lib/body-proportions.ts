export type ProportionSex = "male" | "female";
export type MeasurementUnit = "in" | "cm";

export const MEASUREMENT_KEYS = [
  "height",
  "wrist",
  "shoulders",
  "chest",
  "waist",
  "arms",
  "thighs",
] as const;

export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];
export type Measurements = Record<MeasurementKey, number>;
export type RegionalMeasurementKey = Exclude<
  MeasurementKey,
  "height" | "wrist"
>;
export type RegionalAdjustments = Partial<Record<RegionalMeasurementKey, number>>;

export type ProportionMetric = {
  key:
    | "shoulder_to_waist"
    | "waist_to_height"
    | "chest_to_waist"
    | "arm_to_wrist"
    | "thigh_to_wrist";
  label: string;
  shortLabel: string;
  value: number;
  low: number;
  high: number;
  status: "below" | "in_range" | "above";
  score: number;
  explanation: string;
};

export type ProportionResult = {
  score: number;
  metrics: ProportionMetric[];
  strongest: ProportionMetric;
  focus: ProportionMetric;
};

export const MEASUREMENT_LIMITS_CM: Record<
  MeasurementKey,
  readonly [number, number]
> = {
  height: [120, 230],
  wrist: [10, 30],
  shoulders: [70, 180],
  chest: [60, 180],
  waist: [45, 180],
  arms: [15, 65],
  thighs: [30, 100],
};

const REFERENCES: Record<
  ProportionSex,
  Record<ProportionMetric["key"], readonly [number, number]>
> = {
  male: {
    shoulder_to_waist: [1.45, 1.62],
    waist_to_height: [0.4, 0.5],
    chest_to_waist: [1.25, 1.4],
    arm_to_wrist: [2.2, 2.5],
    thigh_to_wrist: [3.2, 3.6],
  },
  female: {
    shoulder_to_waist: [1.3, 1.45],
    waist_to_height: [0.4, 0.5],
    chest_to_waist: [1.1, 1.3],
    arm_to_wrist: [1.8, 2.1],
    thigh_to_wrist: [2.8, 3.3],
  },
};

const LABELS: Record<
  ProportionMetric["key"],
  { label: string; shortLabel: string }
> = {
  shoulder_to_waist: {
    label: "Shoulder-to-waist",
    shortLabel: "V-taper",
  },
  waist_to_height: { label: "Waist-to-height", shortLabel: "Waist" },
  chest_to_waist: { label: "Chest-to-waist", shortLabel: "Torso" },
  arm_to_wrist: { label: "Arm-to-wrist", shortLabel: "Arms" },
  thigh_to_wrist: { label: "Thigh-to-wrist", shortLabel: "Legs" },
};

const CM_PER_INCH = 2.54;

export function toCentimeters(value: number, unit: MeasurementUnit): number {
  return unit === "in" ? value * CM_PER_INCH : value;
}

export function fromCentimeters(value: number, unit: MeasurementUnit): number {
  return unit === "in" ? value / CM_PER_INCH : value;
}

export function validateMeasurements(
  measurements: Partial<Measurements>,
): Partial<Record<MeasurementKey, string>> {
  const errors: Partial<Record<MeasurementKey, string>> = {};
  for (const key of MEASUREMENT_KEYS) {
    const value = measurements[key];
    if (value === undefined || !Number.isFinite(value)) {
      errors[key] = "Required";
      continue;
    }
    const [minimum, maximum] = MEASUREMENT_LIMITS_CM[key];
    if (value < minimum || value > maximum) {
      errors[key] = `Use ${minimum}–${maximum} cm`;
    }
  }
  return errors;
}

function metric(
  key: ProportionMetric["key"],
  value: number,
  sex: ProportionSex,
): ProportionMetric {
  const [low, high] = REFERENCES[sex][key];
  const status = value < low ? "below" : value > high ? "above" : "in_range";
  const midpoint = (low + high) / 2;
  const distance = value < low ? low - value : value > high ? value - high : 0;
  const halfBand = (high - low) / 2;
  const score = status === "in_range"
    ? Math.round(100 - (Math.abs(value - midpoint) / halfBand) * 20)
    : Math.max(0, Math.round(80 - (distance / midpoint) * 450));
  const direction = status === "in_range"
    ? "inside the reference band"
    : status === "below"
      ? "below the reference band"
      : "above the reference band";
  const caveat = key === "waist_to_height"
    ? "This is the only health-screening ratio in the set."
    : "This is an aesthetic reference, not a health target.";
  return {
    key,
    ...LABELS[key],
    value,
    low,
    high,
    status,
    score,
    explanation: `Your ratio is ${direction}. ${caveat}`,
  };
}

export function calculateProportions(
  measurements: Measurements,
  sex: ProportionSex,
): ProportionResult {
  const metrics = [
    metric(
      "shoulder_to_waist",
      measurements.shoulders / measurements.waist,
      sex,
    ),
    metric("waist_to_height", measurements.waist / measurements.height, sex),
    metric("chest_to_waist", measurements.chest / measurements.waist, sex),
    metric("arm_to_wrist", measurements.arms / measurements.wrist, sex),
    metric("thigh_to_wrist", measurements.thighs / measurements.wrist, sex),
  ];
  const weightedScore =
    metrics[0].score * 0.3 +
    metrics[1].score * 0.25 +
    metrics[2].score * 0.2 +
    metrics[3].score * 0.125 +
    metrics[4].score * 0.125;
  const sorted = [...metrics].sort((a, b) => b.score - a.score);
  return {
    score: Math.round(weightedScore),
    metrics,
    strongest: sorted[0],
    focus: sorted[sorted.length - 1],
  };
}

function midpoint(range: readonly [number, number]): number {
  return (range[0] + range[1]) / 2;
}

function boundedTarget(
  current: number,
  desired: number,
  key: RegionalMeasurementKey,
): number {
  const minimumChange = key === "waist" ? -0.15 : -0.08;
  const maximumChange = key === "waist" ? 0.08 : 0.15;
  return Math.max(
    current * (1 + minimumChange),
    Math.min(current * (1 + maximumChange), desired),
  );
}

/**
 * Produces a conservative starting target rather than an implied prescription.
 * Each change is capped so the AI-preview controls begin in a plausible range.
 */
export function suggestTargets(
  current: Measurements,
  sex: ProportionSex,
): Measurements {
  const refs = REFERENCES[sex];
  const desiredWaist = Math.min(
    current.height * midpoint(refs.waist_to_height),
    current.shoulders / midpoint(refs.shoulder_to_waist),
    current.chest / midpoint(refs.chest_to_waist),
  );
  const waist = boundedTarget(current.waist, desiredWaist, "waist");
  return {
    height: current.height,
    wrist: current.wrist,
    waist,
    shoulders: boundedTarget(
      current.shoulders,
      waist * midpoint(refs.shoulder_to_waist),
      "shoulders",
    ),
    chest: boundedTarget(
      current.chest,
      waist * midpoint(refs.chest_to_waist),
      "chest",
    ),
    arms: boundedTarget(
      current.arms,
      current.wrist * midpoint(refs.arm_to_wrist),
      "arms",
    ),
    thighs: boundedTarget(
      current.thighs,
      current.wrist * midpoint(refs.thigh_to_wrist),
      "thighs",
    ),
  };
}

export function regionalAdjustments(
  current: Measurements,
  target: Measurements,
): RegionalAdjustments {
  const result: RegionalAdjustments = {};
  for (const key of [
    "shoulders",
    "chest",
    "waist",
    "arms",
    "thighs",
  ] as const) {
    const percentage = ((target[key] / current[key]) - 1) * 100;
    const bounded = Math.max(-25, Math.min(25, percentage));
    if (Math.abs(bounded) >= 0.5) result[key] = Math.round(bounded * 10) / 10;
  }
  return result;
}

export function formatRatio(value: number): string {
  return value.toFixed(2);
}

export function formatMeasurement(
  valueCm: number,
  unit: MeasurementUnit,
): string {
  const value = fromCentimeters(valueCm, unit);
  return `${value.toFixed(1).replace(/\.0$/, "")} ${unit}`;
}
