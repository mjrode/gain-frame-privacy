"use client";

// The money panel. Leads with MRR *ex-weekly* rather than the headline,
// because weekly subscriptions book a full month of MRR while only about a
// third survive their first renewal — so the headline drifts further from
// durable revenue as weekly mix grows. Both numbers are shown; the durable
// one is the big one.

import {
  Bar,
  COLORS,
  Card,
  Loading,
  PanelError,
  PanelNote,
  Section,
  Sparkline,
  Stat,
  StatRow,
  money,
  pct,
} from "./shared";

export interface MoneyData {
  configured: boolean;
  hint?: string;
  generatedAt?: string;
  overview?: {
    mrr: number | null;
    activeSubscriptions: number | null;
    activeTrials: number | null;
    revenue28d: number | null;
  };
  mrr?: {
    headline: number | null;
    weekly: number | null;
    exWeekly: number | null;
    asOf: string | null;
    inFlightWeek: boolean;
    series: Array<{
      weekStart: string;
      total: number;
      weekly: number;
      exWeekly: number;
      incomplete: boolean;
    }>;
  };
  churn?: {
    weekStart: string;
    ratePercent: number | null;
    actives: number | null;
    churned: number | null;
  } | null;
  ai?: {
    cost30d: number;
    cost7d: number;
    perDay: number;
    monthlyRunRate: number;
    users7d: number;
    percentOfExWeeklyMrr: number | null;
  };
}

function marginTone(percentOfMrr: number | null | undefined): string {
  if (percentOfMrr === null || percentOfMrr === undefined) return COLORS.ink;
  if (percentOfMrr >= 40) return COLORS.bad;
  if (percentOfMrr >= 25) return COLORS.warn;
  return COLORS.good;
}

export default function MoneyStrip({
  data,
  error,
}: {
  data: MoneyData | null;
  error: string | null;
}) {
  if (error) {
    return (
      <Section title="Money">
        <PanelError message={error} />
      </Section>
    );
  }
  if (!data) {
    return (
      <Section title="Money">
        <Loading />
      </Section>
    );
  }
  if (!data.configured) {
    return (
      <Section title="Money">
        <PanelNote>
          {data.hint ??
            "RevenueCat is not configured for this worker."}{" "}
          Run <code>npx wrangler secret put REVENUECAT_API_KEY</code> from the
          repo root.
        </PanelNote>
      </Section>
    );
  }

  const { mrr, overview, churn, ai } = data;
  const series = mrr?.series ?? [];
  const weeklyShare =
    mrr?.headline && mrr.headline > 0 && mrr.weekly !== null
      ? (mrr.weekly / mrr.headline) * 100
      : null;

  const prior = series.length >= 2 ? series[series.length - 2] : null;
  const exWeeklyDelta =
    prior && mrr?.exWeekly !== null && mrr?.exWeekly !== undefined
      ? mrr.exWeekly - prior.exWeekly
      : null;

  return (
    <Section
      title="Money"
      subtitle={
        mrr?.asOf
          ? `Week of ${mrr.asOf}${mrr.inFlightWeek ? " · in-flight, still filling" : ""}`
          : undefined
      }
    >
      <Card>
        <StatRow>
          <Stat
            label="MRR ex-weekly"
            value={money(mrr?.exWeekly)}
            emphasis
            sub={
              exWeeklyDelta === null ? (
                "durable revenue"
              ) : (
                <span
                  style={{
                    color: exWeeklyDelta >= 0 ? COLORS.good : COLORS.bad,
                  }}
                >
                  {exWeeklyDelta >= 0 ? "▲" : "▼"} {money(Math.abs(exWeeklyDelta))} vs prior week
                </span>
              )
            }
          />
          <Stat
            label="Headline MRR"
            value={money(mrr?.headline)}
            sub={
              weeklyShare !== null
                ? `${money(mrr?.weekly)} (${weeklyShare.toFixed(0)}%) is weekly plans`
                : undefined
            }
          />
          <Stat
            label="Active subs"
            value={overview?.activeSubscriptions?.toLocaleString() ?? "—"}
            sub={`${overview?.activeTrials ?? 0} trials`}
          />
          <Stat
            label="Weekly churn"
            value={pct(churn?.ratePercent)}
            sub={
              churn
                ? `${churn.churned ?? 0} of ${churn.actives ?? 0} · wk ${churn.weekStart}`
                : "no complete week"
            }
          />
          <Stat
            label="AI run-rate"
            value={`${money(ai?.monthlyRunRate)}/mo`}
            tone={marginTone(ai?.percentOfExWeeklyMrr)}
            sub={`${money(ai?.perDay, 2)}/day · ${pct(ai?.percentOfExWeeklyMrr)} of ex-weekly MRR`}
          />
        </StatRow>

        {series.length >= 2 && (
          <div
            style={{
              display: "flex",
              gap: 28,
              padding: "14px 18px",
              borderTop: `1px solid ${COLORS.line}`,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>
                Ex-weekly MRR, {series.length} weeks
              </div>
              <Sparkline
                values={series.map((p) => p.exWeekly)}
                color={COLORS.good}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>
                Weekly-plan MRR (the part that mostly lapses)
              </div>
              <Sparkline
                values={series.map((p) => p.weekly)}
                color={COLORS.warn}
              />
            </div>
            {weeklyShare !== null && (
              <div style={{ minWidth: 160, flex: "1 1 160px" }}>
                <div
                  style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6 }}
                >
                  Weekly share of headline
                </div>
                <Bar value={weeklyShare} max={100} tone={COLORS.warn} />
                <div style={{ fontSize: 12, color: COLORS.faint, marginTop: 5 }}>
                  {weeklyShare.toFixed(1)}% — quote ex-weekly in audits
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </Section>
  );
}
