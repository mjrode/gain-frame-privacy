"use client";

// Single-operator admin dashboard. V1 scope: AI flow usage — which models
// serve which flow, request counts, error rates, cost, and the prompt
// templates behind each flow (expandable).
//
// Auth: Google OAuth via Supabase (the app's existing auth project). The
// client-side email check is cosmetic UX only — the worker independently
// verifies the bearer token and allowlist on /api/admin/* and /admin-data/*.

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qpctmhhnomeeyajbivne.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6kXa8qaaix3McgqohdzCkw_HNoZFlKw";
const ADMIN_EMAILS = ["michaelrode44@gmail.com"];

interface FlowModelRow {
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

interface UsageResponse {
  windowDays: number;
  generatedAt: string;
  rows: FlowModelRow[];
}

interface PromptSource {
  file: string;
  excerpts: string[];
}

interface PromptSnapshot {
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
}

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

function summarize(rows: FlowModelRow[]): FlowSummary[] {
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
  return [...byFlow.values()].sort((a, b) => b.requests - a.requests);
}

function errorRateLabel(errors: number, requests: number): string {
  if (requests === 0) return "—";
  return `${((errors / requests) * 100).toFixed(1)}%`;
}

function errorColor(errors: number, requests: number): string {
  if (requests === 0 || errors === 0) return "#1a7f37";
  const rate = errors / requests;
  if (rate < 0.02) return "#9a6700";
  return "#c93838";
}

const cellStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
  fontSize: 14,
  verticalAlign: "top",
  textAlign: "left",
};

const headStyle: React.CSSProperties = {
  ...cellStyle,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#666",
  borderBottom: "2px solid #ddd",
  whiteSpace: "nowrap",
};

export default function AdminClient() {
  const supabase = useMemo(getSupabase, []);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [prompts, setPrompts] = useState<PromptSnapshot | null>(null);
  const [windowChoice, setWindowChoice] = useState<"7d" | "24h">("7d");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const email = session?.user.email?.toLowerCase() ?? null;
  const isAdmin = email !== null && ADMIN_EMAILS.includes(email);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    const headers = { Authorization: `Bearer ${session.access_token}` };
    try {
      const [usageRes, promptsRes] = await Promise.all([
        fetch(`/api/admin/ai-flows?window=${windowChoice}`, { headers }),
        prompts
          ? Promise.resolve(null)
          : fetch("/admin-data/ai-prompts.json", { headers }),
      ]);
      if (!usageRes.ok) {
        throw new Error(
          usageRes.status === 401
            ? "This account is not authorized."
            : `Usage query failed (${usageRes.status}).`,
        );
      }
      setUsage((await usageRes.json()) as UsageResponse);
      if (promptsRes) {
        if (promptsRes.ok) {
          setPrompts((await promptsRes.json()) as PromptSnapshot);
        } else {
          console.warn(`prompt snapshot fetch failed (${promptsRes.status})`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }, [session, windowChoice, prompts]);

  useEffect(() => {
    if (session && isAdmin) void load();
  }, [session, isAdmin, load]);

  if (!authReady) {
    return <p style={{ color: "#555" }}>Loading…</p>;
  }

  if (!session) {
    return (
      <div style={{ textAlign: "center", paddingTop: 96 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>GainFrame Admin</h1>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Sign in with the operator account to continue.
        </p>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/admin/` },
            })
          }
          style={{
            padding: "12px 28px",
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: "center", paddingTop: 96 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Not authorized</h1>
        <p style={{ color: "#555", marginBottom: 24 }}>
          {email} does not have access to this page.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  const summaries = usage ? summarize(usage.rows) : [];

  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>AI Flows</h1>
          <p style={{ color: "#666", fontSize: 13, margin: "4px 0 0" }}>
            {usage
              ? `Last ${usage.windowDays === 1 ? "24 hours" : "7 days"} · refreshed ${new Date(usage.generatedAt).toLocaleTimeString()}`
              : "Loading usage…"}
            {prompts &&
              ` · prompt snapshot ${prompts.gain_frame_commit} (${prompts.generated_at.slice(0, 10)})`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(["24h", "7d"] as const).map((choice) => (
            <button
              key={choice}
              onClick={() => setWindowChoice(choice)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid #ccc",
                background: windowChoice === choice ? "#1a1a1a" : "#fff",
                color: windowChoice === choice ? "#fff" : "#1a1a1a",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {choice}
            </button>
          ))}
          <button
            onClick={() => void load()}
            disabled={loading}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid #ccc",
              background: "#fff",
              fontSize: 13,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              background: "transparent",
              color: "#888",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <p
          style={{
            padding: "12px 16px",
            background: "#fdecec",
            color: "#c93838",
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {error}
        </p>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={headStyle}>Flow</th>
              <th style={headStyle}>Models</th>
              <th style={{ ...headStyle, textAlign: "right" }}>Requests</th>
              <th style={{ ...headStyle, textAlign: "right" }}>Error rate</th>
              <th style={{ ...headStyle, textAlign: "right" }}>Cost</th>
              <th style={headStyle}>Last seen</th>
              <th style={headStyle} />
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => {
              const promptEntry = prompts?.flows[summary.flow];
              const hasPrompts =
                promptEntry !== undefined && promptEntry.sources.length > 0;
              const isOpen = expanded === summary.flow;
              return (
                <FlowRows
                  key={summary.flow}
                  summary={summary}
                  promptSources={hasPrompts ? promptEntry.sources : null}
                  isOpen={isOpen}
                  onToggle={() =>
                    setExpanded(isOpen ? null : summary.flow)
                  }
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {usage && summaries.length === 0 && (
        <p style={{ color: "#666" }}>No AI traffic in this window.</p>
      )}
    </div>
  );
}

function FlowRows({
  summary,
  promptSources,
  isOpen,
  onToggle,
}: {
  summary: FlowSummary;
  promptSources: PromptSource[] | null;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        style={{ cursor: "pointer", background: isOpen ? "#fafafa" : undefined }}
      >
        <td style={{ ...cellStyle, fontWeight: 600, whiteSpace: "nowrap" }}>
          {summary.flow}
        </td>
        <td style={cellStyle}>
          {summary.models.map((m) => (
            <span
              key={`${m.model}-${m.provider}`}
              title={`${m.provider} · ${m.requests} requests${m.fallbackRequests ? ` · ${m.fallbackRequests} via fallback` : ""}`}
              style={{
                display: "inline-block",
                padding: "2px 10px",
                margin: "0 6px 4px 0",
                borderRadius: 999,
                background: m.provider === "openai" ? "#eef4ff" : "#eefaf0",
                border: "1px solid #dde",
                fontSize: 12.5,
                whiteSpace: "nowrap",
              }}
            >
              {m.model} · {m.requests.toLocaleString()}
            </span>
          ))}
        </td>
        <td style={{ ...cellStyle, textAlign: "right" }}>
          {summary.requests.toLocaleString()}
        </td>
        <td
          style={{
            ...cellStyle,
            textAlign: "right",
            color: errorColor(summary.errors, summary.requests),
            fontWeight: summary.errors > 0 ? 600 : 400,
          }}
        >
          {errorRateLabel(summary.errors, summary.requests)}
        </td>
        <td style={{ ...cellStyle, textAlign: "right", whiteSpace: "nowrap" }}>
          ${summary.costUsd.toFixed(2)}
        </td>
        <td style={{ ...cellStyle, whiteSpace: "nowrap", color: "#666" }}>
          {summary.lastSeen.slice(0, 16)}
        </td>
        <td style={{ ...cellStyle, color: "#888", whiteSpace: "nowrap" }}>
          {promptSources ? (isOpen ? "Hide prompt ▲" : "Prompt ▼") : ""}
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={7} style={{ ...cellStyle, background: "#fafafa" }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
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
                        border: "1px solid #eee",
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
              <p style={{ fontSize: 13, color: "#888" }}>
                No prompt template captured for this flow.
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
