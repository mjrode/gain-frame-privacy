// GET /api/admin/product?window=7d|14d|30d
//
// Two panels that share one round trip because both come from PostHog:
//
//   funnel  — onboarding_started -> completed -> paywall_viewed -> purchase,
//             split by app version, plus a daily completion-rate trend.
//             Completion is the highest-leverage metric in the product (it
//             tracks with paid conversion and week-1 retention), and past
//             regressions shipped inside a release and went unnoticed for
//             days — hence the per-version split, which makes a bad release
//             obvious the day it lands.
//
//   failures — product failure events by version. NOTE: this is not crash
//             reporting. PostHog `$exception` on this project is web-only
//             (marketing site); iOS crashes live in Crashlytics/Sentry. What
//             is measurable here is features failing on users, which is the
//             more actionable signal anyway.
//
// Counts are distinct persons per step, not a strictly ordered funnel — good
// enough for rate comparison between versions, which is what this is for.

import { type AdminEnv, deny, hogql, num, ok, str, verifyAdmin } from "./admin.ts";

const FAILURE_EVENTS = [
  "coach_response_failed",
  "deep_dive_failed",
  "prediction_failed",
  "goal_preview_failed",
  "target_assessment_failed",
  "weekly_summary_generation_failed",
  "onboarding_future_preview_failed",
  "onboarding_deep_dive_failed",
  "entitlement_sync_failure_detected",
  "paywall_offer_load_failed",
  "paywall_purchase_failed",
  "precision_bf_failed",
  "coach_demo_response_failed",
  "health_permission_sheet_stalled",
  "context_snapshot_upload_failed",
  "external_storage_repaired",
];

const FUNNEL_EVENTS = [
  "onboarding_started",
  "onboarding_completed",
  "paywall_viewed",
  "paywall_purchase_completed",
];

const quoted = (values: string[]) => values.map((v) => `'${v}'`).join(", ");

async function queryFunnelByVersion(env: AdminEnv, days: number) {
  const rows = await hogql(
    env,
    `SELECT properties.$app_version AS version,
            count(DISTINCT if(event = 'onboarding_started', person_id, NULL)) AS started,
            count(DISTINCT if(event = 'onboarding_completed', person_id, NULL)) AS completed,
            count(DISTINCT if(event = 'paywall_viewed', person_id, NULL)) AS paywall,
            count(DISTINCT if(event = 'paywall_purchase_completed', person_id, NULL)) AS purchased
     FROM events
     WHERE event IN (${quoted(FUNNEL_EVENTS)})
       AND timestamp > now() - INTERVAL ${days} DAY
     GROUP BY version
     HAVING started > 3
     ORDER BY started DESC
     LIMIT 12`,
  );
  return rows.map((r) => ({
    version: str(r[0]) || "unknown",
    started: num(r[1]),
    completed: num(r[2]),
    paywall: num(r[3]),
    purchased: num(r[4]),
  }));
}

async function queryCompletionTrend(env: AdminEnv, days: number) {
  const rows = await hogql(
    env,
    `SELECT toDate(timestamp) AS day,
            count(DISTINCT if(event = 'onboarding_started', person_id, NULL)) AS started,
            count(DISTINCT if(event = 'onboarding_completed', person_id, NULL)) AS completed
     FROM events
     WHERE event IN ('onboarding_started', 'onboarding_completed')
       AND timestamp > now() - INTERVAL ${days} DAY
     GROUP BY day ORDER BY day ASC`,
  );
  return rows.map((r) => ({
    day: str(r[0]),
    started: num(r[1]),
    completed: num(r[2]),
  }));
}

async function queryFailures(env: AdminEnv, days: number) {
  const rows = await hogql(
    env,
    `SELECT event,
            properties.$app_version AS version,
            count() AS occurrences,
            count(DISTINCT person_id) AS users,
            toString(max(timestamp)) AS last_seen
     FROM events
     WHERE event IN (${quoted(FAILURE_EVENTS)})
       AND timestamp > now() - INTERVAL ${days} DAY
     GROUP BY event, version
     ORDER BY occurrences DESC
     LIMIT 25`,
  );
  return rows.map((r) => ({
    event: str(r[0]),
    version: str(r[1]) || "unknown",
    occurrences: num(r[2]),
    users: num(r[3]),
    lastSeen: str(r[4]),
  }));
}

/** Web-only errors from the marketing site — kept separate from app failures. */
async function queryWebErrors(env: AdminEnv, days: number) {
  const rows = await hogql(
    env,
    `SELECT count() AS occurrences, count(DISTINCT person_id) AS users
     FROM events
     WHERE event = '$exception' AND timestamp > now() - INTERVAL ${days} DAY`,
  );
  const r = rows[0] ?? [];
  return { occurrences: num(r[0]), users: num(r[1]) };
}

export async function handleAdminProduct(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  if (!(await verifyAdmin(request, env))) return deny(401, "Unauthorized.");

  const window = new URL(request.url).searchParams.get("window");
  const days = window === "30d" ? 30 : window === "7d" ? 7 : 14;

  try {
    const [versions, trend, failures, webErrors] = await Promise.all([
      queryFunnelByVersion(env, days),
      queryCompletionTrend(env, days),
      queryFailures(env, days),
      queryWebErrors(env, days),
    ]);
    return ok({
      windowDays: days,
      generatedAt: new Date().toISOString(),
      versions,
      trend,
      failures,
      webErrors,
    });
  } catch (err) {
    console.error("admin product query failed", err);
    return deny(
      502,
      `Product query failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}
