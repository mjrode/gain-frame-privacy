import assert from "node:assert/strict";
import test from "node:test";

const { handleLeaderboard, normalizeEntries } = await import("./leaderboard.ts");

test("normalizeEntries keeps only the public leaderboard contract", () => {
  const entries = normalizeEntries([
    {
      user_id: "must-not-leak",
      username: "ironatlas",
      score: 96,
      goal: "Gain Muscle",
      score_date: "2026-08-09T12:00:00.000Z",
      email: "must-not-leak@example.com",
      avatar_path: "private/avatar.jpg",
    },
    { username: "bad name", score: 50, goal: "Gain Muscle", score_date: "2026-08-09" },
    { username: "valid_name", score: 101, goal: "Gain Muscle", score_date: "2026-08-09" },
  ]);

  assert.deepEqual(entries, [{
    username: "ironatlas",
    score: 96,
    goal: "Gain Muscle",
    score_date: "2026-08-09T12:00:00.000Z",
  }]);
});

test("handleLeaderboard queries only the safe Supabase projection", async () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = globalThis.caches;
  const cachePuts = [];
  globalThis.caches = {
    default: {
      match: async () => undefined,
      put: async (key, response) => cachePuts.push([key, response]),
    },
  };

  let upstreamUrl;
  globalThis.fetch = async (input) => {
    upstreamUrl = new URL(String(input));
    return Response.json([{
      user_id: "must-not-leak",
      username: "nova_lifts",
      score: 93,
      goal: "Body Recomp",
      score_date: "2026-08-08T12:00:00.000Z",
      joined_at: "must-not-leak",
    }]);
  };

  try {
    const pending = [];
    const response = await handleLeaderboard(
      new Request("https://gainframe.app/api/leaderboard"),
      { SUPABASE_URL: "https://example.supabase.co", SUPABASE_SECRET_KEY: "secret" },
      { waitUntil: (promise) => pending.push(promise) },
    );
    await Promise.all(pending);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      entries: [{
        username: "nova_lifts",
        score: 93,
        goal: "Body Recomp",
        score_date: "2026-08-08T12:00:00.000Z",
      }],
    });
    assert.equal(upstreamUrl.pathname, "/rest/v1/leaderboard_profiles");
    assert.equal(upstreamUrl.searchParams.get("select"), "username,score,goal,score_date");
    assert.equal(upstreamUrl.searchParams.get("order"), "score.desc,score_date.asc,username.asc");
    assert.equal(upstreamUrl.searchParams.get("limit"), "500");
    assert.equal(cachePuts.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.caches = originalCaches;
  }
});

test("handleLeaderboard fails closed without its service credentials", async () => {
  const response = await handleLeaderboard(
    new Request("https://gainframe.app/api/leaderboard"),
    {},
    { waitUntil() {} },
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Leaderboard is not configured yet." });
});
