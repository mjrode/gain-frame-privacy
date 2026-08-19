"use client";

// Onboarding funnel, split by app version.
//
// The split is the point: a completion regression that ships inside a release
// is invisible in a pooled number but obvious when versions sit next to each
// other. Versions are sorted by volume, and the completion rate of the newest
// high-volume build is compared against the best-performing one so a bad
// release announces itself.

import {
  Bar,
  COLORS,
  Card,
  Loading,
  PanelError,
  Section,
  Sparkline,
  cell,
  head,
  numCell,
  numHead,
  pct,
  rate,
} from "./shared";

export interface ProductData {
  windowDays: number;
  generatedAt: string;
  versions: Array<{
    version: string;
    started: number;
    completed: number;
    paywall: number;
    purchased: number;
  }>;
  trend: Array<{ day: string; started: number; completed: number }>;
  failures: Array<{
    event: string;
    version: string;
    occurrences: number;
    users: number;
    lastSeen: string;
  }>;
  webErrors: { occurrences: number; users: number };
}

/** Sorts version strings like 3.11 above 3.2 (numeric, not lexical). */
function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pb[i] ?? 0) - (pa[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export default function FunnelPanel({
  data,
  error,
}: {
  data: ProductData | null;
  error: string | null;
}) {
  if (error) {
    return (
      <Section title="Onboarding funnel">
        <PanelError message={error} />
      </Section>
    );
  }
  if (!data) {
    return (
      <Section title="Onboarding funnel">
        <Loading />
      </Section>
    );
  }

  const versions = data.versions;
  const maxStarted = Math.max(1, ...versions.map((v) => v.started));

  // Only compare builds with enough volume for the rate to mean anything.
  const comparable = versions.filter((v) => v.started >= 30);
  const newest = [...comparable].sort((a, b) =>
    compareVersions(a.version, b.version),
  )[0];
  const best = [...comparable].sort(
    (a, b) => (rate(b.completed, b.started) ?? 0) - (rate(a.completed, a.started) ?? 0),
  )[0];
  const regression =
    newest && best && newest.version !== best.version
      ? {
          newest,
          best,
          gap:
            (rate(best.completed, best.started) ?? 0) -
            (rate(newest.completed, newest.started) ?? 0),
        }
      : null;

  const trendRates = data.trend
    .filter((d) => d.started > 0)
    .map((d) => (d.completed / d.started) * 100);

  return (
    <Section
      title="Onboarding funnel"
      subtitle={`Distinct users per step, last ${data.windowDays} days. Completion tracks with paid conversion and week-1 retention.`}
    >
      {regression && regression.gap >= 3 && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fff8e6",
            border: `1px solid #f0d9a0`,
            borderRadius: 10,
            fontSize: 13.5,
            marginBottom: 12,
            color: "#7a5a00",
          }}
        >
          <strong>v{regression.newest.version}</strong> completes at{" "}
          {pct(rate(regression.newest.completed, regression.newest.started))} vs{" "}
          <strong>v{regression.best.version}</strong> at{" "}
          {pct(rate(regression.best.completed, regression.best.started))} — a{" "}
          {regression.gap.toFixed(1)} point gap on the newest build.
        </div>
      )}

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={head}>Version</th>
                <th style={head}>Volume</th>
                <th style={numHead}>Started</th>
                <th style={numHead}>Completed</th>
                <th style={numHead}>Completion</th>
                <th style={numHead}>Paywall</th>
                <th style={numHead}>Purchased</th>
                <th style={numHead}>Start → paid</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => {
                const completion = rate(v.completed, v.started);
                const toPaid = rate(v.purchased, v.started);
                const isBest = best && v.version === best.version;
                return (
                  <tr key={v.version}>
                    <td style={{ ...cell, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {v.version}
                      {isBest && v.started >= 30 && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 10.5,
                            color: COLORS.good,
                            fontWeight: 600,
                          }}
                        >
                          BEST
                        </span>
                      )}
                    </td>
                    <td style={{ ...cell, minWidth: 90 }}>
                      <Bar value={v.started} max={maxStarted} />
                    </td>
                    <td style={numCell}>{v.started.toLocaleString()}</td>
                    <td style={numCell}>{v.completed.toLocaleString()}</td>
                    <td
                      style={{
                        ...numCell,
                        fontWeight: 600,
                        color:
                          completion === null
                            ? COLORS.ink
                            : completion >= 55
                              ? COLORS.good
                              : completion >= 48
                                ? COLORS.warn
                                : COLORS.bad,
                      }}
                    >
                      {pct(completion)}
                    </td>
                    <td style={numCell}>{v.paywall.toLocaleString()}</td>
                    <td style={numCell}>{v.purchased.toLocaleString()}</td>
                    <td style={numCell}>{pct(toPaid)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {trendRates.length >= 2 && (
          <div
            style={{
              padding: "14px 18px",
              borderTop: `1px solid ${COLORS.line}`,
            }}
          >
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>
              Daily completion rate — {trendRates[trendRates.length - 1].toFixed(1)}% latest
            </div>
            <Sparkline
              values={trendRates}
              color={COLORS.accent}
              baselineZero={false}
              width={420}
            />
          </div>
        )}
      </Card>
    </Section>
  );
}
