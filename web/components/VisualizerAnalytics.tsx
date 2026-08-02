"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

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
  useEffect(() => {
    track("bfv_tool_view");

    // CalcEmbed sets its markup during render, not in an effect, so the
    // slider nodes are already committed by the time this runs.
    let engaged = false;
    const offs: Array<() => void> = [];

    for (const [id, control] of [
      ["bfvBfSlider", "body_fat"],
      ["bfvAgeSlider", "age"],
    ] as const) {
      const el = document.getElementById(id);
      if (!el) continue;
      const onInput = () => {
        // One engagement event per page load — the sliders fire `input`
        // continuously while dragging.
        if (engaged) return;
        engaged = true;
        track("bfv_slider_engaged", { control });
      };
      el.addEventListener("input", onInput, { passive: true });
      offs.push(() => el.removeEventListener("input", onInput));
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("[data-bfv-cta]");
      if (!link) return;
      track("bfv_cta_clicked", {
        placement: link.getAttribute("data-bfv-cta") ?? "unknown",
      });
    };
    document.addEventListener("click", onClick);
    offs.push(() => document.removeEventListener("click", onClick));

    return () => offs.forEach((off) => off());
  }, []);

  return null;
}
