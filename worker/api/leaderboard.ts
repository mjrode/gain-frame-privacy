// GET /api/leaderboard
//
// The iOS app keeps leaderboard rows behind authenticated Supabase RLS. This
// endpoint is the deliberately narrow public read projection for gainframe.app:
// it never returns user IDs, emails, profile data, avatar paths, or photos.
//
// Required Worker secrets:
//   - SUPABASE_URL
//   - SUPABASE_SECRET_KEY

import type { Ctx } from "../types";

export interface LeaderboardEnv {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
}

export interface PublicLeaderboardEntry {
  username: string;
  score: number;
  goal: "Lose Weight" | "Gain Muscle" | "Body Recomp";
  score_date: string;
}

const CACHE_SECONDS = 300;
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

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

/**
 * Defense in depth for the service-role fetch: even if the upstream query is
 * changed accidentally, the public response remains a four-field projection.
 */
export function normalizeEntries(value: unknown): PublicLeaderboardEntry[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    if (
      typeof row.username !== "string" ||
      !USERNAME_PATTERN.test(row.username) ||
      !Number.isInteger(row.score) ||
      row.score < 1 ||
      row.score > 100 ||
      typeof row.goal !== "string" ||
      !GOALS.has(row.goal as PublicLeaderboardEntry["goal"]) ||
      !validDate(row.score_date)
    ) {
      return [];
    }

    return [{
      username: row.username,
      score: row.score,
      goal: row.goal as PublicLeaderboardEntry["goal"],
      score_date: row.score_date,
    }];
  });
}

function publicCacheResponse(entries: PublicLeaderboardEntry[]): Response {
  return jsonResponse(
    { entries },
    { headers: { "Cache-Control": `public, max-age=0, s-maxage=${CACHE_SECONDS}` } },
  );
}

export async function handleLeaderboard(
  request: Request,
  env: LeaderboardEnv,
  ctx: Ctx,
): Promise<Response> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    return jsonResponse(
      { error: "Leaderboard is not configured yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(new URL(request.url).toString(), { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const upstream = new URL("/rest/v1/leaderboard_profiles", env.SUPABASE_URL);
  upstream.searchParams.set("select", "username,score,goal,score_date");
  upstream.searchParams.set("order", "score.desc,score_date.asc,username.asc");
  upstream.searchParams.set("limit", "500");

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstream, {
      headers: {
        Accept: "application/json",
        // Supabase's current `sb_secret_` keys must stay in `apikey`; sending
        // one as a bearer JWT makes the Data API reject it.
        apikey: env.SUPABASE_SECRET_KEY,
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

  const response = publicCacheResponse(normalizeEntries(data));
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
