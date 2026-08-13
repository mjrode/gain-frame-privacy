"use client";

import { useEffect } from "react";
import { track, trackOncePerDay } from "@/lib/analytics";
import { campaignForPath } from "@/lib/site";
import { ANALYTICS_CONSENT_STATE_EVENT } from "@/lib/analytics-consent";
import {
  buildWebAttributionLink,
  isGainFrameDownloadUrl,
  rememberAcquisitionParams,
} from "@/lib/web-attribution";

/**
 * Site-wide delegated listener that fires `outbound_app_store_click` for any
 * click on an App Store link — React components, static blog/calculator
 * bodies under lib/_extracted, and future posts all get coverage for free.
 *
 * Placement labels come from optional attributes on the anchor:
 *   - `data-cta-source`   overrides the default source (the page pathname)
 *   - `data-cta-content`  overrides the inferred placement (floating_pill /
 *                         store_badge / link)
 *   - `data-track-exempt` skips only the legacy outbound event — attribution
 *     rewriting and the consented web-download event still apply.
 *
 * Listens in the capture phase so a stopPropagation() in page scripts can't
 * swallow the event before GA sees it.
 *
 * The event is deduped to once per user per day (keyed by source + placement)
 * so a single tap the browser reports multiple times — or repeat visits to the
 * same CTA — can't inflate the count.
 *
 * NOTE ON ANDROID COVERAGE: `PlatformDownloadLink` routes Android users to the
 * web body-fat tool rather than the iOS-only App Store listing, so that anchor
 * is not an apps.apple.com URL and never reaches this listener — it fires
 * `cta_platform_alternative_click` instead. Android is roughly a third of
 * homepage CTA volume, so `outbound_app_store_click` alone UNDERSTATES total
 * CTA engagement. Always sum both events (or split by `$os`) when reading CTA
 * health; see web/docs/cta-tracking.md.
 */
export default function AppStoreClickTracker() {
  useEffect(() => {
    const rememberCurrentAcquisition = () => {
      rememberAcquisitionParams(window.location.search);
    };
    rememberCurrentAcquisition();
    window.addEventListener(
      ANALYTICS_CONSENT_STATE_EVENT,
      rememberCurrentAcquisition,
    );

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.<HTMLAnchorElement>("a[href]");
      if (!anchor || !isGainFrameDownloadUrl(anchor.href)) return;

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

      // Coarse campaign token when a placement-specific campaign was not
      // declared. The token is placed in the OneLink only after consent.
      const fallbackCt =
        source === "nav" || source === "blog_nav"
          ? "web-nav"
          : campaignForPath(window.location.pathname);
      const ct = anchor.getAttribute("data-cta-campaign") ?? fallbackCt;

      rememberCurrentAcquisition();
      const attribution = buildWebAttributionLink({
        campaign: ct,
        cta: ctaContent,
      });
      anchor.href = attribution.href;

      if (attribution.payload) {
        // This event deliberately is not deduplicated: web_click_id must match
        // the exact OneLink click that later resolves in the app.
        track("web_download_clicked", {
          ...attribution.payload,
          destination: "app_store",
        });
      }

      if (!anchor.hasAttribute("data-track-exempt")) {
        trackOncePerDay(
          "outbound_app_store_click",
          { source, cta_content: ctaContent, ct },
          `${source}:${ctaContent}`,
        );
      }
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(
        ANALYTICS_CONSENT_STATE_EVENT,
        rememberCurrentAcquisition,
      );
    };
  }, []);

  return null;
}
