"use client";

import { useEffect } from "react";
import { track, trackOncePerDay } from "@/lib/analytics";
import {
  APP_STORE_APP_ID,
  APP_STORE_PROVIDER_TOKEN,
  campaignForPath,
} from "@/lib/site";
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
 *   - `data-track-exempt` skips the anchor entirely — the BF estimator's
 *     CTAs set this because they fire their own richer event (campaign
 *     source + variant) and must not double-count.
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
    rememberAcquisitionParams(window.location.search);

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

      // Coarse Apple campaign token, used only when the anchor doesn't declare
      // one: nav CTAs render on every page, so they get their own token;
      // everything else is keyed off the page path.
      const fallbackCt =
        source === "nav" || source === "blog_nav"
          ? "web-nav"
          : campaignForPath(window.location.pathname);

      // Append Apple campaign tokens at click time so App Store Connect
      // attributes the install to a web campaign instead of "organic". This
      // covers static blog bodies and future posts without content edits.
      // Only GainFrame's own listing is rewritten (blog posts also link to
      // competitor apps), and a page that set its own ct (giveaway,
      // wilmington) keeps it.
      //
      // When the anchor already carries a ct, that value — not the coarse
      // path-derived fallback — is what App Store Connect attributes the
      // install to, so the analytics event has to report the same string.
      // Components like PlatformDownloadLink and DownloadQr set placement-level
      // tokens (web-home-hero / -nav / -qr / -closing, web-blog-<intent>), and
      // reporting `web-home` for all four made PostHog and ASC irreconcilable.
      let ct = fallbackCt;
      try {
        const url = new URL(anchor.href);
        const declaredCt = url.searchParams.get("ct");
        if (declaredCt) {
          ct = declaredCt;
        } else if (url.pathname.includes(APP_STORE_APP_ID)) {
          url.searchParams.set("pt", APP_STORE_PROVIDER_TOKEN);
          url.searchParams.set("ct", ct);
          url.searchParams.set("mt", "8");
          anchor.href = url.toString();
        }
      } catch {
        // Malformed href — leave the anchor untouched and report the fallback.
      }

      const attribution = buildWebAttributionLink({
        campaign: ct,
        cta: ctaContent,
      });
      anchor.href = attribution.href;

      // This event deliberately is not deduplicated: web_click_id must match
      // the exact OneLink click that later resolves in the app.
      track("web_download_clicked", {
        ...attribution.payload,
        destination: "app_store",
      });

      if (!anchor.hasAttribute("data-track-exempt")) {
        trackOncePerDay(
          "outbound_app_store_click",
          { source, cta_content: ctaContent, ct },
          `${source}:${ctaContent}`,
        );
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
