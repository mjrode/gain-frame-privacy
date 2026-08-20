import assert from "node:assert/strict";
import test from "node:test";

const {
  handleLeaderboard,
  handleLeaderboardProfile,
  handleLeaderboardProfileMedia,
  handleLeaderboardReport,
  normalizeConsistencyEntries,
  normalizeEntries,
  normalizeProfile,
} = await import("./leaderboard.ts");
const { profileShellRequest } = await import("../routes.ts");

const PROFILE_ID = "d9428888-122b-4b20-a8b6-cc177b327b22";
const ENTRY_ID = "7c2e5ba3-8d70-44f6-a588-46771b17ef30";
const MEDIA_ID = "9f714e1c-4e8d-4d91-8303-f3db457bb492";

test("normalizeEntries keeps only the public standings contract", () => {
  const entries = normalizeEntries([
    {
      user_id: "must-not-leak",
      profile_id: PROFILE_ID,
      entry_id: ENTRY_ID,
      rank: 1,
      username: "ironatlas",
      score: 96,
      goal: "Gain Muscle",
      score_date: "2026-08-09T12:00:00.000Z",
      email: "must-not-leak@example.com",
      avatar_path: "private/avatar.jpg",
      avatar_url: "https://example.supabase.co/storage/" + PROFILE_ID + "/avatar.jpg?token=short-lived",
      has_proof_media: true,
      profile_available: true,
      training_since_year: 2020,
      favorite_lift: "Back squat",
      region: "Northeast",
      training_style: "Powerbuilding",
      weekly_sessions: 4,
      current_phase: "Lean gain",
      cheer_count: 12,
      recent_check_in_count: 7,
      streak_weeks: 5,
      previous_score_date: "2026-08-02T20:14:00Z",
    },
    {
      profile_id: PROFILE_ID,
      entry_id: ENTRY_ID,
      rank: 2,
      username: "bad name",
      score: 50,
      goal: "Gain Muscle",
      score_date: "2026-08-09",
      has_proof_media: false,
      profile_available: false,
    },
    {
      profile_id: "f9b035e5-45e2-46a5-92d7-6df401da73df",
      entry_id: "03efe1b9-b789-4dd5-bec6-5a80876f3e42",
      rank: 2,
      username: "score_only",
      score: 72,
      goal: "Lose Weight",
      score_date: "2026-08-07",
      avatar_url: "https://example.supabase.co/storage/auth-user-id/avatar.jpg",
      has_proof_media: true,
      profile_available: false,
      training_style: "must-not-expand-legacy-consent",
      cheer_count: 999,
      streak_weeks: 99,
    },
  ], "example.supabase.co");

  assert.deepEqual(entries, [{
    profile_id: PROFILE_ID,
    entry_id: ENTRY_ID,
    rank: 1,
    username: "ironatlas",
    score: 96,
    goal: "Gain Muscle",
    score_date: "2026-08-09",
    avatar_url: "https://example.supabase.co/storage/" + PROFILE_ID + "/avatar.jpg?token=short-lived",
    has_proof_media: true,
    profile_available: true,
    training_since_year: 2020,
    favorite_lift: "Back squat",
    region: "Northeast",
    training_style: "Powerbuilding",
    weekly_sessions: 4,
    current_phase: "Lean gain",
    cheer_count: 12,
    recent_check_in_count: 7,
    streak_weeks: 5,
    previous_score_date: "2026-08-02",
  }, {
    profile_id: "f9b035e5-45e2-46a5-92d7-6df401da73df",
    entry_id: "03efe1b9-b789-4dd5-bec6-5a80876f3e42",
    rank: 2,
    username: "score_only",
    score: 72,
    goal: "Lose Weight",
    score_date: "2026-08-07",
    has_proof_media: false,
    profile_available: false,
  }]);
  assert.equal("user_id" in entries[0], false);
  assert.equal("avatar_path" in entries[0], false);
});

test("normalizeConsistencyEntries keeps the display-only weekly contract", () => {
  const entries = normalizeConsistencyEntries([{
    user_id: "must-not-leak",
    profile_id: PROFILE_ID,
    entry_id: ENTRY_ID,
    rank: 2,
    username: "steady_set",
    consistency_points: 34,
    weekly_check_in_count: 3,
    streak_weeks: 4,
    goal: "Body Recomp",
    score_date: "2026-08-20T13:00:00Z",
    profile_available: true,
  }]);
  assert.deepEqual(entries, [{
    profile_id: PROFILE_ID,
    entry_id: ENTRY_ID,
    rank: 2,
    username: "steady_set",
    consistency_points: 34,
    weekly_check_in_count: 3,
    streak_weeks: 4,
    goal: "Body Recomp",
    score_date: "2026-08-20",
    profile_available: true,
  }]);
  assert.equal("user_id" in entries[0], false);
});

test("normalizeProfile drops hidden fields and unsafe asset hosts", () => {
  const profile = normalizeProfile({
    profile: {
      profile_id: PROFILE_ID,
      user_id: "must-not-leak",
      username: "nova_lifts",
      avatar_url: "https://evil.example/avatar.webp",
      bio: "  Four days a week.  ",
      favorite_lift: "Deadlift",
      training_since_year: 2021,
      region: "Austin, TX",
      training_style: "Hybrid",
      weekly_sessions: 4,
      current_phase: "Maintenance",
      visibility: "unlisted",
      moderation_notes: "must-not-leak",
    },
    entries: [{
      entry_id: ENTRY_ID,
      score: 82,
      goal: "Body Recomp",
      score_date: "2026-08-10T23:19:00Z",
      score_contract_version: "v2",
      verification_state: "server_attested",
      private_photo_path: "must-not-leak",
      media: [{
        media_id: MEDIA_ID,
        entry_id: ENTRY_ID,
        state: "approved",
        url: "https://example.supabase.co/storage/" + PROFILE_ID + "/proof.webp?token=short-lived",
        width: 960,
        height: 1200,
        face_blurred: true,
        background_redacted: false,
        storage_path: "must-not-leak",
      }],
    }],
    summary: {
      best_score: 90,
      first_score: 70,
      latest_score: 82,
      entry_count: 4,
      first_score_date: "2025-01-03T18:12:00Z",
      latest_score_date: "2026-08-10T23:19:00Z",
      private_delta: "must-not-leak",
    },
    total_entries: 4,
    next_cursor: "djE6NTA",
  }, "example.supabase.co");

  assert.deepEqual(profile, {
    profile: {
      profile_id: PROFILE_ID,
      username: "nova_lifts",
      bio: "Four days a week.",
      training_since_year: 2021,
      favorite_lift: "Deadlift",
      region: "Austin, TX",
      training_style: "Hybrid",
      weekly_sessions: 4,
      current_phase: "Maintenance",
      visibility: "unlisted",
    },
    summary: {
      best_score: 90,
      first_score: 70,
      latest_score: 82,
      entry_count: 4,
      first_score_date: "2025-01-03",
      latest_score_date: "2026-08-10",
    },
    entries: [{
      entry_id: ENTRY_ID,
      score: 82,
      goal: "Body Recomp",
      score_date: "2026-08-10",
      score_contract_version: "v2",
      verification_state: "server_attested",
      media: [{
        media_id: MEDIA_ID,
        entry_id: ENTRY_ID,
        state: "approved",
        width: 960,
        height: 1200,
        face_blurred: true,
        background_redacted: false,
      }],
    }],
    total_entries: 4,
    next_cursor: "djE6NTA",
  });
  assert.equal("user_id" in profile.profile, false);
  assert.equal("moderation_notes" in profile.profile, false);
});

test("normalizeProfile fails closed for private profiles", () => {
  assert.equal(normalizeProfile({
    profile: {
      profile_id: PROFILE_ID,
      username: "private_lifter",
      visibility: "private",
    },
    entries: [],
  }), null);
});

test("normalizeProfile requires a consistent full-history summary", () => {
  assert.equal(normalizeProfile({
    profile: {
      profile_id: PROFILE_ID,
      username: "ironatlas",
      visibility: "listed",
    },
    entries: [],
    total_entries: 2,
    summary: {
      best_score: 80,
      first_score: 78,
      latest_score: 84,
      entry_count: 2,
      first_score_date: "2026-08-09",
      latest_score_date: "2026-08-10",
    },
  }), null);
});

test("normalizeProfile accepts safe lifetime history counts above 10,000", () => {
  const profile = normalizeProfile({
    profile: {
      profile_id: PROFILE_ID,
      username: "steady_lifter",
      visibility: "listed",
    },
    entries: [],
    summary: {
      best_score: 91,
      first_score: 60,
      latest_score: 88,
      entry_count: 10_001,
      first_score_date: "2020-01-01",
      latest_score_date: "2026-08-11",
    },
    total_entries: 10_001,
    next_cursor: "djE6NTA",
  }, "example.supabase.co");

  assert.equal(profile?.summary.entry_count, 10_001);
  assert.equal(profile?.total_entries, 10_001);
});

test("handleLeaderboard forwards validated filters and returns a safe projection", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamUrl;
  globalThis.fetch = async (input) => {
    upstreamUrl = new URL(String(input));
    return Response.json({
      entries: [{
        user_id: "must-not-leak",
        profile_id: PROFILE_ID,
        entry_id: ENTRY_ID,
        rank: 1,
        username: "nova_lifts",
        score: 93,
        goal: "Body Recomp",
        score_date: "2026-08-08T12:00:00.000Z",
        joined_at: "must-not-leak",
        has_proof_media: false,
        profile_available: true,
      }],
      next_cursor: "next.page_2",
      total: 312,
    });
  };

  try {
    const response = await handleLeaderboard(
      new Request("https://gainframe.app/api/leaderboard?goal=Body%20Recomp&period=month&limit=25"),
      { SUPABASE_URL: "https://example.supabase.co" },
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
    assert.deepEqual(await response.json(), {
      entries: [{
        profile_id: PROFILE_ID,
        entry_id: ENTRY_ID,
        rank: 1,
        username: "nova_lifts",
        score: 93,
        goal: "Body Recomp",
        score_date: "2026-08-08",
        has_proof_media: false,
        profile_available: true,
      }],
      total: 312,
      next_cursor: "next.page_2",
    });
    assert.equal(upstreamUrl.pathname, "/functions/v1/leaderboard-standings");
    assert.equal(upstreamUrl.searchParams.get("goal"), "Body Recomp");
    assert.equal(upstreamUrl.searchParams.get("period"), "month");
    assert.equal(upstreamUrl.searchParams.get("limit"), "25");
    assert.equal(upstreamUrl.searchParams.get("board"), "score");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("handleLeaderboard serves consistency as a read-only weekly board", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamUrl;
  globalThis.fetch = async (input) => {
    upstreamUrl = new URL(String(input));
    return Response.json({
      entries: [{
        profile_id: PROFILE_ID,
        entry_id: ENTRY_ID,
        rank: 1,
        username: "steady_set",
        consistency_points: 43,
        weekly_check_in_count: 4,
        streak_weeks: 3,
        goal: "Body Recomp",
        score_date: "2026-08-20",
        profile_available: true,
      }],
      total: 1,
    });
  };
  try {
    const response = await handleLeaderboard(
      new Request("https://gainframe.app/api/leaderboard?board=consistency&period=all_time"),
      { SUPABASE_URL: "https://example.supabase.co" },
    );
    assert.equal(response.status, 200);
    assert.equal(upstreamUrl.searchParams.get("board"), "consistency");
    assert.equal(upstreamUrl.searchParams.get("period"), "week");
    assert.equal((await response.json()).entries[0].consistency_points, 43);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("handleLeaderboard rejects invalid filters without calling upstream", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return Response.json({ entries: [] });
  };
  try {
    const response = await handleLeaderboard(
      new Request("https://gainframe.app/api/leaderboard?period=forever"),
      { SUPABASE_URL: "https://example.supabase.co" },
    );
    assert.equal(response.status, 400);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("handleLeaderboardProfile requests only the opaque profile ID", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamUrl;
  globalThis.fetch = async (input) => {
    upstreamUrl = new URL(String(input));
    return Response.json({
      profile: {
        profile_id: PROFILE_ID,
        username: "ironatlas",
        visibility: "listed",
      },
      summary: {
        best_score: null,
        first_score: null,
        latest_score: null,
        entry_count: 0,
        first_score_date: null,
        latest_score_date: null,
      },
      entries: [],
      total_entries: 0,
    });
  };
  try {
    const response = await handleLeaderboardProfile(
      new Request(`https://gainframe.app/api/leaderboard/profile?id=${PROFILE_ID}`),
      { SUPABASE_URL: "https://example.supabase.co" },
    );
    assert.equal(response.status, 200);
    assert.equal(upstreamUrl.pathname, "/functions/v1/leaderboard-profile");
    assert.deepEqual([...upstreamUrl.searchParams], [
      ["profile_id", PROFILE_ID],
      ["limit", "50"],
      ["engagement", "true"],
    ]);
    assert.deepEqual(await response.json(), {
      profile: {
        profile_id: PROFILE_ID,
        username: "ironatlas",
        visibility: "listed",
      },
      summary: {
        best_score: null,
        first_score: null,
        latest_score: null,
        entry_count: 0,
        first_score_date: null,
        latest_score_date: null,
      },
      entries: [],
      total_entries: 0,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("handleLeaderboardProfile forwards validated profile pagination", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamUrl;
  globalThis.fetch = async (input) => {
    upstreamUrl = new URL(String(input));
    return Response.json({
      profile: {
        profile_id: PROFILE_ID,
        username: "ironatlas",
        visibility: "listed",
      },
      summary: {
        best_score: 97,
        first_score: 61,
        latest_score: 84,
        entry_count: 75,
        first_score_date: "2024-03-12",
        latest_score_date: "2026-08-10",
      },
      entries: [],
      total_entries: 75,
      next_cursor: "djE6NzU",
    });
  };
  try {
    const response = await handleLeaderboardProfile(
      new Request(
        `https://gainframe.app/api/leaderboard/profile?id=${PROFILE_ID}&cursor=djE6NTA&limit=25`,
      ),
      { SUPABASE_URL: "https://example.supabase.co" },
    );
    assert.equal(response.status, 200);
    assert.deepEqual([...upstreamUrl.searchParams], [
      ["profile_id", PROFILE_ID],
      ["limit", "25"],
      ["engagement", "true"],
      ["cursor", "djE6NTA"],
    ]);
    assert.equal((await response.json()).next_cursor, "djE6NzU");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("handleLeaderboardProfile rejects invalid profile pagination before upstream", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return Response.json({});
  };
  try {
    const response = await handleLeaderboardProfile(
      new Request(
        `https://gainframe.app/api/leaderboard/profile?id=${PROFILE_ID}&cursor=not%20safe&limit=101`,
      ),
      { SUPABASE_URL: "https://example.supabase.co" },
    );
    assert.equal(response.status, 400);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("handleLeaderboardProfileMedia refreshes one exact media URL", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamUrl;
  globalThis.fetch = async (input) => {
    upstreamUrl = new URL(String(input));
    return Response.json({
      profile_id: PROFILE_ID,
      media: {
        media_id: MEDIA_ID,
        entry_id: ENTRY_ID,
        state: "approved",
        width: 960,
        height: 1200,
        face_blurred: true,
        background_redacted: false,
        url: "https://example.supabase.co/storage/" + PROFILE_ID + "/" + MEDIA_ID + ".webp?token=fresh",
        storage_path: "must-not-leak",
        moderation_notes: "must-not-leak",
      },
      signed_url_expires_in: 300,
    });
  };
  try {
    const response = await handleLeaderboardProfileMedia(
      new Request(
        `https://gainframe.app/api/leaderboard/profile/media?id=${PROFILE_ID}&media_id=${MEDIA_ID}`,
      ),
      { SUPABASE_URL: "https://example.supabase.co" },
    );
    assert.equal(response.status, 200);
    assert.deepEqual([...upstreamUrl.searchParams], [
      ["profile_id", PROFILE_ID],
      ["media_id", MEDIA_ID],
    ]);
    assert.deepEqual(await response.json(), {
      profile_id: PROFILE_ID,
      media: {
        media_id: MEDIA_ID,
        entry_id: ENTRY_ID,
        state: "approved",
        url: "https://example.supabase.co/storage/" + PROFILE_ID + "/" + MEDIA_ID + ".webp?token=fresh",
        width: 960,
        height: 1200,
        face_blurred: true,
        background_redacted: false,
      },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("web reports fail safely to the support path when no server secret exists", async () => {
  const response = await handleLeaderboardReport(
    new Request("https://gainframe.app/api/leaderboard/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://gainframe.app",
        "CF-Connecting-IP": "192.0.2.25",
      },
      body: JSON.stringify({
        profile_id: PROFILE_ID,
        target_type: "profile",
        target_id: null,
        reason: "privacy",
      }),
    }),
    { SUPABASE_URL: "https://example.supabase.co" },
  );
  assert.equal(response.status, 503);
  assert.match((await response.json()).support_url, /^mailto:/);
});

test("web reports forward only the leaderboard-manage report contract", async () => {
  const originalFetch = globalThis.fetch;
  let upstreamBody;
  let upstreamAuthorization;
  let upstreamReportToken;
  let upstreamReportIp;
  globalThis.fetch = async (_input, init) => {
    upstreamBody = JSON.parse(String(init.body));
    const headers = new Headers(init.headers);
    upstreamAuthorization = headers.get("Authorization");
    upstreamReportToken = headers.get("X-Leaderboard-Report-Token");
    upstreamReportIp = headers.get("X-Leaderboard-Report-IP");
    assert.equal(headers.get("X-Leaderboard-Report-UA"), null);
    return Response.json({ accepted: true });
  };
  try {
    const response = await handleLeaderboardReport(
      new Request("https://gainframe.app/api/leaderboard/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://gainframe.app",
          "CF-Connecting-IP": "192.0.2.26",
          "User-Agent": "GainFrame web report test",
        },
        body: JSON.stringify({
          profile_id: PROFILE_ID,
          target_type: "media",
          target_id: MEDIA_ID,
          reason: "inappropriate_media",
          detail: "This appears to include another person.",
        }),
      }),
      {
        SUPABASE_URL: "https://example.supabase.co",
        LEADERBOARD_REPORT_TOKEN: "server-only-token",
      },
    );
    assert.equal(response.status, 202);
    assert.equal(upstreamAuthorization, null);
    assert.equal(upstreamReportToken, "server-only-token");
    assert.equal(upstreamReportIp, "192.0.2.26");
    assert.deepEqual(upstreamBody, {
      action: "report",
      target_type: "media",
      profile_id: PROFILE_ID,
      target_id: MEDIA_ID,
      reason: "inappropriate_media",
      detail: "This appears to include another person.",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("web report burst quota does not split on user-agent text", async () => {
  const statuses = [];
  for (let index = 0; index < 4; index += 1) {
    const response = await handleLeaderboardReport(
      new Request("https://gainframe.app/api/leaderboard/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://gainframe.app",
          "CF-Connecting-IP": "192.0.2.88",
          "User-Agent": "Rotating browser " + index,
        },
        body: JSON.stringify({
          profile_id: PROFILE_ID,
          target_type: "profile",
          target_id: null,
          reason: "privacy",
        }),
      }),
      { SUPABASE_URL: "https://example.supabase.co" },
    );
    statuses.push(response.status);
  }
  assert.deepEqual(statuses, [503, 503, 503, 429]);
});

test("canonical profile route rewrites to the static member shell", () => {
  const rewritten = profileShellRequest(new Request(
    `https://gainframe.app/leaderboard/u/${PROFILE_ID}/`,
  ));
  assert.ok(rewritten);
  const url = new URL(rewritten.url);
  assert.equal(url.pathname, "/leaderboard/member/");
  assert.equal(url.searchParams.get("id"), PROFILE_ID);
  assert.equal(profileShellRequest(new Request("https://gainframe.app/leaderboard/u/not-an-id/")), null);
});

test("handleLeaderboard fails closed without its source configuration", async () => {
  const response = await handleLeaderboard(
    new Request("https://gainframe.app/api/leaderboard"),
    {},
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Leaderboard is not configured yet." });
});
