export type BlogCtaPresentation =
  | "legacy_inline"
  | "sticky_control"
  | "editorial_inline";

const BLOG_CARD_NAMES: Record<BlogCtaPresentation, string> = {
  legacy_inline:
    "Standard inline blog card — green/cream panel inside the article",
  sticky_control:
    "Sticky blog card — floating dock at the bottom of the screen (experiment control)",
  editorial_inline:
    "Editorial inline blog card — large blue/white panel inside the article (experiment challenger)",
};

const DOWNLOAD_CTA_NAMES: Record<string, string> = {
  link: "Inline text link (not a card)",
  store_badge: "App Store badge",
  floating_pill: "Floating download pill",
  nav_download: "Navigation download button",
  hero_download: "Homepage hero download button",
  hero_primary: "Hero download button",
  closing_download: "Closing download button",
  download_enter: "Giveaway entry download button",
  download_free: "Free-download button",
  mobile_join: "Leaderboard join button",
  redeem_offer: "Offer redemption button",
};

export function blogCtaCardName(
  presentation: BlogCtaPresentation,
): string {
  return BLOG_CARD_NAMES[presentation];
}

export function describeDownloadCta(
  ctaContent: string,
  experimentVariant?: string,
): string {
  if (
    experimentVariant === "legacy_inline" ||
    experimentVariant === "sticky_control" ||
    experimentVariant === "editorial_inline"
  ) {
    return blogCtaCardName(experimentVariant);
  }

  if (ctaContent.startsWith("contextual_inline_")) {
    return blogCtaCardName("legacy_inline");
  }
  if (ctaContent.includes("sticky_control")) {
    return blogCtaCardName("sticky_control");
  }
  if (ctaContent.includes("editorial_inline")) {
    return blogCtaCardName("editorial_inline");
  }

  const knownName = DOWNLOAD_CTA_NAMES[ctaContent];
  if (knownName) return knownName;

  const readableIdentifier = ctaContent
    .replace(/_desktop_link$/, "")
    .replace(/_qr$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const name = readableIdentifier
    ? `${readableIdentifier.charAt(0).toUpperCase()}${readableIdentifier.slice(1)} CTA`
    : "Download CTA";

  return ctaContent.includes("_qr") || ctaContent.endsWith("_desktop_link")
    ? `${name} — desktop QR companion link`
    : name;
}
