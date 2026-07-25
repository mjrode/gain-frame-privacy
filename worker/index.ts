// Worker entry point for gainframe.app.
//
// Everything the site serves is a static file from web/out — Workers Static
// Assets handles those directly (see wrangler.jsonc). This script only exists
// for the two dynamic endpoints the static export can't provide. Asset-first
// routing sends existing files directly from the asset store, while unmatched
// requests (including /api/*) reach this fetch handler.

import { handleStats, type StatsEnv } from "./api/stats";
import {
  CORS_HEADERS,
  handleTrainerWaitlist,
  type TrainerWaitlistEnv,
} from "./api/trainer-waitlist";
import type { AssetFetcher, Ctx } from "./types";

interface Env extends StatsEnv, TrainerWaitlistEnv {
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
    const { pathname } = new URL(request.url);

    if (pathname === "/api/stats") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return methodNotAllowed("GET, HEAD");
      }
      return handleStats(request, env, ctx);
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

    // Non-/api paths only reach the Worker if the asset router missed them.
    return env.ASSETS.fetch(request);
  },
};
