// Worker entry point for gainframe.app.
//
// Everything the site serves is a static file from web/out — Workers Static
// Assets handles those through the ASSETS binding (see wrangler.jsonc). The
// Worker runs first so it can enforce the canonical HTTPS origin before
// routing API requests or returning a static asset.

import { handleStats, type StatsEnv } from "./api/stats";
import {
  handleLeaderboard,
  handleLeaderboardProfile,
  handleLeaderboardProfileMedia,
  handleLeaderboardReport,
  type LeaderboardEnv,
} from "./api/leaderboard";
import {
  CORS_HEADERS,
  handleTrainerWaitlist,
  type TrainerWaitlistEnv,
} from "./api/trainer-waitlist";
import { handlePrivacyRegion } from "./api/privacy-region";
import type { AssetFetcher, Ctx } from "./types";
import { profileShellRequest } from "./routes";

interface Env extends StatsEnv, TrainerWaitlistEnv, LeaderboardEnv {
  ASSETS: AssetFetcher;
}

function methodNotAllowed(
  allow: string,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      Allow: allow,
      ...headers,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.protocol === "http:") {
      url.protocol = "https:";
      return new Response(null, {
        status: 308,
        headers: { Location: url.toString() },
      });
    }

    const { pathname } = url;

    if (pathname === "/api/privacy-region") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed("GET, HEAD");
      }
      return handlePrivacyRegion(request);
    }

    if (pathname === "/api/stats") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed("GET, HEAD");
      }
      return handleStats(request, env, ctx);
    }

    if (pathname === "/api/leaderboard") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed("GET, HEAD");
      }
      return handleLeaderboard(request, env);
    }

    if (pathname === "/api/leaderboard/profile") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed("GET, HEAD");
      }
      return handleLeaderboardProfile(request, env);
    }

    if (pathname === "/api/leaderboard/profile/media") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed("GET, HEAD");
      }
      return handleLeaderboardProfileMedia(request, env);
    }

    if (pathname === "/api/leaderboard/report") {
      if (request.method !== "POST") {
        return methodNotAllowed("POST");
      }
      return handleLeaderboardReport(request, env);
    }

    if (pathname === "/api/trainer-waitlist") {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }
      if (request.method !== "POST") {
        return methodNotAllowed("POST, OPTIONS", CORS_HEADERS);
      }
      return handleTrainerWaitlist(request, env);
    }

    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Canonical profile URLs share one export-safe client shell. Every other
    // non-/api request is served directly from the static asset binding.
    return env.ASSETS.fetch(profileShellRequest(request) || request);
  },
};
