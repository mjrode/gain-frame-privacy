import type { AssignedCtaExperiment } from "./assigned-cta-experiment.ts";

export const BODY_FAT_RESULT_CTA_EXPERIMENT_ID = "body_fat_result_cta_v1";
export const BODY_FAT_RESULT_CTA_PHASE = "fold_v1_stable_assignment";
export const BODY_FAT_RESULT_CTA_STORAGE_KEY =
  `gainframe:experiment:${BODY_FAT_RESULT_CTA_EXPERIMENT_ID}:${BODY_FAT_RESULT_CTA_PHASE}`;
export const BODY_FAT_RESULT_CTA_QUERY = "bf_cta";

/**
 * control  — today's result card, then the analysis bridge.
 * analysis — the ask moves into the result card, led by the user's number.
 * goal     — the ask moves into the result card as a goal-physique preview.
 * sticky   — today's layout plus a bottom bar that stays on screen.
 */
export const BODY_FAT_RESULT_CTA_VARIANTS = ["control", "analysis", "goal", "sticky"] as const;
export type BodyFatResultCtaVariant = (typeof BODY_FAT_RESULT_CTA_VARIANTS)[number];
export type BodyFatResultCtaAssignment = { variant: BodyFatResultCtaVariant; forced: boolean };

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

export function bodyFatResultCtaVariantForRandom(value: number): BodyFatResultCtaVariant {
  const bounded = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999) : 0;
  return BODY_FAT_RESULT_CTA_VARIANTS[Math.floor(bounded * BODY_FAT_RESULT_CTA_VARIANTS.length)];
}

let inMemoryVariant: BodyFatResultCtaVariant | null = null;

/** Clears page-lifetime state for isolated tests. */
export function clearBodyFatResultCtaAssignmentMemory(): void {
  inMemoryVariant = null;
}

/** Restore this phase's saved arm before choosing a new one, and persist it at
 * once, so a returning visitor cannot cross arms. QA overrides are marked
 * forced and never replace the saved visitor arm. Only iOS calls this. */
export function getBodyFatResultCtaAssignment(
  storage: Pick<Storage, "getItem" | "setItem"> | null | undefined = undefined,
  search = typeof window === "undefined" ? "" : window.location.search,
  random = Math.random,
): BodyFatResultCtaAssignment {
  try {
    const forced = new URLSearchParams(search).get(BODY_FAT_RESULT_CTA_QUERY);
    if (isBodyFatResultCtaVariant(forced)) return { variant: forced, forced: true };
  } catch {
    // A malformed query string must never block the result CTA.
  }

  let resolved = storage ?? null;
  if (storage === undefined && typeof window !== "undefined") {
    try {
      resolved = window.localStorage;
    } catch {
      // Storage may be blocked; keep the page-lifetime fallback.
    }
  }
  try {
    const stored = resolved?.getItem(BODY_FAT_RESULT_CTA_STORAGE_KEY);
    if (isBodyFatResultCtaVariant(stored)) inMemoryVariant = stored;
  } catch {
    // A storage error must never block the CTA.
  }
  if (!inMemoryVariant) inMemoryVariant = bodyFatResultCtaVariantForRandom(random());
  try {
    resolved?.setItem(BODY_FAT_RESULT_CTA_STORAGE_KEY, inMemoryVariant);
  } catch {
    // Keep the same page choice when persistence is unavailable.
  }
  return { variant: inMemoryVariant, forced: false };
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
