"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import LeaderboardShareDialog from "./LeaderboardShareDialog";
import { publicLeaderboardDate } from "./leaderboard-date";
import { appendUniqueStandings } from "./leaderboard-pagination";
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

export default function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [goal, setGoal] = useState<GoalFilter>("all");
  const [period, setPeriod] = useState<Period>("all_time");
  const [shareContext, setShareContext] = useState<LeaderboardShareContext>();

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
      const params = new URLSearchParams({ goal, period, limit: "50" });
      if (cursor) params.set("cursor", cursor);
      const response = await fetch("/api/leaderboard?" + params.toString(), {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal,
      });
      if (!response.ok) throw new Error("Leaderboard request failed: " + response.status);

      const body = await response.json() as { entries?: unknown; next_cursor?: unknown };
      if (!Array.isArray(body.entries)) throw new Error("Invalid leaderboard response");
      const incoming = body.entries as LeaderboardEntry[];
      setEntries((current) => append
        ? appendUniqueStandings(current, incoming)
        : appendUniqueStandings([], incoming));
      setNextCursor(typeof body.next_cursor === "string" ? body.next_cursor : undefined);
      setStatus("ready");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      if (!append) setStatus("error");
    } finally {
      if (append) setLoadingMore(false);
    }
  }, [goal, period]);

  useEffect(() => {
    const controller = new AbortController();
    void load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  const selectedGoalLabel = GOAL_FILTERS.find((filter) => filter.value === goal)?.label;
  const selectedPeriodLabel = PERIODS.find((item) => item.value === period)?.label;
  const openShare = (entry: LeaderboardEntry) => setShareContext(
    buildShareContext(entries, entry, goal, period),
  );

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
              <span className="leaderboard-kicker">Community scorebook</span>
              <h1 id="standings-heading">Leaderboard</h1>
              <p aria-live="polite" className="leaderboard-count">
                {status === "ready"
                  ? String(entries.length) + (nextCursor ? "+" : "") + " " +
                    (entries.length === 1 && !nextCursor ? "member" : "members")
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
              profile fields and entries. Any scan image is a separately
              approved, cropped public copy—not the original stored in GainFrame.{" "}
              <a href="/privacy/">Privacy details</a>
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

        {status === "ready" && entries.length === 0 && (
          <div className="leaderboard-state">
            <strong>No scores in this division yet</strong>
            <p>Try {selectedGoalLabel?.toLowerCase()} from {selectedPeriodLabel?.toLowerCase()}, or check back after the next opt-in score is shared.</p>
          </div>
        )}

        {status === "ready" && entries.length > 0 && (
          <>
            <ol className="leaderboard-ledger" aria-label="Ranked GainFrame Scores">
              {entries.map((entry) => {
                const rank = entry.rank;
                const rowContents = (
                  <>
                    <span className="leaderboard-rank">{rank}</span>
                    <span className="leaderboard-member">
                      <span className="leaderboard-avatar" aria-hidden="true">
                        {entry.avatar_url
                          ? <img src={entry.avatar_url} alt="" referrerPolicy="no-referrer" />
                          : initials(entry.username)}
                      </span>
                      <span>
                        <strong>@{entry.username}</strong>
                        <small>
                          {goal === "all" && <>{friendlyGoal(entry.goal)} <b aria-hidden="true">·</b> </>}
                          {formatDate(entry.score_date)}
                          {entry.has_proof_media && <span className="leaderboard-proof-mark">Scan image shared</span>}
                        </small>
                      </span>
                    </span>
                    <span
                      className="leaderboard-score"
                      aria-hidden={entry.profile_available ? true : undefined}
                      aria-label={entry.profile_available ? undefined : entry.score + " GainFrame Score"}
                    >
                      {entry.score}
                    </span>
                    {entry.profile_available && <span className="leaderboard-row-arrow" aria-hidden="true">↗</span>}
                  </>
                );
                return (
                  <li className={"leaderboard-row" + (rank === 1 ? " leaderboard-row--first" : "")} key={entry.entry_id}>
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
                      title="Share standing"
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
                  {loadingMore ? "Loading…" : "Show more standings"}
                </button>
              </div>
            )}
          </>
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
