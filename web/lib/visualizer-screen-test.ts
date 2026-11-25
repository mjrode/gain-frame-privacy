import type { AssignedCtaExperiment } from "./assigned-cta-experiment.ts";

export const SCREEN_TEST_ID = "visualizer_result_example";
export const SCREEN_TEST_PHASE = "app_screens_v3";
export const SCREEN_ARMS = ["control", "score_example", "future_you", "front_side"] as const;
type ScreenArm = typeof SCREEN_ARMS[number];
export const FUTURE_YOU_PLACEMENT_PHASE = "future_you_placement_v1";
type Placement = NonNullable<AssignedCtaExperiment["buttonPlacement"]>["variant"];

function screenArm(value: string | null) {
  return SCREEN_ARMS.find(arm => arm === value);
}

export function screenPreview(search: string) {
  const value = new URLSearchParams(search).get(SCREEN_TEST_ID);
  return value === "treatment" ? "score_example" : screenArm(value);
}

export function placementPreview(search: string) {
  const value = new URLSearchParams(search).get("future_you_button");
  return value === "above_image" || value === "below_image" ? value : undefined;
}

/**
 * Both the four-offer test and the Future You button-placement test closed on
 * 2026-11-24. Control led every treatment on the 24-hour Store-click read at
 * roughly 750 visitors per arm, so eligible slider traffic returns to the
 * `analysis_rollout_v2` experience and this module no longer enrols anyone,
 * draws a placement or writes an assignment.
 *
 * Forced previews still render each arm for review. They stay
 * `experiment_forced: true`, so they remain excluded from every read, and they
 * never touch stored assignments.
 */
export function visualizerScreenPreview(
  preview?: ScreenArm,
  previewPlacement?: Placement,
): AssignedCtaExperiment | null {
  if (previewPlacement) preview = "future_you";
  if (!preview) return null;
  const assignment: AssignedCtaExperiment = {
    id: SCREEN_TEST_ID,
    phase: SCREEN_TEST_PHASE,
    variant: preview,
    forced: true,
    angle: preview === "future_you" ? "future" : "analysis",
    style: preview,
  };
  if (preview === "future_you") {
    assignment.buttonPlacement = {
      phase: FUTURE_YOU_PLACEMENT_PHASE,
      variant: previewPlacement ?? "below_image",
    };
  }
  return assignment;
}
