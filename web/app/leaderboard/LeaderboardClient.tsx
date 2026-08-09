"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/site";

type Goal = "Lose Weight" | "Gain Muscle" | "Body Recomp";
type GoalFilter = "all" | Goal;
type Period = "all" | "year" | "month" | "week";

interface LeaderboardEntry {
  username: string;
  score: number;
  goal: Goal;
  score_date: string;
}

const GOAL_FILTERS: Array<{ value: GoalFilter; label: string }> = [
  { value: "all", label: "All goals" },
  { value: "Lose Weight", label: "Lose weight" },
  { value: "Gain Muscle", label: "Gain muscle" },
  { value: "Body Recomp", label: "Body recomp" },
];

const PERIODS: Array<{ value: Period; label: string }> = [
  { value: "all", label: "All time" },
  { value: "year", label: "This year" },
  { value: "month", label: "This month" },
  { value: "week", label: "This week" },
];

function startOfPeriod(period: Period, now: Date): Date | null {
  if (period === "all") return null;
  if (period === "year") return new Date(now.getFullYear(), 0, 1);
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function initials(username: string): string {
  return username.replace(/_/g, " ").slice(0, 2).toUpperCase();
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
}

function rankLabel(rank: number): string {
  return `#${String(rank).padStart(2, "0")}`;
}

export default function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [goal, setGoal] = useState<GoalFilter>("all");
  const [period, setPeriod] = useState<Period>("all");

  const load = useCallback(async (signal?: AbortSignal) => {
    setStatus("loading");
    try {
      const response = await fetch("/api/leaderboard", {
        headers: { Accept: "application/json" },
        signal,
      });
      if (!response.ok) throw new Error(`Leaderboard request failed: ${response.status}`);

      const body = await response.json() as { entries?: unknown };
      if (!Array.isArray(body.entries)) throw new Error("Invalid leaderboard response");
      setEntries(body.entries as LeaderboardEntry[]);
      setStatus("ready");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const rankedEntries = useMemo(() => {
    const periodStart = startOfPeriod(period, new Date());
    return entries
      .filter((entry) => goal === "all" || entry.goal === goal)
      .filter((entry) => !periodStart || new Date(entry.score_date) >= periodStart)
      .sort((left, right) => (
        right.score - left.score ||
        new Date(left.score_date).getTime() - new Date(right.score_date).getTime() ||
        left.username.localeCompare(right.username)
      ));
  }, [entries, goal, period]);

  const selectedGoalLabel = GOAL_FILTERS.find((filter) => filter.value === goal)?.label;
  const selectedPeriodLabel = PERIODS.find((item) => item.value === period)?.label;

  return (
    <div className="leaderboard-wrap">
      <header className="leaderboard-hero">
        <p className="leaderboard-kicker"><span aria-hidden="true" /> COMMUNITY STANDINGS</p>
        <h1>GainFrame <em>Leaderboard</em></h1>
        <p>
          A public benchmark for people doing the work. Every row is opt-in;
          progress photos and private profile details stay out of view.
        </p>
      </header>

      <section className="leaderboard-board" aria-labelledby="standings-heading">
        <div className="leaderboard-board-heading">
          <div>
            <p className="leaderboard-eyebrow">LIVE LEDGER</p>
            <h2 id="standings-heading">Community standings</h2>
          </div>
          <p aria-live="polite" className="leaderboard-count">
            {status === "ready" ? `${rankedEntries.length} ${rankedEntries.length === 1 ? "member" : "members"}` : ""}
          </p>
        </div>

        <div className="leaderboard-filters" aria-label="Filter leaderboard">
          <label>
            <span>Goal</span>
            <select value={goal} onChange={(event) => setGoal(event.target.value as GoalFilter)}>
              {GOAL_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
            </select>
          </label>
          <label>
            <span>Score date</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
              {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>

        {status === "loading" && (
          <div className="leaderboard-state" role="status">
            <span className="leaderboard-spinner" aria-hidden="true" /> Loading standings…
          </div>
        )}

        {status === "error" && (
          <div className="leaderboard-state leaderboard-state--error" role="alert">
            <strong>Leaderboard unavailable</strong>
            <p>Try again in a moment.</p>
            <button type="button" onClick={() => void load()}>Try again</button>
          </div>
        )}

        {status === "ready" && rankedEntries.length === 0 && (
          <div className="leaderboard-state">
            <strong>No scores in this division yet</strong>
            <p>Try {selectedGoalLabel?.toLowerCase()} from {selectedPeriodLabel?.toLowerCase()}, or check back after the next opt-in score is shared.</p>
          </div>
        )}

        {status === "ready" && rankedEntries.length > 0 && (
          <ol className="leaderboard-ledger" aria-label="Ranked GainFrame Scores">
            <li className="leaderboard-ledger-heading" aria-hidden="true">
              <span>Rank</span><span>Member</span><span>Score</span>
            </li>
            {rankedEntries.map((entry, index) => {
              const rank = index + 1;
              return (
                <li className={`leaderboard-row${rank === 1 ? " leaderboard-row--first" : ""}`} key={`${entry.username}-${entry.score_date}`}>
                  <span className="leaderboard-rank">{rankLabel(rank)}</span>
                  <span className="leaderboard-member">
                    <span className="leaderboard-avatar" aria-hidden="true">{initials(entry.username)}</span>
                    <span>
                      <strong>@{entry.username}</strong>
                      <small>{entry.goal} <b aria-hidden="true">·</b> {formatDate(entry.score_date)}</small>
                    </span>
                  </span>
                  <span className="leaderboard-score" aria-label={`${entry.score} GainFrame Score`}>{entry.score}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <aside className="leaderboard-privacy" aria-label="Leaderboard privacy">
        <span aria-hidden="true">⌁</span>
        <p><strong>Private by default, competitive by choice.</strong> This page receives only an opted-in username, GainFrame Score, goal, and selected check-in date. It never receives progress photos, real names, emails, account IDs, or uploaded avatars.</p>
      </aside>

      <section className="leaderboard-cta">
        <p className="leaderboard-eyebrow">YOUR POSITION</p>
        <h2>Want a place on the board?</h2>
        <p>Download GainFrame, score a check-in, then decide whether to share a username and score.</p>
        <a
          href={SITE.appStoreUrl}
          target="_blank"
          rel="noopener"
          data-cta-source="leaderboard"
          data-cta-content="download_join"
        >
          Download GainFrame <span aria-hidden="true">→</span>
        </a>
      </section>
    </div>
  );
}
