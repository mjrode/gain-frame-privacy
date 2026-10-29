import { isProductionAnalyticsHost, track } from "./analytics.ts";
import { isBodyVisualizerCtaPreviewHost } from "./body-visualizer-cta-experiment.ts";
import {
  BRIDGE_VISIBILITY_MS,
  BRIDGE_VISIBILITY_RATIO,
  observeBridgeVisibility,
} from "./body-visualizer-bridge-analytics.ts";

export const BODY_FAT_BRIDGE_VERSION = "analysis_walkthrough_v1";
export const BODY_FAT_BRIDGE_EXPERIMENT_ID = "body_fat_app_bridge";
export const BODY_FAT_CTA_CONTENT = {
  main_cta: "body_fat_analysis_walkthrough_v1_main",
  result_cta: "body_fat_analysis_walkthrough_v1_result",
} as const;

type BridgeElement = "main_cta" | "walkthrough" | "result_cta" | "video";
type BridgeEvent = "body_fat_bridge_viewed" | "body_fat_bridge_cta_clicked";
type BridgePlatform = "unknown" | "ios" | "android" | "desktop";
type Emit = (event: BridgeEvent, properties: Record<string, unknown>) => void;
type Observe = (element: HTMLElement, onVisible: () => void) => () => void;

/** Local previews never enter the production analytics SDKs or pending queue. */
export const emitBodyFatBridgeEvent: Emit = (event, properties) => {
  if (typeof window === "undefined") return;
  const hostname = window.location.hostname;
  if (isBodyVisualizerCtaPreviewHost(hostname)) {
    console.debug("[Body Fat app bridge]", JSON.stringify({
      event, ...properties, preview_only: true,
    }));
  } else if (isProductionAnalyticsHost(hostname)) {
    track(event, { ...properties, preview_only: false });
  }
};

export function bodyFatBridgeCtaElement(content: string | null) {
  if (content === BODY_FAT_CTA_CONTENT.main_cta) return "main_cta" as const;
  if (content === BODY_FAT_CTA_CONTENT.result_cta) return "result_cta" as const;
  return null;
}

/** Owned by the page: returning to a section or remounting it cannot inflate reach. */
export function createBodyFatBridgeAnalytics(
  platform: BridgePlatform,
  emit: Emit = emitBodyFatBridgeEvent,
  observe: Observe = observeBridgeVisibility,
) {
  const seen = new Set<BridgeElement>();
  const cleanups = new Map<BridgeElement, () => void>();
  const eligible = platform === "ios" || platform === "desktop";
  const common = {
    tool: "bf_from_photo",
    bridge_version: BODY_FAT_BRIDGE_VERSION,
    campaign: "seo-physique-cpp-v1",
    platform,
  };

  function observeRef(element: BridgeElement) {
    return (node: HTMLElement | null) => {
      cleanups.get(element)?.();
      cleanups.delete(element);
      if (!node || seen.has(element) || platform === "unknown") return;
      if (!eligible && (element === "main_cta" || element === "result_cta")) return;
      cleanups.set(element, observe(node, () => {
        if (seen.has(element)) return;
        seen.add(element);
        emit("body_fat_bridge_viewed", {
          ...common, element,
          visibility_ratio: BRIDGE_VISIBILITY_RATIO,
          visible_ms: BRIDGE_VISIBILITY_MS,
        });
      }));
    };
  }

  return {
    refs: {
      main_cta: observeRef("main_cta"),
      walkthrough: observeRef("walkthrough"),
      result_cta: observeRef("result_cta"),
      video: observeRef("video"),
    },
    onClick(event: { target: EventTarget | null }) {
      if (!eligible || !(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[data-cta-content]");
      if (!anchor) return;
      const content = anchor.getAttribute("data-cta-content");
      const element = bodyFatBridgeCtaElement(content);
      if (!element) return;
      emit("body_fat_bridge_cta_clicked", {
        ...common, element, cta_content: content,
      });
    },
  };
}

export type BodyFatBridgeAnalytics = ReturnType<typeof createBodyFatBridgeAnalytics>;
