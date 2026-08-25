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
import {
  handleAndroidWaitlist,
  type AndroidWaitlistEnv,
} from "./api/android-waitlist";
import { handlePrivacyRegion } from "./api/privacy-region";
import {
  handleAdminAiFlows,
  verifyAdmin,
} from "./api/admin";
import { handleAdminMoney } from "./api/admin-money";
import { handleAdminProduct } from "./api/admin-product";
import { handleAdminScoringTrust } from "./api/admin-scoring";
import {
  sendToolCtaDailyReport,
  type ToolCtaReportEnv,
} from "./experiments/tool-cta-report";
import type { AssetFetcher, Ctx, ScheduledController } from "./types";
import { profileShellRequest } from "./routes";

interface Env
  extends StatsEnv,
    TrainerWaitlistEnv,
    AndroidWaitlistEnv,
    LeaderboardEnv,
    ToolCtaReportEnv {
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

    if (pathname === "/api/android-waitlist") {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }
      if (request.method !== "POST") {
        return methodNotAllowed("POST, OPTIONS", CORS_HEADERS);
      }
      return handleAndroidWaitlist(request, env);
    }

    if (pathname === "/api/admin/ai-flows") {
      if (request.method !== "GET") {
        return methodNotAllowed("GET");
      }
      return handleAdminAiFlows(request, env);
    }

    if (pathname === "/api/admin/money") {
      if (request.method !== "GET") {
        return methodNotAllowed("GET");
      }
      return handleAdminMoney(request, env);
    }

    if (pathname === "/api/admin/product") {
      if (request.method !== "GET") {
        return methodNotAllowed("GET");
      }
      return handleAdminProduct(request, env);
    }

    if (pathname === "/api/admin/scoring-trust") {
      if (request.method !== "GET") {
        return methodNotAllowed("GET");
      }
      return handleAdminScoringTrust(request, env);
    }

    if (pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // The prompt-template snapshot ships as a static asset but is product
    // IP — never serve it unauthenticated. run_worker_first guarantees this
    // check runs before the asset binding.
    if (pathname.startsWith("/admin-data/")) {
      if (!(await verifyAdmin(request, env))) {
        return new Response(JSON.stringify({ error: "Unauthorized." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const assetResponse = await env.ASSETS.fetch(request);
      const headers = new Headers(assetResponse.headers);
      headers.set("Cache-Control", "no-store");
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        headers,
      });
    }

    // Canonical profile URLs share one export-safe client shell. Every other
    // non-/api request is served directly from the static asset binding.
    return env.ASSETS.fetch(profileShellRequest(request) || request);
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: Ctx,
  ): Promise<void> {
    ctx.waitUntil(
      sendToolCtaDailyReport(env)
        .then((result) => {
          if (!result.sent) {
            console.warn("Tool CTA daily report skipped", result.reason);
          }
        })
        .catch((error) => {
          console.error("Tool CTA daily report failed", error);
        }),
    );
  },
};
