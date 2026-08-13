import assert from "node:assert/strict";
import test from "node:test";

const {
  buildShareContext,
  gapToFifth,
  rankBucket,
  selectedIsInTopFive,
  shareEventProperties,
} = await import("./leaderboard-share.ts");

function entry(rank, score, username = `lifter_${rank}`) {
  return {
    profile_id: `profile-${rank}`,
    entry_id: `entry-${rank}`,
    rank,
    username,
    score,
    goal: "Gain Muscle",
    score_date: "2026-08-13",
    has_proof_media: false,
    profile_available: true,
  };
}

test("share context keeps a top-five member highlighted without duplication", () => {
  const entries = [entry(1, 98), entry(2, 95), entry(3, 92), entry(4, 90), entry(5, 88)];
  const context = buildShareContext(entries, entries[2], "all", "all_time");

  assert.equal(selectedIsInTopFive(context), true);
  assert.equal(context.topFive.filter((row) => row.entry_id === "entry-3").length, 1);
  assert.equal(gapToFifth(context), 0);
});

test("share context keeps the top five and a separate outside member", () => {
  const entries = [entry(1, 98), entry(2, 95), entry(3, 92), entry(4, 90), entry(5, 88)];
  const selected = entry(14, 81, "current_user");
  const context = buildShareContext(entries, selected, "Gain Muscle", "month");

  assert.equal(selectedIsInTopFive(context), false);
  assert.deepEqual(context.topFive.map((row) => row.rank), [1, 2, 3, 4, 5]);
  assert.equal(gapToFifth(context), 7);
});

test("share analytics payload is bucketed and contains no public or private identity", () => {
  const selected = entry(132, 72, "do_not_send");
  const context = buildShareContext([entry(1, 98)], selected, "all", "week");
  const payload = shareEventProperties({
    context,
    template: "rank_flex",
    placement: "member_profile",
  });

  assert.deepEqual(payload, {
    platform: "web",
    template: "rank_flex",
    placement: "member_profile",
    rank_bucket: "rank_26_plus",
    goal: "all",
    period: "week",
  });
  assert.equal(JSON.stringify(payload).includes("do_not_send"), false);
  assert.equal("profile_id" in payload, false);
});

test("rank buckets keep Slack and analytics cardinality bounded", () => {
  assert.equal(rankBucket(1), "top_1");
  assert.equal(rankBucket(5), "top_5");
  assert.equal(rankBucket(6), "top_10");
  assert.equal(rankBucket(25), "top_25");
  assert.equal(rankBucket(26), "rank_26_plus");
});
