import type { AssignedCtaExperiment } from "./assigned-cta-experiment.ts";

export const BODY_VISUALIZER_CTA_EXPERIMENT_ID = "body_visualizer_cta_v1";
export const BODY_VISUALIZER_CTA_PHASE = "analysis_rollout_v2";
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

export function isBodyVisualizerCtaPreviewHost(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
}

/** Deterministic iOS/desktop rollout. Android never requests an assignment.
 * Historical storage is left intact; explicit QA remains forced and excluded.
 */
export function getBodyVisualizerCtaAssignment(
  search = typeof window === "undefined" ? "" : window.location.search,
): BodyVisualizerCtaAssignment {
  const forced = new URLSearchParams(search).get(BODY_VISUALIZER_CTA_QUERY);
  if (isBodyVisualizerCtaVariant(forced))
    return { variant: forced, forced: true };
  return { variant: "analysis", forced: false };
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
