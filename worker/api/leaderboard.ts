// GET /api/leaderboard
//
// The iOS app keeps leaderboard rows behind authenticated Supabase RLS. This
// endpoint proxies its deliberately narrow public Edge Function projection for
// gainframe.app; it never returns user IDs, emails, profile data, avatar paths,
// or photos.
//
// Required Worker configuration:
//   - SUPABASE_URL

export interface LeaderboardEnv {
  SUPABASE_URL?: string;
}

export interface PublicLeaderboardEntry {
  username: string;
  score: number;
  goal: "Lose Weight" | "Gain Muscle" | "Body Recomp";
  score_date: string;
}

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_]{2,19}$/;
const GOALS = new Set<PublicLeaderboardEntry["goal"]>([
  "Lose Weight",
  "Gain Muscle",
  "Body Recomp",
]);

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...(init.headers || {}),
    },
  });
}

function publicScoreDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  // The Edge Function already returns a date-only value. Reapply the
  // projection here so an upstream change cannot expose a check-in time.
  return date.toISOString().slice(0, 10);
}

/**
 * Defense in depth for the public Edge Function: even if its upstream query is
 * changed accidentally, the site response remains a four-field projection.
 */
export function normalizeEntries(value: unknown): PublicLeaderboardEntry[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const scoreDate = publicScoreDate(row.score_date);
    if (
      typeof row.username !== "string" ||
      !USERNAME_PATTERN.test(row.username) ||
      typeof row.score !== "number" ||
      !Number.isInteger(row.score) ||
      row.score < 1 ||
      row.score > 100 ||
      typeof row.goal !== "string" ||
      !GOALS.has(row.goal as PublicLeaderboardEntry["goal"]) ||
      !scoreDate
    ) {
      return [];
    }

    return [{
      username: row.username,
      score: row.score,
      goal: row.goal as PublicLeaderboardEntry["goal"],
      score_date: scoreDate,
    }];
  });
}

function liveResponse(entries: PublicLeaderboardEntry[]): Response {
  return jsonResponse(
    { entries },
    // A user can join or update their score in the app at any time. Do not
    // serve an empty or stale cross-POP cache entry after that action.
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function handleLeaderboard(
  request: Request,
  env: LeaderboardEnv,
): Promise<Response> {
  if (!env.SUPABASE_URL) {
    return jsonResponse(
      { error: "Leaderboard is not configured yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const upstream = new URL("/functions/v1/leaderboard-standings", env.SUPABASE_URL);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstream, {
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    console.warn("Leaderboard upstream request failed", error);
    return jsonResponse(
      { error: "Leaderboard is temporarily unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!upstreamResponse.ok) {
    console.warn("Leaderboard upstream returned", upstreamResponse.status);
    return jsonResponse(
      { error: "Leaderboard is temporarily unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  let data: unknown;
  try {
    data = await upstreamResponse.json();
  } catch {
    return jsonResponse(
      { error: "Leaderboard is temporarily unavailable." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const entries = data && typeof data === "object"
    ? (data as { entries?: unknown }).entries
    : undefined;
  return liveResponse(normalizeEntries(entries));
}
