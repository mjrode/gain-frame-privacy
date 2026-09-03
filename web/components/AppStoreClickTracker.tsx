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
import { describeDownloadCta } from "@/lib/download-cta-context";

const CTA_CARD_SELECTOR = [
  "[data-cta-card]",
  ".blog-post-cta",
  ".post-footer-cta",
  ".blog-cta-card",
  ".blog-cta",
].join(", ");

function compactText(value: string | null | undefined): string | undefined {
  const compacted = value?.replace(/\s+/g, " ").trim();
  return compacted || undefined;
}

function inferredCardName(card: HTMLElement | null): string | undefined {
  const declared = compactText(card?.dataset.ctaCardName);
  if (declared) return declared;
  if (
    card?.matches(
      ".blog-post-cta, .post-footer-cta, .blog-cta-card, .blog-cta",
    )
  ) {
    return "Authored inline blog card — per-article creative";
  }
  return undefined;
}

function inferredCardType(card: HTMLElement | null): string | undefined {
  if (card?.dataset.ctaCard) return card.dataset.ctaCard;
  return card ? "blog_authored" : undefined;
}

function cardText(
  card: HTMLElement | null,
  declared: string | undefined,
  selector: string,
): string | undefined {
  return (
    compactText(declared) ??
    compactText(card?.querySelector(selector)?.textContent)
  );
}

function clickedActionText(anchor: HTMLAnchorElement): string | undefined {
  return (
    compactText(anchor.getAttribute("aria-label")) ??
    compactText(anchor.textContent) ??
    compactText(anchor.querySelector("img")?.getAttribute("alt"))
  );
}

function absoluteAssetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  try {
    return new URL(path, window.location.origin).href;
  } catch {
    return undefined;
  }
}

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
      const customProductPageId =
        anchor.getAttribute("data-cta-custom-product-page-id") ?? undefined;
      const experimentRoot = anchor.closest<HTMLElement>(
        "[data-experiment-id]",
      );
      const experimentId = experimentRoot?.dataset.experimentId;
      const experimentPhase = experimentRoot?.dataset.experimentPhase;
      const experimentVariant = experimentRoot?.dataset.experimentVariant;
      const experimentForced =
        experimentRoot?.dataset.experimentForced === "true";
      const experimentProperties = experimentId && experimentVariant
        ? {
            experiment_id: experimentId,
            ...(experimentPhase
              ? { experiment_phase: experimentPhase }
              : {}),
            experiment_variant: experimentVariant,
            experiment_forced: experimentForced,
            cta_angle: experimentRoot?.dataset.ctaAngle ?? experimentVariant,
          }
        : {};
      const cardRoot = anchor.closest<HTMLElement>(CTA_CARD_SELECTOR);
      const cardName =
        inferredCardName(cardRoot) ??
        describeDownloadCta(ctaContent, experimentVariant);
      const actionText = clickedActionText(anchor);
      const cardLabel = cardText(
        cardRoot,
        cardRoot?.dataset.ctaCardLabel,
        ".blog-contextual-cta-label",
      );
      const cardHeadline = cardText(
        cardRoot,
        cardRoot?.dataset.ctaCardHeadline,
        "h2, h3",
      );
      const buttonText =
        cardText(
          cardRoot,
          cardRoot?.dataset.ctaCardButton,
          ".blog-contextual-cta-button",
        ) ?? actionText;
      const cardImageUrl = absoluteAssetUrl(
        cardRoot?.dataset.ctaCardImage ??
          cardRoot?.querySelector("img")?.getAttribute("src") ??
          undefined,
      );
      const cardType = inferredCardType(cardRoot);
      const cardContext = {
        cta_card_name: cardName,
        ...(actionText ? { cta_action_text: actionText } : {}),
        ...(cardType ? { cta_card_type: cardType } : {}),
        ...(cardLabel ? { cta_card_label: cardLabel } : {}),
        ...(cardHeadline ? { cta_card_headline: cardHeadline } : {}),
        ...(buttonText ? { cta_button_text: buttonText } : {}),
        ...(cardImageUrl ? { cta_card_image_url: cardImageUrl } : {}),
        ...(cardRoot?.dataset.blogCtaSlug
          ? { blog_slug: cardRoot.dataset.blogCtaSlug }
          : {}),
        ...(cardRoot?.dataset.blogCtaIntent
          ? { blog_intent: cardRoot.dataset.blogCtaIntent }
          : {}),
        ...(cardRoot?.dataset.blogCtaPlacement
          ? { blog_placement: cardRoot.dataset.blogCtaPlacement }
          : {}),
        ...(cardRoot?.dataset.blogCtaRollout
          ? { blog_rollout: cardRoot.dataset.blogCtaRollout }
          : {}),
      };

      rememberCurrentAcquisition();
      const attribution = buildWebAttributionLink({
        campaign: ct,
        cta: ctaContent,
        customProductPageId,
      });
      anchor.href = attribution.href;

      if (attribution.payload) {
        // This event deliberately is not deduplicated: web_click_id must match
        // the exact OneLink click that later resolves in the app.
        track("web_download_clicked", {
          ...attribution.payload,
          destination: "app_store",
          // Tool/placement/campaign directly on the event so funnels don't
          // have to reconstruct them from the attribution payload.
          source,
          cta_content: ctaContent,
          ct,
          ...cardContext,
          ...experimentProperties,
        });
      }

      if (!anchor.hasAttribute("data-track-exempt")) {
        trackOncePerDay(
          "outbound_app_store_click",
          {
            source,
            cta_content: ctaContent,
            ct,
            ...cardContext,
            ...experimentProperties,
          },
          `${source}:${ctaContent}:${experimentVariant ?? "none"}`,
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
