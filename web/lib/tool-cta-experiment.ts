export const TOOL_CTA_EXPERIMENT_ID = "tool_result_cta_v1";
export const TOOL_CTA_EXPERIMENT_STORAGE_KEY =
  "gainframe:experiment:tool_result_cta_v1";

export const TOOL_CTA_VARIANTS = ["improve", "track", "future"] as const;
export type ToolCtaVariant = (typeof TOOL_CTA_VARIANTS)[number];

export type ToolCtaAssignment = {
  variant: ToolCtaVariant;
  forced: boolean;
};

export function isToolCtaVariant(value: unknown): value is ToolCtaVariant {
  return (
    typeof value === "string" &&
    TOOL_CTA_VARIANTS.includes(value as ToolCtaVariant)
  );
}

export function toolCtaVariantForRandom(value: number): ToolCtaVariant {
  const bounded = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999) : 0;
  return TOOL_CTA_VARIANTS[Math.floor(bounded * TOOL_CTA_VARIANTS.length)];
}

/**
 * Stable, privacy-safe assignment for the result CTA experiment. The
 * localStorage value is essential presentation state, not an analytics ID:
 * it only prevents a returning visitor from seeing a different CTA angle.
 * Optional `gf_cta_variant` overrides exist for QA and are explicitly marked
 * as forced on analytics events so they can be excluded from the readout.
 */
export function getToolCtaAssignment(
  storage: Pick<Storage, "getItem" | "setItem"> | null =
    typeof window === "undefined" ? null : window.localStorage,
  search = typeof window === "undefined" ? "" : window.location.search,
  random = Math.random,
): ToolCtaAssignment {
  try {
    const forced = new URLSearchParams(search).get("gf_cta_variant");
    if (isToolCtaVariant(forced)) {
      return { variant: forced, forced: true };
    }
  } catch {
    // A malformed query string should never block the result CTA.
  }

  try {
    const stored = storage?.getItem(TOOL_CTA_EXPERIMENT_STORAGE_KEY);
    if (isToolCtaVariant(stored)) {
      return { variant: stored, forced: false };
    }
  } catch {
    // Private browsing and hardened browsers may reject localStorage reads.
  }

  const variant = toolCtaVariantForRandom(random());
  try {
    storage?.setItem(TOOL_CTA_EXPERIMENT_STORAGE_KEY, variant);
  } catch {
    // The assignment remains stable for this component mount even if storage
    // is unavailable. Analytics is best effort and the CTA still works.
  }
  return { variant, forced: false };
}
