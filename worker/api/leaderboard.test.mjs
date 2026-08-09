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
    score_date: "2026-08-09",
  }]);
});

test("handleLeaderboard queries only the safe Supabase projection", async () => {
  const originalFetch = globalThis.fetch;

  let upstreamUrl;
  globalThis.fetch = async (input) => {
    upstreamUrl = new URL(String(input));
    return Response.json({
      entries: [{
        user_id: "must-not-leak",
        username: "nova_lifts",
        score: 93,
        goal: "Body Recomp",
        score_date: "2026-08-08T12:00:00.000Z",
        joined_at: "must-not-leak",
      }],
    });
  };

  try {
    const response = await handleLeaderboard(
      new Request("https://gainframe.app/api/leaderboard"),
      { SUPABASE_URL: "https://example.supabase.co" },
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), {
      entries: [{
        username: "nova_lifts",
        score: 93,
        goal: "Body Recomp",
        score_date: "2026-08-08",
      }],
    });
    assert.equal(upstreamUrl.pathname, "/functions/v1/leaderboard-standings");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("handleLeaderboard fails closed without its source configuration", async () => {
  const response = await handleLeaderboard(
    new Request("https://gainframe.app/api/leaderboard"),
    {},
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Leaderboard is not configured yet." });
});
