"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { bodyFatVisualizerDeepLinkSource } from "@/lib/tool-funnel";
import { WEB_TOOL_COMPLETED_DOM_EVENT } from "@/lib/web-tool-usage";

/**
 * Instrumentation for /tools/body-fat-visualizer/.
 *
 * The visualizer body is injected as raw HTML by CalcEmbed, so there is no
 * React tree inside it to hang handlers off. This mounts as a sibling and
 * binds to the known slider ids and to any `[data-bfv-cta]` link in the
 * markup instead.
 *
 * App Store links are deliberately NOT tracked here — AppStoreClickTracker
 * already fires `outbound_app_store_click` site-wide (and rewrites the Apple
 * campaign token), so firing it again would double-count.
 */
export default function VisualizerAnalytics() {
  // Preserve the navigation URL before CalcEmbed's legacy script normalizes
  // the selected state into a hash during its effect.
  const initialLocationRef = useRef<{ search: string; hash: string } | null>(
    null,
  );
  if (initialLocationRef.current === null && typeof window !== "undefined") {
    initialLocationRef.current = {
      search: window.location.search,
      hash: window.location.hash,
    };
  }

  useEffect(() => {
    track("bfv_tool_view");

    // CalcEmbed sets its markup during render, not in an effect, so the
    // controls are already committed by the time this runs. Any meaningful
    // visualizer journey reveals a result and activates the result CTA, but
    // completion is deliberately emitted only once per page load.
    let completed = false;
    let sliderEngaged = false;
    const trackedJourneys = new Set<string>();
    const offs: Array<() => void> = [];

    const completeOnce = (journey: string) => {
      if (completed) return;
      completed = true;
      window.dispatchEvent(
        new CustomEvent(WEB_TOOL_COMPLETED_DOM_EVENT, {
          detail: { journey },
        }),
      );
    };

    const trackJourneyOnce = (
      journey: string,
      event:
        | "bfv_gender_changed"
        | "bfv_view_changed"
        | "bfv_reference_selected",
      properties: Record<string, unknown>,
    ) => {
      if (!trackedJourneys.has(journey)) {
        trackedJourneys.add(journey);
        track(event, properties);
      }
      completeOnce(journey);
    };

    const engageSlider = (control: "body_fat" | "age") => {
      if (!sliderEngaged) {
        sliderEngaged = true;
        track("bfv_slider_engaged", { control });
      }
      completeOnce("slider");
    };

    for (const [id, control] of [
      ["bfvBfSlider", "body_fat"],
      ["bfvAgeSlider", "age"],
    ] as const) {
      const el = document.getElementById(id);
      if (!el) continue;
      const onInput = () => {
        // One engagement event per page load — the sliders fire `input`
        // continuously while dragging.
        engageSlider(control);
      };
      el.addEventListener("input", onInput, { passive: true });
      offs.push(() => el.removeEventListener("input", onInput));
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("[data-bfv-cta]");
      if (link) {
        track("bfv_cta_clicked", {
          placement: link.getAttribute("data-bfv-cta") ?? "unknown",
        });
        return;
      }

      const sliderTick = target?.closest?.(
        "#bfv .bfv__ticks .bfv__tick-label[data-index]",
      );
      if (sliderTick) {
        const control = sliderTick.closest("#bfvAgeTicks")
          ? "age"
          : "body_fat";
        engageSlider(control);
        return;
      }

      const gender = target?.closest?.(
        "#bfv .bfv__gender-btn[data-gender]",
      );
      if (gender) {
        trackJourneyOnce("gender", "bfv_gender_changed", {
          gender: gender.getAttribute("data-gender") ?? "unknown",
        });
        return;
      }

      const view = target?.closest?.("#bfv .bfv__view-btn[data-view]");
      if (view) {
        trackJourneyOnce("view", "bfv_view_changed", {
          view: view.getAttribute("data-view") ?? "unknown",
        });
        return;
      }

      const reference = target?.closest?.("#bfvRefGrid .tool-ref-card[data-bf]");
      if (reference) {
        trackJourneyOnce("reference", "bfv_reference_selected", {
          body_fat: reference.getAttribute("data-bf") ?? "unknown",
        });
      }
    };
    document.addEventListener("click", onClick);
    offs.push(() => document.removeEventListener("click", onClick));

    const visualizerRoot = document.getElementById("bfv");
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as Element | null;
      if (
        (event.key === "ArrowUp" || event.key === "ArrowDown") &&
        !target?.classList?.contains("bfv__slider")
      ) {
        engageSlider("age");
      }
    };
    visualizerRoot?.addEventListener("keydown", onKeyDown);
    offs.push(() => visualizerRoot?.removeEventListener("keydown", onKeyDown));

    const initialLocation = initialLocationRef.current;
    const deepLinkSource = initialLocation
      ? bodyFatVisualizerDeepLinkSource(
          initialLocation.search,
          initialLocation.hash,
        )
      : null;
    if (deepLinkSource) {
      // Defer until sibling effects have installed CalcEmbed's completion
      // listener. Its once-only guard owns the normalized funnel/result event.
      const timer = window.setTimeout(() => {
        track("bfv_deep_link_loaded", { source: deepLinkSource });
        completeOnce("deep_link");
      }, 0);
      offs.push(() => window.clearTimeout(timer));
    }

    return () => offs.forEach((off) => off());
  }, []);

  return null;
}
