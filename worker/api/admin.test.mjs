import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeFlow, verifyAdmin } from "./admin.ts";
import { handleAdminMoney } from "./admin-money.ts";
import { handleAdminProduct } from "./admin-product.ts";

test("normalizeFlow maps legacy display labels to canonical flows", () => {
  assert.equal(normalizeFlow("ClassifyAndScore"), "classify_score");
  assert.equal(normalizeFlow("Weekly Summary"), "weekly_summary");
  assert.equal(normalizeFlow("Coach Hero Image (photo style)"), "coach_hero_photo_style");
});

test("normalizeFlow passes canonical names through and slugifies unknowns", () => {
  assert.equal(normalizeFlow("classify_score"), "classify_score");
  assert.equal(normalizeFlow("coach-daily-read"), "coach_daily_read");
  assert.equal(normalizeFlow("Some Future Flow"), "some_future_flow");
});

test("verifyAdmin fails closed without a bearer token", async () => {
  const request = new Request("https://gainframe.app/api/admin/ai-flows");
  const env = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  };
  assert.equal(await verifyAdmin(request, env), false);
});

test("verifyAdmin fails closed when Supabase config is missing", async () => {
  const request = new Request("https://gainframe.app/api/admin/ai-flows", {
    headers: { Authorization: "Bearer some-token" },
  });
  assert.equal(await verifyAdmin(request, {}), false);
});

test("money and product endpoints reject unauthenticated requests", async () => {
  const env = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    REVENUECAT_API_KEY: "sk_test",
    POSTHOG_PERSONAL_API_KEY: "phx_test",
  };
  for (const [handler, url] of [
    [handleAdminMoney, "https://gainframe.app/api/admin/money"],
    [handleAdminProduct, "https://gainframe.app/api/admin/product"],
  ]) {
    const res = await handler(new Request(url), env);
    assert.equal(res.status, 401);
  }
});

test("money endpoint reports missing RevenueCat config instead of erroring", async () => {
  // verifyAdmin is bypassed here by stubbing the GoTrue lookup the worker
  // makes; the point is the typed `configured: false` contract, which the UI
  // renders as setup guidance rather than a failure.
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ email: "michaelrode44@gmail.com" }), {
      status: 200,
    });
  try {
    const res = await handleAdminMoney(
      new Request("https://gainframe.app/api/admin/money", {
        headers: { Authorization: "Bearer token" },
      }),
      {
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      },
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.configured, false);
    assert.match(body.hint, /REVENUECAT_API_KEY/);
  } finally {
    globalThis.fetch = realFetch;
  }
});
