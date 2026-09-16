export const POUNDS_PER_KILOGRAM = 2.2046226218487757;
export type MassUnit = "lb" | "kg";

export type LeanBodyMassResult = {
  weight: number;
  bodyFat: number;
  fatMass: number;
  fatFreeMass: number;
  range: {
    lowBodyFat: number;
    highBodyFat: number;
    lowMass: number;
    highMass: number;
  } | null;
};

/** Two-compartment arithmetic. Results inherit the supplied estimate's error. */
export function calculateLeanBodyMass(
  weight: number,
  bodyFat: number,
  uncertainty: number | null = null,
): LeanBodyMassResult {
  if (!Number.isFinite(weight) || weight <= 0)
    throw new RangeError("Enter a weight above zero.");
  if (!Number.isFinite(bodyFat) || bodyFat <= 0 || bodyFat >= 100) {
    throw new RangeError("Enter a body-fat percentage above 0 and below 100.");
  }
  if (
    uncertainty !== null &&
    (!Number.isFinite(uncertainty) || uncertainty < 0 || uncertainty > 50)
  ) {
    throw new RangeError(
      "Choose an uncertainty from 0 to 50 percentage points.",
    );
  }
  const fatMass = weight * (bodyFat / 100);
  const lowBodyFat = Math.max(0, bodyFat - (uncertainty ?? 0));
  const highBodyFat = Math.min(100, bodyFat + (uncertainty ?? 0));
  return {
    weight,
    bodyFat,
    fatMass,
    fatFreeMass: weight - fatMass,
    range:
      uncertainty === null
        ? null
        : {
            lowBodyFat,
            highBodyFat,
            lowMass: weight * (1 - highBodyFat / 100),
            highMass: weight * (1 - lowBodyFat / 100),
          },
  };
}

export function convertMass(
  value: number,
  from: MassUnit,
  to: MassUnit,
): number {
  if (from === to) return value;
  return to === "kg"
    ? value / POUNDS_PER_KILOGRAM
    : value * POUNDS_PER_KILOGRAM;
}
