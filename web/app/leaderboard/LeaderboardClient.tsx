"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SITE } from "@/lib/site";
import { publicLeaderboardDate } from "./leaderboard-date";

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
  { value: "Lose Weight", label: "Lose" },
  { value: "Gain Muscle", label: "Build" },
  { value: "Body Recomp", label: "Recomp" },
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
  const date = publicLeaderboardDate(value);
  return !date
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
}

function rankLabel(rank: number): string {
  return String(rank);
}

function friendlyGoal(goal: Goal): string {
  if (goal === "Body Recomp") return "Recomp";
  if (goal === "Gain Muscle") return "Build";
  return "Lose";
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
        cache: "no-store",
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
      .filter((entry) => {
        const scoreDate = publicLeaderboardDate(entry.score_date);
        return scoreDate !== null && (!periodStart || scoreDate >= periodStart);
      })
      .sort((left, right) => (
        right.score - left.score ||
        (publicLeaderboardDate(left.score_date)?.getTime() ?? 0) -
          (publicLeaderboardDate(right.score_date)?.getTime() ?? 0) ||
        left.username.localeCompare(right.username)
      ));
  }, [entries, goal, period]);

  const selectedGoalLabel = GOAL_FILTERS.find((filter) => filter.value === goal)?.label;
  const selectedPeriodLabel = PERIODS.find((item) => item.value === period)?.label;

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
              <h1 id="standings-heading">Leaderboard</h1>
              <p aria-live="polite" className="leaderboard-count">
                {status === "ready"
                  ? rankedEntries.length + " " + (rankedEntries.length === 1 ? "member" : "members")
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
              <strong>Photos stay private.</strong> This page receives only a chosen
              username, score, goal, and check-in date—never real names, emails,
              account IDs, uploaded avatars, or progress photos.
            </p>
          </details>
        </div>

        <div className="leaderboard-controls">
          <div className="leaderboard-filters" aria-label="Filter leaderboard">
            <label>
              <span>Goal</span>
              <select aria-label="Goal" value={goal} onChange={(event) => setGoal(event.target.value as GoalFilter)}>
                {GOAL_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
              </select>
            </label>
            <label>
              <span>Period</span>
              <select aria-label="Period" value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
                {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
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
            {rankedEntries.map((entry, index) => {
              const rank = index + 1;
              return (
                <li className={"leaderboard-row" + (rank === 1 ? " leaderboard-row--first" : "")} key={entry.username + "-" + entry.score_date}>
                  <span className="leaderboard-rank">{rankLabel(rank)}</span>
                  <span className="leaderboard-member">
                    <span className="leaderboard-avatar" aria-hidden="true">{initials(entry.username)}</span>
                    <span>
                      <strong>@{entry.username}</strong>
                      <small>
                        {goal === "all" && <>{friendlyGoal(entry.goal)} <b aria-hidden="true">·</b> </>}
                        {formatDate(entry.score_date)}
                      </small>
                    </span>
                  </span>
                  <span className="leaderboard-score" aria-label={`${entry.score} GainFrame Score`}>{entry.score}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
