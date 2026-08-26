export type BodyVisualizerSex = "male" | "female";

export const BODY_VISUALIZER_RENDERS = {
  male: [8, 10, 12, 15, 18, 20, 25, 30],
  female: [18, 20, 22, 25, 30, 35, 40],
} as const;

const BMI_VISUAL_RANGE: Record<
  BodyVisualizerSex,
  { min: number; max: number }
> = {
  male: { min: 14, max: 35 },
  female: { min: 14, max: 40 },
};

/**
 * Spreads the available illustrative renders evenly across the useful BMI
 * display range. The selected render is a visual band, not a body-fat estimate.
 */
export function bodyVisualizerRender(bmi: number, sex: BodyVisualizerSex) {
  const renders = BODY_VISUALIZER_RENDERS[sex];
  const range = BMI_VISUAL_RANGE[sex];
  const progress = Math.min(
    1,
    Math.max(0, (bmi - range.min) / (range.max - range.min)),
  );
  const index = Math.round(progress * (renders.length - 1));

  return {
    bodyFat: renders[index],
    count: renders.length,
    index,
  };
}
