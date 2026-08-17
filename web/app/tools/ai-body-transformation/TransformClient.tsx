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
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/body-transform";
const STATUS_TIMEOUT_MS = 10_000;
const GENERATE_TIMEOUT_MS = 60_000;
const UNLOCK_TIMEOUT_MS = 20_000;
const TRANSFORM_RAW_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

const CTA_CAMPAIGN = "ai_body_transformation";
const MASCOT_SRC = "/assets/gainframe-guy/poses/gainframe-guy-wave.webp";
// Limit screens get the "out of battery" mascot — sympathetic, on-theme.
const MASCOT_TIRED_SRC = "/assets/gainframe-guy/poses/gainframe-guy-tired.webp";

type Sex = "male" | "female" | "skip";
type Goal = "lose_fat" | "build_muscle" | "recomp";
type Intensity = "realistic" | "strong" | "peak" | "fantasy";

// Mirrors the edge function's INTENSITY_TIERS ladder (ported from the app's
// QuickVisionIntensity). Index order == slider order.
const INTENSITY_STOPS: {
  key: Intensity;
  label: string;
  blurb: string;
}[] = [
  {
    key: "realistic",
    label: "Realistic",
    blurb: "A grounded year of consistent training. Believable progress.",
  },
  {
    key: "strong",
    label: "Strong",
    blurb: "A dedicated athlete's year — strict training, dialed nutrition.",
  },
  {
    key: "peak",
    label: "Peak",
    blurb: "Peak natural physique. Fitness-model territory.",
  },
  {
    key: "fantasy",
    label: "Fantasy",
    blurb: "Action-hero mode. Realism limits off — still you, though.",
  },
];

const ZONES = [
  { key: "shoulders", label: "Shoulders" },
  { key: "chest", label: "Chest" },
  { key: "arms", label: "Arms" },
  { key: "core", label: "Core" },
  { key: "back", label: "Back" },
  { key: "glutes", label: "Glutes" },
  { key: "legs", label: "Legs" },
] as const;
const MAX_ZONES = 3;

type Stage =
  | { kind: "idle" }
  | { kind: "processing" }
  | {
      kind: "result";
      afterUrl: string;
      afterMime: string;
      remaining: number;
      canUnlock: boolean;
    }
  | { kind: "unusable"; message: string }
  // canUnlock: an email unlocks one more lifetime render — offered on every
  // limit screen (lifetime AND ip-daily/capacity: the extra render persists
  // past the daily reset). Only hidden once already unlocked.
  | { kind: "rate_limited"; message: string; canUnlock: boolean; title?: string }
  | { kind: "error"; message: string };

type UnlockStage = "idle" | "sending" | "error";

type SuccessResponse = {
  image_base64: string;
  image_mime: string;
  model_used: string;
  remaining: number;
  can_unlock: boolean;
};

type ErrorResponse = {
  error: string;
  message?: string;
  can_unlock?: boolean;
  reason?: string;
};

type StatusResponse = {
  remaining: number;
  used?: number;
  unlocked: boolean;
  ip_limited?: boolean;
  capacity_limited?: boolean;
};

// Image gen runs 10–30s (vs the BF scan's ~8s), so the ladder is slower and
// narrates what the model is actually doing — the identity-lock line doubles
// as reassurance that the output will still look like them.
const PROCESSING_MESSAGES = [
  "Reading your photo",
  "Locking your identity — face, hair, markings",
  "Applying a year of training",
  "Rendering the future you",
  "Final pass — keeping it realistic",
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isSuccessResponse(value: unknown): value is SuccessResponse {
  return isRecord(value) &&
    typeof value.image_base64 === "string" && value.image_base64.length > 0 &&
    (value.image_mime === "image/jpeg" || value.image_mime === "image/png" ||
      value.image_mime === "image/webp") &&
    typeof value.model_used === "string" &&
    typeof value.remaining === "number" &&
    typeof value.can_unlock === "boolean";
}

function isStatusResponse(value: unknown): value is StatusResponse {
  return isRecord(value) &&
    typeof value.remaining === "number" &&
    typeof value.unlocked === "boolean" &&
    (value.ip_limited === undefined || typeof value.ip_limited === "boolean") &&
    (value.capacity_limited === undefined ||
      typeof value.capacity_limited === "boolean");
}

function errorResponse(value: Record<string, unknown>): ErrorResponse {
  return {
    error: typeof value.error === "string" ? value.error : "unknown_error",
    message: typeof value.message === "string" ? value.message : undefined,
    reason: typeof value.reason === "string" ? value.reason : undefined,
    can_unlock: typeof value.can_unlock === "boolean"
      ? value.can_unlock
      : undefined,
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

// Side-by-side before/after composite with a small watermark bar — the
// classic transformation share format. Built entirely client-side; the
// server never stores either image.
async function buildShareImage(
  beforeUrl: string,
  afterUrl: string,
): Promise<string> {
  const load = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Image load failed"));
      el.src = src;
    });
  const [before, after] = await Promise.all([load(beforeUrl), load(afterUrl)]);

  const panelH = 1200;
  const panelW = Math.round(panelH * 0.75); // 3:4 panels
  const barH = 88;
  const canvas = document.createElement("canvas");
  canvas.width = panelW * 2;
  canvas.height = panelH + barH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#14140f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawCover = (img: HTMLImageElement, x: number) => {
    const scale = Math.max(panelW / img.width, panelH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, 0, panelW, panelH);
    ctx.clip();
    ctx.drawImage(img, x + (panelW - dw) / 2, (panelH - dh) / 2, dw, dh);
    ctx.restore();
  };
  drawCover(before, 0);
  drawCover(after, panelW);

  // Panel labels
  ctx.font = "700 34px Geist, -apple-system, sans-serif";
  ctx.textBaseline = "top";
  const label = (text: string, x: number) => {
    const pad = 14;
    const w = ctx.measureText(text).width + pad * 2;
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.beginPath();
    ctx.roundRect(x, 24, w, 58, 12);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x + pad, 36);
  };
  label("NOW", 24);
  label("+1 YEAR", panelW + 24);

  // Watermark bar
  ctx.fillStyle = "#14140f";
  ctx.fillRect(0, panelH, canvas.width, barH);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 32px Geist, -apple-system, sans-serif";
  ctx.fillText("gainframe.app", 28, panelH + 27);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "400 26px Geist, -apple-system, sans-serif";
  const note = "AI projection · not a guarantee";
  ctx.fillText(
    note,
    canvas.width - ctx.measureText(note).width - 28,
    panelH + 30,
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function TransformClient() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [goal, setGoal] = useState<Goal>("recomp");
  const [zones, setZones] = useState<string[]>([]);
  const [intensityIdx, setIntensityIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [processingIdx, setProcessingIdx] = useState(0);
  // Before/after scrubber position, 0–100 (% of width showing the BEFORE).
  const [scrub, setScrub] = useState(50);
  const [email, setEmail] = useState("");
  const [unlockStage, setUnlockStage] = useState<UnlockStage>("idle");
  const [unlockedNote, setUnlockedNote] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const viewedRef = useRef(false);
  const submittingRef = useRef(false);
  const unlockSubmittingRef = useRef(false);
  const clientIdRef = useRef<string | null>(null);
  const afterUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      track("bt_tool_view");
    }

    // Visitors who can't render right now — lifetime spent, IP daily cap,
    // or global capacity — skip straight to the limit screen instead of
    // uploading and aiming a photo that can't be rendered.
    const clientId = getOrCreateClientId();
    clientIdRef.current = clientId;
    const controller = new AbortController();
    let active = true;
    const attemptId = createAttemptId();
    const startedAt = toolNow();

    void (async () => {
      try {
        const res = await fetchWithTimeout(
          FUNCTION_URL,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "status",
              client_id: clientId,
              request_id: attemptId,
              attempt_id: attemptId,
            }),
            signal: controller.signal,
          },
          STATUS_TIMEOUT_MS,
        );
        if (!active) return;

        if (!res.ok) {
          const err = errorResponse(await errorResponseJson(res));
          if (res.status === 429) {
            track("bt_tool_rate_limited", {
              kind: err.error,
              ...terminalTelemetry({
                attemptId,
                startedAt,
                phase: "status",
                errorType: "rate_limit",
                code: err.error,
                status: res.status,
                retryable: err.error !== "lifetime_limited",
                source: "preflight",
              }),
              blocking: true,
            });
            setStage((current) => current.kind === "idle"
              ? {
                  kind: "rate_limited",
                  canUnlock: err.can_unlock === true,
                  title: err.error === "rate_limited" || err.error === "capacity"
                    ? "Daily limit reached"
                    : undefined,
                  message: err.message ??
                    "You've used your free render. The GainFrame app has no limits.",
                }
              : current);
            return;
          }
          const common = {
            ...terminalTelemetry({
              attemptId,
              startedAt,
              phase: "status",
              errorType: "http",
              code: err.error,
              status: res.status,
              retryable: res.status >= 500 || res.status === 408,
              source: "preflight",
            }),
            blocking: false,
          };
          track("bt_tool_status_failed", {
            ...common,
            status: res.status,
            code: err.error,
          });
          if (res.status !== 422) {
            track("bt_tool_error", { ...common, status: res.status, code: err.error });
            const exception = new Error(
              `Transformation status request failed with HTTP ${res.status}`,
            );
            captureException(exception, {
              tool: "body_transformation",
              ...common,
            });
          }
          return;
        }

        const json = await validatedJson(res, isStatusResponse);
        if (!active) return;
        if (json.ip_limited || json.capacity_limited || json.remaining <= 0) {
          const kind = json.capacity_limited
            ? "capacity"
            : json.ip_limited
              ? "rate_limited"
              : "lifetime_limited";
          track("bt_tool_rate_limited", {
            kind,
            ...terminalTelemetry({
              attemptId,
              startedAt,
              phase: "status",
              errorType: "rate_limit",
              code: kind,
              status: res.status,
              retryable: kind !== "lifetime_limited",
              source: "preflight",
            }),
            blocking: true,
          });
          setStage((current) => {
            if (current.kind !== "idle") return current;
            if (json.ip_limited || json.capacity_limited) {
              return {
                kind: "rate_limited",
                title: "Daily limit reached",
                canUnlock: !json.unlocked,
                message: json.capacity_limited
                  ? "The free tool is at capacity for today — come back tomorrow. Drop your email now and an extra render will be waiting."
                  : "Too many renders from this connection today — try tomorrow. Drop your email now and an extra render will be waiting.",
              };
            }
            return {
              kind: "rate_limited",
              canUnlock: !json.unlocked,
              message: json.unlocked
                ? "Both free renders are used. GainFrame on iOS has unlimited AI transformations — plus the coaching to actually get there."
                : "You've used your free render. Drop your email to unlock one more — or get unlimited renders in the GainFrame app.",
            };
          });
        }
      } catch (error) {
        if (!active) return;
        const failure = asToolClientError(error);
        const common = {
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "status",
            errorType: failure.errorType,
            code: failure.code,
            status: failure.status,
            retryable: failure.retryable,
            source: "preflight",
          }),
          blocking: false,
        };
        track("bt_tool_status_failed", { ...common, error: failure.message });
        track("bt_tool_error", { ...common, error: failure.message });
        captureException(error, {
          tool: "body_transformation",
          ...common,
        });
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
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
    }, 4000);
    return () => clearInterval(id);
  }, [stage.kind]);

  // Result entrance: sweep the scrubber from "before" to a centered rest so
  // the change reads immediately without any interaction.
  useEffect(() => {
    if (stage.kind !== "result") return;
    setScrub(100);
    const t1 = setTimeout(() => setScrub(18), 350);
    return () => clearTimeout(t1);
  }, [stage.kind]);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setStage({ kind: "idle" });
    setZones([]);
    setEmail("");
    setUnlockStage("idle");
  }

  function toggleZone(key: string) {
    setZones((prev) => {
      if (prev.includes(key)) return prev.filter((z) => z !== key);
      if (prev.length >= MAX_ZONES) return prev;
      return [...prev, key];
    });
  }

  function onPick(picked: File | null) {
    if (!picked) return;
    if (!isLikelyImageFile(picked)) {
      const attemptId = createAttemptId();
      const startedAt = toolNow();
      track("bt_tool_unusable", {
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
        message:
          "That file isn't a supported image. Use JPEG, PNG, WebP, HEIC, or HEIF.",
      });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    setStage({ kind: "idle" });
    track("bt_tool_photo_uploaded", {
      size_kb: Math.round(picked.size / 1024),
      mime: picked.type,
    });
  }

  async function submit() {
    if (!file) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStage({ kind: "processing" });
    const attemptId = createAttemptId();
    const startedAt = toolNow();
    let phase = "preprocess";
    let processed: PreprocessedImage | undefined;
    track("bt_tool_generate_requested", {
      sex: sex ?? "skip",
      goal,
      zones: zones.join(","),
      intensity: INTENSITY_STOPS[intensityIdx].key,
      attempt_id: attemptId,
      source: "client",
      ...fileTelemetry(file),
    });

    try {
      processed = await preprocessImageForUpload(file, {
        allowedRawMimes: TRANSFORM_RAW_MIMES,
      });
      const clientId = clientIdRef.current ?? getOrCreateClientId();
      clientIdRef.current = clientId;
      phase = "generate";
      const analyticsConsent = documentAnalyticsConsentGranted(
        document.documentElement,
      );
      const res = await fetchWithTimeout(
        FUNCTION_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate",
            client_id: clientId,
            photo_base64: processed.base64,
            photo_mime: processed.photoMime,
            sex: sex && sex !== "skip" ? sex : null,
            goal,
            zones,
            intensity: INTENSITY_STOPS[intensityIdx].key,
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
        GENERATE_TIMEOUT_MS,
      );

      if (res.ok) {
        phase = "response_parse";
        const json = await validatedJson(res, isSuccessResponse);
        const afterUrl = `data:${json.image_mime};base64,${json.image_base64}`;
        afterUrlRef.current = afterUrl;
        track("bt_tool_result_shown", {
          model: json.model_used,
          remaining: json.remaining,
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "generate",
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
          afterUrl,
          afterMime: json.image_mime,
          remaining: json.remaining,
          canUnlock: json.can_unlock,
        });
        return;
      }

      const err = errorResponse(await errorResponseJson(res));
      if (res.status === 429) {
        track("bt_tool_rate_limited", {
          kind: err.error,
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "generate",
            errorType: "rate_limit",
            code: err.error,
            status: res.status,
            retryable: err.error !== "lifetime_limited",
            source: "server",
          }),
          blocking: true,
          ...fileTelemetry(file, processed),
        });
        setStage({
          kind: "rate_limited",
          canUnlock: err.can_unlock === true,
          title: err.error === "rate_limited" || err.error === "capacity"
            ? "Daily limit reached"
            : undefined,
          message: err.message ??
            "You've used your free render. The GainFrame app has no limits.",
        });
      } else if (res.status === 422) {
        const reason = err.reason ?? err.error ?? "photo_unusable";
        track("bt_tool_unusable", {
          reason,
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "generate",
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
          message: err.message ??
            "We can't render that photo. Use a clear, recent photo of yourself with at least your torso visible.",
        });
      } else {
        const common = {
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "generate",
            errorType: "http",
            code: err.error,
            status: res.status,
            retryable: res.status >= 500 || res.status === 408,
            source: "server",
          }),
          blocking: true,
          ...fileTelemetry(file, processed),
        };
        track("bt_tool_error", { ...common, status: res.status, code: err.error });
        captureException(
          new Error(`Transformation request failed with HTTP ${res.status}`),
          { tool: "body_transformation", ...common },
        );
        setStage({
          kind: "error",
          message: "Something went wrong. Your render wasn't used — try again.",
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
        track("bt_tool_unusable", { ...common, reason: failure.code });
        setStage({ kind: "unusable", message: failure.message });
        return;
      }
      track("bt_tool_error", { ...common, error: failure.message });
      if (shouldCaptureTechnicalError(failure.code)) {
        captureException(err, { tool: "body_transformation", ...common });
      }
      setStage({
        kind: "error",
        message: failure.errorType === "timeout"
          ? "That render took too long. Please try again."
          : "Something went wrong preparing that photo. Please try again.",
      });
    } finally {
      submittingRef.current = false;
    }
  }

  async function submitUnlock() {
    if (unlockSubmittingRef.current) return;
    const attemptId = createAttemptId();
    const startedAt = toolNow();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      track("bt_tool_email_submitted", {
        outcome: "validation_failed",
        ...terminalTelemetry({
          attemptId,
          startedAt,
          phase: "unlock",
          errorType: "validation",
          code: "invalid_email",
          retryable: true,
          source: "client",
        }),
        blocking: true,
      });
      setUnlockStage("error");
      return;
    }
    unlockSubmittingRef.current = true;
    setUnlockStage("sending");
    track("bt_tool_email_submitted", {
      outcome: "requested",
      attempt_id: attemptId,
      source: "client",
    });
    try {
      const clientId = clientIdRef.current ?? getOrCreateClientId();
      clientIdRef.current = clientId;
      const analyticsConsent = documentAnalyticsConsentGranted(
        document.documentElement,
      );
      const res = await fetchWithTimeout(
        FUNCTION_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "unlock",
            client_id: clientId,
            email: trimmed,
            analytics_consent: analyticsConsent,
            ...(analyticsConsent
              ? { posthog_distinct_id: getPosthogDistinctId() }
              : {}),
            request_id: attemptId,
            attempt_id: attemptId,
          }),
        },
        UNLOCK_TIMEOUT_MS,
      );
      if (res.ok) {
        track("bt_tool_second_run_unlocked", {
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "unlock",
            errorType: "none",
            code: "ok",
            status: res.status,
            retryable: false,
            source: "server",
          }),
          blocking: false,
        });
        setUnlockStage("idle");
        setUnlockedNote(true);
        setEmail("");
        // Back to the form with the photo still loaded — one tap to re-render.
        setStage({ kind: "idle" });
      } else {
        const err = errorResponse(await errorResponseJson(res));
        const common = {
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "unlock",
            errorType: "http",
            code: err.error,
            status: res.status,
            retryable: res.status >= 500 || res.status === 408 || res.status === 429,
            source: "server",
          }),
          blocking: true,
        };
        track("bt_tool_unlock_error", {
          ...common,
          status: res.status,
          code: err.error,
        });
        if (res.status !== 422 && res.status !== 429) {
          track("bt_tool_error", { ...common, status: res.status, code: err.error });
          captureException(
            new Error(`Transformation unlock failed with HTTP ${res.status}`),
            { tool: "body_transformation", ...common },
          );
        }
        setUnlockStage("error");
      }
    } catch (error) {
      const failure = asToolClientError(error);
      const common = {
        ...terminalTelemetry({
          attemptId,
          startedAt,
          phase: "unlock",
          errorType: failure.errorType,
          code: failure.code,
          status: failure.status,
          retryable: failure.retryable,
          source: "client",
        }),
        blocking: true,
      };
      track("bt_tool_unlock_error", { ...common, error: failure.message });
      track("bt_tool_error", { ...common, error: failure.message });
      captureException(error, { tool: "body_transformation", ...common });
      setUnlockStage("error");
    } finally {
      unlockSubmittingRef.current = false;
    }
  }

  async function downloadShare() {
    const afterUrl = afterUrlRef.current;
    if (!previewUrl || !afterUrl) return;
    const attemptId = createAttemptId();
    const startedAt = toolNow();
    track("bt_tool_download_clicked", {
      attempt_id: attemptId,
      source: "client",
    });
    const triggerDownload = (href: string) => {
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = "gainframe-future-you.jpg";
      anchor.click();
    };
    try {
      const dataUrl = await buildShareImage(previewUrl, afterUrl);
      triggerDownload(dataUrl);
      track("bt_tool_download_completed", {
        format: "composite",
        ...terminalTelemetry({
          attemptId,
          startedAt,
          phase: "download",
          errorType: "none",
          code: "ok",
          retryable: false,
          source: "client",
        }),
        blocking: false,
      });
    } catch (compositeError) {
      try {
        triggerDownload(afterUrl);
        track("bt_tool_download_completed", {
          format: "raw_fallback",
          fallback_code: "share_composite_failed",
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "download",
            errorType: "none",
            code: "ok",
            retryable: false,
            source: "client",
          }),
          blocking: false,
        });
      } catch (fallbackError) {
        const failure = asToolClientError(fallbackError);
        const common = {
          ...terminalTelemetry({
            attemptId,
            startedAt,
            phase: "download",
            errorType: failure.errorType,
            code: "download_failed",
            retryable: true,
            source: "client",
          }),
          blocking: true,
        };
        track("bt_tool_download_error", { ...common, error: failure.message });
        captureException(fallbackError, {
          tool: "body_transformation",
          ...common,
          fallback_code: "share_composite_failed",
          composite_error_type: compositeError instanceof Error
            ? compositeError.name
            : "unknown",
        });
      }
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

  const unlockForm = (ctaLabel: string) => (
    <>
      <form
        className="btf-unlock-form"
        onSubmit={(e) => {
          e.preventDefault();
          submitUnlock();
        }}
      >
        <input
          className="btf-unlock-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Email address to unlock one more render"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (unlockStage === "error") setUnlockStage("idle");
          }}
          disabled={unlockStage === "sending"}
        />
        <button
          type="submit"
          className="btf-unlock-send"
          disabled={unlockStage === "sending"}
        >
          {unlockStage === "sending" ? "Unlocking…" : ctaLabel}
        </button>
      </form>
      {unlockStage === "error" && (
        <p className="btf-unlock-error" role="alert">
          That didn&apos;t go through — check the address and try again.
        </p>
      )}
      <p className="btf-unlock-note">
        We store your email, never your photos. Occasional GainFrame updates,
        unsubscribe anytime.
      </p>
    </>
  );

  // ============ RENDER ============

  // -------- Processing --------
  if (stage.kind === "processing") {
    return (
      <div className="btf-card">
        <div className="btf-card-head">
          <span className="btf-card-head-label">Rendering</span>
          <span className="btf-card-head-meta">Takes 10–30 seconds</span>
        </div>

        <div className="btf-target is-processing has-file">
          {previewUrl && (
            <>
              <img
                src={previewUrl}
                alt="Photo being transformed"
                className="btf-target-photo"
              />
              <span className="btf-target-photo-overlay" aria-hidden />
            </>
          )}
          <span className="btf-scan-line" aria-hidden />
        </div>

        <div className="btf-status-block">
          <div className="btf-status-line" key={processingIdx}>
            <span className="dot" aria-hidden />
            <span>{PROCESSING_MESSAGES[processingIdx]}…</span>
          </div>
          <div className="btf-status-track" aria-hidden />
        </div>
      </div>
    );
  }

  // -------- Result --------
  if (stage.kind === "result") {
    return (
      <>
        <div className="btf-card btf-card--result">
          <div className="btf-result-head">
            <span className="btf-result-tag">
              <span className="dot" aria-hidden />
              Render complete
            </span>
            <span className="btf-result-hint">Drag the divider</span>
          </div>

          {/* Before/after scrubber. The range input is the interaction layer
              (invisible, full-bleed) so keyboard and touch both work. */}
          <div className="btf-compare">
            <img
              className="btf-compare-after"
              src={stage.afterUrl}
              alt="AI projection of you after one year of training"
            />
            <div
              className="btf-compare-before"
              style={{ width: `${scrub}%` }}
              aria-hidden
            >
              {previewUrl && (
                <img src={previewUrl} alt="" className="btf-compare-before-img" />
              )}
            </div>
            <span className="btf-compare-label is-before" aria-hidden>
              Now
            </span>
            <span className="btf-compare-label is-after" aria-hidden>
              +1 year
            </span>
            <span
              className="btf-compare-handle"
              style={{ left: `${scrub}%` }}
              aria-hidden
            >
              <span className="btf-compare-grip">
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 1L1 6l5 5M14 1l5 5-5 5" />
                </svg>
              </span>
            </span>
            <input
              className="btf-compare-range"
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={scrub}
              aria-label="Reveal before and after"
              onChange={(e) => setScrub(Number(e.target.value))}
            />
          </div>

          <div className="btf-result-actions">
            <button type="button" className="btf-download" onClick={downloadShare}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Save before / after
            </button>
            <button type="button" className="btf-secondary" onClick={reset}>
              Start over
            </button>
          </div>

          {/* Lowest-friction next step on the page. They have just seen a
              projection of where a year goes; the free photo estimator gives
              them today's real number without an install. Mirrors the
              future-you card on the estimator, which is that tool's
              best-performing CTA by a wide margin. */}
          <a
            className="btf-crosslink-card"
            style={{ marginTop: 18 }}
            href="/tools/body-fat-from-photo/"
            onClick={() =>
              track("bt_tool_cta_clicked", { cta_content: "bf_tool_crosslink" })
            }
          >
            <div className="btf-crosslink-text">
              <strong>Now get your real number</strong>
              <span>
                That&apos;s where a year could take you. Our AI reads your
                current body fat percentage from the same kind of photo — free,
                no signup.
              </span>
            </div>
            <span className="btf-crosslink-arrow">Scan →</span>
          </a>

          <p className="btf-result-honesty">
            This is a motivational AI projection of one consistent year — not a
            guarantee. The work is still the work.
          </p>
        </div>

        <ToolConversionCard
          tool={CTA_CAMPAIGN}
          campaign="web-bttool"
          placement="result"
          headline="That render is the preview. Track the real thing in GainFrame."
          body="The app tracks your real progress photos against this projection, re-renders at any intensity, and the AI coach adjusts as your body changes — free to start."
          desktopBody="Scan with your iPhone to track your real progress photos against this projection — free to start."
          onCtaClick={() =>
            track("bt_tool_cta_clicked", { cta_content: "cta_primary" })
          }
        />

        {stage.remaining === 0 && stage.canUnlock && (
          <div className="btf-cta-block">
            <span className="btf-cta-glow" aria-hidden />
            <p className="btf-cta-block-title">Or unlock one more render</p>
            {unlockForm("Unlock render")}
          </div>
        )}

        <p className="btf-retry-note">
          {stage.remaining > 0
            ? `${stage.remaining} render left — make it count`
            : "Free renders used · Unlimited in the app"}
        </p>
      </>
    );
  }

  // -------- Unusable --------
  if (stage.kind === "unusable") {
    return (
      <div className="btf-card">
        <div className="btf-msg">
          <img
            className="btf-msg-mascot"
            src={MASCOT_SRC}
            alt=""
            aria-hidden
            width={96}
            height={96}
            style={{ transform: "rotate(-8deg)" }}
          />
          <p className="btf-msg-title">Couldn&apos;t render that one</p>
          <p className="btf-msg-sub">{stage.message}</p>
          <p className="btf-msg-fine">
            Failed photos don&apos;t count against your free render.
          </p>
          <button
            type="button"
            className="btf-submit"
            style={{ maxWidth: 280, margin: "0 auto" }}
            onClick={reset}
          >
            Try a different photo <span className="arrow" aria-hidden>→</span>
          </button>
        </div>
      </div>
    );
  }

  // -------- Rate limited --------
  if (stage.kind === "rate_limited") {
    return (
      <div className="btf-card">
        <div className="btf-msg">
          <img
            className="btf-msg-mascot btf-msg-mascot--tired"
            src={MASCOT_TIRED_SRC}
            alt=""
            aria-hidden
            width={120}
            height={96}
          />
          <p className="btf-msg-title">
            {stage.title ??
              (stage.canUnlock
                ? "Your free render is used"
                : "No renders left here")}
          </p>
          <p className="btf-msg-sub">{stage.message}</p>

          {stage.canUnlock ? (
            <div className="btf-msg-unlock">{unlockForm("Unlock one more")}</div>
          ) : null}

          <ToolConversionCard
            tool={CTA_CAMPAIGN}
            campaign="web-bttool"
            placement={stage.canUnlock ? "daily_limit" : "lifetime_limit"}
            headline="Unlimited AI transformations in GainFrame."
            eyebrow="Keep rendering"
            body="Render at any intensity and track real progress photos against the projection — free to start."
            desktopBody="Scan with your iPhone for unlimited renders and real progress tracking — free to start."
            onCtaClick={() =>
              track("bt_tool_cta_clicked", {
                cta_content: stage.canUnlock
                  ? "cta_rate_limited"
                  : "cta_lifetime_limited",
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
      <div className="btf-card">
        <div className="btf-msg">
          <div className="btf-msg-icon is-error" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v3m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>
          <p className="btf-msg-title">Something went wrong</p>
          <p className="btf-msg-sub">{stage.message}</p>
          <button
            type="button"
            className="btf-submit"
            style={{ maxWidth: 280, margin: "0 auto" }}
            onClick={() => setStage({ kind: "idle" })}
          >
            Try again <span className="arrow" aria-hidden>→</span>
          </button>
        </div>
      </div>
    );
  }

  // -------- Idle (default) --------
  const submitDisabled = !file || sex === null;
  return (
    <div className="btf-card">
      {unlockedNote && (
        <div className="btf-unlocked-banner" role="status">
          <span className="dot" aria-hidden />
          Second render unlocked — this one&apos;s your best shot.
        </div>
      )}

      <div className="btf-card-head">
        <span className="btf-card-head-label">Your photo</span>
        <span className="btf-card-head-meta">1 free render — aim it well</span>
      </div>

      {!file ? (
        <label
          className={`btf-target ${isDragging ? "is-active" : ""}`}
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
          <img
            className="btf-target-mascot"
            src={MASCOT_SRC}
            alt=""
            aria-hidden
            width={88}
            height={88}
          />
          <div className="btf-target-content">
            <svg
              className="btf-target-icon"
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
            <p className="btf-target-title">Drop a photo or click to upload</p>
            <p className="btf-target-sub">
              Torso visible, good light · JPEG · PNG · HEIC
            </p>
          </div>
        </label>
      ) : (
        <div className="btf-target has-file">
          {previewUrl && (
            <>
              <img
                src={previewUrl}
                alt="Selected photo preview"
                className="btf-target-photo"
              />
              <span className="btf-target-photo-overlay" aria-hidden />
            </>
          )}
          <div className="btf-target-meta">
            <span>
              {(file.size / 1024 / 1024).toFixed(1)} MB ·{" "}
              {file.type.replace("image/", "")}
            </span>
            <button
              type="button"
              className="btf-target-replace"
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

      {!file && (
        <p className="btf-aim-hint">
          Aim &amp; intensity appear once your photo&apos;s in
        </p>
      )}

      {file && (
      <div className="btf-aim">
      <div className="btf-field">
        <p className="btf-field-label">
          <span>The year ahead</span>
          <span className="btf-field-hint">Shapes the transformation</span>
        </p>
        <div className="btf-pills btf-pills--3">
          <button
            type="button"
            className={`btf-pill-btn ${goal === "lose_fat" ? "is-selected" : ""}`}
            onClick={() => setGoal("lose_fat")}
          >
            Lose fat
          </button>
          <button
            type="button"
            className={`btf-pill-btn ${goal === "build_muscle" ? "is-selected" : ""}`}
            onClick={() => setGoal("build_muscle")}
          >
            Build muscle
          </button>
          <button
            type="button"
            className={`btf-pill-btn ${goal === "recomp" ? "is-selected" : ""}`}
            onClick={() => setGoal("recomp")}
          >
            Both
          </button>
        </div>
      </div>

      <div className="btf-field">
        <p className="btf-field-label">
          <span>Emphasize</span>
          <span className="btf-field-hint">
            {zones.length === 0
              ? "Optional · pick up to 3"
              : `${zones.length}/${MAX_ZONES} selected`}
          </span>
        </p>
        <div className="btf-zones">
          {ZONES.map((z) => {
            const selected = zones.includes(z.key);
            const full = !selected && zones.length >= MAX_ZONES;
            return (
              <button
                key={z.key}
                type="button"
                className={`btf-zone-chip ${selected ? "is-selected" : ""}`}
                disabled={full}
                aria-pressed={selected}
                onClick={() => toggleZone(z.key)}
              >
                {z.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="btf-field">
        <p className="btf-field-label">
          <span>How far to push it</span>
          <span className="btf-field-hint">
            {INTENSITY_STOPS[intensityIdx].label}
          </span>
        </p>
        <div className="btf-intensity">
          <input
            className="btf-intensity-range"
            type="range"
            min={0}
            max={INTENSITY_STOPS.length - 1}
            step={1}
            value={intensityIdx}
            aria-label="Transformation intensity, realistic to fantasy"
            aria-valuetext={INTENSITY_STOPS[intensityIdx].label}
            data-fantasy={
              INTENSITY_STOPS[intensityIdx].key === "fantasy" || undefined
            }
            onChange={(e) => setIntensityIdx(Number(e.target.value))}
          />
          <div className="btf-intensity-stops" aria-hidden>
            {INTENSITY_STOPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                tabIndex={-1}
                className={`btf-intensity-stop ${i === intensityIdx ? "is-active" : ""}`}
                onClick={() => setIntensityIdx(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="btf-intensity-blurb">
            {INTENSITY_STOPS[intensityIdx].blurb}
          </p>
        </div>
      </div>

      <div className="btf-field">
        <p className="btf-field-label">
          <span>Reference</span>
          <span className="btf-field-hint">Tunes the changes</span>
        </p>
        <div className="btf-pills btf-pills--3">
          <button
            type="button"
            className={`btf-pill-btn ${sex === "male" ? "is-selected" : ""}`}
            onClick={() => setSex("male")}
          >
            Male
          </button>
          <button
            type="button"
            className={`btf-pill-btn ${sex === "female" ? "is-selected" : ""}`}
            onClick={() => setSex("female")}
          >
            Female
          </button>
          <button
            type="button"
            className={`btf-pill-btn ${sex === "skip" ? "is-selected" : ""}`}
            onClick={() => setSex("skip")}
          >
            Skip
          </button>
        </div>
      </div>
      </div>
      )}

      <button
        type="button"
        className="btf-submit"
        disabled={submitDisabled}
        onClick={submit}
      >
        {!file ? "Add a photo to start" : submitDisabled ? "Pick a reference to render" : (
          <>
            Render future me <span className="arrow" aria-hidden>→</span>
          </>
        )}
      </button>

      <p className="btf-privacy">
        <strong>Privacy:</strong> photo sent to the AI service for the render
        call only · Never stored, never used to train models.
      </p>
    </div>
  );
}
