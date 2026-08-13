import assert from "node:assert/strict";
import test from "node:test";

const {
  combinedStoredAnalyticsConsent,
  isProductionAnalyticsHost,
  resolveAnalyticsConsent,
  resolveAnalyticsConsentState,
  storedAnalyticsConsent,
} = await import("./analytics-consent.ts");

test("a saved denial wins when browser stores disagree", () => {
  assert.equal(
    combinedStoredAnalyticsConsent("granted", "denied"),
    "denied",
  );
  assert.equal(
    combinedStoredAnalyticsConsent("denied", "granted"),
    "denied",
  );
  assert.equal(combinedStoredAnalyticsConsent("granted", null), "granted");
  assert.equal(combinedStoredAnalyticsConsent("invalid", null), null);
});

test("analytics decisions honor saved choices and otherwise require region", () => {
  assert.equal(resolveAnalyticsConsent("granted", true), "granted");
  assert.equal(resolveAnalyticsConsent("denied", false), "denied");
  assert.equal(resolveAnalyticsConsent(null, true), "pending");
  assert.equal(resolveAnalyticsConsent(null, false), "granted");
  assert.equal(resolveAnalyticsConsent("invalid", true), "pending");
  assert.equal(storedAnalyticsConsent("invalid"), null);
});

test("region failures track unless a saved choice overrides them", () => {
  assert.deepEqual(resolveAnalyticsConsentState(null, null), {
    decision: "granted",
  });
  assert.deepEqual(resolveAnalyticsConsentState("granted", null), {
    decision: "granted",
  });
  assert.deepEqual(resolveAnalyticsConsentState("denied", null), {
    decision: "denied",
  });
});

test("analytics scripts run only on the production domain", () => {
  assert.equal(isProductionAnalyticsHost("gainframe.app"), true);
  assert.equal(isProductionAnalyticsHost("www.gainframe.app"), true);
  assert.equal(isProductionAnalyticsHost("app.gainframe.app"), false);
  assert.equal(isProductionAnalyticsHost("localhost"), false);
  assert.equal(isProductionAnalyticsHost("gainframe.app.example.com"), false);
});
