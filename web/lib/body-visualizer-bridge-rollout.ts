import { isProductionAnalyticsHost } from "./analytics.ts";
import type { AssignedCtaExperiment } from "./assigned-cta-experiment.ts";
import {
  isBodyVisualizerCtaPreviewHost,
  isBodyVisualizerCtaVariant,
  type BodyVisualizerCtaVariant,
} from "./body-visualizer-cta-experiment.ts";

export const BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID = "body_visualizer_app_bridge";
export const BODY_VISUALIZER_BRIDGE_PHASE = "future_you_walkthrough_v1";
export const BODY_VISUALIZER_BRIDGE_MAIN_CTA = "body_visualizer_future_you_walkthrough_v1_main";
export const BODY_VISUALIZER_BRIDGE_RESULT_CTA = "body_visualizer_future_you_walkthrough_v1_result";

/** The approved rollout is fixed in production; historical controls remain local. */
export function getBodyVisualizerBridgeRollout(hostname: string, search: string) {
  const local = isBodyVisualizerCtaPreviewHost(hostname);
  const params = new URLSearchParams(search);
  const enabled = isProductionAnalyticsHost(hostname) ||
    (local && params.get("bv_bridge") !== "current");
  const requested = local ? params.get("bv_cta") : null;
  const variant: BodyVisualizerCtaVariant = enabled
    ? "future"
    : isBodyVisualizerCtaVariant(requested) ? requested : "analysis";
  return { enabled, local, variant };
}

/** Separate the new creative and its download/QR attribution from the closed test. */
export function bodyVisualizerBridgeExperiment(forced = false): AssignedCtaExperiment {
  return {
    id: BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID,
    phase: BODY_VISUALIZER_BRIDGE_PHASE,
    variant: "future",
    forced,
    angle: "future",
    style: "ink",
  };
}
