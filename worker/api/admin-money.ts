// GET /api/admin/money
//
// The business north star: MRR (headline AND ex-weekly), subscribers, trials,
// churn, and what AI inference is costing against that revenue.
//
// Why ex-weekly exists: a $3.99/week plan books $17.29 of MRR because RC
// normalizes every duration to a month, but roughly a third of weekly subs
// survive their first renewal. The headline number therefore overstates
// durable revenue, and the overstatement grows as weekly mix grows. RC's
// charts API can segment MRR by `product_duration` (P1W / P1M / P1Y), so the
// split is taken from RC itself rather than reconstructed from a ledger.
//
// Env: REVENUECAT_API_KEY (secret, v2 `sk_...`), REVENUECAT_PROJECT_ID
// (optional, defaults to the GainFrame project). Missing key degrades to a
// typed `configured: false` response so the panel explains itself instead of
// rendering a bare 502.

import { type AdminEnv, deny, hogql, num, ok, str, verifyAdmin } from "./admin.ts";

const RC_BASE = "https://api.revenuecat.com/v2";
const DEFAULT_PROJECT = "proj0033e581";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface RcChartSegment {
  display_name?: string;
  is_total?: boolean;
}

interface RcChartValue {
  cohort: number;
  measure: number;
  segment?: number;
  value: number;
  incomplete?: boolean;
}

interface RcChart {
  measures?: Array<{ display_name?: string }>;
  segments?: RcChartSegment[] | null;
  values?: RcChartValue[];
}

async function rcFetch(
  env: AdminEnv,
  path: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  const key = env.REVENUECAT_API_KEY;
  if (!key) throw new Error("REVENUECAT_API_KEY is not configured");
  const project = env.REVENUECAT_PROJECT_ID || DEFAULT_PROJECT;
  const url = new URL(`${RC_BASE}/projects/${project}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`revenuecat ${res.status} on ${path}`);
  return res.json();
}

function isoDay(offsetMs: number): string {
  return new Date(Date.now() - offsetMs).toISOString().slice(0, 10);
}

/**
 * MRR split by subscription duration. Returns one point per week with the
 * total and the weekly-plan share, oldest first.
 */
async function fetchMrrSplit(env: AdminEnv) {
  const chart = (await rcFetch(env, "/charts/mrr", {
    resolution: "week",
    start_date: isoDay(9 * WEEK_MS),
    end_date: isoDay(0),
    segment: "product_duration",
  })) as RcChart;

  const segments = chart.segments ?? [];
  const totalIdx = segments.findIndex((s) => s.is_total);
  const weekIdx = segments.findIndex((s) => s.display_name === "P1W");

  const byCohort = new Map<
    number,
    { total: number; weekly: number; incomplete: boolean }
  >();
  for (const v of chart.values ?? []) {
    const entry = byCohort.get(v.cohort) ?? {
      total: 0,
      weekly: 0,
      incomplete: false,
    };
    if (v.segment === totalIdx) entry.total = v.value;
    if (v.segment === weekIdx) entry.weekly = v.value;
    if (v.incomplete) entry.incomplete = true;
    byCohort.set(v.cohort, entry);
  }

  return [...byCohort.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cohort, e]) => ({
      weekStart: new Date(cohort * 1000).toISOString().slice(0, 10),
      total: Math.round(e.total * 100) / 100,
      weekly: Math.round(e.weekly * 100) / 100,
      exWeekly: Math.round((e.total - e.weekly) * 100) / 100,
      incomplete: e.incomplete,
    }));
}

/** Latest *complete* weekly churn period — the in-flight week always flatters. */
async function fetchChurn(env: AdminEnv) {
  const chart = (await rcFetch(env, "/charts/churn", {
    resolution: "week",
    start_date: isoDay(6 * WEEK_MS),
    end_date: isoDay(0),
  })) as RcChart;

  const names = (chart.measures ?? []).map((m) => m.display_name ?? "");
  const activesIdx = names.indexOf("Actives");
  const churnedIdx = names.indexOf("Churned Actives");
  const rateIdx = names.indexOf("Churn Rate");

  const byCohort = new Map<number, Record<number, number>>();
  const incomplete = new Set<number>();
  for (const v of chart.values ?? []) {
    const entry = byCohort.get(v.cohort) ?? {};
    entry[v.measure] = v.value;
    byCohort.set(v.cohort, entry);
    if (v.incomplete) incomplete.add(v.cohort);
  }

  const complete = [...byCohort.entries()]
    .filter(([cohort]) => !incomplete.has(cohort))
    .sort((a, b) => b[0] - a[0]);
  if (complete.length === 0) return null;

  const [cohort, m] = complete[0];
  return {
    weekStart: new Date(cohort * 1000).toISOString().slice(0, 10),
    ratePercent: m[rateIdx] ?? null,
    actives: m[activesIdx] ?? null,
    churned: m[churnedIdx] ?? null,
  };
}

async function fetchOverview(env: AdminEnv) {
  const data = (await rcFetch(env, "/metrics/overview")) as {
    metrics?: Array<{ id?: string; value?: number }>;
  };
  const pick = (id: string) =>
    data.metrics?.find((m) => m.id === id)?.value ?? null;
  return {
    mrr: pick("mrr"),
    activeSubscriptions: pick("active_subscriptions"),
    activeTrials: pick("active_trials"),
    revenue28d: pick("revenue"),
  };
}

/** AI spend over the trailing 30 days, plus a 7-day run-rate. */
async function fetchAiSpend(env: AdminEnv) {
  const rows = await hogql(
    env,
    `SELECT round(sumIf(properties.$ai_total_cost_usd, timestamp > now() - INTERVAL 30 DAY), 2) AS cost_30d,
            round(sumIf(properties.$ai_total_cost_usd, timestamp > now() - INTERVAL 7 DAY), 2) AS cost_7d,
            count(DISTINCT if(timestamp > now() - INTERVAL 7 DAY, person_id, NULL)) AS users_7d
     FROM events
     WHERE event = '$ai_generation' AND timestamp > now() - INTERVAL 30 DAY`,
  );
  const r = rows[0] ?? [];
  const cost7d = num(r[1]);
  return {
    cost30d: num(r[0]),
    cost7d,
    perDay: Math.round((cost7d / 7) * 100) / 100,
    monthlyRunRate: Math.round((cost7d / 7) * 30 * 100) / 100,
    users7d: num(r[2]),
  };
}

export async function handleAdminMoney(
  request: Request,
  env: AdminEnv,
): Promise<Response> {
  if (!(await verifyAdmin(request, env))) return deny(401, "Unauthorized.");

  if (!env.REVENUECAT_API_KEY) {
    return ok({
      configured: false,
      hint: "Set the REVENUECAT_API_KEY worker secret (a RevenueCat v2 sk_ key) to enable revenue metrics.",
    });
  }

  try {
    const [overview, mrrSeries, churn, ai] = await Promise.all([
      fetchOverview(env),
      fetchMrrSplit(env),
      fetchChurn(env),
      fetchAiSpend(env),
    ]);

    const latest = mrrSeries.at(-1) ?? null;
    const exWeekly = latest?.exWeekly ?? null;
    // Margin is judged against durable revenue, not the weekly-inflated
    // headline — that's the whole point of the ex-weekly number.
    const aiPercentOfMrr =
      exWeekly && exWeekly > 0
        ? Math.round((ai.monthlyRunRate / exWeekly) * 1000) / 10
        : null;

    return ok({
      configured: true,
      generatedAt: new Date().toISOString(),
      overview,
      mrr: {
        headline: latest?.total ?? overview.mrr,
        weekly: latest?.weekly ?? null,
        exWeekly,
        asOf: latest?.weekStart ?? null,
        inFlightWeek: latest?.incomplete ?? false,
        series: mrrSeries,
      },
      churn,
      ai: { ...ai, percentOfExWeeklyMrr: aiPercentOfMrr },
    });
  } catch (err) {
    console.error("admin money query failed", err);
    return deny(
      502,
      `Revenue query failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }
}
