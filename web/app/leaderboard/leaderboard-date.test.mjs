import assert from "node:assert/strict";
import test from "node:test";

const { publicLeaderboardDate } = await import("./leaderboard-date.ts");

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
