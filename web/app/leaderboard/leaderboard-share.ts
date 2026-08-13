export type LeaderboardGoal = "Lose Weight" | "Gain Muscle" | "Body Recomp";
export type LeaderboardGoalFilter = "all" | LeaderboardGoal;
export type LeaderboardPeriod = "all_time" | "year" | "month" | "week";
export type LeaderboardShareTemplate =
  | "standings"
  | "rank_flex"
  | "chasing_five";
export type LeaderboardSharePlacement = "leaderboard" | "member_profile";
export type LeaderboardRankBucket =
  | "top_1"
  | "top_5"
  | "top_10"
  | "top_25"
  | "rank_26_plus";

export interface LeaderboardShareEntry {
  profile_id: string;
  entry_id: string;
  rank: number;
  username: string;
  score: number;
  goal: LeaderboardGoal;
  score_date: string;
  avatar_url?: string;
  has_proof_media: boolean;
  profile_available: boolean;
}

export interface LeaderboardShareContext {
  selected: LeaderboardShareEntry;
  topFive: LeaderboardShareEntry[];
  goal: LeaderboardGoalFilter;
  period: LeaderboardPeriod;
}

export interface LeaderboardShareEventProperties {
  platform: "web";
  template: LeaderboardShareTemplate;
  placement: LeaderboardSharePlacement;
  rank_bucket: LeaderboardRankBucket;
  goal: LeaderboardGoalFilter;
  period: LeaderboardPeriod;
}

export function rankBucket(rank: number): LeaderboardRankBucket {
  if (rank === 1) return "top_1";
  if (rank <= 5) return "top_5";
  if (rank <= 10) return "top_10";
  if (rank <= 25) return "top_25";
  return "rank_26_plus";
}

export function buildShareContext(
  entries: LeaderboardShareEntry[],
  selected: LeaderboardShareEntry,
  goal: LeaderboardGoalFilter,
  period: LeaderboardPeriod,
): LeaderboardShareContext {
  const unique = new Map<string, LeaderboardShareEntry>();
  for (const entry of entries) unique.set(entry.entry_id, entry);
  unique.set(selected.entry_id, selected);

  const topFive = [...unique.values()]
    .sort((left, right) => left.rank - right.rank || right.score - left.score)
    .slice(0, 5);

  return { selected, topFive, goal, period };
}

export function selectedIsInTopFive(context: LeaderboardShareContext): boolean {
  return context.topFive.some(
    (entry) => entry.entry_id === context.selected.entry_id,
  );
}

export function gapToFifth(context: LeaderboardShareContext): number | null {
  if (selectedIsInTopFive(context)) return 0;
  const fifth = context.topFive[4];
  if (!fifth) return null;
  return Math.max(0, fifth.score - context.selected.score);
}

export function shareFilename(
  template: LeaderboardShareTemplate,
  rank: number,
): string {
  return `gainframe-${template.replace(/_/g, "-")}-rank-${rank}.png`;
}

export function shareEventProperties(input: {
  context: LeaderboardShareContext;
  template: LeaderboardShareTemplate;
  placement: LeaderboardSharePlacement;
}): LeaderboardShareEventProperties {
  return {
    platform: "web",
    template: input.template,
    placement: input.placement,
    rank_bucket: rankBucket(input.context.selected.rank),
    goal: input.context.goal,
    period: input.context.period,
  };
}
