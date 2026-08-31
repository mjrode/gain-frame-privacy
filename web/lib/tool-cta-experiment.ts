import { documentAnalyticsConsentGranted } from "./analytics-consent.ts";

export const TOOL_CTA_EXPERIMENT_ID = "tool_result_cta_v1";
export const TOOL_CTA_EXPERIMENT_PHASE = "expanded_result_cards_v2";
export const TOOL_CTA_EXPERIMENT_STORAGE_KEY =
  "gainframe:experiment:tool_result_cta_v1";

export const TOOL_CTA_VARIANTS = ["improve", "track", "future"] as const;
export type ToolCtaVariant = (typeof TOOL_CTA_VARIANTS)[number];

export type ToolConversionExperimentCopy = {
  eyebrow: string;
  headline: string;
  body: string;
  desktopBody?: string;
  iosLabel: string;
  proof?: string;
};

export type ToolConversionExperiment = {
  id: string;
  variants: Record<ToolCtaVariant, ToolConversionExperimentCopy>;
};

export type ToolResultCtaContext =
  | { tool: "physique_rater"; score: number; opportunity: string }
  | { tool: "bf_from_photo"; estimate: string }
  | {
      tool: "ab_analyzer";
      score: number;
      biggestLever: string;
      timeline: string;
    }
  | { tool: "six_pack_timeline"; timeline: string }
  | { tool: "body_visualizer"; bmi: string }
  | { tool: "body_fat_visualizer" }
  | { tool: "ai_body_transformation" }
  | { tool: "body_measurements" }
  | { tool: "progress_photo_compare" }
  | { tool: "recomp_reality_checker" }
  | { tool: "body_shape_compare" };

const PRIVATE_PROOF = "Free to start · iPhone app · Photos stay private";
const TRACK_PROOF =
  "Free to start · No account required · Photos stay private";
const FUTURE_PROOF =
  "AI projection, not a promise · Free to start · iPhone app";

function resultExperiment(
  variants: ToolConversionExperiment["variants"],
): ToolConversionExperiment {
  return { id: TOOL_CTA_EXPERIMENT_ID, variants };
}

/**
 * Contextual copy for one site-wide message-angle experiment. Assignment,
 * layout, artwork, placement, destination, and button styling stay fixed;
 * only the message angle changes between Improve, Track, and Future.
 */
export function buildToolResultCtaExperiment(
  context: ToolResultCtaContext,
): ToolConversionExperiment {
  switch (context.tool) {
    case "physique_rater":
      return resultExperiment({
        improve: {
          eyebrow: "Your next move",
          headline: "See exactly what to improve next.",
          body: `GainFrame expands “${context.opportunity}” into a 12-muscle breakdown and tracks whether weak points are catching up.`,
          desktopBody: `Scan with your iPhone to expand “${context.opportunity}” into a 12-muscle breakdown and track it over time.`,
          iosLabel: "Show my 12-muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the score useful",
          headline: `${context.score} only matters if it moves.`,
          body:
            "Save consistent check-ins and see whether body fat, muscle, and proportions are actually changing.",
          desktopBody:
            "Scan with your iPhone to save consistent check-ins and turn this score into a real progress trend.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Turn the result into a target",
          headline: "See what 12 consistent weeks could build.",
          body:
            "Choose a timeline, preview a future physique, then compare it with the real photos you take along the way.",
          desktopBody:
            "Scan with your iPhone to preview a future physique and compare the projection with your real check-ins.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "bf_from_photo":
      return resultExperiment({
        improve: {
          eyebrow: "Your next move",
          headline: "See exactly what to improve next.",
          body: `Turn your ${context.estimate}% estimate into a 12-muscle breakdown with clear strengths and focus areas.`,
          desktopBody: `Scan with your iPhone to turn ${context.estimate}% into a 12-muscle breakdown and next-step focus.`,
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the number useful",
          headline: `${context.estimate}% only matters if it moves.`,
          body:
            "Save consistent check-ins and see whether body fat, muscle, and proportions are actually changing.",
          desktopBody:
            "Scan with your iPhone to save this estimate and turn the next check-in into a real trend.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Turn the result into a target",
          headline: "See what consistent training could build.",
          body:
            "Preview a future physique, then compare that target with the real photos you take along the way.",
          desktopBody:
            "Scan with your iPhone to preview a future physique and compare it with your real check-ins.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "ab_analyzer":
      return resultExperiment({
        improve: {
          eyebrow: "Your biggest lever",
          headline: "Turn the weak point into a plan.",
          body: `Start with “${context.biggestLever},” then use the 12-muscle breakdown to see what else needs work.`,
          desktopBody: `Scan with your iPhone to turn “${context.biggestLever}” into a full muscle-by-muscle plan.`,
          iosLabel: "Show my full breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the score useful",
          headline: `${context.score} only matters if it moves.`,
          body:
            "Save the same pose each week and watch your ab score, body fat, and muscle balance change together.",
          desktopBody:
            "Scan with your iPhone to save this score and compare it with consistent weekly check-ins.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Turn the timeline into a target",
          headline: context.timeline === "Timeline unavailable"
            ? "Preview the physique you are working toward."
            : `Picture the end of your ${context.timeline} range.`,
          body:
            "Preview a leaner physique, then compare the projection with your real progress photos along the way.",
          desktopBody:
            "Scan with your iPhone to preview the target and compare it with your real check-ins.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "six_pack_timeline":
      return resultExperiment({
        improve: {
          eyebrow: "Train the full picture",
          headline: "See what to improve while you cut.",
          body:
            "Get a 12-muscle breakdown so the route to visible abs does not ignore the physique around them.",
          desktopBody:
            "Scan with your iPhone for a 12-muscle breakdown and clear focus areas while you cut.",
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the timeline real",
          headline: `${context.timeline} is the plan. Weekly photos prove it.`,
          body:
            "Track body fat, weight, and the same pose together so the range updates with the real you.",
          desktopBody:
            "Scan with your iPhone to save this range and compare it with consistent weekly check-ins.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "See the target",
          headline: "Preview the physique at the end of the range.",
          body:
            "Create a motivational leaner projection, then compare it with the real photos you take along the way.",
          desktopBody:
            "Scan with your iPhone to preview the target and compare it with your real check-ins.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "body_visualizer":
      return resultExperiment({
        improve: {
          eyebrow: "Go beyond BMI",
          headline: `BMI ${context.bmi} cannot show weak points. GainFrame can.`,
          body:
            "Use one progress photo for body-fat context, proportions, and a 12-muscle breakdown.",
          desktopBody:
            "Scan with your iPhone for body-fat context, proportions, and a 12-muscle breakdown.",
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the number useful",
          headline: `BMI ${context.bmi} is a snapshot. Track the body behind it.`,
          body:
            "Save consistent check-ins and see whether body fat, muscle, and proportions are actually changing.",
          desktopBody:
            "Scan with your iPhone to turn this snapshot into a private progress-photo trend.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Turn the result into a target",
          headline: "See what consistent training could build.",
          body:
            "Preview a future physique, then compare that target with the real photos you take along the way.",
          desktopBody:
            "Scan with your iPhone to preview a future physique and compare it with your real check-ins.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "body_fat_visualizer":
      return resultExperiment({
        improve: {
          eyebrow: "Go beyond the reference",
          headline: "Found your level? See what to improve next.",
          body:
            "Use your own photo for body-fat context, proportions, and a 12-muscle breakdown.",
          desktopBody:
            "Scan with your iPhone for body-fat context, proportions, and a 12-muscle breakdown.",
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the match useful",
          headline: "A visual match is a snapshot. Track your own trend.",
          body:
            "Save consistent check-ins and see whether body fat, muscle, and proportions are actually changing.",
          desktopBody:
            "Scan with your iPhone to turn this visual match into a private progress-photo trend.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Turn the reference into a target",
          headline: "Preview the physique you are working toward.",
          body:
            "Create a motivational projection, then compare it with the real photos you take along the way.",
          desktopBody:
            "Scan with your iPhone to preview a future physique and compare it with your real check-ins.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "ai_body_transformation":
      return resultExperiment({
        improve: {
          eyebrow: "Build the route",
          headline: "The preview shows the destination. Find the weak points.",
          body:
            "Use a 12-muscle breakdown to decide what deserves more work before your next check-in.",
          desktopBody:
            "Scan with your iPhone for a 12-muscle breakdown and clear focus areas behind the projection.",
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the preview useful",
          headline: "The render is a target. Track the real thing.",
          body:
            "Save consistent check-ins and compare your real progress with the projection over time.",
          desktopBody:
            "Scan with your iPhone to save the target and compare it with consistent progress photos.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Keep the target visible",
          headline: "Save this projection as your future-physique target.",
          body:
            "Re-render at different intensities, then compare each projection with the real photos you take.",
          desktopBody:
            "Scan with your iPhone to keep exploring the target and compare it with real check-ins.",
          iosLabel: "Explore my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "body_measurements":
      return resultExperiment({
        improve: {
          eyebrow: "Turn targets into a plan",
          headline: "See which muscle groups need the work.",
          body:
            "Pair your measurement targets with a 12-muscle breakdown and clear focus areas.",
          desktopBody:
            "Scan with your iPhone to pair measurement targets with a full muscle-by-muscle breakdown.",
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the target useful",
          headline: "Your target is set. Track the photos that get you there.",
          body:
            "Save consistent check-ins and see whether the measurement target is becoming visible.",
          desktopBody:
            "Scan with your iPhone to save the target and compare it with consistent progress photos.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Keep shaping the target",
          headline: "Preview each target before you chase it.",
          body:
            "Adjust different muscle groups, re-render the projection, and compare it with your real progress.",
          desktopBody:
            "Scan with your iPhone to explore more targets and compare them with your real check-ins.",
          iosLabel: "Explore my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "progress_photo_compare":
      return resultExperiment({
        improve: {
          eyebrow: "Turn the change into a plan",
          headline: "See what deserves your attention next.",
          body:
            "Bring one check-in into GainFrame for body-fat context, proportions, and a 12-muscle breakdown.",
          desktopBody:
            "Scan with your iPhone to turn the visible change into a 12-muscle breakdown and clear focus areas.",
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make every comparison count",
          headline: "Two photos show a change. A timeline shows the trend.",
          body:
            "Keep every check-in aligned, save the dates, and compare your progress without rebuilding the view each time.",
          desktopBody:
            "Scan with your iPhone to keep aligned check-ins together and turn one comparison into a private progress timeline.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Give the change a target",
          headline: "Compare today with the physique you are building toward.",
          body:
            "Create a motivational future-physique projection, then compare it with the real photos you take along the way.",
          desktopBody:
            "Scan with your iPhone to preview a future physique and compare the projection with your real check-ins.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "recomp_reality_checker":
      return resultExperiment({
        improve: {
          eyebrow: "Turn the signals into a plan",
          headline: "See where your training needs the next push.",
          body:
            "Add a progress photo for body-fat context, proportions, and a 12-muscle breakdown behind the scale and tape.",
          desktopBody:
            "Scan with your iPhone to add a muscle-by-muscle view to the signals you just checked.",
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Confirm the pattern",
          headline: "A likely trend becomes useful when it repeats.",
          body:
            "Save consistent check-ins alongside weight and measurements so the next 4–12 weeks are easier to read.",
          desktopBody:
            "Scan with your iPhone to pair consistent photos with the weight, waist, and strength trend.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Give the next block a target",
          headline: "Picture what another consistent 12 weeks could build.",
          body:
            "Preview a future physique, then compare the projection with your real progress instead of treating it as a promise.",
          desktopBody:
            "Scan with your iPhone to preview a target and compare it with real check-ins over the next training block.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });

    case "body_shape_compare":
      return resultExperiment({
        improve: {
          eyebrow: "Go beyond the outline",
          headline: "Ratios show where. A scan shows what to work on.",
          body:
            "Pair the illustrative shape comparison with body-fat context and a 12-muscle breakdown.",
          desktopBody:
            "Scan with your iPhone to turn the ratio comparison into a muscle-by-muscle view and clear focus areas.",
          iosLabel: "Show my muscle breakdown",
          proof: PRIVATE_PROOF,
        },
        track: {
          eyebrow: "Make the target measurable",
          headline: "A goal outline is not a trend. Track the real changes.",
          body:
            "Save consistent check-ins and see whether the proportions behind the illustration are changing over time.",
          desktopBody:
            "Scan with your iPhone to compare consistent progress photos with the proportions you are working toward.",
          iosLabel: "Track my next check-in",
          proof: TRACK_PROOF,
        },
        future: {
          eyebrow: "Keep the target visual",
          headline: "Turn the illustrative comparison into a future target.",
          body:
            "Preview a motivational future physique, then compare the projection with your real check-ins along the way.",
          desktopBody:
            "Scan with your iPhone to explore a future physique and compare it with your real progress.",
          iosLabel: "Preview my future physique",
          proof: FUTURE_PROOF,
        },
      });
  }
}

export type ToolCtaAssignment = {
  variant: ToolCtaVariant;
  forced: boolean;
};

let inMemoryToolCtaVariant: ToolCtaVariant | null = null;

/** Clears page-lifetime state for isolated tests. */
export function clearToolCtaAssignmentMemory(): void {
  inMemoryToolCtaVariant = null;
}

export function isToolCtaVariant(value: unknown): value is ToolCtaVariant {
  return (
    typeof value === "string" &&
    TOOL_CTA_VARIANTS.includes(value as ToolCtaVariant)
  );
}

export function toolCtaVariantForRandom(value: number): ToolCtaVariant {
  const bounded = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999) : 0;
  return TOOL_CTA_VARIANTS[Math.floor(bounded * TOOL_CTA_VARIANTS.length)];
}

/**
 * Stable, privacy-safe assignment for the result CTA experiment. Until
 * analytics consent is granted, assignment is kept in memory only. A later
 * grant persists that same page-lifetime variant, avoiding a visible switch.
 * Optional `gf_cta_variant` overrides exist for QA and are explicitly marked
 * as forced on analytics events so they can be excluded from the readout.
 */
export function getToolCtaAssignment(
  storage: Pick<Storage, "getItem" | "setItem"> | null | undefined = undefined,
  search = typeof window === "undefined" ? "" : window.location.search,
  random = Math.random,
  analyticsConsentGranted =
    typeof window !== "undefined" &&
    documentAnalyticsConsentGranted(window.document?.documentElement),
): ToolCtaAssignment {
  try {
    const forced = new URLSearchParams(search).get("gf_cta_variant");
    if (isToolCtaVariant(forced)) {
      return { variant: forced, forced: true };
    }
  } catch {
    // A malformed query string should never block the result CTA.
  }

  let consentedStorage: Pick<Storage, "getItem" | "setItem"> | null = null;
  if (analyticsConsentGranted) {
    if (storage !== undefined) {
      consentedStorage = storage;
    } else if (typeof window !== "undefined") {
      try {
        consentedStorage = window.localStorage;
      } catch {
        // Private browsing and hardened browsers may reject localStorage.
      }
    }

    // If this page assigned while consent was pending, preserve that visible
    // variant and make it the stable choice for future consented visits.
    if (!inMemoryToolCtaVariant) {
      try {
        const stored = consentedStorage?.getItem(
          TOOL_CTA_EXPERIMENT_STORAGE_KEY,
        );
        if (isToolCtaVariant(stored)) {
          inMemoryToolCtaVariant = stored;
        }
      } catch {
        // Storage reads are optional; page-lifetime assignment still works.
      }
    }
  }

  if (!inMemoryToolCtaVariant) {
    inMemoryToolCtaVariant = toolCtaVariantForRandom(random());
  }

  if (analyticsConsentGranted) {
    try {
      consentedStorage?.setItem(
        TOOL_CTA_EXPERIMENT_STORAGE_KEY,
        inMemoryToolCtaVariant,
      );
    } catch {
      // The in-memory fallback remains stable when storage writes fail.
    }
  }
  return { variant: inMemoryToolCtaVariant, forced: false };
}
