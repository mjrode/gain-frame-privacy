/* Waist circumference percentiles, NHANES 2015–2018.
 *
 * Source: National Center for Health Statistics, "Anthropometric Reference
 * Data for Children and Adults: United States, 2015–2018", Vital and Health
 * Statistics Series 3, Number 46 — Table 19 (adult females) and Table 20
 * (adult males), "All race and Hispanic-origin groups" rows.
 * https://www.cdc.gov/nchs/data/series/sr_03/sr03-046-508.pdf
 *
 * Values are centimeters, measured at the upper border of the iliac crest per
 * the NHANES protocol — NOT at the pants label. Estimates are survey-weighted.
 *
 * We store only the published breakpoints and interpolate between them. We
 * deliberately do NOT extrapolate past the 5th/95th: waist circumference is
 * right-skewed, so a normal-curve tail estimate would be wrong in the exact
 * place people care most. Outside the published range the result is reported
 * as "below the 5th" / "above the 95th" instead of a fabricated number.
 */

export type Sex = "male" | "female";

/** Published percentile breakpoints, in order, matching each band's tuple. */
export const PERCENTILE_POINTS = [5, 10, 15, 25, 50, 75, 85, 90, 95] as const;

export type AgeBand = {
  /** Stable key used in analytics + as the <select> value. */
  id: string;
  /** Display label. */
  label: string;
  /** Survey-weighted mean waist, cm. */
  mean: number;
  /** Number of examined persons behind the estimate. */
  n: number;
  /** Waist in cm at each of PERCENTILE_POINTS. */
  values: readonly number[];
};

const MALE_BANDS: readonly AgeBand[] = [
  { id: "20-29", label: "20–29", mean: 94.2, n: 781, values: [72.4, 75.6, 77.0, 81.0, 90.7, 105.3, 111.2, 117.4, 127.3] },
  { id: "30-39", label: "30–39", mean: 102.6, n: 777, values: [80.5, 84.3, 86.6, 90.7, 99.9, 111.2, 120.5, 125.2, 132.7] },
  { id: "40-49", label: "40–49", mean: 104.1, n: 741, values: [81.3, 86.2, 89.8, 94.4, 102.8, 111.9, 118.0, 123.5, 134.1] },
  { id: "50-59", label: "50–59", mean: 105.1, n: 810, values: [83.8, 87.9, 90.6, 94.7, 103.3, 113.0, 119.4, 126.5, 135.1] },
  { id: "60-69", label: "60–69", mean: 107.3, n: 936, values: [82.8, 89.4, 92.1, 96.4, 106.2, 115.9, 121.9, 127.7, 136.3] },
  { id: "70-79", label: "70–79", mean: 107.4, n: 540, values: [85.7, 89.9, 92.6, 98.9, 106.6, 115.8, 120.5, 124.6, 131.1] },
  { id: "80plus", label: "80+", mean: 104.3, n: 296, values: [83.7, 89.2, 92.2, 95.7, 104.1, 112.3, 116.6, 119.9, 126.7] },
];

const FEMALE_BANDS: readonly AgeBand[] = [
  { id: "20-29", label: "20–29", mean: 92.1, n: 791, values: [69.6, 71.7, 73.6, 77.5, 88.9, 103.8, 113.1, 118.8, 125.5] },
  { id: "30-39", label: "30–39", mean: 97.2, n: 822, values: [72.7, 75.5, 78.5, 83.3, 94.2, 107.1, 117.1, 121.2, 133.6] },
  { id: "40-49", label: "40–49", mean: 99.5, n: 852, values: [77.2, 79.9, 82.2, 85.9, 96.1, 109.1, 119.7, 124.0, 133.1] },
  { id: "50-59", label: "50–59", mean: 99.8, n: 884, values: [74.2, 78.6, 82.4, 87.1, 97.9, 110.5, 117.1, 122.5, 128.6] },
  { id: "60-69", label: "60–69", mean: 101.7, n: 929, values: [77.9, 81.5, 85.2, 89.9, 100.2, 113.1, 119.4, 122.8, 130.8] },
  { id: "70-79", label: "70–79", mean: 101.5, n: 488, values: [79.2, 83.0, 86.5, 91.8, 100.7, 110.2, 115.7, 118.7, 124.5] },
  { id: "80plus", label: "80+", mean: 98.3, n: 299, values: [76.4, 79.5, 83.1, 89.0, 98.4, 107.2, 111.6, 115.8, 118.8] },
];

/** All-adult (20 and over) rows, used for the "vs all US adults" comparison. */
export const ALL_ADULTS: Record<Sex, AgeBand> = {
  male: { id: "20plus", label: "20 and over", mean: 102.9, n: 4881, values: [77.6, 82.7, 86.2, 91.7, 101.8, 112.1, 118.5, 124.0, 132.6] },
  female: { id: "20plus", label: "20 and over", mean: 98.4, n: 5065, values: [73.3, 77.1, 80.4, 85.3, 96.4, 109.2, 116.7, 121.6, 129.7] },
};

export const BANDS: Record<Sex, readonly AgeBand[]> = {
  male: MALE_BANDS,
  female: FEMALE_BANDS,
};

export function bandById(sex: Sex, id: string): AgeBand | undefined {
  return BANDS[sex].find((b) => b.id === id);
}

export const CM_PER_INCH = 2.54;

export const toCm = (inches: number) => inches * CM_PER_INCH;
export const toInches = (cm: number) => cm / CM_PER_INCH;

export type PercentileResult =
  /** Waist sits inside the published 5th–95th range; `value` is interpolated. */
  | { kind: "exact"; value: number }
  /** Below the 5th percentile — we don't invent a tail estimate. */
  | { kind: "below" }
  /** Above the 95th percentile — likewise. */
  | { kind: "above" };

/**
 * Percentile rank of `waistCm` within `band`, linearly interpolated between the
 * published breakpoints. Returns a bounded result rather than extrapolating
 * beyond the 5th/95th (see file header).
 */
export function percentileFor(waistCm: number, band: AgeBand): PercentileResult {
  const v = band.values;
  const p = PERCENTILE_POINTS;

  if (waistCm < v[0]) return { kind: "below" };
  if (waistCm > v[v.length - 1]) return { kind: "above" };

  for (let i = 0; i < v.length - 1; i++) {
    const lo = v[i];
    const hi = v[i + 1];
    if (waistCm >= lo && waistCm <= hi) {
      // Guard against a zero-width bracket (identical published values).
      const span = hi - lo;
      const t = span === 0 ? 0 : (waistCm - lo) / span;
      return { kind: "exact", value: p[i] + t * (p[i + 1] - p[i]) };
    }
  }
  // waistCm === the top breakpoint exactly.
  return { kind: "exact", value: p[p.length - 1] };
}

/** "62nd", "3rd", "11th" — ordinal suffix for a whole-number percentile. */
export function ordinal(n: number): string {
  const i = Math.round(n);
  const mod100 = i % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${i}th`;
  switch (i % 10) {
    case 1:
      return `${i}st`;
    case 2:
      return `${i}nd`;
    case 3:
      return `${i}rd`;
    default:
      return `${i}th`;
  }
}

/**
 * Waist-to-height ratio. The widely used screening target is < 0.5 — keep your
 * waist under half your height. Returns null when height is missing/implausible
 * so the widget can simply omit the row rather than render a nonsense ratio.
 */
export function waistToHeight(waistCm: number, heightCm: number): number | null {
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) return null;
  return waistCm / heightCm;
}

export type WhtrBand = "low" | "healthy" | "increased" | "high";

export function whtrBand(ratio: number): WhtrBand {
  if (ratio < 0.4) return "low";
  if (ratio < 0.5) return "healthy";
  if (ratio < 0.6) return "increased";
  return "high";
}

export const WHTR_COPY: Record<WhtrBand, string> = {
  low: "Below the usual healthy range — worth a sanity check on how you measured.",
  healthy: "Inside the commonly used healthy range (under 0.5).",
  increased: "Above the 0.5 screening target — the range usually described as increased risk.",
  high: "Well above the 0.5 screening target. Worth raising with a doctor.",
};

/** Formats a cm value in the user's chosen unit, e.g. 101.8 → `40.1"` or `101.8 cm`. */
export function formatWaist(cm: number, unit: "in" | "cm"): string {
  return unit === "in" ? `${toInches(cm).toFixed(1)}"` : `${cm.toFixed(1)} cm`;
}

export const SOURCE = {
  label:
    "NHANES 2015–2018 · NCHS Vital and Health Statistics, Series 3, No. 46 (Tables 19–20)",
  url: "https://www.cdc.gov/nchs/data/series/sr_03/sr03-046-508.pdf",
} as const;
