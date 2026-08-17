import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeFlow, verifyAdmin } from "./admin.ts";

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
