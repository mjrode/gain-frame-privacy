import type { AssignedCtaExperiment } from "./assigned-cta-experiment.ts";

export const BODY_VISUALIZER_CTA_EXPERIMENT_ID = "body_visualizer_cta_v1";
export const BODY_VISUALIZER_CTA_PHASE = "four_treatments_v1";
export const BODY_VISUALIZER_CTA_STORAGE_KEY = `gainframe:experiment:${BODY_VISUALIZER_CTA_EXPERIMENT_ID}:${BODY_VISUALIZER_CTA_PHASE}`;
export const BODY_VISUALIZER_CTA_QUERY = "bv_cta";

export const BODY_VISUALIZER_CTA_VARIANTS = [
  "direct",
  "analysis",
  "progress",
  "future",
] as const;
export type BodyVisualizerCtaVariant =
  (typeof BODY_VISUALIZER_CTA_VARIANTS)[number];
export type BodyVisualizerCtaAssignment = {
  variant: BodyVisualizerCtaVariant;
  forced: boolean;
};

export const BODY_VISUALIZER_CTA_TREATMENTS = {
  direct: {
    letter: "A",
    label: "Body-fat estimate",
    style: "lime",
    headline: "Estimate your body fat.",
    body: "One photo. Free to start.",
    iosLabel: "Get the app",
  },
  analysis: {
    letter: "B",
    label: "Personal analysis",
    style: "ink",
    headline: "See your body breakdown.",
    body: "Body fat + muscle in the app.",
    iosLabel: "Analyze my photo",
  },
  progress: {
    letter: "C",
    label: "Progress tracking",
    style: "coral",
    headline: "Make your progress visible.",
    body: "Compare photos in the app.",
    iosLabel: "Track my progress",
  },
  future: {
    letter: "D",
    label: "Future physique",
    style: "outline",
    headline: "Preview your future physique.",
    body: "AI projection in the iPhone app.",
    iosLabel: "Preview in app",
  },
} as const;

export function isBodyVisualizerCtaVariant(
  value: unknown,
): value is BodyVisualizerCtaVariant {
  return (
    typeof value === "string" &&
    BODY_VISUALIZER_CTA_VARIANTS.includes(value as BodyVisualizerCtaVariant)
  );
}

export function bodyVisualizerCtaVariantForRandom(
  value: number,
): BodyVisualizerCtaVariant {
  const bounded = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 0.999999)
    : 0;
  return BODY_VISUALIZER_CTA_VARIANTS[Math.floor(bounded * 4)];
}

export function isBodyVisualizerCtaPreviewHost(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
}

let memoryVariant: BodyVisualizerCtaVariant | null = null;
export function clearBodyVisualizerCtaAssignmentMemory() {
  memoryVariant = null;
}

/** A page-specific 25/25/25/25 assignment. QA never overwrites the saved arm. */
export function getBodyVisualizerCtaAssignment(
  storage: Pick<Storage, "getItem" | "setItem"> | null | undefined = undefined,
  search = typeof window === "undefined" ? "" : window.location.search,
  random = Math.random,
): BodyVisualizerCtaAssignment {
  const forced = new URLSearchParams(search).get(BODY_VISUALIZER_CTA_QUERY);
  if (isBodyVisualizerCtaVariant(forced))
    return { variant: forced, forced: true };

  let resolvedStorage = storage ?? null;
  if (storage === undefined && typeof window !== "undefined") {
    try {
      resolvedStorage = window.localStorage;
    } catch {
      /* Page-lifetime fallback. */
    }
  }
  try {
    const stored = resolvedStorage?.getItem(BODY_VISUALIZER_CTA_STORAGE_KEY);
    if (isBodyVisualizerCtaVariant(stored)) memoryVariant = stored;
  } catch {
    /* Blocked storage must not interrupt the tool. */
  }
  memoryVariant ??= bodyVisualizerCtaVariantForRandom(random());
  try {
    resolvedStorage?.setItem(BODY_VISUALIZER_CTA_STORAGE_KEY, memoryVariant);
  } catch {
    /* Keep the page's assignment. */
  }
  return { variant: memoryVariant, forced: false };
}

export function bodyVisualizerAssignedExperiment(
  assignment: BodyVisualizerCtaAssignment,
): AssignedCtaExperiment {
  return {
    id: BODY_VISUALIZER_CTA_EXPERIMENT_ID,
    phase: BODY_VISUALIZER_CTA_PHASE,
    variant: assignment.variant,
    forced: assignment.forced,
    angle: assignment.variant,
    style: BODY_VISUALIZER_CTA_TREATMENTS[assignment.variant].style,
  };
}

/** Unique placement follows both the App Store link and desktop QR attribution. */
export function bodyVisualizerCtaPlacement(variant: BodyVisualizerCtaVariant) {
  return `atlas_v6_${BODY_VISUALIZER_CTA_PHASE}_${variant}`;
}
