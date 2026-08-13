export const SITE = {
  url: "https://gainframe.app",
  name: "GainFrame",
  appStoreUrl:
    "https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082",
  ga4Id: "G-N6YPFBB8JE",
  clarityId: "y0oh5t64bn",
  // PostHog project token (publishable) — same project as the iOS app so
  // site + app analytics live in one place.
  posthogKey: "phc_qaY5cwxVEdsFMD240oLruxYUHhhx3ORlvTXUepqEk8S",
  posthogHost: "https://us.i.posthog.com",
  contactEmail: "michaelrode44@gmail.com",
  ogImage: "https://gainframe.app/assets/og-images/og-image.png",
  logo: "https://gainframe.app/assets/favicons/favicon.webp",
  // Trainer waitlist deposit — Stripe Payment Link for the $50 founding-
  // member deposit (applied to first month at the $5/client/mo founding
  // rate). See docs/trainers-landing.md for setup + refund flow.
  trainerDepositUrl: "https://buy.stripe.com/6oUfZh6By3lpbwLbNEg7e00",
} as const;

// Apple campaign-token pieces for App Store links. `pt` (provider token) and
// `ct` (campaign) surface web-driven installs in App Store Connect →
// Analytics → Sources → Campaigns; without them every web install reads as
// "organic". Same pt as the giveaway/wilmington pages.
export const APP_STORE_APP_ID = "6759252082";
export const APP_STORE_PROVIDER_TOKEN = "128456047";

/**
 * Coarse per-surface campaign token for a page path. The delegated click
 * handler uses it only after analytics consent is granted; rendered anchors
 * themselves stay as the direct App Store destination.
 *
 * Components declare finer placement-level campaign values through their
 * `data-cta-*` attributes, so `AppStoreClickTracker` can use them when it
 * constructs the consented OneLink. See web/docs/cta-tracking.md.
 */
export function campaignForPath(pathname: string): string {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/") return "web-home";
  if (p.startsWith("/tools/body-fat-from-photo")) return "web-bftool";
  if (p.startsWith("/tools/ai-body-transformation")) return "web-bttool";
  if (p.startsWith("/tools")) return "web-tools";
  if (p.startsWith("/blog")) return "web-blog";
  if (p.startsWith("/get")) return "web-get";
  if (p.startsWith("/about")) return "web-about";
  if (p.startsWith("/comics")) return "web-comics";
  return "web-other";
}
