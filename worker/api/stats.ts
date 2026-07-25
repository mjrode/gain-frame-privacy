// GET /api/stats
//
// Returns the two trust numbers shown on the /get landing page:
//   { rating: number, ratingCount: number, lifters: number }
//
//   - rating / ratingCount  ← Apple's public iTunes lookup API (no key needed)
//   - lifters               ← PostHog HogQL count(distinct person_id)
//
// Both sources degrade gracefully: if a fetch fails or an env var is missing,
// we fall back to the last-known-good constants below so the badge is never
// blank. The response is cached for 6h (Cloudflare edge cache + Cache-Control)
// so we don't hammer Apple/PostHog on every page view.
//
// Env vars (Cloudflare dashboard → Worker → Settings → Variables and Secrets):
//   - POSTHOG_PERSONAL_API_KEY   optional; a PostHog personal API key with
//                                `query:read` scope. Without it, lifters uses
//                                the fallback constant.
//   - POSTHOG_PROJECT_ID         optional; defaults to 357433 (GainFrame).
//   - POSTHOG_HOST               optional; defaults to https://us.posthog.com.

import type { Ctx } from "../types";

export interface StatsEnv {
  POSTHOG_PERSONAL_API_KEY?: string;
  POSTHOG_PROJECT_ID?: string;
  POSTHOG_HOST?: string;
}

const APP_ID = "6759252082";
const RATING_FALLBACK = 4.9;
const RATING_COUNT_FALLBACK = 35;
const LIFTERS_FALLBACK = 5000;
const CACHE_SECONDS = 21600; // 6 hours

async function fetchAppStore(): Promise<{ rating: number; ratingCount: number }> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${APP_ID}&country=us`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(`itunes ${res.status}`);
    const data = (await res.json()) as {
      results?: Array<{ averageUserRating?: number; userRatingCount?: number }>;
    };
    const app = data.results?.[0];
    const rating = app?.averageUserRating;
    const ratingCount = app?.userRatingCount;
    return {
      rating:
        typeof rating === "number" && rating > 0
          ? Math.round(rating * 10) / 10
          : RATING_FALLBACK,
      ratingCount:
        typeof ratingCount === "number" && ratingCount >= 0
          ? ratingCount
          : RATING_COUNT_FALLBACK,
    };
  } catch (err) {
    console.warn("App Store lookup failed", err);
    return { rating: RATING_FALLBACK, ratingCount: RATING_COUNT_FALLBACK };
  }
}

async function fetchLifters(env: StatsEnv): Promise<number> {
  const key = env.POSTHOG_PERSONAL_API_KEY;
  if (!key) return LIFTERS_FALLBACK;
  const projectId = env.POSTHOG_PROJECT_ID || "357433";
  const host = env.POSTHOG_HOST || "https://us.posthog.com";
  try {
    const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query:
            "SELECT count(DISTINCT person_id) FROM events WHERE timestamp >= now() - INTERVAL 24 MONTH",
        },
      }),
    });
    if (!res.ok) throw new Error(`posthog ${res.status}`);
    const data = (await res.json()) as { results?: Array<Array<number>> };
    const count = data.results?.[0]?.[0];
    return typeof count === "number" && count > 0 ? count : LIFTERS_FALLBACK;
  } catch (err) {
    console.warn("PostHog lifters query failed", err);
    return LIFTERS_FALLBACK;
  }
}

export async function handleStats(
  request: Request,
  env: StatsEnv,
  ctx: Ctx,
): Promise<Response> {
  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(new URL(request.url).toString(), {
    method: "GET",
  });

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const [store, lifters] = await Promise.all([
    fetchAppStore(),
    fetchLifters(env),
  ]);

  const response = new Response(
    JSON.stringify({
      rating: store.rating,
      ratingCount: store.ratingCount,
      lifters,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
        "Access-Control-Allow-Origin": "*",
      },
    },
  );

  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
