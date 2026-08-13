import assert from "node:assert/strict";
import test from "node:test";

const {
  analyticsConsentRegion,
  handlePrivacyRegion,
  requiresAnalyticsConsent,
} = await import("./privacy-region.ts");

test("requiresAnalyticsConsent covers the EEA, UK, and Switzerland", () => {
  for (const country of ["AT", "DE", "FR", "IE", "IS", "LI", "NO", "GB", "CH"]) {
    assert.equal(requiresAnalyticsConsent(country), true, country);
  }
  for (const country of ["US", "CA", "AU", "JP", "BR"]) {
    assert.equal(requiresAnalyticsConsent(country), false, country);
  }
});

test("requiresAnalyticsConsent allows analytics for missing or unknown location", () => {
  assert.equal(requiresAnalyticsConsent(undefined), false);
  assert.equal(requiresAnalyticsConsent(null), false);
  assert.equal(requiresAnalyticsConsent(""), false);
  assert.equal(requiresAnalyticsConsent("XX"), false);
  assert.equal(requiresAnalyticsConsent("T1"), false);
  assert.equal(analyticsConsentRegion(undefined), "unknown");
  assert.equal(analyticsConsentRegion("DE"), "required");
  assert.equal(analyticsConsentRegion("US"), "not_required");
});

test("privacy region response discloses only the consent decision", async () => {
  const request = new Request("https://gainframe.app/api/privacy-region");
  Object.defineProperty(request, "cf", {
    value: { country: "US" },
  });

  const response = handlePrivacyRegion(request);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.deepEqual(await response.json(), {
    requiresConsent: false,
    regionKnown: true,
  });
});

test("privacy region response distinguishes an unavailable location", async () => {
  const request = new Request("https://gainframe.app/api/privacy-region");
  Object.defineProperty(request, "cf", {
    value: { country: "XX" },
  });

  const response = handlePrivacyRegion(request);

  assert.deepEqual(await response.json(), {
    requiresConsent: false,
    regionKnown: false,
  });
});

test("privacy region HEAD response has no body", async () => {
  const request = new Request("https://gainframe.app/api/privacy-region", {
    method: "HEAD",
  });
  Object.defineProperty(request, "cf", {
    value: { country: "DE" },
  });

  const response = handlePrivacyRegion(request);

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});
