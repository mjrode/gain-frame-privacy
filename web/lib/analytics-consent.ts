export const ANALYTICS_CONSENT_STORAGE_KEY =
  "gainframe_analytics_consent_v1";
export const OPEN_ANALYTICS_PREFERENCES_EVENT =
  "gainframe:open-analytics-preferences";

export type AnalyticsConsent = "granted" | "denied";
export type AnalyticsConsentDecision = AnalyticsConsent | "pending";
export type AnalyticsConsentState = {
  decision: AnalyticsConsentDecision;
};

export function storedAnalyticsConsent(
  value: string | null | undefined,
): AnalyticsConsent | null {
  return value === "granted" || value === "denied" ? value : null;
}

/** A denial in either browser store must never be overridden by a stale grant. */
export function combinedStoredAnalyticsConsent(
  firstValue: string | null | undefined,
  secondValue: string | null | undefined,
): AnalyticsConsent | null {
  const first = storedAnalyticsConsent(firstValue);
  const second = storedAnalyticsConsent(secondValue);
  if (first === "denied" || second === "denied") return "denied";
  return first ?? second;
}

/** Explicit choices always win; otherwise only consent-required traffic waits. */
export function resolveAnalyticsConsent(
  storedChoice: string | null | undefined,
  requiresConsent: boolean,
): AnalyticsConsentDecision {
  const stored = storedAnalyticsConsent(storedChoice);
  if (stored) return stored;
  return requiresConsent ? "pending" : "granted";
}

/** Unknown or unavailable region data follows the product policy of tracking. */
export function resolveAnalyticsConsentState(
  storedChoice: string | null | undefined,
  requiresConsent: boolean | null,
): AnalyticsConsentState {
  const decision = resolveAnalyticsConsent(
    storedChoice,
    requiresConsent ?? false,
  );
  return { decision };
}

export function isProductionAnalyticsHost(hostname: string): boolean {
  return /^(?:www\.)?gainframe\.app$/i.test(hostname);
}
