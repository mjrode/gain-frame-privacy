// Minimal Workers runtime types. The worker has no build step of its own
// (wrangler bundles it with esbuild, which strips types), so we hand-roll the
// two shapes we touch instead of pulling in @cloudflare/workers-types.

export interface Ctx {
  waitUntil(promise: Promise<unknown>): void;
}

export interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

export interface ScheduledController {
  cron: string;
  scheduledTime: number;
}
