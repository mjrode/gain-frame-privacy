"use client";

import { useEffect, useRef, useState } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import {
  getPosthogDistinctId,
  getWebAnalyticsContext,
  track,
} from "@/lib/analytics";
import { documentAnalyticsConsentGranted } from "@/lib/analytics-consent";
import { buildToolResultCtaExperiment } from "@/lib/tool-cta-experiment";
import { trackToolFunnelStep } from "@/lib/tool-funnel";
import { reportWebToolCompletion } from "@/lib/web-tool-usage";

const FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/ab-analyze";

const CTA_CAMPAIGN = "ab_analyzer";
const MASCOT_SRC = "/assets/gainframe-guy/poses/gainframe-guy-wave.webp";

type Sex = "male" | "female" | "skip";
type Confidence = "low" | "medium" | "high";

type Regions = {
  upper_abs: number;
  lower_abs: number;
  obliques: number;
};

type Analysis = {
  score: number;
  band: string;
  regions: Regions;
  estimated_bf_low: number;
  estimated_bf_high: number;
  months_to_visible_low: number | null;
  months_to_visible_high: number | null;
  timeline_note: string;
  headline: string;
  biggest_lever: string;
  confidence: Confidence;
  remaining_lifetime: number;
};

type Stage =
  | { kind: "idle" }
  | { kind: "processing" }
  | { kind: "result"; analysis: Analysis }
  | { kind: "unusable"; message: string }
  // lifetime: true = all 3 free scans used, terminal, vs the daily limit
  // where tomorrow works.
  | { kind: "rate_limited"; message: string; lifetime: boolean }
  | { kind: "error"; message: string };

type ErrorResponse = { error: string; message?: string };

const PROCESSING_MESSAGES = [
  "Reading the photo",
  "Finding the ab region",
  "Estimating body fat",
  "Projecting your timeline",
];

const REGION_LABELS: Array<{ key: keyof Regions; label: string; hint: string }> = [
  { key: "upper_abs", label: "Upper abs", hint: "The rows above the navel, first to show" },
  { key: "lower_abs", label: "Lower abs", hint: "Below the navel, usually last to show" },
  { key: "obliques", label: "Obliques", hint: "The side wall, visible only when genuinely lean" },
];

function getOrCreateClientId(): string {
  // Shared with the BF tool and physique rater on purpose: same browser, same
  // anonymous id. Quotas stay separate because the function salts per tool.
  const KEY = "gf_tid";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
  } catch {
    /* localStorage may be blocked */
  }
  const id = crypto.randomUUID();
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

async function preprocessImage(
  file: File,
  maxDim = 1024,
): Promise<{ base64: string; sizeKb: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read that image."));
      el.src = url;
    });
    const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported in this browser.");
    ctx.drawImage(img, 0, 0, w, h);
    const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1] ?? "";
    return { base64, sizeKb: Math.round((base64.length * 3) / 4 / 1024) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function timelineHeadline(analysis: Analysis): string {
  const { months_to_visible_low: low, months_to_visible_high: high } = analysis;
  if (low === null || high === null) return "Timeline unavailable";
  if (high === 0) return "Visible now";
  if (low === high) return `~${high} month${high === 1 ? "" : "s"}`;
  return `~${low} to ${high} months`;
}

function ScoreRing({ score, band }: { score: number; band: string }) {
  const CIRC = 2 * Math.PI * 54;
  const dash = (Math.min(100, Math.max(0, score)) / 100) * CIRC;
  return (
    <div className="pr-ring" role="img" aria-label={`Ab score ${score} out of 100, ${band}`}>
      <svg viewBox="0 0 128 128" aria-hidden>
        <circle className="pr-ring-track" cx="64" cy="64" r="54" />
        <circle
          className="pr-ring-fill"
          cx="64"
          cy="64"
          r="54"
          style={{ strokeDasharray: `${dash} ${CIRC}` }}
        />
      </svg>
      <div className="pr-ring-center">
        <span className="pr-ring-score">{score}</span>
        <span className="pr-ring-of">/ 100</span>
      </div>
    </div>
  );
}

function RegionBar({ label, hint, value }: { label: string; hint: string; value: number }) {
  return (
    <div className="pr-sub">
      <div className="pr-sub-head">
        <span className="pr-sub-label">{label}</span>
        <span className="pr-sub-value">{value}</span>
      </div>
      <div
        className="pr-sub-track"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={label}
      >
        <span className="pr-sub-fill" style={{ width: `${value}%` }} />
      </div>
      <p className="pr-sub-hint">{hint}</p>
    </div>
  );
}

export default function AbAnalyzerClient() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [sex, setSex] = useState<Sex>("skip");
  const [preview, setPreview] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackToolFunnelStep(CTA_CAMPAIGN, "viewed", { input_mode: "photo" });
  }, []);

  useEffect(() => {
    if (stage.kind !== "processing") return;
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % PROCESSING_MESSAGES.length),
      1800,
    );
    return () => clearInterval(t);
  }, [stage.kind]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setStage({ kind: "error", message: "That file isn't an image." });
      return;
    }
    setMsgIdx(0);
    setStage({ kind: "processing" });
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    trackToolFunnelStep(CTA_CAMPAIGN, "started", {
      input_mode: "photo",
      start_trigger: "photo_selected",
    });

    try {
      const { base64 } = await preprocessImage(file);
      track("ab_tool_requested", {
        sex: sex === "skip" ? "unknown" : sex,
      });

      const analyticsConsent = documentAnalyticsConsentGranted(
        document.documentElement,
      );
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: getOrCreateClientId(),
          photo_base64: base64,
          photo_mime: "image/jpeg",
          sex: sex === "skip" ? null : sex,
          analytics_consent: analyticsConsent,
          ...(analyticsConsent
            ? {
                posthog_distinct_id: getPosthogDistinctId(),
                analytics_context: getWebAnalyticsContext(),
              }
            : {}),
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as Analysis;
        track("ab_tool_scored", {
          score: data.score,
          band: data.band,
          months_low: data.months_to_visible_low,
          months_high: data.months_to_visible_high,
        });
        trackToolFunnelStep(CTA_CAMPAIGN, "result_shown", {
          input_mode: "photo",
          result_type: "ab_score_and_timeline",
        });
        void reportWebToolCompletion("ab-analyzer");
        setStage({ kind: "result", analysis: data });
        return;
      }

      const err = (await res.json().catch(() => ({}))) as ErrorResponse;
      if (res.status === 422) {
        setStage({
          kind: "unusable",
          message: err.message ?? "We couldn't read that photo. Try a clearer shot of your midsection.",
        });
        return;
      }
      if (res.status === 429) {
        setStage({
          kind: "rate_limited",
          message: err.message ?? "You've used your free scan.",
          lifetime: err.error === "lifetime_limited",
        });
        return;
      }
      if (res.status === 413) {
        setStage({ kind: "error", message: "That photo is too large. Try one under 5MB." });
        return;
      }
      setStage({
        kind: "error",
        message: "The analyzer is having a moment. Try again in a minute.",
      });
    } catch {
      setStage({
        kind: "error",
        message: "Something went wrong reading that photo. Try another one.",
      });
    }
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setStage({ kind: "idle" });
    if (fileRef.current) fileRef.current.value = "";
  }

  const busy = stage.kind === "processing";

  return (
    <div className="pr-card">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      {(stage.kind === "idle" || busy) && (
        <>
          <div className="pr-controls">
            <div className="pr-control">
              <span className="pr-control-label">You are</span>
              <div className="pr-segments" role="group" aria-label="Sex">
                {(["male", "female", "skip"] as Sex[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`pr-segment${sex === v ? " is-active" : ""}`}
                    aria-pressed={sex === v}
                    disabled={busy}
                    onClick={() => setSex(v)}
                  >
                    {v === "skip" ? "Rather not say" : v === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {busy ? (
            <div className="pr-processing">
              {preview && <img className="pr-processing-thumb" src={preview} alt="" />}
              <span className="pr-spinner" aria-hidden />
              <p className="pr-processing-msg">{PROCESSING_MESSAGES[msgIdx]}…</p>
            </div>
          ) : (
            <button
              type="button"
              className="pr-drop"
              onClick={() => fileRef.current?.click()}
            >
              <img className="pr-drop-mascot" src={MASCOT_SRC} alt="" width={72} height={72} />
              <strong>Upload a photo to scan your abs</strong>
              <span>
                Front-facing, good light, midsection visible. Bare or tight
                clothing over the stomach reads best.
              </span>
              <span className="pr-drop-cta">Choose photo</span>
              <span className="pr-drop-fine">
                Free · No signup · Your photo is never stored
              </span>
            </button>
          )}
        </>
      )}

      {stage.kind === "result" && (
        <div className="pr-result">
          <div className="pr-result-top">
            {preview && <img className="pr-result-photo" src={preview} alt="The photo you scanned" />}
            <div className="pr-result-score">
              <ScoreRing score={stage.analysis.score} band={stage.analysis.band} />
              <span className="pr-band" data-band={stage.analysis.band.toLowerCase()}>
                {stage.analysis.band}
              </span>
              <span className="pr-conf">{stage.analysis.confidence} confidence</span>
            </div>
          </div>

          <p className="pr-headline">{stage.analysis.headline}</p>

          <div className="pr-notes">
            <div className="pr-note">
              <span className="pr-note-label">Estimated body fat</span>
              <p>
                Roughly {stage.analysis.estimated_bf_low} to{" "}
                {stage.analysis.estimated_bf_high} percent, read from this one
                photo. Treat it as a range, never a decimal.
              </p>
            </div>
            <div className="pr-note">
              <span className="pr-note-label">
                Six-pack timeline: {timelineHeadline(stage.analysis)}
              </span>
              <p>{stage.analysis.timeline_note}</p>
            </div>
          </div>

          <div className="pr-subs">
            {REGION_LABELS.map(({ key, label, hint }) => (
              <RegionBar
                key={key}
                label={label}
                hint={hint}
                value={stage.analysis.regions[key]}
              />
            ))}
          </div>

          <div className="pr-notes">
            <div className="pr-note">
              <span className="pr-note-label">Biggest lever</span>
              <p>{stage.analysis.biggest_lever}</p>
            </div>
          </div>

          <p className="pr-caveat">
            One casual photo, one moment. The score and the timeline are
            estimates that move with lighting, pump, and the meal you just ate.
            The useful version is the same scan on the same pose every week.
          </p>

          <ToolConversionCard
            tool={CTA_CAMPAIGN}
            campaign="web-abs"
            placement="result"
            headline={`${stage.analysis.score} is a snapshot. Track the cut to visible abs in GainFrame.`}
            body="Unlimited scans, body fat %, and a 12-muscle breakdown — free to start."
            desktopBody="Scan with your iPhone for unlimited scans, body fat %, and a 12-muscle breakdown — free to start."
            experiment={buildToolResultCtaExperiment({
              tool: CTA_CAMPAIGN,
              score: stage.analysis.score,
              biggestLever: stage.analysis.biggest_lever,
              timeline: timelineHeadline(stage.analysis),
            })}
            onCtaClick={() =>
              track("ab_tool_cta_click", { placement: "result" })
            }
          />
        </div>
      )}

      {(stage.kind === "unusable" || stage.kind === "error") && (
        <div className="pr-state">
          <h3>{stage.kind === "unusable" ? "Couldn't read that one" : "Something broke"}</h3>
          <p>{stage.message}</p>
          <button type="button" className="pr-cta-secondary" onClick={reset}>
            Try another photo
          </button>
        </div>
      )}

      {stage.kind === "rate_limited" && (
        <div className="pr-state">
          <h3>
            {stage.lifetime
              ? "That's all 3 free scans"
              : "That's today's free scan"}
          </h3>
          <p>
            {stage.lifetime
              ? "The web tool caps at three. The app doesn't cap at all."
              : "Unlimited in the app — no daily cap, no waiting."}
          </p>
          <ToolConversionCard
            tool={CTA_CAMPAIGN}
            campaign="web-abs"
            placement={stage.lifetime ? "lifetime_limit" : "daily_limit"}
            headline="Unlimited ab analysis in GainFrame."
            eyebrow="Keep scanning"
            body="Unlimited scans, body fat %, and a 12-muscle breakdown — free to start."
            desktopBody="Scan with your iPhone for unlimited scans, body fat %, and a 12-muscle breakdown — free to start."
            onCtaClick={() =>
              track("ab_tool_cta_click", {
                placement: stage.lifetime ? "lifetime_limit" : "daily_limit",
              })
            }
          />
        </div>
      )}
    </div>
  );
}
