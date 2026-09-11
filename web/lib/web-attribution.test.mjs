import assert from "node:assert/strict";
import test from "node:test";

import {
  buildWebAttributionLink,
  deriveOriginalSource,
  directAppStoreUrl,
  isGainFrameDownloadUrl,
  safeAnonymousPosthogId,
} from "./web-attribution.ts";

const context = {
  referrer: "https://www.google.com/search",
  referring_domain: "www.google.com",
  landing_path: "/blog/dexa-scan-vs-ai-body-composition/",
  current_path: "/tools/body-fat-estimator/",
  browser: "Mobile Safari",
  os: "iOS",
  device_type: "Mobile",
  session_id: "session-123",
  utm_medium: "organic",
  utm_campaign: "dexa-guide",
};

test("builds the stable iOS deferred-deep-link mapping on page load", () => {
  const result = buildWebAttributionLink(
    { campaign: "web-blog", cta: "article_bottom" },
    {
      context,
      currentUrl:
        "https://gainframe.app/tools/body-fat-estimator/?ttclid=current-click",
      now: new Date("2026-08-09T12:34:56.000Z"),
      oneLinkUrl: "https://gainframe.onelink.me/WufP",
      posthogDistinctId: "019abcde-1234-5678-9abc-def012345678",
      randomUUID: () => "11111111-2222-4333-8444-555555555555",
      preservedParams: { ttclid: "preserved-click", gclid: "google-click" },
    },
  );

  assert.ok(result.payload);
  const url = new URL(result.href);
  assert.equal(url.origin + url.pathname, "https://gainframe.onelink.me/WufP");
  assert.equal(url.searchParams.get("ct"), "web-blog");
  assert.equal(url.searchParams.get("pid"), "owned_web");
  assert.equal(url.searchParams.get("af_channel"), "google_organic");
  assert.equal(url.searchParams.get("deep_link_value"), "web_attribution");
  assert.equal(
    url.searchParams.get("deep_link_sub1"),
    "/blog/dexa-scan-vs-ai-body-composition/",
  );
  assert.equal(
    url.searchParams.get("deep_link_sub2"),
    "/tools/body-fat-estimator/",
  );
  assert.equal(url.searchParams.get("deep_link_sub3"), "article_bottom");
  assert.equal(url.searchParams.get("deep_link_sub4"), "google_organic");
  assert.equal(url.searchParams.get("deep_link_sub5"), "dexa-guide");
  assert.equal(
    url.searchParams.get("deep_link_sub6"),
    "11111111-2222-4333-8444-555555555555",
  );
  assert.equal(
    url.searchParams.get("deep_link_sub7"),
    "019abcde-1234-5678-9abc-def012345678",
  );
  assert.equal(url.searchParams.get("deep_link_sub8"), "session-123");
  assert.equal(url.searchParams.get("deep_link_sub9"), "organic");
  assert.equal(
    url.searchParams.get("deep_link_sub10"),
    "2026-08-09T12:34:56.000Z",
  );
  assert.equal(url.searchParams.get("ttclid"), "preserved-click");
  assert.equal(url.searchParams.get("gclid"), "google-click");
});

test("download attribution does not wait for a consent decision", () => {
  const result = buildWebAttributionLink(
    { campaign: "web-blog", cta: "article_bottom" },
    { context, posthogDistinctId: null, randomUUID: () => "click-123" },
  );
  assert.ok(result.payload);
  assert.equal(result.payload.web_click_id, "click-123");
  assert.equal(new URL(result.href).searchParams.get("deep_link_value"), "web_attribution");
});

test("custom product page routing survives attribution and direct fallback", () => {
  const customProductPageId = "ba181e7f-4bf8-44f3-8be6-94077b918f89";
  const options = {
    campaign: "seo-physique-cpp-v1",
    cta: "result",
    customProductPageId,
  };

  const directUrl = new URL(directAppStoreUrl(options));
  assert.equal(directUrl.hostname, "apps.apple.com");
  assert.equal(directUrl.searchParams.get("ppid"), customProductPageId);
  assert.equal(directUrl.searchParams.get("pt"), "128456047");
  assert.equal(directUrl.searchParams.get("ct"), "seo-physique-cpp-v1");
  assert.equal(directUrl.searchParams.get("mt"), "8");

  const consented = buildWebAttributionLink(options, {
    context,
    currentUrl: "https://gainframe.app/tools/physique-rater/",
    oneLinkUrl: "https://gainframe.onelink.me/WufP",
    randomUUID: () => "11111111-2222-4333-8444-555555555555",
    posthogDistinctId: null,
  });
  const oneLink = new URL(consented.href);
  assert.equal(oneLink.searchParams.get("ct"), "seo-physique-cpp-v1");
  assert.equal(
    oneLink.searchParams.get("af_ios_store_cpp"),
    customProductPageId,
  );
  assert.ok(consented.payload);
});

test("invalid product page identifiers fail closed to the default listing", () => {
  const result = directAppStoreUrl(
    {
      campaign: "seo-physique-cpp-v1",
      cta: "result",
      customProductPageId: "not-a-product-page",
    },
  );
  const url = new URL(result);
  assert.equal(url.searchParams.get("ppid"), null);
  assert.equal(url.searchParams.get("ct"), null);
});

test("anonymous PostHog identity fails closed for email-like values", () => {
  assert.equal(safeAnonymousPosthogId("anon:$device-123"), "anon:$device-123");
  assert.equal(safeAnonymousPosthogId("person@example.com"), undefined);
  assert.equal(safeAnonymousPosthogId("has spaces"), undefined);
});

test("derives first-touch traffic source without leaking referrer URLs", () => {
  assert.equal(deriveOriginalSource(context), "google_organic");
  assert.equal(
    deriveOriginalSource({ ...context, utm_source: "TikTok Ads" }),
    "tiktok_ads",
  );
});

test("only GainFrame download destinations are rewritten", () => {
  assert.equal(
    isGainFrameDownloadUrl(
      "https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082",
    ),
    true,
  );
  assert.equal(
    isGainFrameDownloadUrl("https://gainframe.onelink.me/WufP"),
    true,
  );
  assert.equal(
    isGainFrameDownloadUrl("https://apps.apple.com/us/app/competitor/id123456"),
    false,
  );
});
