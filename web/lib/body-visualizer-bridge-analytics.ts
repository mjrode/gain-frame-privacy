import { isProductionAnalyticsHost, track } from "./analytics.ts";
import { isBodyVisualizerCtaPreviewHost } from "./body-visualizer-cta-experiment.ts";
import { assignedCtaProperties } from "./assigned-cta-experiment.ts";
import {
  BODY_VISUALIZER_BRIDGE_MAIN_CTA,
  BODY_VISUALIZER_BRIDGE_PHASE,
  BODY_VISUALIZER_BRIDGE_RESULT_CTA,
  bodyVisualizerBridgeExperiment,
} from "./body-visualizer-bridge-rollout.ts";

export const BODY_VISUALIZER_BRIDGE_VERSION = BODY_VISUALIZER_BRIDGE_PHASE;
export const BRIDGE_VISIBILITY_RATIO = 0.5;
export const BRIDGE_VISIBILITY_MS = 1000;
export const BRIDGE_RESULT_CTA_CONTENT = BODY_VISUALIZER_BRIDGE_RESULT_CTA;

export type BridgeElement = "main_cta" | "walkthrough" | "result_cta" | "video";
export type BridgeEvent = "body_visualizer_bridge_viewed" | "body_visualizer_bridge_cta_clicked";
type BridgePlatform = "unknown" | "ios" | "android" | "desktop";
type Emit = (event: BridgeEvent, properties: Record<string, unknown>) => void;
type Observe = (element: HTMLElement, onVisible: () => void) => () => void;

/** Preview events never enter the live SDKs or their pending queue. */
export const emitBodyVisualizerBridgeEvent: Emit = (event, properties) => {
  if (typeof window === "undefined") return;
  const hostname = window.location.hostname;
  if (isBodyVisualizerCtaPreviewHost(hostname)) {
    console.debug("[Body Visualizer bridge]", JSON.stringify({
      event, ...properties, experiment_forced: true, preview_only: true,
    }));
  } else if (isProductionAnalyticsHost(hostname)) {
    track(event, { ...properties, preview_only: false });
  }
};

/** Require continuous foreground exposure, not a fast scroll or autoplay. */
export const observeBridgeVisibility: Observe = (element, onVisible) => {
  if (typeof IntersectionObserver === "undefined") return () => {};
  let visible = false;
  let recorded = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function cancelTimer() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function updateTimer() {
    if (recorded || !visible || document.visibilityState !== "visible") {
      cancelTimer();
      return;
    }
    if (timer !== undefined) return;
    timer = setTimeout(() => {
      timer = undefined;
      if (recorded || !visible || document.visibilityState !== "visible") return;
      recorded = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateTimer);
      onVisible();
    }, BRIDGE_VISIBILITY_MS);
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target !== element) continue;
      visible = entry.isIntersecting && entry.intersectionRatio >= BRIDGE_VISIBILITY_RATIO;
      updateTimer();
    }
  }, { threshold: BRIDGE_VISIBILITY_RATIO });
  observer.observe(element);
  document.addEventListener("visibilitychange", updateTimer);

  return () => {
    recorded = true;
    cancelTimer();
    observer.disconnect();
    document.removeEventListener("visibilitychange", updateTimer);
  };
};

export function bridgeCtaElement(content: string | null, primary: boolean) {
  if (content === BRIDGE_RESULT_CTA_CONTENT) return "result_cta" as const;
  if (primary && content === BODY_VISUALIZER_BRIDGE_MAIN_CTA) return "main_cta" as const;
  return null;
}

/** Owned by the page, so mode switches/remounts do not repeat reach events. */
export function createBodyVisualizerBridgeAnalytics(
  platform: BridgePlatform,
  emit: Emit = emitBodyVisualizerBridgeEvent,
  observe: Observe = observeBridgeVisibility,
) {
  const seen = new Set<BridgeElement>();
  const cleanups = new Map<BridgeElement, () => void>();
  const eligible = platform === "ios" || platform === "desktop";
  const common = {
    ...assignedCtaProperties(bodyVisualizerBridgeExperiment()),
    tool: "body_visualizer",
    bridge_version: BODY_VISUALIZER_BRIDGE_VERSION,
    campaign: "web-body-visualizer",
    platform,
  };

  function observeRef(key: BridgeElement) {
    return (element: HTMLElement | null) => {
      cleanups.get(key)?.();
      cleanups.delete(key);
      if (!element || seen.has(key) || platform === "unknown") return;
      if (!eligible && (key === "main_cta" || key === "result_cta")) return;
      cleanups.set(key, observe(element, () => {
        if (seen.has(key)) return;
        // Mark before delivery: a queued event is still a recorded exposure.
        seen.add(key);
        emit("body_visualizer_bridge_viewed", {
          ...common, element: key,
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
      const element = bridgeCtaElement(content, anchor.classList.contains("tcc-primary"));
      if (!element) return;
      emit("body_visualizer_bridge_cta_clicked", {
        ...common, element, cta_content: content,
      });
    },
  };
}

export type BodyVisualizerBridgeAnalytics = ReturnType<typeof createBodyVisualizerBridgeAnalytics>;
