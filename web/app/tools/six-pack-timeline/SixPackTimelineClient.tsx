"use client";

import { useEffect, useRef, useState } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import {
  captureException,
  getPosthogDistinctId,
  getWebAnalyticsContext,
  track,
} from "@/lib/analytics";
import { documentAnalyticsConsentGranted } from "@/lib/analytics-consent";
import {
  calculateSixPackTimeline,
  DEFICIT_PRESETS,
  type SixPackSex,
  type SixPackTimeline,
} from "@/lib/six-pack-timeline";
import {
  createAttemptId,
  errorResponseJson,
  fetchWithTimeout,
  isLikelyImageFile,
  preprocessImageForUpload,
  validatedJson,
} from "@/lib/tool-client";

const AB_FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/ab-analyze";
const TRANSFORM_FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/body-transform";
const AB_TIMEOUT_MS = 30_000;
const RENDER_TIMEOUT_MS = 60_000;
const RAW_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

type Unit = "lb" | "kg";
type Confidence = "low" | "medium" | "high";
type Analysis = {
  score: number;
  band: string;
  estimated_bf_low: number;
  estimated_bf_high: number;
  confidence: Confidence;
  headline: string;
};
type RenderStatus = "processing" | "ready" | "limited" | "error";
type Stage =
  | { kind: "idle" }
  | { kind: "analyzing" }
  | {
      kind: "result";
      analysis: Analysis;
      timeline: SixPackTimeline;
      renderStatus: RenderStatus;
      afterUrl?: string;
      renderMessage?: string;
    }
  | { kind: "unusable"; message: string }
  | { kind: "rate_limited"; message: string }
  | { kind: "error"; message: string };

type TransformResponse = {
  image_base64: string;
  image_mime: "image/jpeg" | "image/png" | "image/webp";
  model_used: string;
  remaining: number;
  can_unlock: boolean;
};

const PROCESSING_MESSAGES = [
  "Reading your starting point",
  "Estimating the body-fat range",
  "Running the deficit math",
  "Building your date range",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isAnalysis(value: unknown): value is Analysis {
  return isRecord(value) &&
    typeof value.score === "number" &&
    typeof value.band === "string" &&
    typeof value.estimated_bf_low === "number" &&
    typeof value.estimated_bf_high === "number" &&
    (value.confidence === "low" || value.confidence === "medium" ||
      value.confidence === "high") &&
    typeof value.headline === "string";
}

function isTransformResponse(value: unknown): value is TransformResponse {
  return isRecord(value) &&
    typeof value.image_base64 === "string" &&
    value.image_base64.length > 0 &&
    (value.image_mime === "image/jpeg" || value.image_mime === "image/png" ||
      value.image_mime === "image/webp") &&
    typeof value.model_used === "string" &&
    typeof value.remaining === "number" &&
    typeof value.can_unlock === "boolean";
}

function getOrCreateClientId(): string {
  const key = "gf_tid";
  try {
    const existing = localStorage.getItem(key);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
  const id = crypto.randomUUID();
  try {
    localStorage.setItem(key, id);
  } catch {
    // The request can still proceed with an in-memory id.
  }
  return id;
}

function asPounds(weight: number, unit: Unit): number {
  return unit === "lb" ? weight : weight * 2.2046226218;
}

function displayWeight(pounds: number, unit: Unit): string {
  const value = unit === "lb" ? pounds : pounds / 2.2046226218;
  return `${value.toFixed(value < 10 ? 1 : 0)} ${unit}`;
}

function dateAfterWeeks(weeks: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}

function timelineLabel(timeline: SixPackTimeline): string {
  if (timeline.alreadyVisible) return "Likely visible now";
  if (timeline.weeksLow === timeline.weeksHigh) {
    return `About ${timeline.weeksHigh} weeks`;
  }
  return `${timeline.weeksLow}–${timeline.weeksHigh} weeks`;
}

async function imageAspectRatio(src: string): Promise<number> {
  return await new Promise<number>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const ratio = image.naturalWidth / image.naturalHeight;
      resolve(Number.isFinite(ratio) && ratio > 0 ? ratio : 3 / 4);
    };
    image.onerror = () => resolve(3 / 4);
    image.src = src;
  });
}

export default function SixPackTimelineClient() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [sex, setSex] = useState<SixPackSex | null>(null);
  const [unit, setUnit] = useState<Unit>("lb");
  const [weight, setWeight] = useState("");
  const [dailyDeficit, setDailyDeficit] = useState(500);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewAspectRatio, setPreviewAspectRatio] = useState(3 / 4);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [scrub, setScrub] = useState(50);
  const fileRef = useRef<HTMLInputElement>(null);
  const viewedRef = useRef(false);
  const submittingRef = useRef(false);

  const numericWeight = Number(weight);
  const weightLbs = asPounds(numericWeight, unit);
  const validWeight = Number.isFinite(weightLbs) && weightLbs >= 80 && weightLbs <= 500;
  const canUpload = sex !== null && validWeight && stage.kind !== "analyzing";

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("six_pack_tool_view");
  }, []);

  useEffect(() => {
    if (stage.kind !== "analyzing") return;
    setProcessingIndex(0);
    const id = setInterval(() => {
      setProcessingIndex((index) =>
        Math.min(index + 1, PROCESSING_MESSAGES.length - 1)
      );
    }, 1800);
    return () => clearInterval(id);
  }, [stage.kind]);

  function reset() {
    setPreviewUrl(null);
    setPreviewAspectRatio(3 / 4);
    setStage({ kind: "idle" });
    setScrub(50);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function renderLeanerPhoto(options: {
    photoBase64: string;
    photoMime: string;
    clientId: string;
    analysis: Analysis;
    timeline: SixPackTimeline;
  }) {
    const attemptId = createAttemptId();
    const midpoint =
      (options.analysis.estimated_bf_low + options.analysis.estimated_bf_high) / 2;
    const intensity = midpoint - options.timeline.targetBodyFat > 6
      ? "strong"
      : "realistic";
    try {
      const analyticsConsent = documentAnalyticsConsentGranted(
        document.documentElement,
      );
      const response = await fetchWithTimeout(
        TRANSFORM_FUNCTION_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate",
            client_id: options.clientId,
            photo_base64: options.photoBase64,
            photo_mime: options.photoMime,
            sex,
            goal: "lose_fat",
            zones: ["core"],
            intensity,
            analytics_consent: analyticsConsent,
            ...(analyticsConsent
              ? {
                  posthog_distinct_id: getPosthogDistinctId(),
                  analytics_context: getWebAnalyticsContext(),
                }
              : {}),
            request_id: attemptId,
            attempt_id: attemptId,
          }),
        },
        RENDER_TIMEOUT_MS,
      );

      if (!response.ok) {
        const error = await errorResponseJson(response);
        const limited = response.status === 429;
        track("six_pack_tool_render_unavailable", {
          status: response.status,
          code: typeof error.error === "string" ? error.error : "unknown_error",
        });
        setStage((current) =>
          current.kind === "result"
            ? {
                ...current,
                renderStatus: limited ? "limited" : "error",
                renderMessage: limited
                  ? "Your free AI render has already been used. Your timeline is still ready below."
                  : "The preview render missed this rep. Your timeline is still ready below.",
              }
            : current
        );
        return;
      }

      const data = await validatedJson(response, isTransformResponse);
      const afterUrl = `data:${data.image_mime};base64,${data.image_base64}`;
      track("six_pack_tool_render_shown", {
        model: data.model_used,
        intensity,
        remaining: data.remaining,
      });
      setStage((current) =>
        current.kind === "result"
          ? { ...current, renderStatus: "ready", afterUrl }
          : current
      );
    } catch (error) {
      track("six_pack_tool_render_unavailable", { code: "client_error" });
      captureException(error, { tool: "six_pack_timeline", phase: "render" });
      setStage((current) =>
        current.kind === "result"
          ? {
              ...current,
              renderStatus: "error",
              renderMessage:
                "The preview render missed this rep. Your timeline is still ready below.",
            }
          : current
      );
    }
  }

  async function handleFile(file: File) {
    if (!sex || !validWeight || submittingRef.current) return;
    if (!isLikelyImageFile(file)) {
      setStage({ kind: "error", message: "Choose a JPEG, PNG, WebP, HEIC, or HEIF photo." });
      return;
    }

    submittingRef.current = true;
    setStage({ kind: "analyzing" });
    track("six_pack_tool_photo_uploaded", {
      sex,
      unit,
      daily_deficit: dailyDeficit,
      size_kb: Math.round(file.size / 1024),
    });

    try {
      const processed = await preprocessImageForUpload(file, {
        allowedRawMimes: RAW_MIMES,
      });
      const stablePreview = `data:${processed.photoMime};base64,${processed.base64}`;
      setPreviewUrl(stablePreview);
      setPreviewAspectRatio(await imageAspectRatio(stablePreview));
      const clientId = getOrCreateClientId();
      const analyticsConsent = documentAnalyticsConsentGranted(
        document.documentElement,
      );
      const response = await fetchWithTimeout(
        AB_FUNCTION_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            photo_base64: processed.base64,
            photo_mime: processed.photoMime,
            sex,
            analytics_consent: analyticsConsent,
            ...(analyticsConsent
              ? {
                  posthog_distinct_id: getPosthogDistinctId(),
                  analytics_context: getWebAnalyticsContext(),
                }
              : {}),
          }),
        },
        AB_TIMEOUT_MS,
      );

      if (!response.ok) {
        const error = await errorResponseJson(response);
        const message = typeof error.message === "string"
          ? error.message
          : "We couldn't read that photo. Try a clear, front-facing shot with your midsection visible.";
        if (response.status === 422) {
          setStage({ kind: "unusable", message });
        } else if (response.status === 429) {
          setStage({ kind: "rate_limited", message });
        } else {
          setStage({ kind: "error", message: "The analysis missed this rep. Please try again." });
        }
        return;
      }

      const analysis = await validatedJson(response, isAnalysis);
      const timeline = calculateSixPackTimeline({
        sex,
        weightLbs,
        estimatedBodyFatLow: analysis.estimated_bf_low,
        estimatedBodyFatHigh: analysis.estimated_bf_high,
        dailyDeficit,
      });
      track("six_pack_tool_timeline_shown", {
        sex,
        score: analysis.score,
        body_fat_low: analysis.estimated_bf_low,
        body_fat_high: analysis.estimated_bf_high,
        daily_deficit: dailyDeficit,
        weeks_low: timeline.weeksLow,
        weeks_high: timeline.weeksHigh,
        pace_warning: timeline.paceWarning,
      });
      setStage({
        kind: "result",
        analysis,
        timeline,
        renderStatus: "processing",
      });
      void renderLeanerPhoto({
        photoBase64: processed.base64,
        photoMime: processed.photoMime,
        clientId,
        analysis,
        timeline,
      });
    } catch (error) {
      track("six_pack_tool_error", { phase: "analysis" });
      captureException(error, { tool: "six_pack_timeline", phase: "analysis" });
      setStage({
        kind: "error",
        message: "Something went wrong reading that photo. Try another one.",
      });
    } finally {
      submittingRef.current = false;
    }
  }

  function pickPhoto() {
    if (!sex) {
      document.getElementById("spt-reference")?.focus();
      return;
    }
    if (!validWeight) {
      document.getElementById("spt-weight")?.focus();
      return;
    }
    fileRef.current?.click();
  }

  return (
    <section aria-label="Six pack timeline calculator">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {(stage.kind === "idle" || stage.kind === "analyzing") && (
        <div className="btf-card">
          <div className="btf-card-head">
            <span className="btf-card-head-label">Your six-pack plan</span>
            <span className="btf-card-head-meta">Free · no signup</span>
          </div>

          {stage.kind === "analyzing" ? (
            <>
              <div className={`btf-target ${previewUrl ? "has-file" : ""} is-processing`}>
                {previewUrl ? (
                  <img className="btf-target-photo" src={previewUrl} alt="" />
                ) : (
                  <img
                    className="spt-analyzing-mascot"
                    src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp"
                    alt=""
                    width={96}
                    height={96}
                  />
                )}
                <span className="btf-scan-line" aria-hidden />
              </div>
              <div className="btf-status-block" role="status" aria-live="polite">
                <span className="btf-status-line">
                  <span className="dot" aria-hidden />
                  {PROCESSING_MESSAGES[processingIndex]}…
                </span>
                <div className="btf-status-track" aria-hidden />
                <p className="spt-status-note">
                  The timeline appears first. The photo render follows.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="btf-field">
                <p className="btf-field-label">
                  <span>Reference</span>
                  <span className="btf-field-hint">Sets the visible-abs target</span>
                </p>
                <div className="btf-pills spt-pills-2" id="spt-reference" tabIndex={-1}>
                {(["male", "female"] as SixPackSex[]).map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={`btf-pill-btn ${sex === value ? "is-selected" : ""}`}
                    aria-pressed={sex === value}
                    onClick={() => setSex(value)}
                  >
                    {value === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
                <p className="spt-field-help">~12% male · ~19% female planning anchor</p>
              </div>

              <div className="btf-field">
                <p className="btf-field-label">
                  <span>Current weight</span>
                  <span className="btf-field-hint">Used only for the math</span>
                </p>
              <div className="spt-weight-row">
                <input
                  id="spt-weight"
                  type="number"
                  inputMode="decimal"
                  min={unit === "lb" ? 80 : 36}
                  max={unit === "lb" ? 500 : 227}
                  placeholder={unit === "lb" ? "180" : "82"}
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  aria-describedby="spt-weight-help"
                />
                  <div className="btf-pills spt-unit-pills" aria-label="Weight unit">
                  {(["lb", "kg"] as Unit[]).map((value) => (
                    <button
                      type="button"
                      key={value}
                        className={`btf-pill-btn ${unit === value ? "is-selected" : ""}`}
                      aria-pressed={unit === value}
                      onClick={() => {
                        const current = Number(weight);
                        if (Number.isFinite(current) && current > 0) {
                          setWeight(
                            (value === "kg"
                              ? asPounds(current, unit) / 2.2046226218
                              : asPounds(current, unit)
                            ).toFixed(0),
                          );
                        }
                        setUnit(value);
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
                <p className="spt-field-help" id="spt-weight-help">Not stored.</p>
              </div>

              <div className="btf-field">
                <p className="btf-field-label">
                  <span>Daily calorie deficit</span>
                  <span className="btf-field-hint">Choose your pace</span>
                </p>
                <div className="btf-pills spt-deficits">
                {DEFICIT_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.calories}
                      className={`btf-pill-btn ${dailyDeficit === preset.calories ? "is-selected" : ""}`}
                    aria-pressed={dailyDeficit === preset.calories}
                    onClick={() => setDailyDeficit(preset.calories)}
                  >
                    <strong>−{preset.calories}</strong>
                    <span>{preset.label}</span>
                    <small>{preset.note}</small>
                  </button>
                ))}
              </div>
              </div>

              <button
                type="button"
                className="btf-submit"
                disabled={!canUpload}
                onClick={pickPhoto}
              >
                {canUpload ? (
                  <>Upload photo &amp; build timeline <span className="arrow" aria-hidden>→</span></>
                ) : (
                  "Finish the fields above"
                )}
              </button>
              <p className="btf-privacy">
                <strong>Privacy:</strong> photo sent to the AI services for the
                analysis and render calls only · Never stored.
              </p>
            </>
          )}
        </div>
      )}

      {stage.kind === "result" && (
        <div className="btf-card btf-card--result spt-result">
          <div className="btf-result-head">
            <span className="btf-result-tag"><span className="dot" /> Timeline ready</span>
            <span className="btf-result-hint">Photo estimate + deficit math</span>
          </div>
          <div className="spt-result-heading">
            <h2>{timelineLabel(stage.timeline)}</h2>
            {!stage.timeline.alreadyVisible && (
              <p>
                Roughly {formatDate(dateAfterWeeks(stage.timeline.weeksLow))} to{" "}
                {formatDate(dateAfterWeeks(stage.timeline.weeksHigh))}, if your
                average deficit lands near {dailyDeficit} calories per day.
              </p>
            )}
            {stage.timeline.alreadyVisible && (
              <p>
                The full estimated body-fat range already touches the planning
                threshold. Lighting and ab development may be the bigger levers.
              </p>
            )}
          </div>

          <div className="spt-stat-grid">
            <div>
              <span>Starting range</span>
              <strong>
                {stage.analysis.estimated_bf_low}–{stage.analysis.estimated_bf_high}%
              </strong>
              <small>{stage.analysis.confidence} photo confidence</small>
            </div>
            <div>
              <span>Planning target</span>
              <strong>~{stage.timeline.targetBodyFat}%</strong>
              <small>defined-abs anchor, not a guarantee</small>
            </div>
            <div>
              <span>Estimated loss</span>
              <strong>
                {displayWeight(stage.timeline.weightLossLowLbs, unit)}–
                {displayWeight(stage.timeline.weightLossHighLbs, unit)}
              </strong>
              <small>assuming lean mass is maintained</small>
            </div>
            <div>
              <span>Selected pace</span>
              <strong>{displayWeight(stage.timeline.weeklyLossLbs, unit)}/wk</strong>
              <small>{stage.timeline.weeklyLossPercent.toFixed(2)}% bodyweight / week</small>
            </div>
          </div>

          {stage.timeline.paceWarning && (
            <p className="spt-warning" role="note">
              <strong>Worth slowing down:</strong> this preset projects more
              than 1% of your current bodyweight per week. A smaller deficit may
              be easier to sustain and friendlier to muscle retention.
            </p>
          )}

          <div className="spt-render-block">
            <div className="spt-render-heading">
              <div>
                <p className="btf-section-eyebrow">AI preview</p>
                <h3>Your leaner preview.</h3>
              </div>
            </div>

            {stage.renderStatus === "ready" && stage.afterUrl && previewUrl && (
              <div
                className="btf-compare"
                style={{ aspectRatio: previewAspectRatio }}
              >
                <img
                  className="btf-compare-after"
                  src={stage.afterUrl}
                  alt="AI illustration of a leaner version of your uploaded photo"
                />
                <div className="btf-compare-before" style={{ width: `${scrub}%` }}>
                  <img
                    className="btf-compare-before-img"
                    src={previewUrl}
                    alt="Your uploaded photo"
                  />
                </div>
                <span className="btf-compare-label is-before">Now</span>
                <span className="btf-compare-label is-after">Leaner preview</span>
                <span className="btf-compare-handle" style={{ left: `${scrub}%` }} aria-hidden>
                  <span className="btf-compare-grip">↔</span>
                </span>
                <input
                  className="btf-compare-range"
                  type="range"
                  min={0}
                  max={100}
                  value={scrub}
                  onChange={(event) => setScrub(Number(event.target.value))}
                  aria-label="Compare current photo and leaner AI preview"
                />
              </div>
            )}

            {stage.renderStatus === "processing" && previewUrl && (
              <div className="spt-rendering" role="status">
                <div className="btf-status-line">
                  <span className="dot" aria-hidden />
                  Rendering the leaner you…
                </div>
                <div className="btf-status-track" aria-hidden />
                <p>Your timeline is ready. The visual usually takes another 20–30 seconds.</p>
              </div>
            )}

            {(stage.renderStatus === "limited" || stage.renderStatus === "error") && (
              <div className="spt-render-missed">
                <img
                  src="/assets/gainframe-guy/poses/gainframe-guy-tired.webp"
                  alt=""
                  width={90}
                  height={90}
                />
                <div>
                  <strong>Timeline ready. Render unavailable.</strong>
                  <p>{stage.renderMessage}</p>
                </div>
              </div>
            )}

            <p className="spt-render-note">
              AI illustration, not a promised outcome. It may change details it
              should preserve. Your actual result depends on training, muscle
              retention, fat distribution, genetics, and adherence.
            </p>

            {stage.renderStatus === "ready" && stage.afterUrl && (
              <div className="btf-result-actions">
                <a
                  className="btf-download"
                  href={stage.afterUrl}
                  download="gainframe-six-pack-preview.jpg"
                  onClick={() => track("six_pack_tool_download_clicked")}
                >
                  Download render ↓
                </a>
                <button type="button" className="btf-secondary" onClick={reset}>
                  Start over
                </button>
              </div>
            )}
          </div>

          <ToolConversionCard
            tool="six_pack_timeline"
            campaign="web-six-pack"
            placement="result"
            eyebrow="Turn the estimate into a trend"
            headline={`${timelineLabel(stage.timeline)} is the plan. Weekly photos tell you if it is working.`}
            body="GainFrame tracks body fat, weight, and progress photos together—so your six-pack range updates with the real you."
            desktopBody="Scan with your iPhone to track body fat, weight, and progress photos together—so the range updates with the real you."
            onCtaClick={() => track("six_pack_tool_cta_clicked", { placement: "result" })}
          />

          {stage.renderStatus !== "ready" && (
            <button type="button" className="spt-reset" onClick={reset}>
              Run another timeline
            </button>
          )}
        </div>
      )}

      {(stage.kind === "unusable" || stage.kind === "error" || stage.kind === "rate_limited") && (
        <div className="btf-card">
          <div className="btf-msg spt-state">
          <img
              className="btf-msg-mascot btf-msg-mascot--tired"
              src="/assets/gainframe-guy/poses/gainframe-guy-tired.webp"
            alt=""
            width={100}
            height={100}
          />
            <p className="btf-msg-title">
            {stage.kind === "unusable"
              ? "That photo hid the answer"
              : stage.kind === "rate_limited"
                ? "The free scan limit is reached"
                : "That rep did not count"}
            </p>
            <p className="btf-msg-sub">{stage.message}</p>
            <button type="button" className="btf-submit spt-try-again" onClick={reset}>
              Try another photo <span className="arrow" aria-hidden>→</span>
            </button>
          {stage.kind === "rate_limited" && (
            <ToolConversionCard
              tool="six_pack_timeline"
              campaign="web-six-pack"
              placement="limit"
              headline="Keep the timeline moving in GainFrame."
              body="Unlimited progress scans, body-fat trends, and side-by-side comparisons—free to start."
              desktopBody="Scan with your iPhone for progress scans, body-fat trends, and side-by-side comparisons—free to start."
              onCtaClick={() => track("six_pack_tool_cta_clicked", { placement: "limit" })}
            />
          )}
          </div>
        </div>
      )}
    </section>
  );
}
