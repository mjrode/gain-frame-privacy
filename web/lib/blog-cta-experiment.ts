import { documentAnalyticsConsentGranted } from "./analytics-consent.ts";
import type { BlogCtaIntent } from "./blog-cta.ts";

export const BLOG_CTA_EXPERIMENT_ID = "blog_contextual_cta_v1";
export const BLOG_CTA_EXPERIMENT_PHASE = "sticky_vs_editorial_inline_v1";
export const BLOG_CTA_EXPERIMENT_STORAGE_KEY =
  "gainframe:experiment:blog_contextual_cta_v1";

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

/**
 * Stable, privacy-safe assignment for the blog CTA experiment. The assignment
 * remains in memory while consent is unresolved or denied. Once consent is
 * granted, that same visible assignment is persisted so repeat visits do not
 * switch treatments. The dedicated QA override deliberately does not share
 * the tool experiment's query parameter or storage key.
 */
export function getBlogCtaAssignment(
  storage: Pick<Storage, "getItem" | "setItem"> | null | undefined = undefined,
  search = typeof window === "undefined" ? "" : window.location.search,
  random = Math.random,
  analyticsConsentGranted =
    typeof window !== "undefined" &&
    documentAnalyticsConsentGranted(window.document?.documentElement),
): BlogCtaAssignment {
  try {
    const forced = new URLSearchParams(search).get("gf_blog_cta_variant");
    if (isBlogCtaVariant(forced)) {
      return { variant: forced, forced: true };
    }
  } catch {
    // A malformed query string should never block article content.
  }

  let consentedStorage: Pick<Storage, "getItem" | "setItem"> | null = null;
  if (analyticsConsentGranted) {
    if (storage !== undefined) {
      consentedStorage = storage;
    } else if (typeof window !== "undefined") {
      try {
        consentedStorage = window.localStorage;
      } catch {
        // Hardened browsers may reject localStorage; page-lifetime assignment
        // still keeps the experience stable.
      }
    }

    if (!inMemoryBlogCtaVariant) {
      try {
        const stored = consentedStorage?.getItem(
          BLOG_CTA_EXPERIMENT_STORAGE_KEY,
        );
        if (isBlogCtaVariant(stored)) {
          inMemoryBlogCtaVariant = stored;
        }
      } catch {
        // Storage is optional; never block the article or CTA.
      }
    }
  }

  if (!inMemoryBlogCtaVariant) {
    inMemoryBlogCtaVariant = blogCtaVariantForRandom(random());
  }

  if (analyticsConsentGranted) {
    try {
      consentedStorage?.setItem(
        BLOG_CTA_EXPERIMENT_STORAGE_KEY,
        inMemoryBlogCtaVariant,
      );
    } catch {
      // Keep the already-visible in-memory assignment when storage fails.
    }
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
