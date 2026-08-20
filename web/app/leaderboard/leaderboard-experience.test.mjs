import assert from "node:assert/strict";
import test from "node:test";

import {
  communityPulse,
  profileAchievements,
  rankDeltas,
  standingAchievements,
} from "./leaderboard-experience.ts";

function entry(overrides = {}) {
  return {
    profile_id: crypto.randomUUID(),
    entry_id: crypto.randomUUID(),
    rank: 1,
    username: "atlas",
    score: 90,
    goal: "Body Recomp",
    score_date: "2026-08-20",
    has_proof_media: false,
    profile_available: true,
    ...overrides,
  };
}

test("rank movement and community pulse use the same visit snapshot", () => {
  const first = entry({ rank: 1, profile_id: "10000000-0000-4000-8000-000000000001" });
  const second = entry({
    rank: 2,
    username: "nova",
    profile_id: "10000000-0000-4000-8000-000000000002",
    cheer_count: 5,
    streak_weeks: 4,
  });
  const deltas = rankDeltas([first, second], { [second.profile_id]: 5 });
  const pulse = communityPulse([first, second], deltas, 12, new Date("2026-08-20T12:00:00Z"));

  assert.equal(deltas[second.profile_id], 3);
  assert.equal(pulse.totalMembers, 12);
  assert.equal(pulse.weeklyCheckIns, 2);
  assert.equal(pulse.movingMembers, 1);
  assert.equal(pulse.biggestMoverUsername, "nova");
  assert.equal(pulse.totalCheers, 5);
  assert.equal(pulse.headline, "@nova climbed 3 places this week.");
});

test("community pulse uses add language when no rank changed", () => {
  const pulse = communityPulse(
    [entry({ score_date: "2026-08-20" })],
    {},
    1,
    new Date("2026-08-20T12:00:00Z"),
  );

  assert.equal(pulse.headline, "1 check-in was added this week.");
});

test("community pulse gives a forward-looking quiet-week message", () => {
  const pulse = communityPulse([], {}, 10, new Date("2026-08-20T12:00:00Z"));

  assert.equal(pulse.headline, "The first check-in will set the pace this week.");
});

test("leaderboard achievements are public-data only", () => {
  const achievements = standingAchievements(entry({
    rank: 1,
    streak_weeks: 8,
    recent_check_in_count: 10,
    cheer_count: 6,
  }));
  assert.deepEqual(
    achievements.map((item) => item.id),
    ["board-leader", "eight-week", "ten-frames", "crowd-favorite"],
  );
});

test("profile story achievements derive from public history", () => {
  const achievements = profileAchievements(
    { best_score: 85, first_score: 75, latest_score: 85, entry_count: 10 },
    [
      { entry_id: "1", score: 75, score_date: "2026-08-13" },
      { entry_id: "2", score: 85, score_date: "2026-08-20" },
    ],
    8,
  );
  assert.deepEqual(
    achievements.map((item) => item.id),
    ["top-ten", "ten-frames", "five-point", "fresh-pb"],
  );
});
