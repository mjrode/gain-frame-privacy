"use client";

// Reliability, measured as *features failing on users* rather than crashes.
//
// PostHog `$exception` on this project is web-only (the marketing site);
// iOS crashes go to Crashlytics and Sentry, not here. So this panel tracks
// the product's own failure events, which is the more actionable signal:
// a spike in deep_dive_failed or paywall_offer_load_failed is a user-visible
// break even when the app never crashed.

import {
  COLORS,
  Card,
  Loading,
  PanelError,
  Section,
  cell,
  head,
  numCell,
  numHead,
} from "./shared";
import type { ProductData } from "./FunnelPanel";

// Self-healing repairs, not user-visible breakage — counted but not alarming.
const BENIGN = new Set(["external_storage_repaired"]);

export default function ReliabilityPanel({
  data,
  error,
}: {
  data: ProductData | null;
  error: string | null;
}) {
  if (error) {
    return (
      <Section title="Reliability">
        <PanelError message={error} />
      </Section>
    );
  }
  if (!data) {
    return (
      <Section title="Reliability">
        <Loading />
      </Section>
    );
  }

  const failures = data.failures;
  const realFailures = failures.filter((f) => !BENIGN.has(f.event));
  const affected = realFailures.reduce((sum, f) => sum + f.users, 0);

  return (
    <Section
      title="Reliability"
      subtitle={
        <>
          Product failure events, last {data.windowDays} days —{" "}
          {affected.toLocaleString()} user-hits across{" "}
          {new Set(realFailures.map((f) => f.event)).size} failure types. iOS
          crashes are not here; they live in Crashlytics and Sentry.
        </>
      }
      right={
        <span style={{ fontSize: 12.5, color: COLORS.faint }}>
          Web errors (marketing site): {data.webErrors.occurrences.toLocaleString()} /{" "}
          {data.webErrors.users.toLocaleString()} visitors
        </span>
      }
    >
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={head}>Failure event</th>
                <th style={head}>Version</th>
                <th style={numHead}>Occurrences</th>
                <th style={numHead}>Users hit</th>
                <th style={head}>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {failures.map((f) => {
                const benign = BENIGN.has(f.event);
                return (
                  <tr key={`${f.event}-${f.version}`}>
                    <td
                      style={{
                        ...cell,
                        fontWeight: benign ? 400 : 600,
                        color: benign ? COLORS.faint : COLORS.ink,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.event}
                      {benign && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10.5,
                            color: COLORS.faint,
                          }}
                        >
                          self-healed
                        </span>
                      )}
                    </td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>{f.version}</td>
                    <td style={numCell}>{f.occurrences.toLocaleString()}</td>
                    <td
                      style={{
                        ...numCell,
                        color: benign
                          ? COLORS.faint
                          : f.users >= 25
                            ? COLORS.bad
                            : f.users >= 5
                              ? COLORS.warn
                              : COLORS.ink,
                        fontWeight: !benign && f.users >= 5 ? 600 : 400,
                      }}
                    >
                      {f.users.toLocaleString()}
                    </td>
                    <td style={{ ...cell, color: COLORS.faint, whiteSpace: "nowrap" }}>
                      {f.lastSeen.slice(0, 16)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {failures.length === 0 && (
          <div style={{ padding: 18, color: COLORS.faint, fontSize: 13.5 }}>
            No failure events in this window.
          </div>
        )}
      </Card>
    </Section>
  );
}
