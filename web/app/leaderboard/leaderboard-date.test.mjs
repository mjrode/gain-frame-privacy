import assert from "node:assert/strict";
import test from "node:test";

const { publicLeaderboardDate } = await import("./leaderboard-date.ts");
const { appendUniqueStandings } = await import("./leaderboard-pagination.ts");
const { appendUniqueEntries } = await import("./member/profile-pagination.ts");
const {
  nextMediaRetryAttempt,
  profileMediaRefreshSearch,
  profilePageSearch,
} = await import("./member/profile-media.ts");

test("publicLeaderboardDate keeps a valid public score date visible", () => {
  const date = publicLeaderboardDate("2026-08-02");

  assert.ok(date);
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 7);
  assert.equal(date.getDate(), 2);
});

test("publicLeaderboardDate rejects malformed calendar dates", () => {
  assert.equal(publicLeaderboardDate("2026-02-29"), null);
  assert.equal(publicLeaderboardDate("2026-08-02T12:00:00Z"), null);
});

test("profile pagination appends older entries without duplicating overlap", () => {
  assert.deepEqual(
    appendUniqueEntries(
      [{ entry_id: "new", score: 82 }, { entry_id: "overlap", score: 77 }],
      [{ entry_id: "overlap", score: 77 }, { entry_id: "old", score: 71 }],
    ),
    [
      { entry_id: "new", score: 82 },
      { entry_id: "overlap", score: 77 },
      { entry_id: "old", score: 71 },
    ],
  );
});

test("standings pagination deduplicates entry and profile identities", () => {
  assert.deepEqual(
    appendUniqueStandings(
      [{ entry_id: "entry-1", profile_id: "profile-1", rank: 1 }],
      [
        { entry_id: "entry-1", profile_id: "profile-1", rank: 1 },
        { entry_id: "entry-2", profile_id: "profile-1", rank: 2 },
        { entry_id: "entry-3", profile_id: "profile-3", rank: 3 },
        { entry_id: "entry-3", profile_id: "profile-4", rank: 4 },
      ],
    ),
    [
      { entry_id: "entry-1", profile_id: "profile-1", rank: 1 },
      { entry_id: "entry-3", profile_id: "profile-3", rank: 3 },
    ],
  );
});

test("scan image helpers build exact refresh queries and allow one retry", () => {
  const query = new URLSearchParams(profilePageSearch("opaque-profile", "page-2"));
  assert.deepEqual([...query], [
    ["id", "opaque-profile"],
    ["limit", "50"],
    ["cursor", "page-2"],
  ]);
  const mediaQuery = new URLSearchParams(
    profileMediaRefreshSearch("opaque-profile", "opaque-media"),
  );
  assert.deepEqual([...mediaQuery], [
    ["id", "opaque-profile"],
    ["media_id", "opaque-media"],
  ]);
  assert.equal(nextMediaRetryAttempt(0), 1);
  assert.equal(nextMediaRetryAttempt(1), null);
});
