"use client";

import Image from "next/image";
import { type CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/site";
import LeaderboardShareDialog from "./LeaderboardShareDialog";
import { publicLeaderboardDate } from "./leaderboard-date";
import { appendUniqueStandings } from "./leaderboard-pagination";
import {
  communityPulse,
  rankDeltas,
  rankMemoryKey,
  rankSnapshot,
  standingAchievements,
} from "./leaderboard-experience";
import {
  buildShareContext,
  type LeaderboardGoal,
  type LeaderboardGoalFilter,
  type LeaderboardPeriod,
  type LeaderboardShareContext,
  type LeaderboardShareEntry,
} from "./leaderboard-share";

type Goal = LeaderboardGoal;
type GoalFilter = LeaderboardGoalFilter;
type Period = LeaderboardPeriod;
type LeaderboardEntry = LeaderboardShareEntry;
type Board = "score" | "consistency" | "community";
interface ConsistencyEntry {
  profile_id: string;
  entry_id: string;
  rank: number;
  username: string;
  consistency_points: number;
  check_in_day_count?: number;
  weekly_check_in_count?: number;
  streak_weeks: number;
  goal: Goal;
  score_date: string;
  avatar_url?: string;
  profile_available: boolean;
}

const GOAL_FILTERS: Array<{ value: GoalFilter; label: string }> = [
  { value: "all", label: "All goals" },
  { value: "Lose Weight", label: "Lose" },
  { value: "Gain Muscle", label: "Build" },
  { value: "Body Recomp", label: "Recomp" },
];

const PERIODS: Array<{ value: Period; label: string }> = [
  { value: "all_time", label: "All time" },
  { value: "year", label: "This year" },
  { value: "month", label: "This month" },
  { value: "week", label: "This week" },
];

function initials(username: string): string {
  return username.replace(/_/g, " ").slice(0, 2).toUpperCase();
}

function formatDate(value: string): string {
  const date = publicLeaderboardDate(value);
  return !date
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
}

function friendlyGoal(goal: Goal): string {
  if (goal === "Body Recomp") return "Recomp";
  if (goal === "Gain Muscle") return "Build";
  return "Lose";
}

function rankingRule(period: Period): string {
  if (period === "all_time") {
    return "Each member’s best score across all time and goals sets their rank.";
  }
  const context = period === "year"
      ? "this year"
      : period === "month"
        ? "this month"
        : "this week";
  return `Each member’s best score ${context} across all goals sets their rank.`;
}

function consistencyDayCount(entry: ConsistencyEntry): number {
  return entry.check_in_day_count ?? entry.weekly_check_in_count ?? 0;
}

function consistencyStreakLabel(weeks: number): string {
  return weeks === 0 ? "No active streak" : `${weeks}-week streak`;
}

function publicProfileChips(entry: LeaderboardEntry): string[] {
  return [
    entry.training_since_year ? `Since ${entry.training_since_year}` : undefined,
    entry.favorite_lift,
    entry.region,
    entry.training_style,
    entry.weekly_sessions ? `${entry.weekly_sessions}x week` : undefined,
    entry.current_phase,
  ].filter((value): value is string => Boolean(value));
}

export default function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [consistencyEntries, setConsistencyEntries] = useState<ConsistencyEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [goal, setGoal] = useState<GoalFilter>("all");
  const [period, setPeriod] = useState<Period>("month");
  const [board, setBoard] = useState<Board>("score");
  const [shareContext, setShareContext] = useState<LeaderboardShareContext>();
  const [totalMembers, setTotalMembers] = useState(0);
  const [rankMovements, setRankMovements] = useState<Record<string, number>>({});
  const [replayToken, setReplayToken] = useState(0);

  const load = useCallback(async ({
    cursor,
    append = false,
    signal,
  }: {
    cursor?: string;
    append?: boolean;
    signal?: AbortSignal;
  } = {}) => {
    if (append) setLoadingMore(true);
    else setStatus("loading");
    try {
      const params = new URLSearchParams({
        board: board === "consistency" ? "consistency" : "score",
        goal,
        period: board === "consistency" ? "month" : period,
        limit: board === "consistency" ? "100" : "50",
      });
      if (cursor) params.set("cursor", cursor);
      const response = await fetch("/api/leaderboard?" + params.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal,
      });
      if (!response.ok) throw new Error("Leaderboard request failed: " + response.status);

      const body = await response.json() as {
        entries?: unknown;
        next_cursor?: unknown;
        total?: unknown;
      };
      if (!Array.isArray(body.entries)) throw new Error("Invalid leaderboard response");
      const incoming = body.entries as Array<LeaderboardEntry | ConsistencyEntry>;
      const safeTotal = typeof body.total === "number" && Number.isSafeInteger(body.total)
        ? Math.max(incoming.length, body.total)
        : incoming.length;
      if (board === "consistency") {
        setConsistencyEntries(incoming as ConsistencyEntry[]);
      } else {
        const scoreEntries = incoming as LeaderboardEntry[];
        setEntries((current) => append
          ? appendUniqueStandings(current, scoreEntries)
          : appendUniqueStandings([], scoreEntries));
      }
      setTotalMembers((current) => append ? Math.max(current, safeTotal) : safeTotal);
      if (board !== "consistency" && !append && typeof window !== "undefined") {
        const memoryKey = rankMemoryKey(goal, period);
        let previous: Record<string, number> = {};
        try {
          const stored = window.localStorage.getItem(memoryKey);
          if (stored) previous = JSON.parse(stored) as Record<string, number>;
        } catch {
          previous = {};
        }
        const scoreEntries = incoming as LeaderboardEntry[];
        setRankMovements(rankDeltas(scoreEntries, previous));
        try {
          window.localStorage.setItem(memoryKey, JSON.stringify(rankSnapshot(scoreEntries)));
        } catch {
          // Private browsing may make storage unavailable. Motion still falls
          // back to the first-load reveal without changing leaderboard data.
        }
        setReplayToken((value) => value + 1);
      }
      setNextCursor(board === "score" && typeof body.next_cursor === "string" ? body.next_cursor : undefined);
      setStatus("ready");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      if (!append) setStatus("error");
    } finally {
      if (append) setLoadingMore(false);
    }
  }, [board, goal, period]);

  useEffect(() => {
    const controller = new AbortController();
    void load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  const selectedGoalLabel = GOAL_FILTERS.find((filter) => filter.value === goal)?.label;
  const selectedPeriodLabel = PERIODS.find((item) => item.value === period)?.label;
  const pulse = useMemo(
    () => communityPulse(entries, rankMovements, totalMembers),
    [entries, rankMovements, totalMembers],
  );
  const pulseMetrics = useMemo(() => [
    { value: pulse.totalMembers, label: "Members", visible: true },
    { value: pulse.weeklyCheckIns, label: "Check-ins", visible: pulse.weeklyCheckIns > 0 },
    { value: pulse.movingMembers, label: "Rank changes", visible: pulse.movingMembers > 0 },
    { value: pulse.activeStreaks, label: "Weekly streaks", visible: pulse.activeStreaks > 0 },
    { value: pulse.totalCheers, label: "Cheers", visible: pulse.totalCheers > 0 },
  ].filter((metric) => metric.visible), [pulse]);
  const freshEntries = useMemo(
    () => [...entries]
      .sort((left, right) => right.score_date.localeCompare(left.score_date))
      .slice(0, 3),
    [entries],
  );
  const openShare = (entry: LeaderboardEntry) => setShareContext(
    buildShareContext(entries, entry, goal, period),
  );
  const activeCount = board === "consistency" ? consistencyEntries.length : entries.length;

  return (
    <div className="leaderboard-wrap">
      <header className="leaderboard-header">
        <div className="leaderboard-title-row">
          <div className="leaderboard-heading-lockup">
            <span className="leaderboard-gary" aria-hidden="true">
              <Image
                src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp"
                alt=""
                width={60}
                height={66}
                priority
              />
            </span>

            <div>
              <span className="leaderboard-kicker">Opt-in GainScores</span>
              <h1 id="standings-heading">Leaderboard</h1>
              <p aria-live="polite" className="leaderboard-count">
                {status === "ready"
                  ? String(totalMembers) + " " +
                    (totalMembers === 1 ? "member" : "members")
                  : ""}
              </p>
            </div>
          </div>

          <details className="leaderboard-privacy">
            <summary>
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M6.5 8V6.3a3.5 3.5 0 0 1 7 0V8" />
                <rect x="4.5" y="8" width="11" height="8" rx="2.2" />
              </svg>
              Opt-in
            </summary>
            <p>
              <strong>Shared by choice.</strong> Members choose their public
              profile fields and entries. Any shared check-in photo is a separately
              approved, cropped public copy—not the original stored in GainFrame.{" "}
              <a href="/privacy/">Privacy details</a>
            </p>
          </details>
        </div>

        <div className="leaderboard-controls">
          <div className="leaderboard-board-switch" aria-label="Leaderboard type">
            <button
              type="button"
              className={board === "score" ? "is-selected" : ""}
              aria-pressed={board === "score"}
              onClick={() => setBoard("score")}
            >
              GainScore
            </button>
            <button
              type="button"
              className={board === "consistency" ? "is-selected" : ""}
              aria-pressed={board === "consistency"}
              onClick={() => setBoard("consistency")}
            >
              Consistency
            </button>
            <button
              type="button"
              className={board === "community" ? "is-selected" : ""}
              aria-pressed={board === "community"}
              onClick={() => setBoard("community")}
            >
              Community
            </button>
          </div>
          <div className="leaderboard-filters" aria-label="Filter leaderboard">
              <label>
                <span>Goal</span>
                <select aria-label="Goal" value={goal} onChange={(event) => setGoal(event.target.value as GoalFilter)}>
                  {GOAL_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
                </select>
              </label>
              {board !== "consistency" ? (
                <label>
                  <span>Period</span>
                  <select aria-label="Period" value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
                    {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
              ) : <span className="leaderboard-period-reset">Resets next month</span>}
          </div>

          <a
            className="leaderboard-join"
            href={SITE.appStoreUrl}
            target="_blank"
            rel="noopener"
            data-cta-source="leaderboard"
            data-cta-content="mobile_join"
          >
            Join in the app <span aria-hidden="true">→</span>
          </a>
        </div>
      </header>

      <section className="leaderboard-board" aria-labelledby="standings-heading">
        {status === "loading" && (
          <div className="leaderboard-state" role="status">
            <span className="sr-only">Loading leaderboard…</span>
            <div className="leaderboard-skeleton" aria-hidden="true">
              <span className="leaderboard-skeleton-card" />
              {Array.from({ length: 5 }, (_, index) => (
                <span className="leaderboard-skeleton-row" key={index}>
                  <i /> <b /> <em /> <strong />
                </span>
              ))}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="leaderboard-state leaderboard-state--error" role="alert">
            <strong>Leaderboard unavailable</strong>
            <p>Try again in a moment.</p>
            <button type="button" onClick={() => void load()}>Try again</button>
          </div>
        )}

        {status === "ready" && activeCount === 0 && (
          <div className="leaderboard-state">
            <strong>No scores in this division yet</strong>
            <p>Try {selectedGoalLabel?.toLowerCase()} from {selectedPeriodLabel?.toLowerCase()}, or check back after someone adds a check-in.</p>
          </div>
        )}

        {board === "score" && status === "ready" && entries.length > 0 && (
          <div className="leaderboard-panel" key={`score-${goal}-${period}-${replayToken}`}>
            <div className="leaderboard-board-heading">
              <span>{selectedPeriodLabel ?? "Leaderboard"}</span>
              <small>{rankingRule(period)}</small>
            </div>
            <ol className="leaderboard-ledger" aria-label="Ranked GainFrame Scores">
              {entries.map((entry, index) => {
                const rank = entry.rank;
                const movement = rankMovements[entry.profile_id] || 0;
                const achievements = standingAchievements(entry).slice(0, 2);
                const profileChips = publicProfileChips(entry).slice(0, 3);
                const rowContents = (
                  <>
                    <span className="leaderboard-rank">
                      {"#" + String(rank).padStart(2, "0")}
                      {rank === 1 && <small>PACESETTER</small>}
                    </span>
                    <span className="leaderboard-member">
                      <span className="leaderboard-avatar" aria-hidden="true">
                        {entry.avatar_url
                          ? <img src={entry.avatar_url} alt="" referrerPolicy="no-referrer" />
                          : initials(entry.username)}
                      </span>
                      <span>
                        <span className="leaderboard-member-title">
                          <strong>@{entry.username}</strong>
                          {movement !== 0 && (
                            <span className={"leaderboard-movement " + (movement > 0 ? "is-up" : "is-down")}>
                              {movement > 0 ? "↑" : "↓"} {Math.abs(movement)}
                            </span>
                          )}
                        </span>
                        <small>
                          {goal === "all" && <>{friendlyGoal(entry.goal)} <b aria-hidden="true">·</b> </>}
                          {formatDate(entry.score_date)}
                          {entry.has_proof_media && <span className="leaderboard-proof-mark">Check-in photo</span>}
                        </small>
                        {(achievements.length > 0 || profileChips.length > 0 || (entry.cheer_count || 0) > 0) && (
                          <span className="leaderboard-row-signals" aria-label="Public leaderboard highlights">
                            {achievements.map((achievement) => (
                              <span key={achievement.id}>{achievement.symbol} {achievement.title}</span>
                            ))}
                            {profileChips.map((chip) => <span key={chip}>{chip}</span>)}
                            {(entry.cheer_count || 0) > 0 && <span>+{entry.cheer_count} cheers</span>}
                          </span>
                        )}
                      </span>
                    </span>
                    <span
                      className="leaderboard-score"
                      aria-hidden={entry.profile_available ? true : undefined}
                      aria-label={entry.profile_available ? undefined : entry.score + " GainFrame Score"}
                    >
                      {entry.score}
                    </span>
                  </>
                );
                return (
                  <li
                    className={
                      "leaderboard-row leaderboard-row--replay" +
                      (rank === 1 ? " leaderboard-row--first" : "") +
                      (rank > 1 && rank <= 3 ? " leaderboard-row--podium" : "") +
                      (movement > 0 ? " leaderboard-row--up" : movement < 0 ? " leaderboard-row--down" : "")
                    }
                    key={entry.entry_id + "-" + replayToken}
                    style={{
                      "--row-order": Math.min(index, 10),
                      "--rank-shift": Math.max(-4, Math.min(4, movement || 1)),
                    } as CSSProperties}
                  >
                    {entry.profile_available ? (
                      <a
                        className="leaderboard-row-link"
                        href={"/leaderboard/u/" + entry.profile_id + "/"}
                        aria-label={"View @" + entry.username + "'s profile, ranked " + rank + " with a score of " + entry.score}
                      >
                        {rowContents}
                      </a>
                    ) : (
                      <div className="leaderboard-row-link leaderboard-row-link--static">
                        {rowContents}
                      </div>
                    )}
                    <button
                      className="leaderboard-row-share"
                      type="button"
                      onClick={() => openShare(entry)}
                      aria-label={"Create a share card for @" + entry.username + " at rank " + rank}
                      title="Share rank"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24">
                        <circle cx="18" cy="5" r="2.5" />
                        <circle cx="6" cy="12" r="2.5" />
                        <circle cx="18" cy="19" r="2.5" />
                        <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ol>
            {nextCursor && (
              <div className="leaderboard-more">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => void load({ cursor: nextCursor, append: true })}
                >
                  {loadingMore ? "Loading…" : "Show more members"}
                </button>
              </div>
            )}
          </div>
        )}

        {board === "consistency" && status === "ready" && consistencyEntries.length > 0 && (
          <div className="leaderboard-panel" key={`consistency-${goal}-${replayToken}`}>
            <div className="leaderboard-consistency-rule">
              <span>Consistency league</span>
              <h2>Showing up counts here.</h2>
              <p>
                Earn 10 points for each check-in day this month, plus up to 9 active-streak points.
                Multiple scores on one day still count once.
              </p>
            </div>
            <div className="leaderboard-board-heading">
              <span>This month&apos;s league</span>
              <small>Check-in days first; active streak breaks the tie.</small>
            </div>
            <ol className="leaderboard-ledger leaderboard-ledger--consistency" aria-label="Monthly consistency rankings">
              {consistencyEntries.map((entry, index) => {
                const checkInDays = consistencyDayCount(entry);
                const rowContents = (
                  <>
                    <span className="leaderboard-rank">
                      {"#" + String(entry.rank).padStart(2, "0")}
                      {entry.rank === 1 && <small>STEADIEST</small>}
                    </span>
                    <span className="leaderboard-member">
                      <span className="leaderboard-avatar" aria-hidden="true">
                        {entry.avatar_url
                          ? <img src={entry.avatar_url} alt="" referrerPolicy="no-referrer" />
                          : initials(entry.username)}
                      </span>
                      <span>
                        <span className="leaderboard-member-title"><strong>@{entry.username}</strong></span>
                        <small>{checkInDays} check-in {checkInDays === 1 ? "day" : "days"} <b aria-hidden="true">·</b> {consistencyStreakLabel(entry.streak_weeks)}</small>
                      </span>
                    </span>
                    <span className="leaderboard-consistency-score">
                      <strong>{entry.consistency_points}</strong>
                      <small>PTS</small>
                    </span>
                  </>
                );
                return (
                  <li
                    className={"leaderboard-row leaderboard-row--replay" + (entry.rank === 1 ? " leaderboard-row--first" : "")}
                    key={entry.entry_id}
                    style={{ "--row-order": Math.min(index, 10), "--rank-shift": 1 } as CSSProperties}
                  >
                    {entry.profile_available ? (
                      <a
                        className="leaderboard-row-link"
                        href={"/leaderboard/u/" + entry.profile_id + "/"}
                        aria-label={"View @" + entry.username + ", ranked " + entry.rank + " with " + entry.consistency_points + " consistency points"}
                      >
                        {rowContents}
                      </a>
                    ) : <div className="leaderboard-row-link leaderboard-row-link--static">{rowContents}</div>}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {board === "community" && status === "ready" && entries.length > 0 && (
          <div className="leaderboard-community-view leaderboard-panel" key={`community-${goal}-${period}-${replayToken}`}>
            <div className="leaderboard-community-heading">
              <span>Around the board</span>
              <h2>Fresh check-ins from the GainFrame community</h2>
              <p>See who just added a score, then open any public profile for their shared progress.</p>
            </div>

            <section className="leaderboard-pulse" aria-labelledby="community-pulse-title">
              <span className="leaderboard-pulse-icon" aria-hidden="true">⌁</span>
              <div className="leaderboard-pulse-copy">
                <span>This week on the leaderboard</span>
                <h2 id="community-pulse-title">{pulse.headline}</h2>
                <div className="leaderboard-pulse-metrics" aria-label="Community activity summary">
                  {pulseMetrics.map((metric) => (
                    <span key={metric.label}><strong>{metric.value}</strong><small>{metric.label}</small></span>
                  ))}
                </div>
              </div>
            </section>

            <section className="leaderboard-fresh" aria-labelledby="fresh-checkins-title">
              <div className="leaderboard-fresh-heading">
                <span>Latest activity</span>
                <h2 id="fresh-checkins-title">Recently added scores</h2>
              </div>
              <div className="leaderboard-fresh-grid">
                {freshEntries.map((entry) => {
                  const content = (
                    <>
                      <span className="leaderboard-avatar" aria-hidden="true">
                        {entry.avatar_url
                          ? <img src={entry.avatar_url} alt="" referrerPolicy="no-referrer" />
                          : initials(entry.username)}
                      </span>
                      <span className="leaderboard-fresh-member">
                        <strong>@{entry.username}</strong>
                        <small>Added {formatDate(entry.score_date)}</small>
                      </span>
                      <strong className="leaderboard-fresh-score">{entry.score}</strong>
                    </>
                  );
                  return entry.profile_available ? (
                    <a key={entry.entry_id} href={"/leaderboard/u/" + entry.profile_id + "/"}>{content}</a>
                  ) : <div key={entry.entry_id}>{content}</div>;
                })}
              </div>
            </section>
          </div>
        )}
      </section>
      <p className="leaderboard-community-note">
        Progress over popularity. Read the{" "}
        <a href="/community-guidelines/">community guidelines</a>.
      </p>
      {shareContext && (
        <LeaderboardShareDialog
          context={shareContext}
          placement="leaderboard"
          onClose={() => setShareContext(undefined)}
        />
      )}
    </div>
  );
}
