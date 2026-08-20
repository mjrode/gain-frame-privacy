"use client";

import {
  type CSSProperties,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import LeaderboardShareDialog from "../LeaderboardShareDialog";
import { publicLeaderboardDate } from "../leaderboard-date";
import {
  buildShareContext,
  type LeaderboardShareContext,
  type LeaderboardShareEntry,
} from "../leaderboard-share";
import {
  nextMediaRetryAttempt,
  profileMediaRefreshSearch,
  profilePageSearch,
} from "./profile-media";
import { appendUniqueEntries } from "./profile-pagination";
import {
  consecutivePublishedWeeks,
  profileAchievements,
} from "../leaderboard-experience";

type Goal = "Lose Weight" | "Gain Muscle" | "Body Recomp";

interface ProfileMedia {
  media_id: string;
  entry_id: string;
  state: "approved";
  url?: string;
  width: number;
  height: number;
  face_blurred: boolean;
  background_redacted: boolean;
}

interface ProfileMediaWithUrl extends ProfileMedia {
  url: string;
}

interface ProfileEntry {
  entry_id: string;
  score: number;
  goal: Goal;
  score_date: string;
  score_contract_version: string;
  verification_state: "server_attested" | "legacy_client";
  media: ProfileMedia[];
}

interface ProfilePayload {
  profile: {
    profile_id: string;
    username: string;
    avatar_url?: string;
    bio?: string;
    training_since_year?: number;
    favorite_lift?: string;
    region?: string;
    training_style?: string;
    weekly_sessions?: number;
    current_phase?: string;
    visibility: "listed" | "unlisted";
  };
  summary: {
    best_score: number | null;
    first_score: number | null;
    latest_score: number | null;
    entry_count: number;
    first_score_date: string | null;
    latest_score_date: string | null;
  };
  entries: ProfileEntry[];
  total_entries: number;
  next_cursor?: string;
}

interface ReportTarget {
  profile_id: string;
  username: string;
  media_id?: string;
}

interface RefreshedMedia {
  media: ProfileMediaWithUrl;
  revision: number;
}

interface MediaUiState {
  refreshing: boolean;
  error?: string;
}

const PROFILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function profileIdFromLocation(): string | null {
  const queryId = new URLSearchParams(window.location.search).get("id");
  if (queryId && PROFILE_ID_PATTERN.test(queryId)) return queryId.toLowerCase();
  const match = window.location.pathname.match(
    /^\/leaderboard\/u\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/?$/i,
  );
  return match ? match[1].toLowerCase() : null;
}

function initials(username: string): string {
  return username.replace(/_/g, " ").slice(0, 2).toUpperCase();
}

function formatDate(value: string, includeYear = true): string {
  const date = publicLeaderboardDate(value);
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(date);
}

function friendlyGoal(goal: Goal): string {
  if (goal === "Body Recomp") return "Recomp";
  if (goal === "Gain Muscle") return "Build";
  return "Lose";
}

function chronological(entries: ProfileEntry[]): ProfileEntry[] {
  return [...entries].sort((left, right) => (
    (publicLeaderboardDate(left.score_date)?.getTime() || 0) -
    (publicLeaderboardDate(right.score_date)?.getTime() || 0) ||
    left.score - right.score
  ));
}

function ScoreHistory({
  entries,
  hasMore,
}: {
  entries: ProfileEntry[];
  hasMore: boolean;
}) {
  const ordered = chronological(entries);
  const width = 720;
  const height = 174;
  const insetX = 24;
  const insetTop = 17;
  const insetBottom = 28;
  const points = ordered.map((entry, index) => {
    const x = ordered.length === 1
      ? width / 2
      : insetX + index * ((width - insetX * 2) / (ordered.length - 1));
    const y = insetTop + (100 - entry.score) / 100 * (height - insetTop - insetBottom);
    return { x, y, entry };
  });
  const pointString = points.map((point) => String(point.x) + "," + String(point.y)).join(" ");
  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  return (
    <figure className="score-history" aria-labelledby="score-history-title">
      <div className="score-history-heading">
        <div>
          <span>{hasMore ? "Loaded trajectory" : "Shared trajectory"}</span>
          <h2 id="score-history-title">{hasMore ? "Recent score history" : "Score history"}</h2>
        </div>
        {first && last && (
          <p>{formatDate(first.score_date, false)} — {formatDate(last.score_date, false)}</p>
        )}
      </div>
      <div className="score-history-plot">
        <svg
          viewBox={"0 0 " + width + " " + height}
          role="img"
          aria-label={ordered.map((entry) => (
            formatDate(entry.score_date) + ": score " + entry.score
          )).join("; ")}
        >
          {[25, 50, 75, 100].map((score) => {
            const y = insetTop + (100 - score) / 100 * (height - insetTop - insetBottom);
            return (
              <g key={score}>
                <line className="score-history-gridline" x1={insetX} x2={width - insetX} y1={y} y2={y} />
                <text className="score-history-axis" x={width - 2} y={y + 4} textAnchor="end">{score}</text>
              </g>
            );
          })}
          {points.length > 1 && <polyline className="score-history-line-shadow" pathLength="1" points={pointString} />}
          {points.length > 1 && <polyline className="score-history-line" pathLength="1" points={pointString} />}
          {points.map((point, index) => (
            <g
              className="score-history-point-group"
              key={point.entry.entry_id}
              style={{ "--point-order": index } as CSSProperties}
            >
              <circle className="score-history-point-halo" cx={point.x} cy={point.y} r="9" />
              <circle className="score-history-point" cx={point.x} cy={point.y} r="4.5" />
            </g>
          ))}
        </svg>
      </div>
      <figcaption>
        {hasMore
          ? "This trajectory is partial. Load older check-ins to complete it."
          : "Only check-ins this member chose to add are shown."}
      </figcaption>
    </figure>
  );
}

function ReportDialog({
  target,
  onClose,
}: {
  target: ReportTarget;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const [reason, setReason] = useState("privacy");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [supportUrl, setSupportUrl] = useState<string>();

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], input:not([disabled]):not([tabindex="-1"])',
      )).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (status === "sent") doneButtonRef.current?.focus();
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    setSupportUrl(undefined);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/leaderboard/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: target.profile_id,
          target_type: target.media_id ? "media" : "profile",
          target_id: target.media_id || null,
          reason,
          ...(details.trim() ? { detail: details.trim() } : {}),
          website: String(form.get("website") || ""),
        }),
      });
      const body = await response.json() as {
        accepted?: boolean;
        error?: string;
        support_url?: string;
      };
      if (response.ok && body.accepted) {
        setStatus("sent");
        setMessage("Report received. Thank you for looking out for the community.");
        return;
      }
      setStatus("error");
      setMessage(body.error || "We could not send this report.");
      if (body.support_url?.startsWith("mailto:")) setSupportUrl(body.support_url);
    } catch {
      setStatus("error");
      setMessage("We could not send this report. Please try again.");
    }
  }

  return (
    <div className="report-dialog-backdrop" role="presentation">
      <section
        ref={dialogRef}
        className="report-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        aria-describedby="report-dialog-description"
      >
        <div className="report-dialog-topline">
          <span>Community safety</span>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close report form">×</button>
        </div>
        <h2 id="report-dialog-title">
          Report {target.media_id ? "this shared check-in photo" : "@" + target.username}
        </h2>
        <p id="report-dialog-description">
          Reports are private. Include only what our moderation team needs to review this public content.
        </p>

        {status === "sent" ? (
          <div className="report-dialog-result" role="status">
            <strong>We have it.</strong>
            <p>{message}</p>
            <button ref={doneButtonRef} type="button" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              Reason
              <select value={reason} onChange={(event) => setReason(event.target.value)}>
                <option value="privacy">Privacy or photo permission</option>
                <option value="harassment">Harassment or objectification</option>
                <option value="impersonation">Impersonation</option>
                <option value={target.media_id ? "inappropriate_media" : "inappropriate_profile"}>
                  Inappropriate {target.media_id ? "image" : "profile"}
                </option>
                <option value="spam">Spam or manipulation</option>
                <option value="other">Something else</option>
              </select>
            </label>
            <label>
              Helpful details <span>Optional</span>
              <textarea
                value={details}
                maxLength={500}
                rows={4}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="What should we look at?"
              />
            </label>
            <label className="report-honeypot" aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            {status === "error" && (
              <p className="report-dialog-error" role="alert">
                {message}{" "}
                {supportUrl && <a href={supportUrl}>Email support instead</a>}
              </p>
            )}
            <div className="report-dialog-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send report"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default function MemberProfileClient() {
  const [profileId, setProfileId] = useState<string | null>();
  const [payload, setPayload] = useState<ProfilePayload>();
  const [status, setStatus] = useState<"loading" | "ready" | "not-found" | "error">("loading");
  const [revealedMedia, setRevealedMedia] = useState<Set<string>>(new Set());
  const [refreshedMedia, setRefreshedMedia] = useState<Record<string, RefreshedMedia>>({});
  const [mediaUi, setMediaUi] = useState<Record<string, MediaUiState>>({});
  const [reportTarget, setReportTarget] = useState<ReportTarget>();
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState("");
  const [olderAnnouncement, setOlderAnnouncement] = useState("");
  const [shareContext, setShareContext] = useState<LeaderboardShareContext>();
  const [shareOpen, setShareOpen] = useState(false);
  const mediaRetryAttempts = useRef<Map<string, number>>(new Map());
  const closeReport = useCallback(() => setReportTarget(undefined), []);

  useEffect(() => {
    setProfileId(profileIdFromLocation());
  }, []);

  useEffect(() => {
    if (profileId === undefined) return;
    if (profileId === null) {
      setStatus("not-found");
      return;
    }

    const canonicalPath = "/leaderboard/u/" + profileId + "/";
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + canonicalPath;
    if (window.location.pathname === "/leaderboard/member/") {
      window.history.replaceState({}, "", canonicalPath);
    }

    const controller = new AbortController();
    setStatus("loading");
    void fetch("/api/leaderboard/profile?id=" + encodeURIComponent(profileId), {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    }).then(async (response) => {
      if (response.status === 404) {
        setStatus("not-found");
        return;
      }
      if (!response.ok) throw new Error("Profile request failed");
      const body = await response.json() as ProfilePayload;
      if (
        !body?.profile ||
        !body.summary ||
        !Array.isArray(body.entries) ||
        typeof body.total_entries !== "number" ||
        typeof body.summary.entry_count !== "number"
      ) throw new Error("Invalid profile");
      mediaRetryAttempts.current.clear();
      setRefreshedMedia({});
      setMediaUi({});
      setRevealedMedia(new Set());
      setPayload(body);
      setStatus("ready");
      document.title = "@" + body.profile.username + " — GainFrame Community";
    }).catch((error: Error) => {
      if (error.name !== "AbortError") setStatus("error");
    });
    return () => controller.abort();
  }, [profileId]);

  useEffect(() => {
    if (
      status !== "ready" ||
      !payload ||
      payload.profile.visibility !== "listed"
    ) {
      setShareContext(undefined);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      goal: "all",
      period: "all_time",
      limit: "100",
    });
    void fetch("/api/leaderboard?" + params.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) return;
      const body = await response.json() as { entries?: unknown };
      if (!Array.isArray(body.entries)) return;
      const standings = body.entries as LeaderboardShareEntry[];
      const selected = standings.find(
        (entry) => entry.profile_id === payload.profile.profile_id,
      );
      if (selected) {
        setShareContext(buildShareContext(
          standings,
          selected,
          "all",
          "all_time",
        ));
      }
    }).catch((error: Error) => {
      if (error.name !== "AbortError") setShareContext(undefined);
    });
    return () => controller.abort();
  }, [payload, status]);

  async function loadOlderEntries() {
    if (!payload?.next_cursor || loadingOlder) return;
    const requestedCursor = payload.next_cursor;
    setLoadingOlder(true);
    setOlderError("");
    setOlderAnnouncement("Loading more of this member's check-in history.");
    try {
      const response = await fetch(
        "/api/leaderboard/profile?" + profilePageSearch(
          payload.profile.profile_id,
          requestedCursor,
        ),
        {
        cache: "no-store",
        headers: { Accept: "application/json" },
        },
      );
      if (!response.ok) throw new Error("Older check-ins request failed");
      const page = await response.json() as ProfilePayload;
      if (
        page.profile?.profile_id !== payload.profile.profile_id ||
        !Array.isArray(page.entries) ||
        typeof page.total_entries !== "number" ||
        !page.summary ||
        typeof page.summary.entry_count !== "number"
      ) throw new Error("Invalid older check-ins response");

      const mergedEntries = appendUniqueEntries(payload.entries, page.entries);
      const addedCount = mergedEntries.length - payload.entries.length;
      setPayload((current) => {
        if (!current) return current;
        return {
          ...current,
          entries: appendUniqueEntries(current.entries, page.entries),
          summary: page.summary,
          total_entries: page.total_entries,
          next_cursor: page.next_cursor,
        };
      });
      setOlderAnnouncement(
        addedCount > 0
          ? addedCount + (addedCount === 1 ? " older check-in loaded." : " older check-ins loaded.")
          : "No additional check-ins were returned.",
      );
    } catch {
      const message = "Older check-ins could not be loaded. Try again.";
      setOlderError(message);
      setOlderAnnouncement(message);
    } finally {
      setLoadingOlder(false);
    }
  }

  function setMediaState(mediaId: string, state: MediaUiState) {
    setMediaUi((current) => ({ ...current, [mediaId]: state }));
  }

  async function refreshSharedMedia(
    mediaId: string,
  ): Promise<ProfileMediaWithUrl> {
    if (!payload) throw new Error("Profile unavailable");
    const response = await fetch(
      "/api/leaderboard/profile/media?" + profileMediaRefreshSearch(
        payload.profile.profile_id,
        mediaId,
      ),
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) throw new Error("Check-in photo refresh failed");
    const body = await response.json() as {
      profile_id?: string;
      media?: ProfileMediaWithUrl;
    };
    if (
      body.profile_id !== payload.profile.profile_id ||
      body.media?.media_id !== mediaId ||
      typeof body.media.url !== "string"
    ) throw new Error("Invalid check-in photo refresh");

    const media = body.media;
    setRefreshedMedia((current) => ({
      ...current,
      [mediaId]: {
        media,
        revision: (current[mediaId]?.revision ?? 0) + 1,
      },
    }));
    return media;
  }

  async function toggleScanImage(mediaId: string) {
    if (revealedMedia.has(mediaId)) {
      setRevealedMedia((current) => {
        const next = new Set(current);
        next.delete(mediaId);
        return next;
      });
      return;
    }

    mediaRetryAttempts.current.set(mediaId, 0);
    setMediaState(mediaId, { refreshing: true });
    try {
      await refreshSharedMedia(mediaId);
      setRevealedMedia((current) => new Set(current).add(mediaId));
      setMediaState(mediaId, { refreshing: false });
    } catch {
      setMediaState(mediaId, {
        refreshing: false,
        error: "This check-in photo could not be refreshed. It may have been removed. Try again.",
      });
    }
  }

  async function handleScanImageError(mediaId: string) {
    const nextAttempt = nextMediaRetryAttempt(
      mediaRetryAttempts.current.get(mediaId) ?? 0,
    );
    if (nextAttempt === null) {
      setRevealedMedia((current) => {
        const next = new Set(current);
        next.delete(mediaId);
        return next;
      });
      setMediaState(mediaId, {
        refreshing: false,
        error: "The check-in photo still could not be opened. Try viewing it again.",
      });
      return;
    }

    mediaRetryAttempts.current.set(mediaId, nextAttempt);
    setMediaState(mediaId, { refreshing: true });
    try {
      await refreshSharedMedia(mediaId);
      setMediaState(mediaId, { refreshing: false });
    } catch {
      setRevealedMedia((current) => {
        const next = new Set(current);
        next.delete(mediaId);
        return next;
      });
      setMediaState(mediaId, {
        refreshing: false,
        error: "The check-in photo could not be reopened. Try viewing it again.",
      });
    }
  }

  if (status === "loading") {
    return (
      <div className="member-profile-shell member-profile-loading" role="status">
        <span className="member-profile-loader" aria-hidden="true" />
        <strong>Opening leaderboard profile…</strong>
        <p>Gathering the check-ins this member chose to add.</p>
      </div>
    );
  }

  if (status === "not-found" || status === "error" || !payload) {
    return (
      <div className="member-profile-shell member-profile-empty" role={status === "error" ? "alert" : undefined}>
        <img src="/assets/gainframe-guy/poses/gainframe-guy-tired.webp" alt="" />
        <span>{status === "not-found" ? "No public profile here" : "Profile unavailable"}</span>
        <h1>{status === "not-found" ? "This frame is private." : "Gary dropped the scorecard."}</h1>
        <p>
          {status === "not-found"
            ? "The link may be old, or the member may have withdrawn their public profile."
            : "Try again shortly, or head back to the leaderboard."}
        </p>
        <a href="/leaderboard/">Return to leaderboard</a>
      </div>
    );
  }

  const profile = payload.profile;
  const summary = payload.summary;
  const improvement = summary.entry_count > 1 &&
    summary.first_score !== null &&
    summary.latest_score !== null
    ? summary.latest_score - summary.first_score
    : undefined;
  const newestFirst = [...payload.entries].sort((left, right) => (
    (publicLeaderboardDate(right.score_date)?.getTime() || 0) -
    (publicLeaderboardDate(left.score_date)?.getTime() || 0) ||
    right.score - left.score
  ));
  const currentRank = shareContext?.selected.rank;
  const publicAchievements = profileAchievements(summary, payload.entries, currentRank);
  const currentStreak = consecutivePublishedWeeks(payload.entries);
  const reportProfile = () => setReportTarget({
    profile_id: profile.profile_id,
    username: profile.username,
  });

  return (
    <div className="member-profile-shell">
      <a className="member-profile-back" href="/leaderboard/">
        <span aria-hidden="true">←</span> Leaderboard
      </a>

      <article className="member-profile-hero">
        <div className="member-profile-identity">
          <div className="member-profile-avatar" aria-hidden="true">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" />
              : initials(profile.username)}
          </div>
          <div>
            <p className="member-profile-eyebrow">
              {profile.visibility === "unlisted" ? "Link-only profile" : "Leaderboard profile"}
            </p>
            <h1>@{profile.username}</h1>
            {profile.bio && <p className="member-profile-bio">{profile.bio}</p>}
          </div>
        </div>

        <div className="member-profile-fields" aria-label="Shared profile details">
          {profile.training_since_year && (
            <span><b>Training</b> Since {profile.training_since_year}</span>
          )}
          {profile.favorite_lift && (
            <span><b>Favorite lift</b> {profile.favorite_lift}</span>
          )}
          {profile.region && (
            <span><b>Region</b> {profile.region}</span>
          )}
          {profile.training_style && (
            <span><b>Training</b> {profile.training_style}</span>
          )}
          {profile.weekly_sessions && (
            <span><b>Frequency</b> {profile.weekly_sessions}× week</span>
          )}
          {profile.current_phase && (
            <span><b>Current phase</b> {profile.current_phase}</span>
          )}
          {shareContext && (
            <button
              className="member-profile-share-button"
              type="button"
              onClick={() => setShareOpen(true)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
              </svg>
              Share rank
            </button>
          )}
        </div>

        <div className="member-profile-gary" aria-hidden="true">
          <span>Keep the frame moving.</span>
          <img src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp" alt="" />
        </div>

        <button className="member-profile-report-link" type="button" onClick={reportProfile}>
          Report profile
        </button>
      </article>

      <section className="member-profile-stats" aria-label="Leaderboard score summary">
        <div className="member-profile-best">
          <span>Personal best</span>
          <strong>{summary.best_score ?? "—"}</strong>
          <small>{summary.best_score === null ? "No check-ins added" : "Highest added score"}</small>
        </div>
        <div>
          <span>Improvement</span>
          <strong>
            {improvement === undefined
              ? "—"
              : improvement > 0
                ? "+" + improvement
                : String(improvement)}
          </strong>
          <small>Since first check-in</small>
        </div>
        <div>
          <span>Check-ins</span>
          <strong>{summary.entry_count}</strong>
          <small>Added by choice</small>
        </div>
      </section>

      <section className="member-profile-story" aria-labelledby="member-profile-story-title">
        <div className="member-profile-story-heading">
          <div>
            <span>Performance story</span>
            <h2 id="member-profile-story-title">
              {improvement !== undefined && improvement > 0
                ? improvement + " points higher since the first added check-in."
                : currentStreak >= 2
                  ? "Check-ins added " + currentStreak + " weeks in a row."
                  : summary.best_score !== null
                    ? "A personal best of " + summary.best_score + ", backed by the full check-in history."
                    : "The first leaderboard check-in has not been added yet."}
            </h2>
          </div>
          <div className="member-profile-story-rank" aria-label={currentRank ? "Current rank " + currentRank : "Current rank unavailable"}>
            <strong>{currentRank ? "#" + String(currentRank).padStart(2, "0") : "—"}</strong>
            <span>Current rank</span>
          </div>
        </div>

        {publicAchievements.length > 0 && (
          <div className="member-achievements" aria-label="Leaderboard achievements">
            {publicAchievements.map((achievement, index) => (
              <div key={achievement.id} style={{ "--achievement-order": index } as CSSProperties}>
                <span aria-hidden="true">{achievement.symbol}</span>
                <p><strong>{achievement.title}</strong><small>{achievement.detail}</small></p>
              </div>
            ))}
          </div>
        )}
      </section>

      {payload.entries.length > 0 && (
        <ScoreHistory entries={payload.entries} hasMore={Boolean(payload.next_cursor)} />
      )}

      <section className="member-entries" aria-labelledby="member-entries-title">
        <div className="member-entries-heading">
          <div>
            <span>Check-in history</span>
            <h2 id="member-entries-title">Added check-ins</h2>
          </div>
          <p>
            {payload.entries.length < summary.entry_count
              ? payload.entries.length + " of " + summary.entry_count
              : summary.entry_count}{" "}
            {summary.entry_count === 1 ? "entry" : "entries"}
          </p>
        </div>

        {newestFirst.length === 0 ? (
          <div className="member-entries-none">No check-ins added yet.</div>
        ) : (
          <ol>
            {newestFirst.map((entry, index) => (
              <li className="member-entry" key={entry.entry_id}>
                <div className="member-entry-rail" aria-hidden="true">
                  <span>{String(newestFirst.length - index).padStart(2, "0")}</span>
                </div>
                <div className="member-entry-copy">
                  <span>{formatDate(entry.score_date)}</span>
                  <h3>{friendlyGoal(entry.goal)} check-in</h3>
                  <p>
                    {entry.verification_state === "server_attested"
                      ? "GainFrame-verified score"
                      : "Submitted GainFrame score"}
                  </p>
                  {entry.media.map((media) => {
                    const isRevealed = revealedMedia.has(media.media_id);
                    const fresh = refreshedMedia[media.media_id];
                    const displayMedia = fresh?.media;
                    const mediaState = mediaUi[media.media_id];
                    const statusId = "scan-image-status-" + media.media_id;
                    return (
                      <div className="member-proof" key={media.media_id}>
                        <button
                          type="button"
                          aria-expanded={isRevealed}
                          aria-describedby={mediaState?.error || mediaState?.refreshing
                            ? statusId
                            : undefined}
                          disabled={mediaState?.refreshing}
                          onClick={() => void toggleScanImage(media.media_id)}
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24">
                            <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
                            <path d="m6.5 16 4.2-4.3 2.8 2.6 2.2-2.1 2.8 3.8M8.5 9h.01" />
                          </svg>
                          {mediaState?.refreshing
                            ? "Refreshing check-in photo…"
                            : isRevealed
                              ? "Hide check-in photo"
                              : "View check-in photo"}
                          <span>Shared by choice</span>
                        </button>
                        {(mediaState?.refreshing || mediaState?.error) && (
                          <p
                            id={statusId}
                            className={mediaState.error
                              ? "member-proof-status member-proof-status--error"
                              : "member-proof-status"}
                            role={mediaState.error ? "alert" : "status"}
                          >
                            {mediaState.error || "Getting a fresh, short-lived image link…"}
                          </p>
                        )}
                        {isRevealed && displayMedia && !mediaState?.refreshing && (
                          <figure id={"scan-image-" + media.media_id}>
                            <img
                              key={media.media_id + "-" + fresh.revision}
                              src={displayMedia.url}
                              width={displayMedia.width}
                              height={displayMedia.height}
                              alt={"Optional shared check-in photo for @" + profile.username + "'s " + formatDate(entry.score_date) + " check-in"}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={() => void handleScanImageError(media.media_id)}
                            />
                            <figcaption>
                              <span>
                                {displayMedia.face_blurred && <b>Face blurred</b>}
                                {displayMedia.background_redacted && <b>Background redacted</b>}
                                {!displayMedia.face_blurred && !displayMedia.background_redacted && <b>Shared as approved</b>}
                              </span>
                              <button
                                type="button"
                                onClick={() => setReportTarget({
                                  profile_id: profile.profile_id,
                                  username: profile.username,
                                  media_id: displayMedia.media_id,
                                })}
                              >
                                Report image
                              </button>
                            </figcaption>
                          </figure>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="member-entry-score">
                  <strong>{entry.score}</strong>
                  <span>GF score</span>
                </div>
              </li>
            ))}
          </ol>
        )}
        {(payload.next_cursor || loadingOlder || olderAnnouncement) && (
          <div className="member-entries-more">
            {payload.next_cursor && (
              <button
                type="button"
                disabled={loadingOlder}
                aria-describedby={olderError ? "older-check-ins-status" : undefined}
                onClick={() => void loadOlderEntries()}
              >
                {loadingOlder ? "Loading older check-ins…" : "Show older check-ins"}
              </button>
            )}
            <p
              id="older-check-ins-status"
              className={olderError
                ? "member-entries-more-status member-entries-more-error"
                : "member-entries-more-status"}
              role="status"
              aria-atomic="true"
            >
              {olderAnnouncement}
            </p>
          </div>
        )}
      </section>

      <aside className="member-profile-context">
        <img src="/assets/gainframe-guy/illustrations/gary-badge.webp" alt="" />
        <div>
          <strong>Progress, not performance.</strong>
          <p>
            Profiles contain only what members deliberately add. Check-in
            photos stay closed until you choose to view them, and reactions or
            popularity rankings are never attached to someone&rsquo;s body.{" "}
            <a href="/community-guidelines/">Community guidelines</a>
          </p>
        </div>
      </aside>

      {reportTarget && (
        <ReportDialog target={reportTarget} onClose={closeReport} />
      )}
      {shareOpen && shareContext && (
        <LeaderboardShareDialog
          context={shareContext}
          placement="member_profile"
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
