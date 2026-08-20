"use client";

// AI flows: what SHOULD serve each flow, what actually did, and what it cost.
//
// The two columns answer different questions and both matter:
//
//   Serving  — the applied route config (primary / candidate / fallback). This
//              is what every new request routes to going forward.
//   Observed — models that actually appeared in telemetry over the window.
//              This lags: old app versions, cached responses, and in-flight
//              retries keep reporting retired models for days after a config
//              change.
//
// A model observed that is NOT in the flow's configured set is flagged as
// drift. That is the exact shape of the incident where an ungraded model
// served 100% of scoring traffic without anyone noticing.

import { useState } from "react";
import {
  COLORS,
  Card,
  Loading,
  PanelError,
  Section,
  Sparkline,
  cell,
  head,
  money,
  numCell,
  numHead,
  pct,
} from "./shared";

export interface FlowModelRow {
  flow: string;
  model: string;
  provider: string;
  requests: number;
  errors: number;
  costUsd: number;
  fallbackRequests: number;
  lastSeen: string;
  promptVersion: string | null;
  configVersion: string | null;
}

export interface FlowsData {
  windowDays: number;
  generatedAt: string;
  rows: FlowModelRow[];
  costTrend: Array<{
    day: string;
    costUsd: number;
    requests: number;
    users: number;
    cachedTokens: number;
    inputTokens: number;
  }>;
  topSpenders: Array<{
    person: string;
    costUsd: number;
    requests: number;
    flows: number;
  }>;
}

export interface RouteConfig {
  primary_model?: string | null;
  candidate_model?: string | null;
  candidate_percent?: number | null;
  fallback_model?: string | null;
  enabled?: boolean | null;
}

export interface RoutesSnapshot {
  generated_at: string;
  gain_frame_commit: string;
  latest: string | null;
  configs: Record<
    string,
    {
      config_version: string;
      reason: string | null;
      routes: Record<string, RouteConfig>;
    }
  >;
}

export interface PromptSource {
  file: string;
  excerpts: string[];
}

export interface PromptSnapshot {
  generated_at: string;
  gain_frame_commit: string;
  flows: Record<string, { sources: PromptSource[] }>;
}

interface FlowSummary {
  flow: string;
  requests: number;
  errors: number;
  costUsd: number;
  lastSeen: string;
  promptVersion: string | null;
  configVersion: string | null;
  models: FlowModelRow[];
  route: RouteConfig | null;
  drift: string[];
}

function providerTone(model: string): { bg: string; fg: string } {
  if (model.startsWith("gpt") || model.includes("luna"))
    return { bg: "#eef2ff", fg: "#3730a3" };
  if (model.startsWith("gemini")) return { bg: "#ecfdf3", fg: "#166534" };
  if (model.startsWith("grok")) return { bg: "#fdf2f8", fg: "#9d174d" };
  return { bg: "#f4f4f5", fg: "#3f3f46" };
}

function ModelChip({
  model,
  suffix,
  dim = false,
  title,
}: {
  model: string;
  suffix?: string;
  dim?: boolean;
  title?: string;
}) {
  const tone = providerTone(model);
  return (
    <span
      title={title}
      style={{
        display: "inline-block",
        padding: "2px 9px",
        margin: "0 5px 4px 0",
        borderRadius: 999,
        background: dim ? "transparent" : tone.bg,
        color: dim ? COLORS.faint : tone.fg,
        border: `1px solid ${dim ? COLORS.line : "transparent"}`,
        fontSize: 12,
        whiteSpace: "nowrap",
        fontWeight: dim ? 400 : 600,
      }}
    >
      {model}
      {suffix && (
        <span style={{ opacity: 0.75, fontWeight: 400 }}> {suffix}</span>
      )}
    </span>
  );
}

/** Models the config permits for a flow — anything else observed is drift. */
function allowedModels(route: RouteConfig | null): Set<string> {
  const set = new Set<string>();
  if (!route) return set;
  for (const m of [
    route.primary_model,
    route.candidate_model,
    route.fallback_model,
  ]) {
    if (m) set.add(m);
  }
  return set;
}

/**
 * Drift is only meaningful against *current* traffic. A multi-day window spans
 * several config eras, so without this cutoff every config change would light
 * up as drift for as long as the window is wide.
 */
const DRIFT_LOOKBACK_HOURS = 24;

function driftCutoff(): string {
  // lastSeen arrives as "YYYY-MM-DD HH:MM:SS.ffffff" (UTC), so a lexical
  // comparison against the same shape is a valid time comparison.
  return new Date(Date.now() - DRIFT_LOOKBACK_HOURS * 3600 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
}

function summarize(
  rows: FlowModelRow[],
  routes: Record<string, RouteConfig>,
): FlowSummary[] {
  const byFlow = new Map<string, FlowSummary>();

  for (const row of rows) {
    const existing = byFlow.get(row.flow);
    if (!existing) {
      byFlow.set(row.flow, {
        flow: row.flow,
        requests: row.requests,
        errors: row.errors,
        costUsd: row.costUsd,
        lastSeen: row.lastSeen,
        promptVersion: row.promptVersion,
        configVersion: row.configVersion,
        models: [row],
        route: routes[row.flow] ?? null,
        drift: [],
      });
      continue;
    }
    existing.requests += row.requests;
    existing.errors += row.errors;
    existing.costUsd += row.costUsd;
    if (row.lastSeen > existing.lastSeen) {
      existing.lastSeen = row.lastSeen;
      existing.promptVersion = row.promptVersion ?? existing.promptVersion;
      existing.configVersion = row.configVersion ?? existing.configVersion;
    }
    existing.models.push(row);
  }

  // Flows that are configured but had no traffic still belong in the table —
  // "nothing ran" is a legitimate and sometimes surprising answer.
  for (const [flow, route] of Object.entries(routes)) {
    if (byFlow.has(flow)) continue;
    byFlow.set(flow, {
      flow,
      requests: 0,
      errors: 0,
      costUsd: 0,
      lastSeen: "",
      promptVersion: null,
      configVersion: null,
      models: [],
      route,
      drift: [],
    });
  }

  const cutoff = driftCutoff();
  for (const summary of byFlow.values()) {
    const allowed = allowedModels(summary.route);
    if (allowed.size === 0) continue;
    summary.drift = [
      ...new Set(
        summary.models
          .filter(
            (m) =>
              m.requests > 0 && m.lastSeen >= cutoff && !allowed.has(m.model),
          )
          .map((m) => m.model),
      ),
    ];
  }

  return [...byFlow.values()].sort((a, b) => b.requests - a.requests);
}

export default function FlowsPanel({
  data,
  routes,
  prompts,
  error,
}: {
  data: FlowsData | null;
  routes: RoutesSnapshot | null;
  prompts: PromptSnapshot | null;
  error: string | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (error) {
    return (
      <Section title="AI flows">
        <PanelError message={error} />
      </Section>
    );
  }
  if (!data) {
    return (
      <Section title="AI flows">
        <Loading />
      </Section>
    );
  }

  // The live config is the one carried by the *most recent* request, not the
  // busiest one — a wide window contains several config eras, and the newest
  // is what serves traffic now. Falls back to the newest snapshot when no
  // observed version is present in the snapshot.
  const versioned = data.rows.filter(
    (r) => r.configVersion && routes?.configs[r.configVersion],
  );
  const liveVersion =
    (versioned.length > 0
      ? versioned.reduce((best, r) => (r.lastSeen > best.lastSeen ? r : best))
          .configVersion
      : null) ??
    routes?.latest ??
    null;
  const liveConfig = liveVersion ? routes?.configs[liveVersion] : undefined;
  const routeMap = liveConfig?.routes ?? {};

  const summaries = summarize(data.rows, routeMap);
  const drifting = summaries.filter((s) => s.drift.length > 0);

  const trend = [...data.costTrend].reverse();
  const cached = trend.reduce((s, d) => s + d.cachedTokens, 0);
  const input = trend.reduce((s, d) => s + d.inputTokens, 0);
  const cacheRate = input > 0 ? (cached / input) * 100 : null;
  const spend30d = trend.reduce((s, d) => s + d.costUsd, 0);

  return (
    <Section
      title="AI flows"
      subtitle={
        <>
          Serving config{" "}
          <code style={{ color: COLORS.ink }}>{liveVersion ?? "unknown"}</code>
          {liveConfig ? ` · ${Object.keys(routeMap).length} routes` : " · config snapshot unavailable"}
          {routes && liveVersion && routes.latest !== liveVersion && (
            <span style={{ color: COLORS.warn }}>
              {" "}· newest snapshotted is {routes.latest}
            </span>
          )}
        </>
      }
    >
      {drifting.length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fff8e6",
            border: "1px solid #f0d9a0",
            borderRadius: 10,
            fontSize: 13.5,
            marginBottom: 12,
            color: "#7a5a00",
          }}
        >
          <strong>
            {drifting.length} flow{drifting.length === 1 ? "" : "s"} served a
            model outside the applied config in the last{" "}
            {DRIFT_LOOKBACK_HOURS}h:
          </strong>{" "}
          {drifting
            .slice(0, 4)
            .map((d) => `${d.flow} (${d.drift.join(", ")})`)
            .join("; ")}
          {drifting.length > 4 && ` and ${drifting.length - 4} more`}. Older app
          builds route on their own and cause this legitimately — but check it
          is not a config that failed to apply.
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>
            Daily AI spend, 30 days — {money(spend30d, 2)} total
          </div>
          <Sparkline values={trend.map((d) => d.costUsd)} width={360} />
        </div>
        {cacheRate !== null && (
          <div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>
              Prompt cache hit rate
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {pct(cacheRate)}
            </div>
            <div style={{ fontSize: 12, color: COLORS.faint }}>
              {(cached / 1e6).toFixed(1)}M of {(input / 1e6).toFixed(1)}M input
              tokens
            </div>
          </div>
        )}
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={head}>Flow</th>
                <th style={head}>Serving (configured)</th>
                <th style={head}>Observed ({data.windowDays}d)</th>
                <th style={numHead}>Requests</th>
                <th style={numHead}>Errors</th>
                <th style={numHead}>Cost</th>
                <th style={head} />
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => {
                const isOpen = expanded === s.flow;
                const promptEntry = prompts?.flows[s.flow];
                const hasPrompts = (promptEntry?.sources.length ?? 0) > 0;
                const errorRate =
                  s.requests > 0 ? (s.errors / s.requests) * 100 : null;
                return (
                  <FlowRow
                    key={s.flow}
                    summary={s}
                    isOpen={isOpen}
                    errorRate={errorRate}
                    promptSources={hasPrompts ? promptEntry!.sources : null}
                    onToggle={() => setExpanded(isOpen ? null : s.flow)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {data.topSpenders.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: COLORS.muted,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Heaviest users ({data.windowDays}d)
          </div>
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th style={head}>Person</th>
                    <th style={numHead}>Cost</th>
                    <th style={numHead}>Requests</th>
                    <th style={numHead}>Flows used</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSpenders.map((sp) => (
                    <tr key={sp.person}>
                      <td
                        style={{
                          ...cell,
                          fontFamily: "ui-monospace, monospace",
                          fontSize: 12,
                          color: COLORS.muted,
                        }}
                      >
                        {sp.person.slice(0, 8)}…
                      </td>
                      <td
                        style={{
                          ...numCell,
                          fontWeight: sp.costUsd >= 1 ? 600 : 400,
                          color: sp.costUsd >= 1 ? COLORS.warn : COLORS.ink,
                        }}
                      >
                        {money(sp.costUsd, 2)}
                      </td>
                      <td style={numCell}>{sp.requests.toLocaleString()}</td>
                      <td style={numCell}>{sp.flows}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </Section>
  );
}

function FlowRow({
  summary,
  isOpen,
  errorRate,
  promptSources,
  onToggle,
}: {
  summary: FlowSummary;
  isOpen: boolean;
  errorRate: number | null;
  promptSources: PromptSource[] | null;
  onToggle: () => void;
}) {
  const route = summary.route;
  const idle = summary.requests === 0;

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          cursor: "pointer",
          background: isOpen ? COLORS.surface : undefined,
          opacity: idle ? 0.6 : 1,
        }}
      >
        <td style={{ ...cell, fontWeight: 600, whiteSpace: "nowrap" }}>
          {summary.flow}
          {summary.drift.length > 0 && (
            <span
              title={`Observed outside config: ${summary.drift.join(", ")}`}
              style={{
                marginLeft: 6,
                fontSize: 10.5,
                color: COLORS.warn,
                fontWeight: 700,
              }}
            >
              DRIFT
            </span>
          )}
        </td>
        <td style={cell}>
          {route ? (
            <>
              {route.primary_model ? (
                <ModelChip model={route.primary_model} title="Primary model" />
              ) : (
                <span style={{ color: COLORS.faint, fontSize: 12 }}>
                  no primary
                </span>
              )}
              {route.candidate_model && (route.candidate_percent ?? 0) > 0 && (
                <ModelChip
                  model={route.candidate_model}
                  suffix={`${route.candidate_percent}%`}
                  title="Candidate (experiment split)"
                />
              )}
              {route.fallback_model && (
                <ModelChip
                  model={route.fallback_model}
                  suffix="fallback"
                  dim
                  title="Used only when the primary fails"
                />
              )}
            </>
          ) : (
            <span style={{ color: COLORS.faint, fontSize: 12 }}>
              not in config
            </span>
          )}
        </td>
        <td style={cell}>
          {idle ? (
            <span style={{ color: COLORS.faint, fontSize: 12 }}>no traffic</span>
          ) : (
            summary.models.map((m) => {
              const off =
                route !== null && !allowedModels(route).has(m.model);
              return (
                <span
                  key={`${m.model}-${m.provider}`}
                  style={{
                    display: "inline-block",
                    padding: "2px 9px",
                    margin: "0 5px 4px 0",
                    borderRadius: 999,
                    background: off ? "#fff4e5" : "#f4f4f5",
                    border: `1px solid ${off ? "#f0d9a0" : COLORS.line}`,
                    color: off ? "#7a5a00" : COLORS.ink,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                  title={`${m.provider} · ${m.requests} requests${
                    m.fallbackRequests ? ` · ${m.fallbackRequests} via fallback` : ""
                  }`}
                >
                  {m.model} · {m.requests.toLocaleString()}
                </span>
              );
            })
          )}
        </td>
        <td style={numCell}>{summary.requests.toLocaleString()}</td>
        <td
          style={{
            ...numCell,
            color:
              errorRate === null || errorRate === 0
                ? COLORS.good
                : errorRate < 2
                  ? COLORS.warn
                  : COLORS.bad,
            fontWeight: summary.errors > 0 ? 600 : 400,
          }}
        >
          {errorRate === null ? "—" : pct(errorRate)}
        </td>
        <td style={numCell}>{money(summary.costUsd, 2)}</td>
        <td style={{ ...cell, color: COLORS.faint, whiteSpace: "nowrap" }}>
          {promptSources ? (isOpen ? "Hide ▲" : "Prompt ▼") : ""}
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={7} style={{ ...cell, background: COLORS.surface }}>
            <div style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 10 }}>
              {summary.lastSeen && (
                <span style={{ marginRight: 16 }}>
                  last seen <code>{summary.lastSeen.slice(0, 16)}</code>
                </span>
              )}
              {summary.promptVersion && (
                <span style={{ marginRight: 16 }}>
                  live prompt_version: <code>{summary.promptVersion}</code>
                </span>
              )}
              {summary.configVersion && (
                <span>
                  live config_version: <code>{summary.configVersion}</code>
                </span>
              )}
            </div>
            {promptSources ? (
              promptSources.map((source) => (
                <details key={source.file} style={{ marginBottom: 8 }}>
                  <summary
                    style={{ cursor: "pointer", fontSize: 13, color: "#444" }}
                  >
                    {source.file} ({source.excerpts.length} excerpt
                    {source.excerpts.length === 1 ? "" : "s"})
                  </summary>
                  {source.excerpts.map((excerpt, i) => (
                    <pre
                      key={i}
                      style={{
                        whiteSpace: "pre-wrap",
                        background: "#fff",
                        border: `1px solid ${COLORS.line}`,
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 12.5,
                        margin: "8px 0",
                        maxHeight: 420,
                        overflowY: "auto",
                      }}
                    >
                      {excerpt}
                    </pre>
                  ))}
                </details>
              ))
            ) : (
              <p style={{ fontSize: 13, color: COLORS.faint, margin: 0 }}>
                No prompt template captured for this flow.
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
