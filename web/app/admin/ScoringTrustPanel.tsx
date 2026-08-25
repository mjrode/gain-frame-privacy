"use client";

// Read-only scoring trust cockpit. It intentionally separates:
//
//   1. operational health — errors, fallback, latency, telemetry coverage;
//   2. user-facing repeatability — same-pose/same-day aggregate ranges;
//   3. direct feedback — fixed-choice calibration responses; and
//   4. controlled evidence — aggregate-only scoring-eval snapshot.
//
// Nothing in this component can mutate the serving route. A threshold breach
// is a prompt for human review, never an automatic rollback.

import {
  COLORS,
  Card,
  Loading,
  PanelError,
  PanelNote,
  Section,
  Stat,
  StatRow,
  cell,
  head,
  numCell,
  numHead,
  pct,
  rate,
} from "./shared";

interface OperationalData {
  requests: number;
  users: number;
  errors: number;
  fallbackRequests: number;
  semanticChecked: number;
  semanticInvalid: number;
  modelTagged: number;
  configTagged: number;
  latencySamples: number;
  latencyP50Seconds: number | null;
  latencyP90Seconds: number | null;
  liveConfigVersion: string;
  liveModel: string;
  lastSeen: string;
}

interface RouteRow {
  flow: string;
  configVersion: string;
  model: string;
  provider: string;
  appVersion: string;
  requests: number;
  users: number;
  errors: number;
  fallbackRequests: number;
  semanticChecked: number;
  semanticInvalid: number;
  latencyP50Seconds: number | null;
  latencyP90Seconds: number | null;
  firstSeen: string;
  lastSeen: string;
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

interface FeedbackVersion {
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

interface FeedbackData extends Omit<FeedbackVersion, "appVersion"> {
  versions: FeedbackVersion[];
}

export interface ScoringTrustData {
  windowDays: number;
  generatedAt: string;
  readOnly: true;
  operational: OperationalData;
  routes: RouteRow[];
  stability: StabilityRow[];
  feedback: FeedbackData;
}

interface SpreadSummary {
  groups: number;
  median: number | null;
  p90: number | null;
  worst: number | null;
  average: number | null;
}

interface EvalModel {
  model: string;
  runs: number;
  gradedCells: number;
  passedCells: number;
  passRatePercent: number | null;
  validationFailures: number;
  rejectedAsNonProgressPhoto: number;
  scoreSpread: SpreadSummary;
  bodyFatSpread: SpreadSummary;
  latency: {
    samples: number;
    medianMs: number | null;
    p90Ms: number | null;
  };
}

export interface ScoringEvalSnapshot {
  configured: boolean;
  generatedAt?: string;
  sourceGeneratedAt?: string | null;
  sourceArtifact?: string;
  gainFrameCommit?: string;
  manifestCases?: number;
  repetitions?: number | null;
  models?: EvalModel[];
  privacy?: string;
}

const SLO = {
  errorRate: 1,
  fallbackRate: 3,
  semanticInvalidRate: 1,
  telemetryCoverage: 95,
  liveScoreP90: 5,
  liveBodyFatP90: 3,
  exactReplayP90: 2,
  feedbackResponses: 30,
};

function seconds(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(2)}s`;
}

function points(value: number | null, suffix = " pts"): string {
  return value === null ? "—" : `${value.toFixed(1)}${suffix}`;
}

function canonicalModel(value: string): string {
  return value.split("@")[0];
}

function toneForLimit(value: number | null, limit: number): string {
  if (value === null) return COLORS.faint;
  if (value < limit) return COLORS.good;
  if (value <= limit * 1.25) return COLORS.warn;
  return COLORS.bad;
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const palette = {
    good: { background: "#edf7ef", color: COLORS.good, border: "#c6e7ce" },
    warn: { background: "#fff8e6", color: COLORS.warn, border: "#f0d9a0" },
    bad: { background: "#fdecec", color: COLORS.bad, border: "#f1c7c7" },
    neutral: { background: COLORS.surface, color: COLORS.muted, border: COLORS.line },
  }[tone];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        border: `1px solid ${palette.border}`,
        background: palette.background,
        color: palette.color,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function MetricRow({
  label,
  value,
  target,
  status,
}: {
  label: string;
  value: string;
  target: string;
  status: "good" | "warn" | "bad" | "neutral";
}) {
  return (
    <tr>
      <td style={{ ...cell, fontWeight: 600 }}>{label}</td>
      <td style={{ ...numCell, fontWeight: 600 }}>{value}</td>
      <td style={{ ...numCell, color: COLORS.faint }}>{target}</td>
      <td style={{ ...cell, textAlign: "right" }}>
        <StatusBadge
          label={status === "good" ? "inside" : status === "neutral" ? "pending" : "review"}
          tone={status}
        />
      </td>
    </tr>
  );
}

export default function ScoringTrustPanel({
  data,
  evaluation,
  error,
}: {
  data: ScoringTrustData | null;
  evaluation: ScoringEvalSnapshot | null;
  error: string | null;
}) {
  if (error && !data) {
    return (
      <Section title="Scoring trust">
        <PanelError message={error} />
      </Section>
    );
  }
  if (!data) {
    return (
      <Section title="Scoring trust">
        <Loading />
      </Section>
    );
  }

  const op = data.operational;
  const errorRate = rate(op.errors, op.requests);
  const fallbackRate = rate(op.fallbackRequests, op.requests);
  const semanticInvalidRate = rate(op.semanticInvalid, op.semanticChecked);
  const modelCoverage = rate(op.modelTagged, op.requests);
  const configCoverage = rate(op.configTagged, op.requests);

  const operationalBreaches = [
    errorRate !== null && errorRate >= SLO.errorRate,
    fallbackRate !== null && fallbackRate >= SLO.fallbackRate,
    semanticInvalidRate !== null && semanticInvalidRate >= SLO.semanticInvalidRate,
    modelCoverage !== null && modelCoverage < SLO.telemetryCoverage,
    configCoverage !== null && configCoverage < SLO.telemetryCoverage,
  ].filter(Boolean).length;

  const currentRoutes = data.routes.filter(
    (row) => row.configVersion === op.liveConfigVersion,
  );
  const flowBreaches = currentRoutes.filter((row) => {
    const rowErrorRate = rate(row.errors, row.requests);
    const rowFallbackRate = rate(row.fallbackRequests, row.requests);
    const rowSemanticRate = rate(row.semanticInvalid, row.semanticChecked);
    return (
      (rowErrorRate !== null && rowErrorRate >= SLO.errorRate) ||
      (rowFallbackRate !== null && rowFallbackRate >= SLO.fallbackRate) ||
      (rowSemanticRate !== null && rowSemanticRate >= SLO.semanticInvalidRate)
    );
  }).length;

  const currentStability = data.stability
    .filter(
      (row) =>
        row.configVersion === op.liveConfigVersion &&
        canonicalModel(row.model) === canonicalModel(op.liveModel),
    )
    .sort((a, b) => b.batches - a.batches);

  const evalModels = evaluation?.models ?? [];
  const liveEval = evalModels.find(
    (row) => canonicalModel(row.model) === canonicalModel(op.liveModel),
  );
  const exactReplayNeedsReview =
    liveEval?.scoreSpread.p90 !== null &&
    liveEval?.scoreSpread.p90 !== undefined &&
    liveEval.scoreSpread.p90 > SLO.exactReplayP90;
  const liveCaptureNeedsReview = currentStability.some(
    (row) =>
      !row.suppressed &&
      ((row.scoreP90 ?? 0) > SLO.liveScoreP90 ||
        (row.bfP90 ?? 0) > SLO.liveBodyFatP90),
  );
  const trustNeedsReview = exactReplayNeedsReview || liveCaptureNeedsReview;

  const headline =
    operationalBreaches > 0 || flowBreaches > 0
      ? {
          title: "Operational guardrail needs review",
          body: "At least one live-route or per-flow threshold is outside the declared range. Routing remains unchanged.",
          tone: "bad" as const,
        }
      : trustNeedsReview
        ? {
            title: "Operations healthy; consistency needs review",
            body: "The route is serving reliably, but controlled or live repeatability is outside the trust target. This is evidence for a human decision, not an automatic rollback.",
            tone: "warn" as const,
          }
        : {
            title: "Operationally healthy; trust decision pending",
            body: "No automatic action is enabled. Keep collecting live capture groups and calibration responses before declaring the route trusted.",
            tone: "good" as const,
          };

  const headlinePalette = {
    good: { bg: "#edf7ef", border: "#c6e7ce", color: COLORS.good },
    warn: { bg: "#fff8e6", border: "#f0d9a0", color: COLORS.warn },
    bad: { bg: "#fdecec", border: "#f1c7c7", color: COLORS.bad },
  }[headline.tone];

  return (
    <Section
      title="Scoring trust"
      subtitle={
        <>
          Read-only · classify + review · last {data.windowDays} days · route{" "}
          <code style={{ color: COLORS.ink }}>{op.liveConfigVersion}</code>
        </>
      }
      right={<StatusBadge label="manual decisions only" tone="neutral" />}
    >
      <div
        style={{
          padding: "14px 16px",
          background: headlinePalette.bg,
          border: `1px solid ${headlinePalette.border}`,
          color: headlinePalette.color,
          borderRadius: 10,
          marginBottom: 12,
          display: "flex",
          gap: 10,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <strong>{headline.title}</strong>
        <span style={{ fontSize: 13 }}>{headline.body}</span>
      </div>

      <Card>
        <StatRow>
          <Stat
            label="Scoring requests"
            value={op.requests.toLocaleString()}
            emphasis
            sub={`${op.users.toLocaleString()} users · deduplicated operations`}
          />
          <Stat
            label="Error rate"
            value={pct(errorRate, 2)}
            tone={toneForLimit(errorRate, SLO.errorRate)}
            sub={`target <${SLO.errorRate}% · ${op.errors} errors`}
          />
          <Stat
            label="Fallback rate"
            value={pct(fallbackRate, 2)}
            tone={toneForLimit(fallbackRate, SLO.fallbackRate)}
            sub={`target <${SLO.fallbackRate}% · ${op.fallbackRequests} requests`}
          />
          <Stat
            label="Latency p50 / p90"
            value={`${seconds(op.latencyP50Seconds)} / ${seconds(op.latencyP90Seconds)}`}
            sub={`${op.latencySamples.toLocaleString()} timed requests`}
          />
          <Stat
            label="Config coverage"
            value={pct(configCoverage)}
            tone={
              configCoverage !== null && configCoverage >= SLO.telemetryCoverage
                ? COLORS.good
                : COLORS.warn
            }
            sub={`model ${pct(modelCoverage)} · target ≥${SLO.telemetryCoverage}%`}
          />
        </StatRow>

        <div style={{ overflowX: "auto", borderTop: `1px solid ${COLORS.line}` }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={head}>Operational SLO</th>
                <th style={numHead}>Current</th>
                <th style={numHead}>Guardrail</th>
                <th style={{ ...head, textAlign: "right" }}>State</th>
              </tr>
            </thead>
            <tbody>
              <MetricRow
                label="Request errors"
                value={pct(errorRate, 2)}
                target={`<${SLO.errorRate}%`}
                status={errorRate !== null && errorRate < SLO.errorRate ? "good" : "bad"}
              />
              <MetricRow
                label="Fallback usage"
                value={pct(fallbackRate, 2)}
                target={`<${SLO.fallbackRate}%`}
                status={fallbackRate !== null && fallbackRate < SLO.fallbackRate ? "good" : "bad"}
              />
              <MetricRow
                label="Semantic invalid"
                value={pct(semanticInvalidRate, 2)}
                target={`<${SLO.semanticInvalidRate}% of checked`}
                status={
                  semanticInvalidRate === null
                    ? "neutral"
                    : semanticInvalidRate < SLO.semanticInvalidRate
                      ? "good"
                      : "bad"
                }
              />
              <MetricRow
                label="Model attribution"
                value={pct(modelCoverage)}
                target={`≥${SLO.telemetryCoverage}%`}
                status={modelCoverage !== null && modelCoverage >= SLO.telemetryCoverage ? "good" : "warn"}
              />
              <MetricRow
                label="Config attribution"
                value={pct(configCoverage)}
                target={`≥${SLO.telemetryCoverage}%`}
                status={configCoverage !== null && configCoverage >= SLO.telemetryCoverage ? "good" : "warn"}
              />
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ height: 18 }} />
      <RouteCard rows={currentRoutes} />

      <div style={{ height: 18 }} />
      <StabilityCard
        rows={data.stability}
        liveConfigVersion={op.liveConfigVersion}
        liveModel={op.liveModel}
      />

      <div style={{ height: 18 }} />
      <FeedbackCard feedback={data.feedback} />

      <div style={{ height: 18 }} />
      <EvaluationCard snapshot={evaluation} liveModel={op.liveModel} />
    </Section>
  );
}

function RouteCard({ rows }: { rows: RouteRow[] }) {
  return (
    <Card>
      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>Live route by flow</div>
        <div style={{ color: COLORS.faint, fontSize: 12, marginTop: 3 }}>
          Fallback attempts are collapsed into one operation. App version is shown when the gateway event carries it.
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={head}>Flow / app</th>
              <th style={head}>Primary model</th>
              <th style={numHead}>Operations</th>
              <th style={numHead}>Error</th>
              <th style={numHead}>Fallback</th>
              <th style={numHead}>Semantic invalid</th>
              <th style={numHead}>Latency p90</th>
              <th style={{ ...head, textAlign: "right" }}>State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const errorRate = rate(row.errors, row.requests);
              const fallbackRate = rate(row.fallbackRequests, row.requests);
              const semanticRate = rate(row.semanticInvalid, row.semanticChecked);
              const needsReview =
                (errorRate !== null && errorRate >= SLO.errorRate) ||
                (fallbackRate !== null && fallbackRate >= SLO.fallbackRate) ||
                (semanticRate !== null && semanticRate >= SLO.semanticInvalidRate);
              return (
                <tr key={`${row.flow}-${row.model}-${row.appVersion}-${index}`}>
                  <td style={{ ...cell, whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 600 }}>{row.flow}</div>
                    <div style={{ color: COLORS.faint, fontSize: 11.5 }}>
                      app {row.appVersion}
                    </div>
                  </td>
                  <td style={{ ...cell, whiteSpace: "nowrap" }}>{row.model}</td>
                  <td style={numCell}>{row.requests.toLocaleString()}</td>
                  <td style={numCell}>{pct(errorRate, 2)}</td>
                  <td
                    style={{
                      ...numCell,
                      color:
                        fallbackRate !== null && fallbackRate >= SLO.fallbackRate
                          ? COLORS.warn
                          : COLORS.ink,
                    }}
                  >
                    {pct(fallbackRate, 2)}
                  </td>
                  <td
                    style={{
                      ...numCell,
                      color:
                        semanticRate !== null &&
                        semanticRate >= SLO.semanticInvalidRate
                          ? COLORS.warn
                          : COLORS.ink,
                    }}
                  >
                    {pct(semanticRate, 2)} ({row.semanticInvalid}/{row.semanticChecked})
                  </td>
                  <td style={numCell}>{seconds(row.latencyP90Seconds)}</td>
                  <td style={{ ...cell, textAlign: "right" }}>
                    <StatusBadge
                      label={needsReview ? "review" : "inside"}
                      tone={needsReview ? "warn" : "good"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div style={{ padding: 16, color: COLORS.faint, fontSize: 13 }}>
          No attributed operations exist for the latest config in this window.
        </div>
      )}
    </Card>
  );
}

function StabilityCard({
  rows,
  liveConfigVersion,
  liveModel,
}: {
  rows: StabilityRow[];
  liveConfigVersion: string;
  liveModel: string;
}) {
  const sorted = [...rows].sort((a, b) => {
    const aLive =
      a.configVersion === liveConfigVersion &&
      canonicalModel(a.model) === canonicalModel(liveModel);
    const bLive =
      b.configVersion === liveConfigVersion &&
      canonicalModel(b.model) === canonicalModel(liveModel);
    if (aLive !== bLive) return aLive ? -1 : 1;
    return b.batches - a.batches;
  });

  return (
    <Card>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.line}` }}>
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>Live consistency proxy</div>
        <div style={{ color: COLORS.faint, fontSize: 12, marginTop: 3 }}>
          Same person, capture template, calendar day, intent, config, model, and app version. This is not exact-image replay; ranges are hidden below three batches.
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={head}>Route / app</th>
              <th style={head}>Intent</th>
              <th style={numHead}>Batches</th>
              <th style={numHead}>Photos</th>
              <th style={numHead}>Score p50</th>
              <th style={numHead}>Score p90</th>
              <th style={numHead}>BF p90</th>
              <th style={{ ...head, textAlign: "right" }}>State</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => {
              const isLive =
                row.configVersion === liveConfigVersion &&
                canonicalModel(row.model) === canonicalModel(liveModel);
              const scoreBreached =
                row.scoreP90 !== null && row.scoreP90 > SLO.liveScoreP90;
              const bfBreached = row.bfP90 !== null && row.bfP90 > SLO.liveBodyFatP90;
              const status: "good" | "warn" | "neutral" = row.suppressed
                ? "neutral"
                : scoreBreached || bfBreached
                  ? "warn"
                  : "good";
              return (
                <tr key={`${row.configVersion}-${row.model}-${row.appVersion}-${row.intent}-${index}`}>
                  <td style={{ ...cell, whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 600 }}>
                      {row.model} {isLive && <StatusBadge label="live" tone="good" />}
                    </div>
                    <div style={{ color: COLORS.faint, fontSize: 11.5 }}>
                      {row.appVersion} · {row.configVersion}
                    </div>
                  </td>
                  <td style={{ ...cell, whiteSpace: "nowrap" }}>{row.intent}</td>
                  <td style={numCell}>{row.batches}</td>
                  <td style={numCell}>{row.photos}</td>
                  <td style={numCell}>{points(row.scoreP50)}</td>
                  <td
                    style={{
                      ...numCell,
                      fontWeight: row.scoreP90 !== null ? 600 : 400,
                      color: scoreBreached ? COLORS.warn : COLORS.ink,
                    }}
                  >
                    {points(row.scoreP90)}
                  </td>
                  <td
                    style={{
                      ...numCell,
                      fontWeight: row.bfP90 !== null ? 600 : 400,
                      color: bfBreached ? COLORS.warn : COLORS.ink,
                    }}
                  >
                    {points(row.bfP90, " pp")}
                  </td>
                  <td style={{ ...cell, textAlign: "right" }}>
                    <StatusBadge
                      label={row.suppressed ? "sample small" : status === "good" ? "inside" : "review"}
                      tone={status}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div style={{ padding: 16, color: COLORS.faint, fontSize: 13 }}>
          No same-pose multi-photo batches exist in this window yet. This is a sample-size state, not a passing trust result.
        </div>
      )}
      {rows.length > 0 && (
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.line}` }}>
          <PanelNote>
            This is a broad drift detector. Imports grouped on one day may still be different historical photos, so a breach requires inspection and must not trigger a route change by itself.
          </PanelNote>
        </div>
      )}
    </Card>
  );
}

function FeedbackCard({ feedback }: { feedback: FeedbackData }) {
  const concerns =
    feedback.inconsistent + feedback.bodyFatOff + feedback.scoreOff;
  const versionCoverage = rate(feedback.configTagged, feedback.responses);

  return (
    <Card>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.line}` }}>
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>Calibration feedback</div>
        <div style={{ color: COLORS.faint, fontSize: 12, marginTop: 3 }}>
          Fixed-choice AI Score Calibration answers only. Unknown answers are counted as “other” and never returned as text.
        </div>
      </div>
      <StatRow>
        <Stat
          label="Responses"
          value={`${feedback.responses} / ${SLO.feedbackResponses}`}
          sub="minimum before using the rate"
          tone={feedback.responses >= SLO.feedbackResponses ? COLORS.good : COLORS.warn}
        />
        <Stat label="Matches" value={feedback.matches.toString()} sub="says the result matches" />
        <Stat
          label="Inconsistent"
          value={feedback.inconsistent.toString()}
          sub="similar photos / all over the place"
          tone={feedback.inconsistent > 0 ? COLORS.warn : COLORS.ink}
        />
        <Stat
          label="BF or score concern"
          value={(feedback.bodyFatOff + feedback.scoreOff).toString()}
          sub={`${concerns} total trust concerns`}
          tone={concerns > 0 ? COLORS.warn : COLORS.ink}
        />
        <Stat
          label="Config attribution"
          value={pct(versionCoverage)}
          sub="survey events need route metadata"
          tone={versionCoverage === 100 ? COLORS.good : COLORS.warn}
        />
      </StatRow>
      {feedback.responses < SLO.feedbackResponses && (
        <div style={{ padding: "0 16px 14px" }}>
          <PanelNote>
            Keep collecting. With {feedback.responses} response{feedback.responses === 1 ? "" : "s"}, individual answers are direct signals—not a reliable rate. The app still needs to attach the most recent scoring config/model to calibration submissions.
          </PanelNote>
        </div>
      )}
    </Card>
  );
}

function EvaluationCard({
  snapshot,
  liveModel,
}: {
  snapshot: ScoringEvalSnapshot | null;
  liveModel: string;
}) {
  if (!snapshot?.configured || !snapshot.models?.length) {
    return (
      <Card>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
            Controlled reference set
          </div>
          <PanelNote>
            Not connected. Generate the aggregate-only snapshot with <code>npm run build:scoring-eval</code> after an approved canonical eval. Raw images and model reasoning must never enter this site.
          </PanelNote>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div
        style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${COLORS.line}`,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>Controlled reference set</div>
          <div style={{ color: COLORS.faint, fontSize: 12, marginTop: 3 }}>
            {snapshot.manifestCases} consented cases × {snapshot.repetitions} repeats · source {snapshot.sourceGeneratedAt?.slice(0, 10) ?? "unknown"} · commit {snapshot.gainFrameCommit ?? "unknown"}
          </div>
        </div>
        <StatusBadge label="aggregate only" tone="neutral" />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={head}>Model</th>
              <th style={numHead}>Expectation pass</th>
              <th style={numHead}>Validator failures</th>
              <th style={numHead}>Score spread p90</th>
              <th style={numHead}>BF spread p90</th>
              <th style={numHead}>Latency p90</th>
              <th style={{ ...head, textAlign: "right" }}>Replay gate</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.models.map((model) => {
              const isLive = canonicalModel(model.model) === canonicalModel(liveModel);
              const replayPass =
                model.scoreSpread.p90 !== null &&
                model.scoreSpread.p90 <= SLO.exactReplayP90;
              return (
                <tr
                  key={model.model}
                  style={{ background: isLive ? "#f7fbf8" : undefined }}
                >
                  <td style={{ ...cell, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {model.model} {isLive && <StatusBadge label="live" tone="good" />}
                  </td>
                  <td style={numCell}>
                    {model.passedCells}/{model.gradedCells} ({pct(model.passRatePercent)})
                  </td>
                  <td
                    style={{
                      ...numCell,
                      color: model.validationFailures > 0 ? COLORS.warn : COLORS.good,
                      fontWeight: model.validationFailures > 0 ? 600 : 400,
                    }}
                  >
                    {model.validationFailures}/{model.runs}
                  </td>
                  <td
                    style={{
                      ...numCell,
                      color: replayPass ? COLORS.good : COLORS.warn,
                      fontWeight: 600,
                    }}
                  >
                    {points(model.scoreSpread.p90)}
                  </td>
                  <td style={numCell}>{points(model.bodyFatSpread.p90, " pp")}</td>
                  <td style={numCell}>
                    {model.latency.p90Ms === null ? "—" : `${(model.latency.p90Ms / 1000).toFixed(2)}s`}
                  </td>
                  <td style={{ ...cell, textAlign: "right" }}>
                    <StatusBadge
                      label={replayPass ? "inside" : `>${SLO.exactReplayP90} pts`}
                      tone={replayPass ? "good" : "warn"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.line}` }}>
        <PanelNote>
          This snapshot is evidence, not a switch. The live 3.7 route may pass expected score/BF ranges while still missing the stricter ≤{SLO.exactReplayP90}-point repeatability target. Any route decision stays manual and must consider live captures, feedback, and operational health together.
        </PanelNote>
      </div>
    </Card>
  );
}
