"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Site-wide delegated listener that fires `outbound_app_store_click` for any
 * click on an App Store link — React components, static blog/calculator
 * bodies under lib/_extracted, and future posts all get coverage for free.
 *
 * Placement labels come from optional attributes on the anchor:
 *   - `data-cta-source`   overrides the default source (the page pathname)
 *   - `data-cta-content`  overrides the inferred placement (floating_pill /
 *                         store_badge / link)
 *   - `data-track-exempt` skips the anchor entirely — the BF estimator's
 *     CTAs set this because they fire their own richer event (campaign
 *     source + variant) and must not double-count.
 *
 * Listens in the capture phase so a stopPropagation() in page scripts can't
 * swallow the event before GA sees it.
 */
export default function AppStoreClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.<HTMLAnchorElement>(
        'a[href*="apps.apple.com"]',
      );
      if (!anchor || anchor.hasAttribute("data-track-exempt")) return;

      const source =
        anchor.getAttribute("data-cta-source") ??
        (window.location.pathname.replace(/\/+$/, "") || "/");
      const ctaContent =
        anchor.getAttribute("data-cta-content") ??
        (anchor.classList.contains("blog-floating-pill")
          ? "floating_pill"
          : anchor.querySelector("img")
            ? "store_badge"
            : "link");

      track("outbound_app_store_click", {
        source,
        cta_content: ctaContent,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
