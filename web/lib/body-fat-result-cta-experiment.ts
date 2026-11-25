import type { AssignedCtaExperiment } from "./assigned-cta-experiment.ts";

export const BODY_FAT_RESULT_CTA_EXPERIMENT_ID = "body_fat_result_cta_v1";

/** The randomized four-arm phase, 2026-11-11 to 2026-11-24. Kept for reference
 * only: reads must never pool it with the rollout phase below. */
export const BODY_FAT_RESULT_CTA_TEST_PHASE = "fold_v1_stable_assignment";

/** Putting the ask inside the result card won the four-arm test decisively
 * (88/220 assigned iOS visitors against control's 26/202, and 40.2% against
 * 17.7% among visitors who actually saw a bridge), so it now ships to every
 * eligible iOS visitor. */
export const BODY_FAT_RESULT_CTA_PHASE = "inline_result_rollout_v1";
export const BODY_FAT_RESULT_CTA_QUERY = "bf_cta";

/**
 * control  — the previous layout: result card, then the analysis bridge.
 * analysis — the ask inside the result card, led by the user's number. Shipped.
 * goal     — the ask inside the result card as a goal-physique preview.
 * sticky   — the previous layout plus a bottom bar that stays on screen.
 *
 * All four remain available as explicit QA previews.
 */
export const BODY_FAT_RESULT_CTA_VARIANTS = ["control", "analysis", "goal", "sticky"] as const;
export type BodyFatResultCtaVariant = (typeof BODY_FAT_RESULT_CTA_VARIANTS)[number];
export type BodyFatResultCtaAssignment = { variant: BodyFatResultCtaVariant; forced: boolean };

export const BODY_FAT_RESULT_CTA_ROLLOUT_VARIANT: BodyFatResultCtaVariant = "analysis";

const ANGLE: Record<BodyFatResultCtaVariant, string> = {
  control: "analysis",
  analysis: "analysis",
  goal: "future",
  sticky: "analysis",
};

const STYLE: Record<BodyFatResultCtaVariant, string> = {
  control: "bridge_card",
  analysis: "inline_result",
  goal: "inline_result",
  sticky: "bridge_card_sticky_bar",
};

export function isBodyFatResultCtaVariant(value: unknown): value is BodyFatResultCtaVariant {
  return typeof value === "string" &&
    BODY_FAT_RESULT_CTA_VARIANTS.includes(value as BodyFatResultCtaVariant);
}

/**
 * Deterministic iOS rollout of the winning arm. Android keeps the email form
 * and never requests an assignment. Nothing is read from or written to
 * storage, so the historical four-arm assignments stay intact and a returning
 * visitor cannot be mistaken for a new enrolment. An explicit `?bf_cta=` arm
 * stays `forced` and is excluded from every read.
 */
export function getBodyFatResultCtaAssignment(
  search = typeof window === "undefined" ? "" : window.location.search,
): BodyFatResultCtaAssignment {
  try {
    const forced = new URLSearchParams(search).get(BODY_FAT_RESULT_CTA_QUERY);
    if (isBodyFatResultCtaVariant(forced)) return { variant: forced, forced: true };
  } catch {
    // A malformed query string must never block the result CTA.
  }
  return { variant: BODY_FAT_RESULT_CTA_ROLLOUT_VARIANT, forced: false };
}

export function bodyFatResultCtaExperiment(
  assignment: BodyFatResultCtaAssignment,
): AssignedCtaExperiment {
  return {
    id: BODY_FAT_RESULT_CTA_EXPERIMENT_ID,
    phase: BODY_FAT_RESULT_CTA_PHASE,
    variant: assignment.variant,
    forced: assignment.forced,
    angle: ANGLE[assignment.variant],
    style: STYLE[assignment.variant],
  };
}
