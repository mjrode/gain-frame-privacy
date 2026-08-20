import type {
  LeaderboardGoalFilter,
  LeaderboardPeriod,
  LeaderboardShareEntry,
} from "./leaderboard-share";

export interface LeaderboardCommunityPulse {
  totalMembers: number;
  weeklyCheckIns: number;
  movingMembers: number;
  activeStreaks: number;
  totalCheers: number;
  biggestMoverUsername?: string;
  biggestClimb: number;
  headline: string;
}

export interface LeaderboardAchievement {
  id: string;
  title: string;
  detail: string;
  symbol: string;
}

export interface ProfileStorySummary {
  best_score: number | null;
  first_score: number | null;
  latest_score: number | null;
  entry_count: number;
}

export interface ProfileStoryEntry {
  entry_id: string;
  score: number;
  score_date: string;
}

export function rankMemoryKey(
  goal: LeaderboardGoalFilter,
  period: LeaderboardPeriod,
): string {
  return `gainframe.leaderboard.ranks.v1.${goal}.${period}`;
}

export function rankSnapshot(
  entries: LeaderboardShareEntry[],
): Record<string, number> {
  return Object.fromEntries(entries.map((entry) => [entry.profile_id, entry.rank]));
}

export function rankDeltas(
  entries: LeaderboardShareEntry[],
  previous: Record<string, number>,
): Record<string, number> {
  const deltas: Record<string, number> = {};
  for (const entry of entries) {
    const oldRank = previous[entry.profile_id];
    if (Number.isSafeInteger(oldRank)) deltas[entry.profile_id] = oldRank - entry.rank;
  }
  return deltas;
}

export function communityPulse(
  entries: LeaderboardShareEntry[],
  deltas: Record<string, number>,
  totalMembers: number,
  now = new Date(),
): LeaderboardCommunityPulse {
  const weekStart = startOfIsoWeek(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);
  const weeklyCheckIns = entries.filter((entry) => {
    const date = publicDate(entry.score_date);
    return date && date >= weekStart && date < weekEnd;
  }).length;
  const movingMembers = entries.filter(
    (entry) => (deltas[entry.profile_id] || 0) !== 0,
  ).length;
  const biggest = entries.reduce<{ entry: LeaderboardShareEntry; delta: number } | undefined>(
    (winner, entry) => {
      const delta = deltas[entry.profile_id] || 0;
      return delta > 0 && (!winner || delta > winner.delta) ? { entry, delta } : winner;
    },
    undefined,
  );
  const activeStreaks = entries.filter((entry) => (entry.streak_weeks || 0) >= 2).length;
  const totalCheers = entries.reduce((sum, entry) => sum + (entry.cheer_count || 0), 0);
  let headline = "The first check-in will set the pace this week.";
  if (biggest) {
    headline = `@${biggest.entry.username} climbed ${biggest.delta} ${biggest.delta === 1 ? "place" : "places"} this week.`;
  } else if (activeStreaks > 0) {
    headline = `${activeStreaks} ${activeStreaks === 1 ? "member has" : "members have"} an active check-in streak.`;
  } else if (weeklyCheckIns > 0) {
    headline = `${weeklyCheckIns} ${weeklyCheckIns === 1 ? "check-in was" : "check-ins were"} added this week.`;
  }
  return {
    totalMembers: Math.max(totalMembers, entries.length),
    weeklyCheckIns,
    movingMembers,
    activeStreaks,
    totalCheers,
    biggestMoverUsername: biggest?.entry.username,
    biggestClimb: biggest?.delta || 0,
    headline,
  };
}

export function standingAchievements(
  entry: LeaderboardShareEntry,
): LeaderboardAchievement[] {
  const achievements: LeaderboardAchievement[] = [];
  if (entry.rank === 1) achievements.push(achievement("board-leader"));
  else if (entry.rank <= 3) achievements.push(achievement("podium"));
  else if (entry.rank <= 10) achievements.push(achievement("top-ten"));

  if ((entry.streak_weeks || 0) >= 8) achievements.push(achievement("eight-week"));
  else if ((entry.streak_weeks || 0) >= 4) achievements.push(achievement("four-week"));
  if ((entry.recent_check_in_count || 0) >= 10) achievements.push(achievement("ten-frames"));
  if ((entry.cheer_count || 0) >= 5) achievements.push(achievement("crowd-favorite"));
  return achievements;
}

export function profileAchievements(
  summary: ProfileStorySummary,
  entries: ProfileStoryEntry[],
  currentRank?: number,
): LeaderboardAchievement[] {
  const achievements: LeaderboardAchievement[] = [];
  if (currentRank === 1) achievements.push(achievement("board-leader"));
  else if (currentRank !== undefined && currentRank <= 3) achievements.push(achievement("podium"));
  else if (currentRank !== undefined && currentRank <= 10) achievements.push(achievement("top-ten"));

  const streak = consecutivePublishedWeeks(entries);
  if (streak >= 8) achievements.push(achievement("eight-week"));
  else if (streak >= 4) achievements.push(achievement("four-week"));
  if (summary.entry_count >= 10) achievements.push(achievement("ten-frames"));
  if (
    summary.first_score !== null &&
    summary.latest_score !== null &&
    summary.latest_score - summary.first_score >= 5
  ) achievements.push(achievement("five-point"));
  const latest = [...entries].sort((left, right) => right.score_date.localeCompare(left.score_date))[0];
  if (entries.length > 1 && latest && latest.score === summary.best_score) {
    achievements.push(achievement("fresh-pb"));
  }
  return uniqueAchievements(achievements);
}

export function consecutivePublishedWeeks(
  entries: ProfileStoryEntry[],
  now = new Date(),
): number {
  const weeks = new Set(entries.flatMap((entry) => {
    const date = publicDate(entry.score_date);
    return date ? [startOfIsoWeek(date).toISOString().slice(0, 10)] : [];
  }));
  let cursor = startOfIsoWeek(now);
  let key = cursor.toISOString().slice(0, 10);
  if (!weeks.has(key)) {
    cursor = new Date(cursor.getTime() - 7 * 86_400_000);
    key = cursor.toISOString().slice(0, 10);
    if (!weeks.has(key)) return 0;
  }
  let count = 0;
  while (weeks.has(key)) {
    count += 1;
    cursor = new Date(cursor.getTime() - 7 * 86_400_000);
    key = cursor.toISOString().slice(0, 10);
  }
  return count;
}

function publicDate(value: string): Date | undefined {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function startOfIsoWeek(date: Date): Date {
  const cursor = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = cursor.getUTCDay() || 7;
  cursor.setUTCDate(cursor.getUTCDate() - weekday + 1);
  return cursor;
}

function uniqueAchievements(
  achievements: LeaderboardAchievement[],
): LeaderboardAchievement[] {
  return [...new Map(achievements.map((item) => [item.id, item])).values()];
}

function achievement(id: string): LeaderboardAchievement {
  switch (id) {
    case "board-leader":
      return { id, title: "Ranked #01", detail: "Holding the top rank", symbol: "01" };
    case "podium":
      return { id, title: "On the podium", detail: "Ranked in the top three", symbol: "03" };
    case "top-ten":
      return { id, title: "Top ten", detail: "Inside the first ten places", symbol: "10" };
    case "eight-week":
      return { id, title: "Eight-week run", detail: "Added check-ins eight weeks in a row", symbol: "8W" };
    case "four-week":
      return { id, title: "Four-week rhythm", detail: "Added check-ins four weeks in a row", symbol: "4W" };
    case "ten-frames":
      return { id, title: "Ten check-ins", detail: "Added ten check-ins", symbol: "10" };
    case "five-point":
      return { id, title: "Five-point climb", detail: "Five points up since the first check-in", symbol: "+5" };
    case "crowd-favorite":
      return { id, title: "Crowd favorite", detail: "Five or more cheers", symbol: "GF" };
    default:
      return { id: "fresh-pb", title: "New personal best", detail: "The latest check-in set a new high", symbol: "PB" };
  }
}
