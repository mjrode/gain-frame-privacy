import type { BlogCtaIntent } from "./blog-cta.ts";

export const BLOG_CTA_EXPERIMENT_ID = "blog_contextual_cta_v1";
export const BLOG_CTA_EXPERIMENT_PHASE = "sticky_vs_editorial_inline_v2_stable_assignment";
export const BLOG_CTA_EXPERIMENT_STORAGE_KEY =
  `gainframe:experiment:blog_contextual_cta_v1:${BLOG_CTA_EXPERIMENT_PHASE}`;

export const BLOG_CTA_VARIANTS = [
  "sticky_control",
  "editorial_inline",
] as const;

export type BlogCtaVariant = (typeof BLOG_CTA_VARIANTS)[number];

export type BlogCtaAssignment = {
  forced: boolean;
  variant: BlogCtaVariant;
};

let inMemoryBlogCtaVariant: BlogCtaVariant | null = null;

/** Clears page-lifetime state for isolated tests. */
export function clearBlogCtaAssignmentMemory(): void {
  inMemoryBlogCtaVariant = null;
}

export function isBlogCtaVariant(value: unknown): value is BlogCtaVariant {
  return (
    typeof value === "string" &&
    BLOG_CTA_VARIANTS.includes(value as BlogCtaVariant)
  );
}

export function blogCtaVariantForRandom(value: number): BlogCtaVariant {
  const bounded = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 0.999999)
    : 0;
  return bounded < 0.5 ? "sticky_control" : "editorial_inline";
}

/** Restore the current phase's saved assignment before choosing a new variant.
 * QA overrides are marked forced and never replace the saved visitor choice. */
export function getBlogCtaAssignment(
  storage: Pick<Storage, "getItem" | "setItem"> | null | undefined = undefined,
  search = typeof window === "undefined" ? "" : window.location.search,
  random = Math.random,
): BlogCtaAssignment {
  try {
    const forced = new URLSearchParams(search).get("gf_blog_cta_variant");
    if (isBlogCtaVariant(forced)) {
      return { variant: forced, forced: true };
    }
  } catch {
    // A malformed query string should never block article content.
  }

  let resolvedStorage = storage ?? null;
  if (storage === undefined && typeof window !== "undefined") {
    try {
      resolvedStorage = window.localStorage;
    } catch {
      // Storage may be blocked; retain the page-lifetime fallback.
    }
  }
  try {
    const stored = resolvedStorage?.getItem(BLOG_CTA_EXPERIMENT_STORAGE_KEY);
    if (isBlogCtaVariant(stored)) inMemoryBlogCtaVariant = stored;
  } catch {
    // A temporary storage error must never block the CTA.
  }
  if (!inMemoryBlogCtaVariant) {
    inMemoryBlogCtaVariant = blogCtaVariantForRandom(random());
  }
  try {
    resolvedStorage?.setItem(BLOG_CTA_EXPERIMENT_STORAGE_KEY, inMemoryBlogCtaVariant);
  } catch {
    // Keep the same page choice when persistence is unavailable.
  }
  return { variant: inMemoryBlogCtaVariant, forced: false };
}

export function getBlogCtaAttribution(
  intent: BlogCtaIntent,
  variant: BlogCtaVariant,
): { campaign: string; content: string } {
  return {
    campaign: `web-blog-${variant.replaceAll("_", "-")}`,
    content: `blog_cta_${variant}_${intent}`,
  };
}
