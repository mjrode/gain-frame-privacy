import { isProductionAnalyticsHost } from "./analytics.ts";
import type { AssignedCtaExperiment } from "./assigned-cta-experiment.ts";
import {
  isBodyVisualizerCtaPreviewHost,
  isBodyVisualizerCtaVariant,
  type BodyVisualizerCtaVariant,
} from "./body-visualizer-cta-experiment.ts";

export const BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID = "body_visualizer_app_bridge";
export const BODY_VISUALIZER_BRIDGE_PHASE = "analysis_primary_walkthrough_v2";
export const BODY_VISUALIZER_BRIDGE_MAIN_CTA = "body_visualizer_analysis_primary_walkthrough_v2_main";
export const BODY_VISUALIZER_BRIDGE_RESULT_CTA = "body_visualizer_analysis_primary_walkthrough_v2_future_result";

/** The analysis-led rollout is fixed in production; historical controls remain local. */
export function getBodyVisualizerBridgeRollout(hostname: string, search: string) {
  const local = isBodyVisualizerCtaPreviewHost(hostname);
  const params = new URLSearchParams(search);
  const enabled = isProductionAnalyticsHost(hostname) ||
    (local && params.get("bv_bridge") !== "current");
  const requested = local ? params.get("bv_cta") : null;
  const variant: BodyVisualizerCtaVariant = enabled
    ? "analysis"
    : isBodyVisualizerCtaVariant(requested) ? requested : "analysis";
  return { enabled, local, variant };
}

/** Keep the restored analysis offer distinct from both earlier rollout phases. */
export function bodyVisualizerBridgeExperiment(
  forced = false,
  angle: "analysis" | "future" = "analysis",
): AssignedCtaExperiment {
  return {
    id: BODY_VISUALIZER_BRIDGE_EXPERIMENT_ID,
    phase: BODY_VISUALIZER_BRIDGE_PHASE,
    variant: "analysis",
    forced,
    angle,
    style: "ink",
  };
}
