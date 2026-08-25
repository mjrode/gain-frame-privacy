// GET /api/admin/scoring-trust?window=7d|14d|30d
//
// Read-only scoring health for the authenticated admin dashboard. This
// endpoint deliberately cannot change a route or trigger a rollback. It
// answers four separate questions from privacy-safe PostHog aggregates:
//
//   operational — are classify/review requests succeeding on the expected
//                 model/config, and how quickly?
//   routes      — which configs and models actually served the window?
//   stability   — how far did same-person/same-template/same-day score and BF
//                 reads spread, grouped by config/model/app version? This is
//                 an intentionally broad proxy, not exact-image replay.
//   feedback    — how many AI Score Calibration responses reported trust,
//                 inconsistency, or body-fat/score concerns?
//
// No prompt, photo, survey free text, request ID, distinct ID, or person-level
// row leaves this endpoint. Stability metrics are suppressed below three
// aggregate batches to keep tiny cohorts from becoming identifying.

import { type AdminEnv, deny, hogql, num, ok, str, verifyAdmin } from "./admin.ts";

const SCORING_FLOWS = [
  "classify_score",
  "review",
  "ClassifyAndScore",
  "Review",
];

const quoted = (values: string[]) => values.map((value) => `'${value}'`).join(", ");

function clean(value: unknown, fallback = "unattributed"): string {
  const text = str(value).trim();
  return text && text !== "null" && text !== "None" && text !== "(null)"
    ? text
    : fallback;
}

// One scoring operation can emit two $ai_generation events when Gemini 3.7
// falls back to 3.5. Collapse attempts by operation_id before calculating
// volume, error, fallback, semantic, or latency rates. Older traffic without
// operation_id falls through progressively less-specific request identifiers.
function scoringOperationsCte(days: number): string {
  return `WITH attempts AS (
       SELECT person_id,
              timestamp,
              coalesce(
                nullIf(toString(properties.operation_id), ''),
                nullIf(toString(properties.request_id), ''),
                nullIf(toString(properties.invocation_id), ''),
                nullIf(toString(properties.$ai_trace_id), ''),
                concat(toString(distinct_id), ':', toString(timestamp))
              ) AS operation_key,
              coalesce(nullIf(toString(properties.ai_flow), ''), nullIf(toString(properties.gen_flow), '')) AS flow,
              toString(properties.config_version) AS config_version,
              toString(properties.$ai_model) AS model,
              toString(properties.$ai_provider) AS provider,
              toString(properties.$app_version) AS app_version,
              properties.provider_call_index AS provider_call_index,
              properties.$ai_is_error = true AS is_error,
              properties.fallback_used = true AS fallback_used,
              toString(properties.semantic_valid) AS semantic_valid,
              toFloatOrNull(toString(properties.$ai_latency)) AS latency
       FROM events
       WHERE event = '$ai_generation'
         AND coalesce(nullIf(properties.ai_flow, ''), nullIf(properties.gen_flow, '')) IN (${quoted(SCORING_FLOWS)})
         AND timestamp > now() - INTERVAL ${days} DAY
     ), operations AS (
       SELECT operation_key,
              any(person_id) AS person_id,
              argMax(flow, timestamp) AS flow,
              argMax(config_version, timestamp) AS config_version,
              argMaxIf(model, timestamp, provider_call_index = 0) AS primary_model,
              argMaxIf(provider, timestamp, provider_call_index = 0) AS primary_provider,
              argMax(app_version, timestamp) AS app_version,
              argMax(is_error, timestamp) AS final_error,
              max(fallback_used) AS fallback_used,
              argMax(semantic_valid, timestamp) AS semantic_valid,
              sum(latency) AS latency,
              max(timestamp) AS last_seen
       FROM attempts
       GROUP BY operation_key
     )`;
}

export type CalibrationCategory =
  | "matches"
  | "inconsistent"
  | "body_fat_off"
  | "score_off"
  | "other";

/** Maps only the fixed-choice first answer. Unknown/free-text stays opaque. */
export function categorizeCalibrationResponse(raw: string): CalibrationCategory {
  const value = raw.trim().toLowerCase();
  if (value.includes("similar photos") || value.includes("all over the place")) {
    return "inconsistent";
  }
  if (value.includes("body-fat") || value.includes("body fat")) {
    return "body_fat_off";
  }
  if (
    value.includes("score feels") ||
    value.includes("score is too") ||
    value.includes("score seems too")
  ) {
    return "score_off";
  }
  if (value.includes("matches how i look")) {
    return "matches";
  }
  return "other";
}

interface StabilityRow {
  configVersion: string;
  model: string;
  appVersion: string;
  intent: string;
  batches: number;
  photos: number;
  scoreP50: number | null;
  scoreP90: number | null;
  scoreWorst: number | null;
  scoreOverFive: number | null;
  bfBatches: number;
  bfP50: number | null;
  bfP90: number | null;
  bfWorst: number | null;
  bfOverThree: number | null;
  suppressed: boolean;
}

/** Tiny cohorts expose only volume, never their score/BF range. */
export function mapStabilityRow(row: unknown[]): StabilityRow {
  const batches = num(row[4]);
  const suppressed = batches < 3;
  const metric = (index: number): number | null =>
    suppressed || row[index] === null || row[index] === undefined
      ? null
      : num(row[index]);

  return {
    configVersion: clean(row[0]),
    model: clean(row[1]),
    appVersion: clean(row[2], "unknown"),
    intent: clean(row[3], "unknown"),
    batches,
    photos: num(row[5]),
    scoreP50: metric(6),
    scoreP90: metric(7),
    scoreWorst: metric(8),
    scoreOverFive: metric(9),
    bfBatches: num(row[10]),
    bfP50: metric(11),
    bfP90: metric(12),
    bfWorst: metric(13),
    bfOverThree: metric(14),
    suppressed,
  };
}

async function queryOperational(env: AdminEnv, days: number) {
  const rows = await hogql(
    env,
    `/* admin_scoring_operational */
     ${scoringOperationsCte(days)}, latest AS (
       SELECT argMaxIf(config_version, last_seen, notEmpty(config_version)) AS config_version
       FROM operations
     )
     SELECT count() AS requests,
            count(DISTINCT person_id) AS users,
            countIf(final_error) AS errors,
            countIf(fallback_used) AS fallback_requests,
            countIf(semantic_valid IN ('true', 'false')) AS semantic_checked,
            countIf(semantic_valid = 'false') AS semantic_invalid,
            countIf(notEmpty(primary_model)) AS model_tagged,
            countIf(notEmpty(config_version)) AS config_tagged,
            countIf(latency IS NOT NULL) AS latency_samples,
            round(quantile(0.5)(latency), 2) AS latency_p50,
            round(quantile(0.9)(latency), 2) AS latency_p90,
            argMax(config_version, last_seen) AS live_config,
            argMax(primary_model, last_seen) AS live_model,
            toString(max(last_seen)) AS last_seen
     FROM operations
     WHERE config_version = (SELECT config_version FROM latest)`,
  );
  const row = rows[0] ?? [];
  return {
    requests: num(row[0]),
    users: num(row[1]),
    errors: num(row[2]),
    fallbackRequests: num(row[3]),
    semanticChecked: num(row[4]),
    semanticInvalid: num(row[5]),
    modelTagged: num(row[6]),
    configTagged: num(row[7]),
    latencySamples: num(row[8]),
    latencyP50Seconds: row[9] === null ? null : num(row[9]),
    latencyP90Seconds: row[10] === null ? null : num(row[10]),
    liveConfigVersion: clean(row[11]),
    liveModel: clean(row[12]),
    lastSeen: str(row[13]),
  };
}

async function queryRouteBreakdown(env: AdminEnv, days: number) {
  const rows = await hogql(
    env,
    `/* admin_scoring_routes */
     ${scoringOperationsCte(days)}
     SELECT flow,
            config_version,
            primary_model,
            primary_provider,
            app_version,
            count() AS requests,
            count(DISTINCT person_id) AS users,
            countIf(final_error) AS errors,
            countIf(fallback_used) AS fallback_requests,
            countIf(semantic_valid IN ('true', 'false')) AS semantic_checked,
            countIf(semantic_valid = 'false') AS semantic_invalid,
            round(quantile(0.5)(latency), 2) AS latency_p50,
            round(quantile(0.9)(latency), 2) AS latency_p90,
            toString(min(last_seen)) AS first_seen,
            toString(max(last_seen)) AS last_seen
     FROM operations
     WHERE notEmpty(config_version)
     GROUP BY flow, config_version, primary_model, primary_provider, app_version
     ORDER BY last_seen DESC, requests DESC
     LIMIT 30`,
  );
  return rows.map((row) => ({
    flow: clean(row[0], "unknown"),
    configVersion: clean(row[1]),
    model: clean(row[2]),
    provider: clean(row[3], "unknown"),
    appVersion: clean(row[4], "unknown"),
    requests: num(row[5]),
    users: num(row[6]),
    errors: num(row[7]),
    fallbackRequests: num(row[8]),
    semanticChecked: num(row[9]),
    semanticInvalid: num(row[10]),
    latencyP50Seconds: row[11] === null ? null : num(row[11]),
    latencyP90Seconds: row[12] === null ? null : num(row[12]),
    firstSeen: str(row[13]),
    lastSeen: str(row[14]),
  }));
}

async function queryStability(env: AdminEnv, days: number) {
  const rows = await hogql(
    env,
    `/* admin_scoring_stability */
     WITH captures AS (
       SELECT distinct_id,
              toStartOfDay(timestamp) AS day,
              coalesce(
                nullIf(toString(properties.resolved_template), 'none'),
                nullIf(toString(properties.template_name), 'unknown'),
                'unknown'
              ) AS template,
              toString(properties.intent) AS intent,
              toString(properties.config_version) AS config_version,
              toString(properties.serving_model) AS model,
              toString(properties.$app_version) AS app_version,
              toFloat(properties.score) AS score,
              toFloatOrNull(
                extract(
                  coalesce(
                    nullIf(toString(properties.bf_displayed), ''),
                    toString(properties.bf_estimate)
                  ),
                  '([0-9]+(?:\\.[0-9]+)?)'
                )
              ) AS bf
       FROM events
       WHERE event = 'photo_scoring_completed'
         AND timestamp > now() - INTERVAL ${days} DAY
         AND properties.succeeded = true
         AND properties.score IS NOT NULL
         AND toString(properties.intent) IN ('newCapture', 'importPhoto', 'userRescore', 'systemRescore')
     ), batches AS (
       SELECT config_version,
              model,
              app_version,
              intent,
              distinct_id,
              day,
              template,
              count() AS photos,
              max(score) - min(score) AS score_range,
              count(bf) AS bf_photos,
              if(count(bf) >= 2, max(bf) - min(bf), NULL) AS bf_range
       FROM captures
       WHERE template != 'unknown'
       GROUP BY config_version, model, app_version, intent, distinct_id, day, template
       HAVING photos >= 2
     )
     SELECT config_version,
            model,
            app_version,
            intent,
            count() AS batches,
            sum(photos) AS photos,
            round(quantile(0.5)(score_range), 1) AS score_p50,
            round(quantile(0.9)(score_range), 1) AS score_p90,
            round(max(score_range), 1) AS score_worst,
            countIf(score_range >= 5) AS score_over_five,
            countIf(bf_photos >= 2) AS bf_batches,
            round(quantileIf(0.5)(bf_range, bf_photos >= 2), 1) AS bf_p50,
            round(quantileIf(0.9)(bf_range, bf_photos >= 2), 1) AS bf_p90,
            round(maxIf(bf_range, bf_photos >= 2), 1) AS bf_worst,
            countIf(bf_photos >= 2 AND bf_range >= 3) AS bf_over_three
     FROM batches
     GROUP BY config_version, model, app_version, intent
     ORDER BY batches DESC
     LIMIT 60`,
  );
  return rows.map(mapStabilityRow);
}

interface FeedbackBucket {
  appVersion: string;
  responses: number;
  users: number;
  matches: number;
  inconsistent: number;
  bodyFatOff: number;
  scoreOff: number;
  other: number;
  configTagged: number;
  modelTagged: number;
}

async function queryCalibrationFeedback(env: AdminEnv, days: number) {
  const rows = await hogql(
    env,
    `/* admin_scoring_feedback */
     SELECT toString(properties.$app_version) AS app_version,
            toString(properties.$survey_response) AS response,
            count() AS responses,
            count(DISTINCT person_id) AS users,
            countIf(notEmpty(toString(properties.config_version))) AS config_tagged,
            countIf(notEmpty(toString(properties.serving_model))) AS model_tagged
     FROM events
     WHERE event = 'survey sent'
       AND properties.$survey_name = 'AI Score Calibration'
       AND timestamp > now() - INTERVAL ${days} DAY
     GROUP BY app_version, response
     ORDER BY responses DESC`,
  );

  const byVersion = new Map<string, FeedbackBucket>();
  for (const row of rows) {
    const appVersion = clean(row[0], "unknown");
    const bucket = byVersion.get(appVersion) ?? {
      appVersion,
      responses: 0,
      users: 0,
      matches: 0,
      inconsistent: 0,
      bodyFatOff: 0,
      scoreOff: 0,
      other: 0,
      configTagged: 0,
      modelTagged: 0,
    };
    const responses = num(row[2]);
    bucket.responses += responses;
    // Response choices are mutually exclusive today. This sum intentionally
    // remains aggregate and can slightly over-count if that survey changes.
    bucket.users += num(row[3]);
    bucket.configTagged += num(row[4]);
    bucket.modelTagged += num(row[5]);
    const category = categorizeCalibrationResponse(str(row[1]));
    if (category === "matches") bucket.matches += responses;
    else if (category === "inconsistent") bucket.inconsistent += responses;
    else if (category === "body_fat_off") bucket.bodyFatOff += responses;
    else if (category === "score_off") bucket.scoreOff += responses;
    else bucket.other += responses;
    byVersion.set(appVersion, bucket);
  }

  const versions = [...byVersion.values()].sort((a, b) => b.responses - a.responses);
  return {
    responses: versions.reduce((sum, row) => sum + row.responses, 0),
    users: versions.reduce((sum, row) => sum + row.users, 0),
    matches: versions.reduce((sum, row) => sum + row.matches, 0),
    inconsistent: versions.reduce((sum, row) => sum + row.inconsistent, 0),
    bodyFatOff: versions.reduce((sum, row) => sum + row.bodyFatOff, 0),
    scoreOff: versions.reduce((sum, row) => sum + row.scoreOff, 0),
    other: versions.reduce((sum, row) => sum + row.other, 0),
    configTagged: versions.reduce((sum, row) => sum + row.configTagged, 0),
    modelTagged: versions.reduce((sum, row) => sum + row.modelTagged, 0),
    versions,
  };
}

export async function handleAdminScoringTrust(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  if (!(await verifyAdmin(request, env))) return deny(401, "Unauthorized.");

  const window = new URL(request.url).searchParams.get("window");
  const days = window === "30d" ? 30 : window === "7d" ? 7 : 14;

  try {
    const [operational, routes, stability, feedback] = await Promise.all([
      queryOperational(env, days),
      queryRouteBreakdown(env, days),
      queryStability(env, days),
      queryCalibrationFeedback(env, days),
    ]);
    return ok({
      windowDays: days,
      generatedAt: new Date().toISOString(),
      readOnly: true,
      operational,
      routes,
      stability,
      feedback,
    });
  } catch (err) {
    console.error("admin scoring-trust query failed", err);
    return deny(
      502,
      `Scoring trust query failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}
