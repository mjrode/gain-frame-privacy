"use client";

// Single-operator admin dashboard shell: auth, window selection, and the
// per-panel fetches.
//
// Each panel fetches independently and renders its own error state, so one
// failing upstream (RevenueCat down, a PostHog key missing) degrades that
// panel alone instead of blanking the page.
//
// Auth: Google OAuth via Supabase. The client-side email check is cosmetic —
// the worker independently verifies the bearer token and the allowlist on
// every /api/admin/* and /admin-data/* request.

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import MoneyStrip, { type MoneyData } from "./MoneyStrip";
import FunnelPanel, { type ProductData } from "./FunnelPanel";
import FlowsPanel, {
  type FlowsData,
  type PromptSnapshot,
  type RoutesSnapshot,
} from "./FlowsPanel";
import ScoringTrustPanel, {
  type ScoringEvalSnapshot,
  type ScoringTrustData,
} from "./ScoringTrustPanel";
import ReliabilityPanel from "./ReliabilityPanel";
import { COLORS } from "./shared";

const SUPABASE_URL = "https://qpctmhhnomeeyajbivne.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6kXa8qaaix3McgqohdzCkw_HNoZFlKw";
const ADMIN_EMAILS = ["michaelrode44@gmail.com"];

type Window = "7d" | "14d" | "30d";

const WINDOWS: Window[] = ["7d", "14d", "30d"];

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 14px",
    borderRadius: 999,
    border: `1px solid ${active ? COLORS.ink : COLORS.line}`,
    background: active ? COLORS.ink : "#fff",
    color: active ? "#fff" : COLORS.ink,
    fontSize: 13,
    cursor: "pointer",
  };
}

async function getJson<T>(
  url: string,
  token: string,
  label: string,
): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    if (res.status === 401) throw new Error("This account is not authorized.");
    let detail = "";
    try {
      detail = ((await res.json()) as { error?: string }).error ?? "";
    } catch {
      /* body was not JSON — the status alone is the signal */
    }
    throw new Error(detail || `${label} failed (${res.status}).`);
  }
  return (await res.json()) as T;
}

export default function AdminClient() {
  const supabase = useMemo(
    () => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY),
    [],
  );
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [windowChoice, setWindowChoice] = useState<Window>("7d");
  const [loading, setLoading] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  const [money, setMoney] = useState<MoneyData | null>(null);
  const [moneyError, setMoneyError] = useState<string | null>(null);
  const [flows, setFlows] = useState<FlowsData | null>(null);
  const [flowsError, setFlowsError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [scoring, setScoring] = useState<ScoringTrustData | null>(null);
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<PromptSnapshot | null>(null);
  const [routes, setRoutes] = useState<RoutesSnapshot | null>(null);
  const [scoringEval, setScoringEval] =
    useState<ScoringEvalSnapshot | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const email = session?.user.email?.toLowerCase() ?? null;
  const isAdmin = email !== null && ADMIN_EMAILS.includes(email);

  const load = useCallback(async () => {
    if (!session) return;
    const token = session.access_token;
    setLoading(true);

    const tasks: Array<Promise<unknown>> = [
      getJson<MoneyData>("/api/admin/money", token, "Revenue query")
        .then((d) => {
          setMoney(d);
          setMoneyError(null);
        })
        .catch((e: Error) => setMoneyError(e.message)),
      getJson<FlowsData>(
        `/api/admin/ai-flows?window=${windowChoice}`,
        token,
        "Usage query",
      )
        .then((d) => {
          setFlows(d);
          setFlowsError(null);
        })
        .catch((e: Error) => setFlowsError(e.message)),
      getJson<ProductData>(
        `/api/admin/product?window=${windowChoice}`,
        token,
        "Product query",
      )
        .then((d) => {
          setProduct(d);
          setProductError(null);
        })
        .catch((e: Error) => setProductError(e.message)),
      getJson<ScoringTrustData>(
        `/api/admin/scoring-trust?window=${windowChoice}`,
        token,
        "Scoring trust query",
      )
        .then((d) => {
          setScoring(d);
          setScoringError(null);
        })
        .catch((e: Error) => setScoringError(e.message)),
    ];

    // Static snapshots only need fetching once per session.
    if (!prompts) {
      tasks.push(
        getJson<PromptSnapshot>("/admin-data/ai-prompts.json", token, "Prompts")
          .then(setPrompts)
          .catch((e: Error) => console.warn("prompt snapshot:", e.message)),
      );
    }
    if (!routes) {
      tasks.push(
        getJson<RoutesSnapshot>("/admin-data/ai-routes.json", token, "Routes")
          .then(setRoutes)
          .catch((e: Error) => console.warn("route snapshot:", e.message)),
      );
    }
    if (!scoringEval) {
      tasks.push(
        getJson<ScoringEvalSnapshot>(
          "/admin-data/scoring-eval.json",
          token,
          "Scoring evaluation",
        )
          .then(setScoringEval)
          .catch((e: Error) =>
            console.warn("scoring evaluation snapshot:", e.message),
          ),
      );
    }

    await Promise.all(tasks);
    setLastLoaded(new Date());
    setLoading(false);
  }, [session, windowChoice, prompts, routes, scoringEval]);

  useEffect(() => {
    if (session && isAdmin) void load();
  }, [session, isAdmin, load]);

  if (!authReady) return <p style={{ color: COLORS.muted }}>Loading…</p>;

  if (!session) {
    return (
      <div style={{ textAlign: "center", paddingTop: 96 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>GainFrame Admin</h1>
        <p style={{ color: COLORS.muted, marginBottom: 24 }}>
          Sign in with the operator account to continue.
        </p>
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${globalThis.location.origin}/admin/` },
            })
          }
          style={{
            padding: "12px 28px",
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 8,
            border: `1px solid ${COLORS.line}`,
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
        <p style={{ color: COLORS.muted, marginBottom: 24 }}>
          {email} does not have access to this page.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: `1px solid ${COLORS.line}`,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>GainFrame Admin</h1>
          <p style={{ color: COLORS.faint, fontSize: 12.5, margin: "4px 0 0" }}>
            {lastLoaded
              ? `Refreshed ${lastLoaded.toLocaleTimeString()}`
              : "Loading…"}
            {prompts && ` · snapshots at ${prompts.gain_frame_commit}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {WINDOWS.map((choice) => (
            <button
              key={choice}
              onClick={() => setWindowChoice(choice)}
              style={pillStyle(windowChoice === choice)}
            >
              {choice}
            </button>
          ))}
          <button
            onClick={() => void load()}
            disabled={loading}
            style={{
              ...pillStyle(false),
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
              color: COLORS.faint,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <MoneyStrip data={money} error={moneyError} />
      <FunnelPanel data={product} error={productError} />
      <ScoringTrustPanel
        data={scoring}
        evaluation={scoringEval}
        error={scoringError}
      />
      <FlowsPanel
        data={flows}
        routes={routes}
        prompts={prompts}
        error={flowsError}
      />
      <ReliabilityPanel data={product} error={productError} />
    </div>
  );
}
