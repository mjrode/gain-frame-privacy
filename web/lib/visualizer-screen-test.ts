import type { AssignedCtaExperiment } from "./assigned-cta-experiment.ts";
import { pairedCtaAssignment } from "./paired-cta-assignment.ts";

export const SCREEN_TEST_ID = "visualizer_result_example";
export const SCREEN_TEST_PHASE = "app_screens_v3";
export const SCREEN_ARMS = ["control", "score_example", "future_you", "front_side"] as const;
type ScreenArm = typeof SCREEN_ARMS[number];
export const FUTURE_YOU_PLACEMENT_PHASE = "future_you_placement_v1";
type Placement = NonNullable<AssignedCtaExperiment["buttonPlacement"]>["variant"];
const storageKey = `gainframe:experiment:${SCREEN_TEST_ID}:${SCREEN_TEST_PHASE}`;
let pageArm: ScreenArm | undefined;

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

export function visualizerScreenAssignment(preview?: ScreenArm, previewPlacement?: Placement): AssignedCtaExperiment {
  if (previewPlacement) preview = "future_you";
  let variant = preview;
  if (!variant) {
    try { pageArm = screenArm(window.localStorage.getItem(storageKey)) ?? pageArm; }
    catch { /* The in-memory assignment also works with storage disabled. */ }
    pageArm ??= SCREEN_ARMS[Math.floor(Math.random() * SCREEN_ARMS.length)];
    variant = pageArm;
    try { window.localStorage.setItem(storageKey, variant); }
    catch { /* Keep the same arm for the rest of this page visit. */ }
  }
  const assignment: AssignedCtaExperiment = {
    id: SCREEN_TEST_ID, phase: SCREEN_TEST_PHASE, variant, forced: Boolean(preview),
    angle: variant === "future_you" ? "future" : "analysis", style: variant,
  };
  if (variant === "future_you") {
    let placement: Placement = previewPlacement ?? "below_image";
    if (!preview) {
      const draw = pairedCtaAssignment(SCREEN_TEST_ID, null, FUTURE_YOU_PLACEMENT_PHASE);
      placement = draw.treatment ? "above_image" : "below_image";
    }
    assignment.buttonPlacement = { phase: FUTURE_YOU_PLACEMENT_PHASE, variant: placement };
  }
  return assignment;
}
