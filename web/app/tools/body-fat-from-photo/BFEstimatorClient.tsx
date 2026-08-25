"use client";

import { useEffect, useRef, useState } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
import {
  captureException,
  getPosthogDistinctId,
  getWebAnalyticsContext,
  track,
} from "@/lib/analytics";
import { documentAnalyticsConsentGranted } from "@/lib/analytics-consent";
import { SEO_PHYSIQUE_TOOLS_CPP } from "@/lib/site";
import {
  asToolClientError,
  createAttemptId,
  errorResponseJson,
  fetchWithTimeout,
  imageMime,
  isLikelyImageFile,
  preprocessImageForUpload,
  terminalTelemetry,
  toolNow,
  validatedJson,
  type PreprocessedImage,
} from "@/lib/tool-client";

const FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/bf-estimate";
const REPORT_FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/bf-full-report";
const ESTIMATE_TIMEOUT_MS = 30_000;
const REPORT_TIMEOUT_MS = 60_000;
const BF_RAW_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;
const REPORT_ALREADY_SENT_CODES = new Set([
  "already_sent",
  "already_sent_today",
  "report_already_sent",
]);

const CTA_CAMPAIGN = "bf_from_photo";
const MASCOT_SRC = "/assets/gainframe-guy/poses/gainframe-guy-wave.webp";

type Sex = "male" | "female" | "skip";
type Confidence = "low" | "medium" | "high";

// Email-capture card on the result screen. "already" = the backend says a
// report already went out for this person today (429) — treated as success.
type EmailStage = "idle" | "sending" | "sent" | "already" | "error";

type Stage =
  | { kind: "idle" }
  | { kind: "processing" }
  | {
      kind: "result";
      estimate: string;
      confidence: Confidence;
      one_line: string;
    }
  | { kind: "unusable"; message: string }
  // lifetime: true = all 3 free scans used, terminal — vs the daily limit
  // where tomorrow works. Different title + CTA label on the same screen.
  | { kind: "rate_limited"; message: string; lifetime: boolean }
  | { kind: "error"; message: string };

type SuccessResponse = {
  estimate: string;
  confidence: Confidence;
  one_line: string;
  model_used: string;
};

type ErrorResponse = {
  error: string;
  message?: string;
  reason?: string;
};

const PROCESSING_MESSAGES = [
  "Looking for visual cues",
  "Checking proportions",
  "Cross-referencing the ranges",
  "Crunching the numbers",
];

function getOrCreateClientId(): string {
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

function nextRunIndex(): number {
  // Lifetime attempt counter for this browser, sent as `run_index` on
  // bf_tool_estimate_requested so downstream consumers (Slack alerts,
  // PostHog) can tell a first-time visitor from the same person retrying.
  // 0 means "unknown" (localStorage blocked — private mode etc).
  const KEY = "gf_bf_runs";
  try {
    const n = (Number(localStorage.getItem(KEY)) || 0) + 1;
    localStorage.setItem(KEY, String(n));
    return n;
  } catch {
    return 0;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isConfidence(value: unknown): value is Confidence {
  return value === "low" || value === "medium" || value === "high";
}

function isSuccessResponse(value: unknown): value is SuccessResponse {
  return isRecord(value) &&
    typeof value.estimate === "string" && /\d+(?:\.\d+)?/.test(value.estimate) &&
    isConfidence(value.confidence) &&
    typeof value.one_line === "string" &&
    typeof value.model_used === "string";
}

function errorResponse(value: Record<string, unknown>): ErrorResponse {
  return {
    error: typeof value.error === "string" ? value.error : "unknown_error",
    message: typeof value.message === "string" ? value.message : undefined,
    reason: typeof value.reason === "string" ? value.reason : undefined,
  };
}

function fileTelemetry(file: File, processed?: PreprocessedImage) {
  return {
    file_mime: imageMime(file) || "unknown",
    file_size_kb: Math.round(file.size / 1024),
    ...(processed
      ? {
          preprocessing_method: processed.method,
          compressed_size_kb: processed.sizeKb,
          upload_mime: processed.photoMime,
        }
      : {}),
  };
}

function shouldCaptureTechnicalError(code: string): boolean {
  return ![
    "unsupported_format",
    "corrupt_image",
    "decode_failed_large",
    "invalid_email",
  ].includes(code);
}

function parseEstimateNumber(estimate: string): number {
  const m = estimate.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function ConfidenceChip({ value }: { value: Confidence }) {
  const segments: Confidence[] = ["low", "medium", "high"];
  const activeIdx = segments.indexOf(value);
  return (
    <span className="bff-conf" data-level={value}>
      <span
        className="bff-conf-dots"
        role="meter"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={activeIdx + 1}
        aria-label={`${value} confidence`}
      >
        {segments.map((_, i) => (
          <span
            key={i}
            className={`bff-conf-dot${i <= activeIdx ? " is-on" : ""}`}
          />
        ))}
      </span>
      <span className="bff-conf-label">
        Confidence <em>{value}</em>
      </span>
    </span>
  );
}

export default function BFEstimatorClient() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  // Android (~half of this tool's users) can't install — the result screen
  // reframes the existing email report as the capture instead of showing an
  // iOS download button.
  const downloadPlatform = useDownloadPlatform();
  const isAndroid = downloadPlatform === "android";
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingIdx, setProcessingIdx] = useState(0);
  const [displayedNumber, setDisplayedNumber] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const viewedRef = useRef(false);
  const submittingRef = useRef(false);

  // Email capture (result screen). The report call must reuse the exact
  // client_id and photo bytes from the estimate call: the backend gates on
  // the same-day rate-limit row keyed by hash(ip + client_id), and the
  // cached base64 avoids re-encoding the photo.
  const [email, setEmail] = useState("");
  const [emailStage, setEmailStage] = useState<EmailStage>("idle");
  const estimateClientIdRef = useRef<string | null>(null);
  const photoBase64Ref = useRef<string | null>(null);
  const photoMimeRef = useRef<string | null>(null);
  const emailSubmittingRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("bf_tool_view");
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (stage.kind !== "processing") return;
    setProcessingIdx(0);
    const id = setInterval(() => {
      setProcessingIdx((i) => Math.min(i + 1, PROCESSING_MESSAGES.length - 1));
    }, 1500);
    return () => clearInterval(id);
  }, [stage.kind]);

  useEffect(() => {
    if (stage.kind !== "result") return;
    const target = parseEstimateNumber(stage.estimate);
    if (target <= 0) {
      setDisplayedNumber(target);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayedNumber(Number((target * eased).toFixed(target % 1 === 0 ? 0 : 1)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setSex(null);
    setStage({ kind: "idle" });
    setDisplayedNumber(0);
    setEmail("");
    setEmailStage("idle");
    estimateClientIdRef.current = null;
    photoBase64Ref.current = null;
    photoMimeRef.current = null;
  }

  async function submitReport() {
    if (stage.kind !== "result") return;
    if (emailSubmittingRef.current) return;
    const attemptId = createAttemptId();
    const startedAt = toolNow();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      track("bf_tool_email_submitted", {
        outcome: "validation_failed",
        ...terminalTelemetry({
          attemptId,
          startedAt,
          phase: "report",
          errorType: "validation",
          code: "invalid_email",
          retryable: true,
          source: "client",
        }),
        blocking: true,
      });
      setEmailStage("error");
      return;
    }
    const photoBase64 = photoBase64Ref.current;
    const photoMime = photoMimeRef.current;
    const clientId = estimateClientIdRef.current;
    if (!photoBase64 || !photoMime || !clientId) {
      // Shouldn't happen (both are set before any result renders), but if
      // the refs are gone there's nothing to analyze — surface the error.
      const common = {
        ...terminalTelemetry({
          attemptId,
          startedAt,
          phase: "report",
          errorType: "unknown",
          code: "missing_report_context",
          retryable: false,
          source: "client",
        }),
        blocking: true,
      };
      const error = new Error("Body-fat report context was missing.");
      track("bf_tool_report_error", { ...common, error: error.message });
      captureException(error, { tool: "body_fat_estimator", ...common });
      setEmailStage("error");
      return;
    }

    emailSubmittingRef.current = true;
    setEmailStage("sending");
    track("bf_tool_email_submitted", {
      outcome: "requested",
      attempt_id: attemptId,
      source: "client",
    });

    try {
      const analyticsConsent = documentAnalyticsConsentGranted(
        document.documentElement,
      );
      const res = await fetchWithTimeout(
        REPORT_FUNCTION_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            email: trimmed,
            photo_base64: photoBase64,
            photo_mime: photoMime,
            sex: sex && sex !== "skip" ? sex : null,
            estimate: stage.estimate,
            confidence: stage.confidence,
            analytics_consent: analyticsConsent,
            ...(analyticsConsent
              ? { posthog_distinct_id: getPosthogDistinctId() }
              : {}),
            request_id: attemptId,
            attempt_id: attemptId,
          }),
        },
        REPORT_TIMEOUT_MS,
      );
      if (res.ok) {
        track("bf_tool_report_sent", {
          outcome: "sent",
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "report",
            errorType: "none",
            code: "ok",
            status: res.status,
            retryable: false,
            source: "server",
          }),
          blocking: false,
        });
        setEmailStage("sent");
      } else {
        const err = errorResponse(await errorResponseJson(res));
        if (res.status === 429 && REPORT_ALREADY_SENT_CODES.has(err.error)) {
          track("bf_tool_report_sent", {
            already: true,
            outcome: "already_sent",
            ...terminalTelemetry({
              attemptId,
              startedAt,
              phase: "report",
              errorType: "none",
              code: err.error,
              status: res.status,
              retryable: false,
              source: "server",
            }),
            blocking: false,
          });
          setEmailStage("already");
          return;
        }

        const common = {
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "report",
            errorType: "http",
            code: err.error,
            status: res.status,
            retryable: res.status >= 500 || res.status === 408 || res.status === 429,
            source: "server",
          }),
          blocking: true,
        };
        track("bf_tool_report_error", {
          ...common,
          status: res.status,
          code: err.error,
        });
        if (res.status !== 422 && res.status !== 429) {
          captureException(
            new Error(`Body-fat report failed with HTTP ${res.status}`),
            { tool: "body_fat_estimator", ...common },
          );
        }
        setEmailStage("error");
      }
    } catch (err) {
      const failure = asToolClientError(err);
      const common = {
        ...terminalTelemetry({
          attemptId,
          startedAt,
          phase: "report",
          errorType: failure.errorType,
          code: failure.code,
          status: failure.status,
          retryable: failure.retryable,
          source: "client",
        }),
        blocking: true,
      };
      track("bf_tool_report_error", { ...common, error: failure.message });
      captureException(err, { tool: "body_fat_estimator", ...common });
      setEmailStage("error");
    } finally {
      emailSubmittingRef.current = false;
    }
  }

  function onPick(picked: File | null) {
    if (!picked) return;
    if (!isLikelyImageFile(picked)) {
      const attemptId = createAttemptId();
      const startedAt = toolNow();
      track("bf_tool_photo_unusable", {
        reason: "unsupported_format",
        ...terminalTelemetry({
          attemptId,
          startedAt,
          phase: "image_select",
          errorType: "unsupported_image",
          code: "unsupported_format",
          retryable: false,
          source: "client",
        }),
        blocking: true,
        ...fileTelemetry(picked),
      });
      setStage({
        kind: "unusable",
        message: "That file isn't a supported image. Use JPEG, PNG, WebP, HEIC, or HEIF.",
      });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    setStage({ kind: "idle" });
    track("bf_tool_photo_uploaded", {
      size_kb: Math.round(picked.size / 1024),
      mime: picked.type,
    });
  }

  async function submit() {
    if (!file) return;
    // Guard against rapid duplicate taps: setStage is async, so the submit
    // button stays mounted/clickable until the next render. Without this, a
    // double/triple-tap (or a mobile browser emitting duplicate click events)
    // fires bf_tool_estimate_requested — and a real scan request — 2–3× before
    // the UI transitions to the processing view.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStage({ kind: "processing" });
    const attemptId = createAttemptId();
    const startedAt = toolNow();
    let phase = "preprocess";
    let processed: PreprocessedImage | undefined;
    track("bf_tool_estimate_requested", {
      sex: sex ?? "skip",
      run_index: nextRunIndex(),
      attempt_id: attemptId,
      source: "client",
      ...fileTelemetry(file),
    });

    try {
      processed = await preprocessImageForUpload(file, {
        allowedRawMimes: BF_RAW_MIMES,
      });
      const clientId = getOrCreateClientId();
      estimateClientIdRef.current = clientId;
      photoBase64Ref.current = processed.base64;
      photoMimeRef.current = processed.photoMime;
      const analyticsConsent = documentAnalyticsConsentGranted(
        document.documentElement,
      );
      const payload = {
        client_id: clientId,
        photo_base64: processed.base64,
        photo_mime: processed.photoMime,
        sex: sex && sex !== "skip" ? sex : null,
        analytics_consent: analyticsConsent,
        ...(analyticsConsent
          ? {
              posthog_distinct_id: getPosthogDistinctId(),
              analytics_context: getWebAnalyticsContext(),
            }
          : {}),
        request_id: attemptId,
        attempt_id: attemptId,
      };
      phase = "estimate";
      const res = await fetchWithTimeout(
        FUNCTION_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        ESTIMATE_TIMEOUT_MS,
      );

      if (res.ok) {
        phase = "response_parse";
        const json = await validatedJson(res, isSuccessResponse);
        track("bf_tool_result_shown", {
          estimate: json.estimate,
          confidence: json.confidence,
          model: json.model_used,
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "estimate",
            errorType: "none",
            code: "ok",
            status: res.status,
            retryable: false,
            source: "server",
          }),
          blocking: false,
          ...fileTelemetry(file, processed),
        });
        setStage({
          kind: "result",
          estimate: json.estimate,
          confidence: json.confidence,
          one_line: json.one_line,
        });
        return;
      }

      const err = errorResponse(await errorResponseJson(res));
      if (res.status === 429) {
        const lifetime = err.error === "lifetime_limited";
        track("bf_tool_rate_limited", {
          kind: lifetime ? "lifetime" : "daily",
          raw_kind: err.error,
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "estimate",
            errorType: "rate_limit",
            code: err.error,
            status: res.status,
            retryable: !lifetime,
            source: "server",
          }),
          blocking: true,
          ...fileTelemetry(file, processed),
        });
        setStage({
          kind: "rate_limited",
          lifetime,
          message:
            err.message ??
            "You've used your free estimate for today. Try GainFrame for unlimited weekly check-ins.",
        });
      } else if (res.status === 422) {
        const reason = err.reason ?? err.error ?? "photo_unusable";
        track("bf_tool_photo_unusable", {
          reason,
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "estimate",
            errorType: "unusable_photo",
            code: reason,
            status: res.status,
            retryable: true,
            source: "server",
          }),
          blocking: true,
          ...fileTelemetry(file, processed),
        });
        setStage({
          kind: "unusable",
          message:
            err.message ??
            "Couldn't analyze that photo. Try a clearer, well-lit shot.",
        });
      } else {
        const common = {
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "estimate",
            errorType: "http",
            code: err.error,
            status: res.status,
            retryable: res.status >= 500 || res.status === 408,
            source: "server",
          }),
          blocking: true,
          ...fileTelemetry(file, processed),
        };
        track("bf_tool_error", { ...common, status: res.status, code: err.error });
        captureException(
          new Error(`Body-fat estimate failed with HTTP ${res.status}`),
          { tool: "body_fat_estimator", ...common },
        );
        setStage({
          kind: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      const failure = asToolClientError(err);
      const common = {
        ...terminalTelemetry({
          attemptId,
          startedAt,
          phase,
          errorType: failure.errorType,
          code: failure.code,
          status: failure.status,
          retryable: failure.retryable,
          source: "client",
        }),
        blocking: true,
        ...fileTelemetry(file, processed),
      };
      if (["unsupported_format", "corrupt_image", "decode_failed_large"].includes(
        failure.code,
      )) {
        track("bf_tool_photo_unusable", { ...common, reason: failure.code });
        setStage({ kind: "unusable", message: failure.message });
        return;
      }
      track("bf_tool_error", { ...common, error: failure.message });
      if (shouldCaptureTechnicalError(failure.code)) {
        captureException(err, { tool: "body_fat_estimator", ...common });
      }
      setStage({
        kind: "error",
        message: failure.errorType === "timeout"
          ? "That scan took too long. Please try again."
          : "Something went wrong preparing that photo. Please try again.",
      });
    } finally {
      // Release the guard so a legitimate retry (after error / unusable / rate
      // limit → reset → idle) can submit again.
      submittingRef.current = false;
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onPick(dropped);
  }

  // ============ RENDER ============

  // -------- Processing --------
  if (stage.kind === "processing") {
    return (
      <div className="bff-card">
        <div className="bff-card-head">
          <span className="bff-card-head-label">Scanning</span>
          <span className="bff-card-head-meta">Step 2 of 2</span>
        </div>

        <div className="bff-target is-processing has-file">
          {previewUrl && (
            <>
              <img
                src={previewUrl}
                alt="Photo being analyzed"
                className="bff-target-photo"
              />
              <span className="bff-target-photo-overlay" aria-hidden />
            </>
          )}
          <span className="bff-scan-line" aria-hidden />
        </div>

        <div className="bff-status-block">
          <div className="bff-status-line" key={processingIdx}>
            <span className="dot" aria-hidden />
            <span>{PROCESSING_MESSAGES[processingIdx]}…</span>
          </div>
          <div className="bff-status-track" aria-hidden />
        </div>
      </div>
    );
  }

  // -------- Result --------
  if (stage.kind === "result") {
    const targetNum = parseEstimateNumber(stage.estimate);
    return (
      <>
        <div className="bff-card bff-card--result">
          {/* Mascot celebrates from the top-right of the card,
              clear of the centered number on every viewport. */}
          <img
            className="bff-result-mascot"
            src={MASCOT_SRC}
            alt=""
            aria-hidden
            width={84}
            height={84}
          />

          <div className="bff-result">
            <span className="bff-result-tag">
              <span className="dot" aria-hidden />
              Scan complete
            </span>

            <div className="bff-result-figure">
              <h2 className="bff-result-num">
                <span className="pre">~</span>
                {targetNum % 1 === 0
                  ? Math.round(displayedNumber)
                  : displayedNumber.toFixed(1)}
                <span className="pct">%</span>
              </h2>
            </div>
            <p className="bff-result-label">Estimated body fat</p>

            <ConfidenceChip value={stage.confidence} />

            <p className="bff-result-obs">{stage.one_line}</p>

            <div className="bff-result-foot">
              <span><strong>Method</strong> · Single-photo AI</span>
              <span><strong>Margin</strong> · ±4–5%</span>
            </div>
          </div>
        </div>

        {/* The conversion unit: the app card leads with the user's actual
            number (the physique-rater framing that out-converts generic
            download copy). The email report follows as its own card — and
            becomes the primary capture on Android, where the app card
            hides itself. */}
        <ToolConversionCard
          tool={CTA_CAMPAIGN}
          campaign={SEO_PHYSIQUE_TOOLS_CPP.campaign}
          customProductPageId={SEO_PHYSIQUE_TOOLS_CPP.id}
          placement="result"
          headline={`${stage.estimate}% is one snapshot. Compare every check-in in GainFrame.`}
          body="Precise multi-photo body fat, 12 muscle scores, weekly trends — free to start."
          desktopBody="Scan with your iPhone for precise multi-photo body fat, 12 muscle scores, and weekly trends — free to start."
          hideOnAndroid
          onCtaClick={() =>
            track("bf_tool_cta_clicked", { cta_content: "cta_primary" })
          }
        />

        <div className="bff-cta-block">
          <span className="bff-cta-glow" aria-hidden />
          <p className="bff-cta-block-title">
            {isAndroid
              ? "No Android app yet — get your result in writing"
              : "Or get it in writing"}
          </p>
          <p className="bff-cta-block-sub">
            {isAndroid
              ? "GainFrame is iPhone-only right now. Email yourself the full breakdown — what the AI saw, strengths, focus areas, timeline."
              : "The full written breakdown — what the AI saw, strengths, focus areas, timeline."}
          </p>

          {emailStage === "sent" || emailStage === "already" ? (
            <div className="bff-cta-sent">
              <span className="bff-cta-check" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div>
                <p className="bff-cta-sent-title">
                  {emailStage === "already"
                    ? "Your report is already on its way"
                    : "Report sent"}
                </p>
                <p className="bff-cta-sent-sub">
                  Give it a couple of minutes — check spam the first time.
                </p>
              </div>
            </div>
          ) : (
            <>
              <form
                className="bff-cta-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitReport();
                }}
              >
                <input
                  className="bff-cta-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-label="Email address for your full report"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailStage === "error") setEmailStage("idle");
                  }}
                  disabled={emailStage === "sending"}
                />
                <button
                  type="submit"
                  className="bff-cta-send"
                  disabled={emailStage === "sending"}
                >
                  {emailStage === "sending" ? "Building…" : "Email report"}
                </button>
              </form>
              {emailStage === "error" && (
                <p className="bff-cta-error" role="alert">
                  That didn't go through — check the address and try again.
                </p>
              )}
              <p className="bff-cta-note">
                We store your email and the report, never your photo.
              </p>
            </>
          )}
        </div>

        <div className="bff-disclaimer">
          <span className="bff-disclaimer-mark">i</span>
          <div>
            <strong>Single-photo estimates carry ±4–5% error.</strong> Good for
            a directional read, not for tracking small changes week-to-week.
          </div>
        </div>

        {(() => {
          // Spectrum Bridge — personalized strip of visualizer renders
          // centered on the user's estimate. Each figure deep-links into
          // the visualizer at that percentage.
          const g = sex === "female" ? "female" : "male";
          const steps =
            g === "female" ? [18, 22, 27, 32, 37, 42] : [8, 13, 18, 23, 28, 33];
          let nearest = 0;
          for (let i = 1; i < steps.length; i++) {
            if (Math.abs(steps[i] - targetNum) < Math.abs(steps[nearest] - targetNum))
              nearest = i;
          }
          const start = Math.max(0, Math.min(nearest - 1, steps.length - 4));
          const window4 = steps.slice(start, start + 4);
          const vizHref = (bf: number) =>
            `/tools/body-fat-visualizer/?g=${g}&bf=${bf}&age=30s`;
          return (
            <div className="bff-spectrum">
              <p className="bff-spectrum-title">Where you sit on the spectrum</p>
              <p className="bff-spectrum-sub">
                Same build, same lighting — only body fat changes.
              </p>
              <div className="bff-spectrum-strip">
                {window4.map((bf) => {
                  const isYou = bf === steps[nearest];
                  const delta = bf - steps[nearest];
                  return (
                    <a
                      key={bf}
                      className={`bff-spectrum-fig${isYou ? " is-you" : ""}`}
                      href={vizHref(bf)}
                      title={`See ${bf}% body fat in the visualizer`}
                      onClick={() =>
                        track("bf_tool_visualizer_clicked", { bf, is_you: isYou })
                      }
                    >
                      <span className="frame">
                        <img
                          src={`/tools/body-fat-visualizer/assets/physiques/${g}-age30s-bf${bf}.webp`}
                          alt={`${bf} percent body fat reference physique`}
                          loading="lazy"
                          width={220}
                          height={295}
                        />
                      </span>
                      {isYou ? (
                        <span className="you-chip">You · ~{Math.round(targetNum)}%</span>
                      ) : (
                        <span className="delta">
                          {delta > 0 ? `+${delta}%` : `${delta}%`}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
              <a
                className="bff-spectrum-link"
                href={vizHref(steps[nearest])}
                onClick={() =>
                  track("bf_tool_visualizer_clicked", {
                    bf: steps[nearest],
                    is_you: true,
                    cta: true,
                  })
                }
              >
                Drag through every level →
              </a>
            </div>
          );
        })()}

        {/* Highest-intent surface on the site: they just saw their current
            number — offer the "where a year takes you" render next. */}
        <a
          className="bff-crosslink-card"
          style={{ marginTop: 18 }}
          href="/tools/ai-body-transformation/"
          onClick={() =>
            track("bf_tool_cta_clicked", { cta_content: "future_you_crosslink" })
          }
        >
          <div className="bff-crosslink-text">
            <strong>Now see your future physique</strong>
            <span>
              That&apos;s where you are today. Our AI transformation tool
              renders the same photo after a year of consistent training —
              free, one render.
            </span>
          </div>
          <span className="bff-crosslink-arrow">Render →</span>
        </a>

        <p className="bff-retry-note">
          Today's free scan used · 3 per person total · The app has no limits
        </p>
      </>
    );
  }

  // -------- Unusable --------
  if (stage.kind === "unusable") {
    return (
      <div className="bff-card">
        <div className="bff-msg">
          <img
            className="bff-msg-mascot"
            src={MASCOT_SRC}
            alt=""
            aria-hidden
            width={96}
            height={96}
            style={{ transform: "rotate(-8deg)" }}
          />
          <p className="bff-msg-title">Couldn't read that one</p>
          <p className="bff-msg-sub">{stage.message}</p>
          <button type="button" className="bff-submit" style={{ maxWidth: 280, margin: "0 auto" }} onClick={reset}>
            Try a different photo <span className="arrow" aria-hidden>→</span>
          </button>
        </div>
      </div>
    );
  }

  // -------- Rate limited --------
  if (stage.kind === "rate_limited") {
    return (
      <div className="bff-card">
        <div className="bff-msg">
          <img
            className="bff-msg-mascot"
            src={MASCOT_SRC}
            alt=""
            aria-hidden
            width={96}
            height={96}
          />
          <p className="bff-msg-title">
            {stage.lifetime
              ? "You've used your 3 free scans"
              : "That's today's free scan"}
          </p>
          <ToolConversionCard
            tool={CTA_CAMPAIGN}
            campaign={SEO_PHYSIQUE_TOOLS_CPP.campaign}
            customProductPageId={SEO_PHYSIQUE_TOOLS_CPP.id}
            placement={stage.lifetime ? "lifetime_limit" : "daily_limit"}
            headline="Unlimited scans in GainFrame."
            eyebrow="Keep scanning"
            body="No daily cap — precise multi-photo body fat, 12 muscle scores, weekly trends. Free to start."
            desktopBody="Scan with your iPhone for unlimited scans, 12 muscle scores, and weekly trends — free to start."
            onCtaClick={() =>
              track("bf_tool_cta_clicked", {
                cta_content: stage.lifetime
                  ? "cta_lifetime_limited"
                  : "cta_rate_limited",
              })
            }
          />
        </div>
      </div>
    );
  }

  // -------- Error --------
  if (stage.kind === "error") {
    return (
      <div className="bff-card">
        <div className="bff-msg">
          <div className="bff-msg-icon is-error" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v3m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <p className="bff-msg-title">Something went wrong</p>
          <p className="bff-msg-sub">{stage.message}</p>
          <button type="button" className="bff-submit" style={{ maxWidth: 280, margin: "0 auto" }} onClick={reset}>
            Start over <span className="arrow" aria-hidden>→</span>
          </button>
        </div>
      </div>
    );
  }

  // -------- Idle (default) --------
  const submitDisabled = !file || sex === null;
  return (
    <div className="bff-card">
      <div className="bff-card-head">
        <span className="bff-card-head-label">Your photo</span>
        <span className="bff-card-head-meta">Step 1 of 2</span>
      </div>

      {!file ? (
        <label
          className={`bff-target ${isDragging ? "is-active" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />

          {/* Mascot peeks in from a corner — decorative, no text overlap */}
          <img
            className="bff-target-mascot"
            src={MASCOT_SRC}
            alt=""
            aria-hidden
            width={88}
            height={88}
          />

          <div className="bff-target-content">
            <svg
              className="bff-target-icon"
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <p className="bff-target-title">Drop a photo or click to upload</p>
            <p className="bff-target-sub">JPEG · PNG · HEIC — up to 10 MB</p>
          </div>
        </label>
      ) : (
        <div className="bff-target has-file">
          {previewUrl && (
            <>
              <img
                src={previewUrl}
                alt="Selected photo preview"
                className="bff-target-photo"
              />
              <span className="bff-target-photo-overlay" aria-hidden />
            </>
          )}
          <div className="bff-target-meta">
            <span>
              {(file.size / 1024 / 1024).toFixed(1)} MB ·{" "}
              {file.type.replace("image/", "")}
            </span>
            <button
              type="button"
              className="bff-target-replace"
              onClick={() => replaceInputRef.current?.click()}
            >
              Replace
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
      )}

      <div className="bff-field">
        <p className="bff-field-label">
          <span>Reference</span>
          <span className="bff-field-hint">Improves accuracy</span>
        </p>
        <div className="bff-pills">
          <button
            type="button"
            className={`bff-pill-btn ${sex === "male" ? "is-selected" : ""}`}
            onClick={() => setSex("male")}
          >
            Male
          </button>
          <button
            type="button"
            className={`bff-pill-btn ${sex === "female" ? "is-selected" : ""}`}
            onClick={() => setSex("female")}
          >
            Female
          </button>
          <button
            type="button"
            className={`bff-pill-btn ${sex === "skip" ? "is-selected" : ""}`}
            onClick={() => setSex("skip")}
          >
            Skip
          </button>
        </div>
      </div>

      <button
        type="button"
        className="bff-submit"
        disabled={submitDisabled}
        onClick={submit}
      >
        {submitDisabled ? "Pick a photo & reference" : (
          <>
            Get my estimate <span className="arrow" aria-hidden>→</span>
          </>
        )}
      </button>

      <p className="bff-privacy">
        <strong>Privacy:</strong> photo sent to Google's AI for the analysis
        call only · Not stored, not used to train models.
      </p>
    </div>
  );
}
