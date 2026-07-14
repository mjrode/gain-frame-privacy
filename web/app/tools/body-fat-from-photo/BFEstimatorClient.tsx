"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

const FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/bf-estimate";
const REPORT_FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/bf-full-report";

const CTA_CAMPAIGN = "bf_from_photo";
const MASCOT_SRC = "/assets/gainframe-guy/poses/gainframe-guy-wave.png";

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
};

const PROCESSING_MESSAGES = [
  "Looking for visual cues",
  "Checking proportions",
  "Cross-referencing the ranges",
  "Crunching the numbers",
];

// Secret URL bypass for the per-day rate limit. When the page is loaded with
// `?dev=gainframe` (or window.GF_DEV_BYPASS = true is set in the console),
// every estimate uses a fresh UUID, so the (ip + client_id) fingerprint
// is unique per call and never collides with today's rate-limit row.
// The function itself still rate-limits — we just dodge the bucket on the
// client side so internal testing isn't blocked.
const DEV_BYPASS_TOKEN = "gainframe";

function isDevBypass(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === DEV_BYPASS_TOKEN) return true;
  } catch {
    /* ignore */
  }
  // Allow toggling from DevTools without a reload.
  return Boolean((window as unknown as { GF_DEV_BYPASS?: boolean }).GF_DEV_BYPASS);
}

function getOrCreateClientId(): string {
  // Dev bypass: fresh UUID every call → rate limit never collides.
  if (isDevBypass()) return crypto.randomUUID();

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
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1] ?? "";
    return { base64, sizeKb: Math.round((base64.length * 3) / 4 / 1024) };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function appStoreUrl(content: string): string {
  const params = new URLSearchParams({
    utm_source: "web",
    utm_medium: "tool",
    utm_campaign: CTA_CAMPAIGN,
    utm_content: content,
  });
  return `${SITE.appStoreUrl}?${params.toString()}`;
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
  }

  async function submitReport() {
    if (stage.kind !== "result") return;
    if (emailSubmittingRef.current) return;
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailStage("error");
      return;
    }
    const photoBase64 = photoBase64Ref.current;
    const clientId = estimateClientIdRef.current;
    if (!photoBase64 || !clientId) {
      // Shouldn't happen (both are set before any result renders), but if
      // the refs are gone there's nothing to analyze — surface the error.
      setEmailStage("error");
      return;
    }

    emailSubmittingRef.current = true;
    setEmailStage("sending");
    track("bf_tool_email_submitted", {});

    try {
      const res = await fetch(REPORT_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          email: trimmed,
          photo_base64: photoBase64,
          photo_mime: "image/jpeg",
          sex: sex && sex !== "skip" ? sex : null,
          estimate: stage.estimate,
          confidence: stage.confidence,
          // Lets the server-side bf_tool_report_lead event land on the same
          // PostHog person as this browser's client-side events.
          posthog_distinct_id:
            (window.posthog as unknown as {
              get_distinct_id?: () => string;
            })?.get_distinct_id?.() ?? null,
        }),
      });
      if (res.ok) {
        track("bf_tool_report_sent", {});
        setEmailStage("sent");
      } else if (res.status === 429) {
        // Already sent today — from the user's perspective that's success.
        track("bf_tool_report_sent", { already: true });
        setEmailStage("already");
      } else {
        const err = (await res.json().catch(() => ({}))) as ErrorResponse;
        track("bf_tool_report_error", { status: res.status, code: err.error });
        setEmailStage("error");
      }
    } catch (err) {
      track("bf_tool_report_error", { error: (err as Error).message });
      setEmailStage("error");
    } finally {
      emailSubmittingRef.current = false;
    }
  }

  function onPick(picked: File | null) {
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      setStage({ kind: "error", message: "Please pick an image file." });
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
    track("bf_tool_estimate_requested", {
      sex: sex ?? "skip",
      run_index: nextRunIndex(),
    });

    try {
      const { base64 } = await preprocessImage(file);
      const clientId = getOrCreateClientId();
      estimateClientIdRef.current = clientId;
      photoBase64Ref.current = base64;
      const payload = {
        client_id: clientId,
        photo_base64: base64,
        photo_mime: "image/jpeg",
        sex: sex && sex !== "skip" ? sex : null,
      };
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = (await res.json()) as SuccessResponse;
        track("bf_tool_result_shown", {
          estimate: json.estimate,
          confidence: json.confidence,
        });
        setStage({
          kind: "result",
          estimate: json.estimate,
          confidence: json.confidence,
          one_line: json.one_line,
        });
        return;
      }

      const err = (await res.json().catch(() => ({}))) as ErrorResponse;
      if (res.status === 429) {
        const lifetime = err.error === "lifetime_limited";
        track("bf_tool_rate_limited", { kind: lifetime ? "lifetime" : "daily" });
        setStage({
          kind: "rate_limited",
          lifetime,
          message:
            err.message ??
            "You've used your free estimate for today. Try GainFrame for unlimited weekly check-ins.",
        });
      } else if (res.status === 422) {
        track("bf_tool_photo_unusable", { reason: err.message ?? "unknown" });
        setStage({
          kind: "unusable",
          message:
            err.message ??
            "Couldn't analyze that photo. Try a clearer, well-lit shot.",
        });
      } else {
        track("bf_tool_error", { status: res.status, code: err.error });
        setStage({
          kind: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      track("bf_tool_error", { error: (err as Error).message });
      setStage({
        kind: "error",
        message: (err as Error).message ?? "Network error. Please try again.",
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

        {/* One block, both asks — the page's single conversion unit. Green
            download is the loudest element; the email row sits below an
            "or get it in writing" divider, zero taps to reach the field. */}
        <div className="bff-cta-block">
          <span className="bff-cta-glow" aria-hidden />
          <p className="bff-cta-block-title">Take this past a one-off guess</p>
          <p className="bff-cta-block-sub">
            Precise multi-photo body fat, 12 muscle scores, weekly trends —
            free to start.
          </p>
          <a
            className="bff-cta-download"
            href={appStoreUrl("cta_primary")}
            target="_blank"
            rel="noopener"
            // Fires its own outbound event below with the campaign source —
            // exempt from the global AppStoreClickTracker to avoid double counts.
            data-track-exempt="true"
            onClick={() => {
              track("bf_tool_cta_clicked", { cta_content: "cta_primary" });
              track("outbound_app_store_click", {
                source: CTA_CAMPAIGN,
                cta_content: "cta_primary",
              });
            }}
          >
            Download GainFrame on iOS <span aria-hidden>→</span>
          </a>

          <div className="bff-cta-divider" aria-hidden>
            or get it in writing
          </div>

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
                Full written breakdown — what the AI saw, strengths, focus
                areas, timeline. We store your email and the report, never
                your photo.
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
            {stage.lifetime ? "You've used your 3 free scans" : "Daily limit reached"}
          </p>
          <p className="bff-msg-sub">{stage.message}</p>
          <a
            className="bff-submit"
            style={{ maxWidth: 280, margin: "0 auto", textDecoration: "none", textAlign: "center" }}
            href={appStoreUrl(stage.lifetime ? "cta_lifetime_limited" : "cta_rate_limited")}
            target="_blank"
            rel="noopener"
            // outbound_app_store_click comes from the global tracker; these
            // attributes keep its source consistent with the other BF CTAs.
            data-cta-source={CTA_CAMPAIGN}
            data-cta-content={stage.lifetime ? "cta_lifetime_limited" : "cta_rate_limited"}
            onClick={() =>
              track("bf_tool_cta_clicked", {
                cta_content: stage.lifetime ? "cta_lifetime_limited" : "cta_rate_limited",
              })
            }
          >
            Get GainFrame on iOS <span className="arrow" aria-hidden>→</span>
          </a>
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
