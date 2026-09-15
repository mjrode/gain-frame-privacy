export type UnitSystem = "metric" | "us";
export type MetricInputs = { heightCm: string; weightKg: string };
export type UsInputs = { feet: string; inches: string; pounds: string };
export type Measurements = { heightM: number; weightKg: number };

export const POUNDS_PER_KG = 2.2046226218;
export const CM_PER_INCH = 2.54;

function parseNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function measurementsFrom(
  unit: UnitSystem,
  metric: MetricInputs,
  us: UsInputs,
): Measurements | null {
  if (unit === "metric") {
    const heightCm = parseNumber(metric.heightCm);
    const weightKg = parseNumber(metric.weightKg);
    if (
      heightCm === null ||
      weightKg === null ||
      heightCm < 120 ||
      heightCm > 230 ||
      weightKg < 35 ||
      weightKg > 250
    )
      return null;
    return { heightM: heightCm / 100, weightKg };
  }
  const feet = parseNumber(us.feet);
  const inches = parseNumber(us.inches);
  const pounds = parseNumber(us.pounds);
  if (
    feet === null ||
    inches === null ||
    pounds === null ||
    !Number.isInteger(feet) ||
    feet < 3 ||
    feet > 7 ||
    inches < 0 ||
    inches > 11.9 ||
    pounds < 77 ||
    pounds > 551.2
  )
    return null;
  const totalInches = feet * 12 + inches;
  if (totalInches < 47.2 || totalInches > 90.6) return null;
  return {
    heightM: (totalInches * CM_PER_INCH) / 100,
    weightKg: pounds / POUNDS_PER_KG,
  };
}

/** Convert display values while preserving valid endpoints after rounding. */
export function bodyVisualizerUnitInputs(current: Measurements) {
  // Round total inches before splitting: 5 ft + 11.96 in must become 6 ft,
  // not the invalid input "5 ft 12 in".
  const totalInches =
    Math.round(((current.heightM * 100) / CM_PER_INCH) * 10) / 10;
  const feet = Math.floor(totalInches / 12);
  const decimal = (value: number) => value.toFixed(1).replace(/\.0$/, "");
  return {
    metric: {
      // US endpoints are rounded approximations of the metric input limits.
      heightCm: decimal(Math.min(230, Math.max(120, current.heightM * 100))),
      weightKg: decimal(Math.min(250, Math.max(35, current.weightKg))),
    },
    us: {
      feet: String(feet),
      inches: decimal(totalInches - feet * 12),
      pounds: decimal(current.weightKg * POUNDS_PER_KG),
    },
  };
}
