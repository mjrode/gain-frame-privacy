export type BodyVisualizerSex = "male" | "female";

// Body-fat percentage assets still used by the photo estimator. These are
// separate from the BMI size illustrations below; do not use them as BMI data.
export const BODY_VISUALIZER_RENDERS = {
  male: [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 22, 25, 27, 30],
  female: [18, 19, 20, 21, 22, 23, 25, 27, 28, 30, 32, 35, 37, 40],
} as const;

export type BodyVisualizerView = "front" | "back";
export const BODY_VISUALIZER_VERSION = "atlas_v3";
export const BODY_VISUALIZER_BMI_RANGE = { min: 16, max: 45 } as const;
export const BODY_VISUALIZER_STAGE_COUNT = 30;
const ASSET_ROOT = "/tools/body-visualizer/assets/atlas-v3";

// Review order follows apparent size, not the numeric targets in generation
// prompts. Paired front/back views always retain the same asset identifier.
export const BODY_VISUALIZER_STAGE_ORDER: Record<
  BodyVisualizerSex,
  readonly number[]
> = {
  female: [
    2, 1, 3, 4, 5, 6, 7, 31, 8, 9, 32, 12, 11, 10, 14, 13, 15, 16, 19, 18, 20,
    21, 33, 24, 23, 27, 25, 28, 26, 29,
  ],
  male: [
    1, 3, 2, 4, 5, 6, 8, 9, 10, 31, 12, 11, 13, 14, 15, 16, 17, 18, 32, 24, 19,
    20, 22, 21, 33, 26, 25, 28, 27, 30,
  ],
};

/**
 * Each stage is an independently generated size illustration, with paired
 * front/back views. BMI indexes the series; it does not predict appearance or
 * estimate body fat. Both sets use the same one-BMI-unit design intervals.
 */
export function bodyVisualizerRender(
  bmi: number | null,
  sex: BodyVisualizerSex,
) {
  if (bmi === null || !Number.isFinite(bmi) || bmi <= 0) return null;
  const { min, max } = BODY_VISUALIZER_BMI_RANGE;
  const index = Math.round(Math.min(max, Math.max(min, bmi)) - min);
  const stage = index + 1;
  const asset = BODY_VISUALIZER_STAGE_ORDER[sex][index];
  const base = `${ASSET_ROOT}/${sex}-stage${String(asset).padStart(2, "0")}`;
  return {
    index,
    stage,
    count: BODY_VISUALIZER_STAGE_COUNT,
    outsideRange: bmi < min || bmi > max,
    front: `${base}-front.webp`,
    back: `${base}-back.webp`,
  };
}

/** Slider limits reflect the image series and the form's supported weights. */
export function bodyVisualizerWeightRange(heightM: number, pounds = false) {
  if (!Number.isFinite(heightM) || heightM < 1.2 || heightM > 2.302)
    return null;
  const factor = pounds ? 2.2046226218 : 1;
  return {
    min: Math.ceil(
      Math.max(35, BODY_VISUALIZER_BMI_RANGE.min * heightM ** 2) * factor,
    ),
    max: Math.floor(
      Math.min(250, BODY_VISUALIZER_BMI_RANGE.max * heightM ** 2) * factor,
    ),
  };
}
