export type BodyShapeUnit = "metric" | "us";

export const BODY_SHAPE_FIELDS = [
  "height",
  "weight",
  "shoulders",
  "chest",
  "waist",
  "hips",
  "inseam",
  "bodyFat",
] as const;

export type BodyShapeField = (typeof BODY_SHAPE_FIELDS)[number];
export type RequiredBodyShapeField = Exclude<BodyShapeField, "bodyFat">;

export type BodyShapeInput = Record<RequiredBodyShapeField, number> & {
  bodyFat?: number;
};

export type BodyShapeMeasurements = {
  heightCm: number;
  weightKg: number;
  shouldersCm: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inseamCm: number;
  bodyFatPercent?: number;
};

export type BodyShapeProfile = {
  bmi: number;
  shoulderToWaist: number;
  waistToHeight: number;
  hipToWaist: number;
  inseamToHeight: number;
  shoulderHalf: number;
  chestHalf: number;
  waistHalf: number;
  hipHalf: number;
  crotchY: number;
  limbWidth: number;
};

export type BodyShapeSilhouette = {
  head: { cx: number; cy: number; radius: number };
  torsoPath: string;
  leftArmPath: string;
  rightArmPath: string;
  leftLegPath: string;
  rightLegPath: string;
};

export type BodyShapeSummary = {
  key: "weight" | "waist_to_height" | "shoulder_to_waist" | "body_fat";
  label: string;
  current: number;
  goal: number;
  delta: number;
};

type CanonicalField = keyof BodyShapeMeasurements;

const CM_PER_INCH = 2.54;
const POUNDS_PER_KG = 2.2046226218;
const CENTER_X = 110;

export const BODY_SHAPE_LIMITS: Record<CanonicalField, readonly [number, number]> = {
  heightCm: [120, 230],
  weightKg: [35, 250],
  shouldersCm: [65, 190],
  chestCm: [55, 190],
  waistCm: [40, 200],
  hipsCm: [55, 200],
  inseamCm: [45, 125],
  bodyFatPercent: [3, 70],
};

const FIELD_TO_CANONICAL: Record<BodyShapeField, CanonicalField> = {
  height: "heightCm",
  weight: "weightKg",
  shoulders: "shouldersCm",
  chest: "chestCm",
  waist: "waistCm",
  hips: "hipsCm",
  inseam: "inseamCm",
  bodyFat: "bodyFatPercent",
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function rounded(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function point(value: number): string {
  return rounded(value).toString();
}

function mirror(x: number): number {
  return CENTER_X + (CENTER_X - x);
}

function isLengthField(field: BodyShapeField): boolean {
  return field !== "weight" && field !== "bodyFat";
}

/** Convert a single displayed input when the user changes unit systems. */
export function convertBodyShapeValue(
  field: BodyShapeField,
  value: number,
  from: BodyShapeUnit,
  to: BodyShapeUnit,
): number {
  if (from === to || field === "bodyFat") return value;
  if (field === "weight") {
    return from === "metric" ? value * POUNDS_PER_KG : value / POUNDS_PER_KG;
  }
  if (isLengthField(field)) {
    return from === "metric" ? value / CM_PER_INCH : value * CM_PER_INCH;
  }
  return value;
}

/** Normalize displayed metric or U.S. values into centimeters and kilograms. */
export function normalizeBodyShapeInput(
  input: BodyShapeInput,
  unit: BodyShapeUnit,
): BodyShapeMeasurements {
  const length = (value: number) =>
    unit === "metric" ? value : value * CM_PER_INCH;
  const weight = unit === "metric"
    ? input.weight
    : input.weight / POUNDS_PER_KG;

  return {
    heightCm: length(input.height),
    weightKg: weight,
    shouldersCm: length(input.shoulders),
    chestCm: length(input.chest),
    waistCm: length(input.waist),
    hipsCm: length(input.hips),
    inseamCm: length(input.inseam),
    ...(input.bodyFat === undefined
      ? {}
      : { bodyFatPercent: input.bodyFat }),
  };
}

export function validateBodyShapeMeasurements(
  measurements: Partial<BodyShapeMeasurements>,
): Partial<Record<CanonicalField, string>> {
  const errors: Partial<Record<CanonicalField, string>> = {};
  const required = Object.keys(BODY_SHAPE_LIMITS).filter(
    (key) => key !== "bodyFatPercent",
  ) as CanonicalField[];

  for (const key of required) {
    const value = measurements[key];
    if (value === undefined || !Number.isFinite(value)) {
      errors[key] = "Required";
      continue;
    }
    const [minimum, maximum] = BODY_SHAPE_LIMITS[key];
    if (value < minimum || value > maximum) {
      errors[key] = "Outside the supported illustration range";
    }
  }

  const bodyFat = measurements.bodyFatPercent;
  if (bodyFat !== undefined) {
    const [minimum, maximum] = BODY_SHAPE_LIMITS.bodyFatPercent;
    if (!Number.isFinite(bodyFat) || bodyFat < minimum || bodyFat > maximum) {
      errors.bodyFatPercent = "Use 3–70% or leave blank";
    }
  }

  const height = measurements.heightCm;
  const inseam = measurements.inseamCm;
  if (
    Number.isFinite(height) &&
    Number.isFinite(inseam) &&
    inseam !== undefined &&
    height !== undefined &&
    (inseam / height < 0.3 || inseam / height > 0.65)
  ) {
    errors.inseamCm = "Check inseam against height";
  }

  return errors;
}

export function bodyShapeInputLimits(
  field: BodyShapeField,
  unit: BodyShapeUnit,
): readonly [number, number] {
  const canonical = FIELD_TO_CANONICAL[field];
  const [minimum, maximum] = BODY_SHAPE_LIMITS[canonical];
  if (unit === "metric" || field === "bodyFat") return [minimum, maximum];
  if (field === "weight") {
    return [minimum * POUNDS_PER_KG, maximum * POUNDS_PER_KG];
  }
  return [minimum / CM_PER_INCH, maximum / CM_PER_INCH];
}

/**
 * Maps entered proportions to a bounded illustration profile. Measurements
 * drive the outline; the result is deliberately not a future-body prediction.
 */
export function buildBodyShapeProfile(
  measurements: BodyShapeMeasurements,
): BodyShapeProfile {
  const heightM = measurements.heightCm / 100;
  const bmi = measurements.weightKg / heightM ** 2;
  const massOffset = clamp((Math.sqrt(bmi / 23) - 1) * 10, -3, 4);
  const softnessOffset = measurements.bodyFatPercent === undefined
    ? 0
    : clamp((measurements.bodyFatPercent - 20) * 0.1, -1.5, 4);
  const ratioWidth = (circumference: number, multiplier: number) =>
    (circumference / measurements.heightCm) * multiplier;

  return {
    bmi: rounded(bmi, 3),
    shoulderToWaist: rounded(
      measurements.shouldersCm / measurements.waistCm,
      3,
    ),
    waistToHeight: rounded(
      measurements.waistCm / measurements.heightCm,
      3,
    ),
    hipToWaist: rounded(measurements.hipsCm / measurements.waistCm, 3),
    inseamToHeight: rounded(
      measurements.inseamCm / measurements.heightCm,
      3,
    ),
    shoulderHalf: rounded(
      clamp(ratioWidth(measurements.shouldersCm, 75) + massOffset * 0.2, 37, 70),
    ),
    chestHalf: rounded(
      clamp(ratioWidth(measurements.chestCm, 72) + massOffset * 0.35, 29, 68),
    ),
    waistHalf: rounded(
      clamp(
        ratioWidth(measurements.waistCm, 68) + massOffset * 0.5 + softnessOffset,
        23,
        68,
      ),
    ),
    hipHalf: rounded(
      clamp(
        ratioWidth(measurements.hipsCm, 72) + massOffset * 0.35 + softnessOffset * 0.45,
        30,
        70,
      ),
    ),
    crotchY: rounded(
      clamp(342 - (measurements.inseamCm / measurements.heightCm) * 280, 177, 238),
    ),
    limbWidth: rounded(clamp(11 + massOffset * 0.35 + softnessOffset * 0.15, 8, 16)),
  };
}

export function buildBodyShapeSilhouette(
  profile: BodyShapeProfile,
): BodyShapeSilhouette {
  const neckHalf = clamp(profile.shoulderHalf * 0.24, 9, 15);
  const shoulderY = 70;
  const chestY = 105;
  const waistY = 155;
  const hipY = Math.min(196, profile.crotchY - 24);
  const handY = Math.min(224, profile.crotchY + 4);
  const ankleY = 334;
  const footY = 342;
  const legGap = clamp(profile.waistHalf * 0.17, 4.5, 9);

  const leftNeck = CENTER_X - neckHalf;
  const leftShoulder = CENTER_X - profile.shoulderHalf;
  const leftChest = CENTER_X - profile.chestHalf;
  const leftWaist = CENTER_X - profile.waistHalf;
  const leftHip = CENTER_X - profile.hipHalf;
  const leftHand = Math.min(leftShoulder - 8, leftHip - 12);
  const leftAnkleOuter = CENTER_X - clamp(profile.limbWidth + 7, 16, 23);
  const leftAnkleInner = CENTER_X - 5;

  const torsoPath = [
    `M ${point(leftNeck)} 55`,
    `C ${point(leftNeck - 5)} 59 ${point(leftShoulder + 8)} 64 ${point(leftShoulder)} ${shoulderY}`,
    `C ${point(leftChest - 2)} 84 ${point(leftChest)} 93 ${point(leftChest)} ${chestY}`,
    `C ${point(leftChest)} 124 ${point(leftWaist)} 135 ${point(leftWaist)} ${waistY}`,
    `C ${point(leftWaist)} 174 ${point(leftHip)} 178 ${point(leftHip)} ${hipY}`,
    `C ${point(leftHip + 3)} ${point(hipY + 14)} ${point(CENTER_X - legGap)} ${point(profile.crotchY - 4)} ${point(CENTER_X - legGap)} ${point(profile.crotchY)}`,
    `L ${point(CENTER_X + legGap)} ${point(profile.crotchY)}`,
    `C ${point(mirror(leftHip + 3))} ${point(hipY + 14)} ${point(mirror(leftHip))} ${point(hipY)} ${point(mirror(leftHip))} ${point(hipY)}`,
    `C ${point(mirror(leftWaist))} 178 ${point(mirror(leftWaist))} 174 ${point(mirror(leftWaist))} ${waistY}`,
    `C ${point(mirror(leftChest))} 135 ${point(mirror(leftChest))} 124 ${point(mirror(leftChest))} ${chestY}`,
    `C ${point(mirror(leftChest))} 93 ${point(mirror(leftChest - 2))} 84 ${point(mirror(leftShoulder))} ${shoulderY}`,
    `C ${point(mirror(leftShoulder + 8))} 64 ${point(mirror(leftNeck - 5))} 59 ${point(mirror(leftNeck))} 55`,
    "Z",
  ].join(" ");

  const leftArmPath = [
    `M ${point(leftShoulder + 3)} 70`,
    `C ${point(leftShoulder - 8)} 96 ${point(leftHand - 5)} 132 ${point(leftHand)} ${handY}`,
    `C ${point(leftHand + 2)} ${point(handY + 8)} ${point(leftHand + profile.limbWidth)} ${point(handY + 7)} ${point(leftHand + profile.limbWidth)} ${point(handY - 1)}`,
    `C ${point(leftHand + profile.limbWidth + 2)} 151 ${point(leftShoulder + profile.limbWidth)} 102 ${point(leftShoulder + 12)} 76`,
    "Z",
  ].join(" ");

  const rightArmPath = [
    `M ${point(mirror(leftShoulder + 3))} 70`,
    `C ${point(mirror(leftShoulder - 8))} 96 ${point(mirror(leftHand - 5))} 132 ${point(mirror(leftHand))} ${handY}`,
    `C ${point(mirror(leftHand + 2))} ${point(handY + 8)} ${point(mirror(leftHand + profile.limbWidth))} ${point(handY + 7)} ${point(mirror(leftHand + profile.limbWidth))} ${point(handY - 1)}`,
    `C ${point(mirror(leftHand + profile.limbWidth + 2))} 151 ${point(mirror(leftShoulder + profile.limbWidth))} 102 ${point(mirror(leftShoulder + 12))} 76`,
    "Z",
  ].join(" ");

  const leftLegPath = [
    `M ${point(leftHip + 3)} ${point(hipY - 2)}`,
    `C ${point(leftHip + 1)} ${point(profile.crotchY + 30)} ${point(leftAnkleOuter - 2)} 295 ${point(leftAnkleOuter)} ${ankleY}`,
    `L ${point(leftAnkleOuter - 7)} ${footY}`,
    `L ${point(leftAnkleInner)} ${footY}`,
    `C ${point(leftAnkleInner + 1)} 304 ${point(CENTER_X - legGap)} ${point(profile.crotchY + 22)} ${point(CENTER_X - legGap)} ${point(profile.crotchY)}`,
    "Z",
  ].join(" ");

  const rightLegPath = [
    `M ${point(mirror(leftHip + 3))} ${point(hipY - 2)}`,
    `C ${point(mirror(leftHip + 1))} ${point(profile.crotchY + 30)} ${point(mirror(leftAnkleOuter - 2))} 295 ${point(mirror(leftAnkleOuter))} ${ankleY}`,
    `L ${point(mirror(leftAnkleOuter - 7))} ${footY}`,
    `L ${point(mirror(leftAnkleInner))} ${footY}`,
    `C ${point(mirror(leftAnkleInner + 1))} 304 ${point(CENTER_X + legGap)} ${point(profile.crotchY + 22)} ${point(CENTER_X + legGap)} ${point(profile.crotchY)}`,
    "Z",
  ].join(" ");

  return {
    head: { cx: CENTER_X, cy: 30, radius: 19 },
    torsoPath,
    leftArmPath,
    rightArmPath,
    leftLegPath,
    rightLegPath,
  };
}

/** Raw, neutral deltas for UI copy. Positive/negative is descriptive only. */
export function compareBodyShapes(
  current: BodyShapeMeasurements,
  goal: BodyShapeMeasurements,
): BodyShapeSummary[] {
  const summaries: BodyShapeSummary[] = [
    {
      key: "weight",
      label: "Entered weight",
      current: rounded(current.weightKg, 2),
      goal: rounded(goal.weightKg, 2),
      delta: rounded(goal.weightKg - current.weightKg, 2),
    },
    {
      key: "waist_to_height",
      label: "Waist-to-height",
      current: rounded(current.waistCm / current.heightCm, 3),
      goal: rounded(goal.waistCm / goal.heightCm, 3),
      delta: rounded(
        goal.waistCm / goal.heightCm - current.waistCm / current.heightCm,
        3,
      ),
    },
    {
      key: "shoulder_to_waist",
      label: "Shoulder-to-waist",
      current: rounded(current.shouldersCm / current.waistCm, 3),
      goal: rounded(goal.shouldersCm / goal.waistCm, 3),
      delta: rounded(
        goal.shouldersCm / goal.waistCm -
          current.shouldersCm / current.waistCm,
        3,
      ),
    },
  ];

  if (
    current.bodyFatPercent !== undefined &&
    goal.bodyFatPercent !== undefined
  ) {
    summaries.push({
      key: "body_fat",
      label: "Entered body fat",
      current: rounded(current.bodyFatPercent, 1),
      goal: rounded(goal.bodyFatPercent, 1),
      delta: rounded(goal.bodyFatPercent - current.bodyFatPercent, 1),
    });
  }

  return summaries;
}
