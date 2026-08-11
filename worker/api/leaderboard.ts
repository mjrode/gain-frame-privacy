// Public leaderboard API boundary for gainframe.app.
//
// Supabase owns the ranking/profile rules. This Worker keeps the browser on a
// narrow, versioned projection and deliberately drops auth IDs, object paths,
// moderation notes, and any future upstream fields that are not public.

export interface LeaderboardEnv {
  SUPABASE_URL?: string;
  // Optional server-only token used for anonymous web reports. If it is not
  // configured, the UI directs people to the published support address.
  LEADERBOARD_REPORT_TOKEN?: string;
}

export type LeaderboardGoal = "Lose Weight" | "Gain Muscle" | "Body Recomp";
export type LeaderboardPeriod = "all_time" | "year" | "month" | "week";

export interface PublicLeaderboardEntry {
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

export interface PublicLeaderboardMedia {
  media_id: string;
  entry_id: string;
  state: "approved";
  url?: string;
  width: number;
  height: number;
  face_blurred: boolean;
  background_redacted: boolean;
}

export interface PublicLeaderboardRefreshedMedia extends PublicLeaderboardMedia {
  url: string;
}

export interface PublicLeaderboardProfileEntry {
  entry_id: string;
  score: number;
  goal: LeaderboardGoal;
  score_date: string;
  score_contract_version: string;
  verification_state: "server_attested" | "legacy_client";
  media: PublicLeaderboardMedia[];
}

export interface PublicLeaderboardProfileSummary {
  best_score: number | null;
  first_score: number | null;
  latest_score: number | null;
  entry_count: number;
  first_score_date: string | null;
  latest_score_date: string | null;
}

export interface PublicLeaderboardProfile {
  profile: {
    profile_id: string;
    username: string;
    avatar_url?: string;
    bio?: string;
    training_since_year?: number;
    favorite_lift?: string;
    region?: string;
    visibility: "listed" | "unlisted";
  };
  summary: PublicLeaderboardProfileSummary;
  entries: PublicLeaderboardProfileEntry[];
  total_entries: number;
  next_cursor?: string;
}

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_]{2,19}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURSOR_PATTERN = /^[A-Za-z0-9._~-]{1,256}$/;
const GOALS = new Set<LeaderboardGoal>([
  "Lose Weight",
  "Gain Muscle",
  "Body Recomp",
]);
const PERIODS = new Set<LeaderboardPeriod>([
  "all_time",
  "year",
  "month",
  "week",
]);
const REPORT_REASONS = new Set([
  "inappropriate_username",
  "inappropriate_avatar",
  "inappropriate_profile",
  "inappropriate_media",
  "impersonation",
  "spam",
  "harassment",
  "privacy",
  "other",
]);
const API_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};
const UPSTREAM_TIMEOUT_MS = 8_000;
const reportWindows = new Map<string, number[]>();

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...API_HEADERS,
      ...(init.headers || {}),
    },
  });
}

function unavailable(message = "Leaderboard is temporarily unavailable."): Response {
  return jsonResponse(
    { error: message },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  );
}

function publicScoreDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  // The Edge Function returns a date-only value. Reapply the projection here
  // so an upstream change cannot expose a check-in time.
  return date.toISOString().slice(0, 10);
}

function publicString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (
    normalized.length === 0 ||
    normalized.length > maxLength ||
    /[\u0000-\u001f\u007f]/.test(normalized)
  ) return undefined;
  return normalized;
}

function publicAssetUrl(
  value: unknown,
  allowedHost?: string,
  opaqueProfileId?: string,
): string | undefined {
  if (typeof value !== "string" || value.length > 2_048) return undefined;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      (allowedHost && url.hostname !== allowedHost) ||
      (opaqueProfileId && !decodeURIComponent(url.pathname).toLowerCase()
        .split("/").includes(opaqueProfileId.toLowerCase()))
    ) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function normalizedProfileId(value: unknown): string | null {
  return typeof value === "string" && UUID_PATTERN.test(value)
    ? value.toLowerCase()
    : null;
}

function normalizedScore(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 100
    ? value
    : null;
}

function normalizedGoal(value: unknown): LeaderboardGoal | null {
  return typeof value === "string" && GOALS.has(value as LeaderboardGoal)
    ? value as LeaderboardGoal
    : null;
}

function normalizeProfileSummary(
  value: unknown,
): PublicLeaderboardProfileSummary | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const entryCount = row.entry_count;
  if (
    typeof entryCount !== "number" ||
    !Number.isSafeInteger(entryCount) ||
    entryCount < 0
  ) return null;

  if (entryCount === 0) {
    if (
      row.best_score !== null ||
      row.first_score !== null ||
      row.latest_score !== null ||
      row.first_score_date !== null ||
      row.latest_score_date !== null
    ) return null;
    return {
      best_score: null,
      first_score: null,
      latest_score: null,
      entry_count: 0,
      first_score_date: null,
      latest_score_date: null,
    };
  }

  const bestScore = normalizedScore(row.best_score);
  const firstScore = normalizedScore(row.first_score);
  const latestScore = normalizedScore(row.latest_score);
  const firstScoreDate = publicScoreDate(row.first_score_date);
  const latestScoreDate = publicScoreDate(row.latest_score_date);
  if (
    bestScore === null ||
    firstScore === null ||
    latestScore === null ||
    !firstScoreDate ||
    !latestScoreDate ||
    bestScore < firstScore ||
    bestScore < latestScore ||
    firstScoreDate > latestScoreDate
  ) return null;

  return {
    best_score: bestScore,
    first_score: firstScore,
    latest_score: latestScore,
    entry_count: entryCount,
    first_score_date: firstScoreDate,
    latest_score_date: latestScoreDate,
  };
}

/** Defense in depth for the public standings projection. */
export function normalizeEntries(
  value: unknown,
  allowedAssetHost?: string,
): PublicLeaderboardEntry[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const profileId = normalizedProfileId(row.profile_id);
    const entryId = normalizedProfileId(row.entry_id);
    const scoreDate = publicScoreDate(row.score_date);
    const score = normalizedScore(row.score);
    const goal = normalizedGoal(row.goal);
    if (
      !profileId ||
      !entryId ||
      typeof row.username !== "string" ||
      !USERNAME_PATTERN.test(row.username) ||
      score === null ||
      !goal ||
      !scoreDate ||
      typeof row.rank !== "number" ||
      !Number.isSafeInteger(row.rank) ||
      row.rank < 1 ||
      typeof row.has_proof_media !== "boolean" ||
      typeof row.profile_available !== "boolean"
    ) return [];

    // Legacy consent covers a score row only. Even if an upstream regression
    // attaches richer fields, do not expand that consent at this boundary.
    const avatarUrl = row.profile_available
      ? publicAssetUrl(row.avatar_url, allowedAssetHost, profileId)
      : undefined;
    return [{
      profile_id: profileId,
      entry_id: entryId,
      rank: row.rank,
      username: row.username,
      score,
      goal,
      score_date: scoreDate,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      has_proof_media: row.profile_available ? row.has_proof_media : false,
      profile_available: row.profile_available,
    }];
  });
}

function normalizeMedia(
  value: unknown,
  allowedAssetHost?: string,
  opaqueProfileId?: string,
  requireUrl = false,
): PublicLeaderboardMedia[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const mediaId = normalizedProfileId(row.media_id);
    const entryId = normalizedProfileId(row.entry_id);
    const url = publicAssetUrl(row.url, allowedAssetHost, opaqueProfileId);
    if (
      !mediaId ||
      !entryId ||
      row.state !== "approved" ||
      (requireUrl && !url) ||
      (row.url !== undefined && !url) ||
      typeof row.width !== "number" ||
      !Number.isInteger(row.width) ||
      row.width < 1 ||
      row.width > 4_096 ||
      typeof row.height !== "number" ||
      !Number.isInteger(row.height) ||
      row.height < 1 ||
      row.height > 4_096 ||
      typeof row.face_blurred !== "boolean" ||
      typeof row.background_redacted !== "boolean"
    ) return [];
    return [{
      media_id: mediaId,
      entry_id: entryId,
      state: "approved" as const,
      ...(requireUrl && url ? { url } : {}),
      width: row.width,
      height: row.height,
      face_blurred: row.face_blurred,
      background_redacted: row.background_redacted,
    }];
  });
}

/** Strictly projects the public profile contract and rejects private profiles. */
export function normalizeProfile(
  value: unknown,
  allowedAssetHost?: string,
): PublicLeaderboardProfile | null {
  if (!value || typeof value !== "object") return null;
  const root = value as Record<string, unknown>;
  if (!root.profile || typeof root.profile !== "object" || !Array.isArray(root.entries)) {
    return null;
  }

  const profileRow = root.profile as Record<string, unknown>;
  const profileId = normalizedProfileId(profileRow.profile_id);
  const visibility = profileRow.visibility;
  if (
    !profileId ||
    typeof profileRow.username !== "string" ||
    !USERNAME_PATTERN.test(profileRow.username) ||
    (visibility !== "listed" && visibility !== "unlisted")
  ) return null;

  const summary = normalizeProfileSummary(root.summary);
  if (!summary) return null;

  const avatarUrl = publicAssetUrl(profileRow.avatar_url, allowedAssetHost, profileId);
  const bio = publicString(profileRow.bio, 180);
  const favoriteLift = publicString(profileRow.favorite_lift, 60);
  const region = publicString(profileRow.region, 80);
  const currentYear = new Date().getUTCFullYear();
  const trainingSinceYear = typeof profileRow.training_since_year === "number" &&
    Number.isInteger(profileRow.training_since_year) &&
    profileRow.training_since_year >= 1900 &&
    profileRow.training_since_year <= currentYear
    ? profileRow.training_since_year
    : undefined;

  const entries = root.entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const entryId = normalizedProfileId(row.entry_id);
    const score = normalizedScore(row.score);
    const goal = normalizedGoal(row.goal);
    const scoreDate = publicScoreDate(row.score_date);
    const contractVersion = publicString(row.score_contract_version, 32);
    const verificationState = row.verification_state;
    if (
      !entryId ||
      score === null ||
      !goal ||
      !scoreDate ||
      !contractVersion ||
      (verificationState !== "server_attested" && verificationState !== "legacy_client")
    ) return [];
    return [{
      entry_id: entryId,
      score,
      goal,
      score_date: scoreDate,
      score_contract_version: contractVersion,
      verification_state: verificationState,
      media: normalizeMedia(row.media, allowedAssetHost, profileId)
        .filter((media) => media.entry_id === entryId),
    } satisfies PublicLeaderboardProfileEntry];
  });
  const totalEntries = typeof root.total_entries === "number" &&
    Number.isSafeInteger(root.total_entries) &&
    root.total_entries >= entries.length
    ? root.total_entries
    : null;
  if (totalEntries === null || totalEntries !== summary.entry_count) return null;
  if (
    root.next_cursor !== undefined &&
    root.next_cursor !== null &&
    (typeof root.next_cursor !== "string" || !CURSOR_PATTERN.test(root.next_cursor))
  ) return null;
  const nextCursor = typeof root.next_cursor === "string" &&
    CURSOR_PATTERN.test(root.next_cursor)
    ? root.next_cursor
    : undefined;

  return {
    profile: {
      profile_id: profileId,
      username: profileRow.username,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      ...(bio ? { bio } : {}),
      ...(trainingSinceYear ? { training_since_year: trainingSinceYear } : {}),
      ...(favoriteLift ? { favorite_lift: favoriteLift } : {}),
      ...(region ? { region } : {}),
      visibility,
    },
    summary,
    entries,
    total_entries: totalEntries,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  };
}

function upstreamHost(env: LeaderboardEnv): string | undefined {
  if (!env.SUPABASE_URL) return undefined;
  try {
    const url = new URL(env.SUPABASE_URL);
    return url.protocol === "https:" ? url.hostname : undefined;
  } catch {
    return undefined;
  }
}

async function fetchUpstream(
  upstream: URL,
  init: RequestInit = {},
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(upstream, { ...init, signal: controller.signal });
  } catch (error) {
    console.warn("Leaderboard upstream request failed", error instanceof Error ? error.name : "unknown");
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function configuredUpstream(env: LeaderboardEnv, functionName: string): URL | null {
  if (!upstreamHost(env)) return null;
  return new URL(`/functions/v1/${functionName}`, env.SUPABASE_URL);
}

export async function handleLeaderboard(
  request: Request,
  env: LeaderboardEnv,
): Promise<Response> {
  const upstream = configuredUpstream(env, "leaderboard-standings");
  if (!upstream) {
    return jsonResponse(
      { error: "Leaderboard is not configured yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const requestUrl = new URL(request.url);
  const goal = requestUrl.searchParams.get("goal") || "all";
  const period = requestUrl.searchParams.get("period") || "all_time";
  const limitValue = Number(requestUrl.searchParams.get("limit") || "50");
  const cursor = requestUrl.searchParams.get("cursor");
  if (
    (goal !== "all" && !GOALS.has(goal as LeaderboardGoal)) ||
    !PERIODS.has(period as LeaderboardPeriod) ||
    !Number.isInteger(limitValue) ||
    limitValue < 1 ||
    limitValue > 100 ||
    (cursor !== null && !CURSOR_PATTERN.test(cursor))
  ) {
    return jsonResponse(
      { error: "Invalid leaderboard filters." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  upstream.searchParams.set("goal", goal);
  upstream.searchParams.set("period", period);
  upstream.searchParams.set("limit", String(limitValue));
  if (cursor) upstream.searchParams.set("cursor", cursor);

  const upstreamResponse = await fetchUpstream(upstream, {
    headers: { Accept: "application/json" },
  });
  if (!upstreamResponse || !upstreamResponse.ok) {
    if (upstreamResponse) console.warn("Leaderboard upstream returned", upstreamResponse.status);
    return unavailable();
  }

  let data: unknown;
  try {
    data = await upstreamResponse.json();
  } catch {
    return unavailable();
  }
  const body = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const nextCursor = typeof body.next_cursor === "string" && CURSOR_PATTERN.test(body.next_cursor)
    ? body.next_cursor
    : undefined;
  return jsonResponse(
    {
      entries: normalizeEntries(body.entries, upstreamHost(env)),
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    },
    {
      headers: {
        // Rankings change frequently and profile avatars may use expiring URLs.
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function handleLeaderboardProfile(
  request: Request,
  env: LeaderboardEnv,
): Promise<Response> {
  const upstream = configuredUpstream(env, "leaderboard-profile");
  if (!upstream) {
    return jsonResponse(
      { error: "Profiles are not configured yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const profileId = normalizedProfileId(new URL(request.url).searchParams.get("id"));
  const requestUrl = new URL(request.url);
  const cursor = requestUrl.searchParams.get("cursor");
  const limitValue = Number(requestUrl.searchParams.get("limit") || "50");
  if (!profileId) {
    return jsonResponse(
      { error: "Invalid profile link." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (
    !Number.isInteger(limitValue) ||
    limitValue < 1 ||
    limitValue > 100 ||
    (cursor !== null && !CURSOR_PATTERN.test(cursor))
  ) {
    return jsonResponse(
      { error: "Invalid profile pagination." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  upstream.searchParams.set("profile_id", profileId);
  upstream.searchParams.set("limit", String(limitValue));
  if (cursor) upstream.searchParams.set("cursor", cursor);
  const upstreamResponse = await fetchUpstream(upstream, {
    headers: { Accept: "application/json" },
  });
  if (!upstreamResponse) return unavailable("Profile is temporarily unavailable.");
  if (upstreamResponse.status === 404) {
    return jsonResponse(
      { error: "Profile not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!upstreamResponse.ok) return unavailable("Profile is temporarily unavailable.");

  let data: unknown;
  try {
    data = await upstreamResponse.json();
  } catch {
    return unavailable("Profile is temporarily unavailable.");
  }
  const profile = normalizeProfile(data, upstreamHost(env));
  if (!profile) {
    console.warn("Leaderboard profile response failed public projection");
    return unavailable("Profile is temporarily unavailable.");
  }
  return jsonResponse(profile, {
    // Media links expire and withdrawing a public entry must take effect fast.
    headers: { "Cache-Control": "no-store" },
  });
}

export async function handleLeaderboardProfileMedia(
  request: Request,
  env: LeaderboardEnv,
): Promise<Response> {
  const upstream = configuredUpstream(env, "leaderboard-profile");
  if (!upstream) {
    return jsonResponse(
      { error: "Scan images are not configured yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const requestUrl = new URL(request.url);
  const profileId = normalizedProfileId(requestUrl.searchParams.get("id"));
  const mediaId = normalizedProfileId(requestUrl.searchParams.get("media_id"));
  if (!profileId || !mediaId) {
    return jsonResponse(
      { error: "Invalid scan image link." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  upstream.searchParams.set("profile_id", profileId);
  upstream.searchParams.set("media_id", mediaId);
  const upstreamResponse = await fetchUpstream(upstream, {
    headers: { Accept: "application/json" },
  });
  if (!upstreamResponse) return unavailable("Scan image is temporarily unavailable.");
  if (upstreamResponse.status === 404) {
    return jsonResponse(
      { error: "Scan image not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!upstreamResponse.ok) return unavailable("Scan image is temporarily unavailable.");

  let data: unknown;
  try {
    data = await upstreamResponse.json();
  } catch {
    return unavailable("Scan image is temporarily unavailable.");
  }
  if (!data || typeof data !== "object") {
    return unavailable("Scan image is temporarily unavailable.");
  }
  const root = data as Record<string, unknown>;
  if (normalizedProfileId(root.profile_id) !== profileId) {
    return unavailable("Scan image is temporarily unavailable.");
  }
  const media = normalizeMedia(
    [root.media],
    upstreamHost(env),
    profileId,
    true,
  )[0] as PublicLeaderboardRefreshedMedia | undefined;
  if (!media || media.media_id !== mediaId) {
    return unavailable("Scan image is temporarily unavailable.");
  }
  return jsonResponse(
    { profile_id: profileId, media },
    { headers: { "Cache-Control": "no-store" } },
  );
}

interface ReportBody {
  profile_id: string;
  target_type: "profile" | "media";
  target_id: string | null;
  reason: string;
  detail?: string;
  website?: string;
}

function reportRateLimitKey(request: Request): string {
  return trustedReportIp(request);
}

function trustedReportIp(request: Request): string {
  const value = request.headers.get("CF-Connecting-IP") || "";
  return /^[0-9a-f:.]{3,64}$/i.test(value) ? value : "unknown";
}

function reportRateLimited(request: Request): boolean {
  const now = Date.now();
  const cutoff = now - 10 * 60 * 1_000;
  const key = reportRateLimitKey(request);
  const recent = (reportWindows.get(key) || []).filter((timestamp) => timestamp > cutoff);
  if (recent.length >= 3) {
    reportWindows.set(key, recent);
    return true;
  }
  recent.push(now);
  reportWindows.set(key, recent);
  if (reportWindows.size > 1_000) {
    for (const [storedKey, timestamps] of reportWindows) {
      if (timestamps.every((timestamp) => timestamp <= cutoff)) reportWindows.delete(storedKey);
    }
  }
  return false;
}

export async function handleLeaderboardReport(
  request: Request,
  env: LeaderboardEnv,
): Promise<Response> {
  const origin = request.headers.get("Origin");
  const requestUrl = new URL(request.url);
  if (origin !== requestUrl.origin) {
    return jsonResponse(
      { error: "This report must be sent from gainframe.app." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return jsonResponse(
      { error: "Expected a JSON report." },
      { status: 415, headers: { "Cache-Control": "no-store" } },
    );
  }
  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength > 8_192) {
    return jsonResponse(
      { error: "Report is too large." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (reportRateLimited(request)) {
    return jsonResponse(
      { error: "Too many reports. Please try again later." },
      { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "600" } },
    );
  }

  let body: ReportBody;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 8_192) {
      return jsonResponse(
        { error: "Report is too large." },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("invalid report body");
    }
    body = parsed as ReportBody;
  } catch {
    return jsonResponse(
      { error: "Invalid report." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  const profileId = normalizedProfileId(body.profile_id);
  const targetId = body.target_id === null ? null : normalizedProfileId(body.target_id);
  const detail = publicString(body.detail, 500);
  if (
    !profileId ||
    (body.target_type !== "profile" && body.target_type !== "media") ||
    (body.target_type === "profile" && body.target_id !== null) ||
    (body.target_type === "media" && !targetId) ||
    typeof body.reason !== "string" ||
    !REPORT_REASONS.has(body.reason) ||
    (body.detail !== undefined && !detail) ||
    (typeof body.website === "string" && body.website.length > 0)
  ) {
    return jsonResponse(
      { error: "Invalid report." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const upstream = configuredUpstream(env, "leaderboard-manage");
  if (!upstream || !env.LEADERBOARD_REPORT_TOKEN) {
    return jsonResponse(
      {
        error: "Web reporting is not configured yet. Please contact support.",
        support_url: "mailto:michaelrode44@gmail.com?subject=GainFrame%20community%20report",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const upstreamResponse = await fetchUpstream(upstream, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Leaderboard-Report-Token": env.LEADERBOARD_REPORT_TOKEN,
      // Supabase trusts these only after authenticating the server-only token.
      // The canonical IP is salt-hashed for quota identity and must never be
      // logged or stored raw. Viewer-controlled user-agent text is not forwarded.
      "X-Leaderboard-Report-IP": trustedReportIp(request),
    },
    body: JSON.stringify({
      action: "report",
      target_type: body.target_type,
      profile_id: profileId,
      target_id: body.target_type === "profile" ? null : targetId,
      reason: body.reason,
      detail: detail || null,
    }),
  });
  if (!upstreamResponse || !upstreamResponse.ok) {
    return jsonResponse(
      {
        error: "We could not send this report. Please contact support.",
        support_url: "mailto:michaelrode44@gmail.com?subject=GainFrame%20community%20report",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
  return jsonResponse(
    { accepted: true },
    { status: 202, headers: { "Cache-Control": "no-store" } },
  );
}
