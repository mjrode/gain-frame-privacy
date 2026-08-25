import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeFlow, verifyAdmin } from "./admin.ts";
import { handleAdminMoney } from "./admin-money.ts";
import { handleAdminProduct } from "./admin-product.ts";
import {
  categorizeCalibrationResponse,
  handleAdminScoringTrust,
  mapStabilityRow,
} from "./admin-scoring.ts";

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

test("admin endpoints reject unauthenticated requests", async () => {
  const env = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    REVENUECAT_API_KEY: "sk_test",
    POSTHOG_PERSONAL_API_KEY: "phx_test",
  };
  for (const [handler, url] of [
    [handleAdminMoney, "https://gainframe.app/api/admin/money"],
    [handleAdminProduct, "https://gainframe.app/api/admin/product"],
    [handleAdminScoringTrust, "https://gainframe.app/api/admin/scoring-trust"],
  ]) {
    const res = await handler(new Request(url), env);
    assert.equal(res.status, 401);
  }
});

test("calibration feedback maps only known fixed-choice answers", () => {
  assert.equal(
    categorizeCalibrationResponse("Yes, it matches how I look"),
    "matches",
  );
  assert.equal(
    categorizeCalibrationResponse("Similar photos get very different results"),
    "inconsistent",
  );
  assert.equal(
    categorizeCalibrationResponse("It's all over the place"),
    "inconsistent",
  );
  assert.equal(
    categorizeCalibrationResponse("Body-fat estimate feels off"),
    "body_fat_off",
  );
  assert.equal(categorizeCalibrationResponse("Score feels too high"), "score_off");
  assert.equal(categorizeCalibrationResponse("private free-form answer"), "other");
});

test("stability metrics are suppressed for cohorts below three batches", () => {
  const tiny = mapStabilityRow([
    "config-37",
    "gemini-3.7-flash",
    "5.4.0",
    "newCapture",
    2,
    4,
    2,
    5,
    8,
    1,
    2,
    1,
    3,
    4,
    1,
  ]);
  assert.equal(tiny.suppressed, true);
  assert.equal(tiny.scoreP90, null);
  assert.equal(tiny.bfP90, null);
  assert.equal(tiny.batches, 2);
  assert.equal(tiny.photos, 4);

  const publishable = mapStabilityRow([
    "config-37",
    "gemini-3.7-flash",
    "5.4.0",
    "newCapture",
    3,
    6,
    2,
    5,
    8,
    1,
    3,
    1,
    3,
    4,
    1,
  ]);
  assert.equal(publishable.suppressed, false);
  assert.equal(publishable.scoreP90, 5);
  assert.equal(publishable.bfP90, 3);
});

test("scoring trust endpoint returns aggregate-only read-only evidence", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("/auth/v1/user")) {
      return new Response(JSON.stringify({ email: "michaelrode44@gmail.com" }), {
        status: 200,
      });
    }

    const query = JSON.parse(String(init?.body)).query.query;
    let results = [];
    if (query.includes("admin_scoring_operational")) {
      results = [[
        120,
        42,
        1,
        2,
        110,
        1,
        118,
        117,
        119,
        2.1,
        4.9,
        "2026-08-19.1-scoring-37",
        "gemini-3.7-flash",
        "2026-08-22 12:00:00",
      ]];
    } else if (query.includes("admin_scoring_routes")) {
      results = [[
        "classify_score",
        "2026-08-19.1-scoring-37",
        "gemini-3.7-flash",
        "google",
        "5.4.0",
        120,
        42,
        1,
        2,
        110,
        1,
        2.1,
        4.9,
        "2026-08-19 12:00:00",
        "2026-08-22 12:00:00",
      ]];
    } else if (query.includes("admin_scoring_stability")) {
      results = [[
        "2026-08-19.1-scoring-37",
        "gemini-3.7-flash",
        "5.4.0",
        "newCapture",
        5,
        10,
        2,
        5,
        7,
        1,
        4,
        1,
        2,
        3,
        1,
      ]];
    } else if (query.includes("admin_scoring_feedback")) {
      results = [
        ["5.4.0", "Yes, it matches how I look", 8, 8, 0, 0],
        ["5.4.0", "Similar photos get very different results", 2, 2, 0, 0],
        ["5.4.0", "private free-form answer", 1, 1, 0, 0],
      ];
    } else {
      assert.fail("unexpected PostHog query");
    }
    return new Response(JSON.stringify({ results }), { status: 200 });
  };

  try {
    const res = await handleAdminScoringTrust(
      new Request("https://gainframe.app/api/admin/scoring-trust?window=7d", {
        headers: { Authorization: "Bearer token" },
      }),
      {
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
        POSTHOG_PERSONAL_API_KEY: "phx_test",
      },
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.readOnly, true);
    assert.equal(body.windowDays, 7);
    assert.equal(body.operational.liveModel, "gemini-3.7-flash");
    assert.equal(body.routes[0].flow, "classify_score");
    assert.equal(body.routes[0].semanticChecked, 110);
    assert.equal(body.stability[0].scoreP90, 5);
    assert.equal(body.feedback.matches, 8);
    assert.equal(body.feedback.inconsistent, 2);
    assert.equal(body.feedback.other, 1);

    const serialized = JSON.stringify(body);
    assert.doesNotMatch(serialized, /private free-form answer/);
    assert.doesNotMatch(serialized, /distinct_id|person_id|survey_response/);
  } finally {
    globalThis.fetch = realFetch;
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
