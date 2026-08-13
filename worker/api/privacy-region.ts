// GET /api/privacy-region
//
// The website is statically exported, so the browser cannot know whether a
// regional analytics-consent prompt is required until the Cloudflare Worker
// supplies the request's coarse country classification. The endpoint returns
// only the boolean decision; it never exposes or persists the country code.

type RequestWithCloudflare = Request & {
  cf?: {
    country?: string | null;
  };
};

// Microsoft Clarity enforces explicit consent signals for the EEA, UK, and
// Switzerland. Keep this list independent of frontend code so location data
// stays at the edge.
const CONSENT_REQUIRED_COUNTRIES = new Set([
  // European Union
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
  "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT",
  "RO", "SK", "SI", "ES", "SE",
  // Remaining EEA members
  "IS", "LI", "NO",
  // United Kingdom and Switzerland
  "GB", "CH",
]);

export type AnalyticsConsentRegion =
  | "required"
  | "not_required"
  | "unknown";

export function analyticsConsentRegion(
  countryCode: string | null | undefined,
): AnalyticsConsentRegion {
  const normalized = countryCode?.trim().toUpperCase();
  if (!normalized || normalized === "XX" || normalized === "T1") {
    return "unknown";
  }
  return CONSENT_REQUIRED_COUNTRIES.has(normalized)
    ? "required"
    : "not_required";
}

export function requiresAnalyticsConsent(
  countryCode: string | null | undefined,
): boolean {
  return analyticsConsentRegion(countryCode) === "required";
}

export function handlePrivacyRegion(request: Request): Response {
  const countryCode = (request as RequestWithCloudflare).cf?.country;
  const region = analyticsConsentRegion(countryCode);
  const payload = JSON.stringify({
    requiresConsent: region === "required",
    regionKnown: region !== "unknown",
  });

  return new Response(request.method === "HEAD" ? null : payload, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
