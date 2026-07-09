"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

const FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/bf-estimate";

const CTA_CAMPAIGN = "bf_from_photo";
const MASCOT_SRC = "/assets/gainframe-guy/poses/gainframe-guy-wave.png";

type Sex = "male" | "female" | "skip";
type Confidence = "low" | "medium" | "high";

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
  | { kind: "rate_limited"; message: string }
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

function CTACard({
  href,
  ctaContent,
  title,
  body,
  preview,
}: {
  href: string;
  ctaContent: string;
  title: string;
  body: string;
  preview: React.ReactNode;
}) {
  return (
    <a
      className="bff-cta"
      href={href}
      target="_blank"
      rel="noopener"
      // Fires its own outbound event below with the campaign source —
      // exempt from the global AppStoreClickTracker to avoid double counts.
      data-track-exempt="true"
      onClick={() => {
        track("bf_tool_cta_clicked", { cta_content: ctaContent });
        track("outbound_app_store_click", {
          source: CTA_CAMPAIGN,
          cta_content: ctaContent,
        });
      }}
    >
      <span className="bff-cta-preview" aria-hidden>
        {preview}
      </span>
      <span className="bff-cta-body">
        <span className="bff-cta-h">{title}</span>
        <span className="bff-cta-p">{body}</span>
        <span className="bff-cta-link">
          Open in app
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </span>
    </a>
  );
}

/* ── Abstract previews for CTA cards ── */

function PreviewSparkline() {
  return (
    <svg viewBox="0 0 200 124" fill="none">
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d26f" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34d26f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(20, 20)">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const heights = [22, 30, 26, 38, 32, 46, 44];
          return (
            <rect
              key={i}
              x={i * 22}
              y={70 - heights[i]}
              width={6}
              height={heights[i]}
              fill="rgba(23,23,23,0.08)"
              rx={1}
            />
          );
        })}
        <path
          d="M3 50 L25 42 L47 46 L69 32 L91 38 L113 24 L135 28 L157 16"
          stroke="#171717"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M3 50 L25 42 L47 46 L69 32 L91 38 L113 24 L135 28 L157 16 L157 70 L3 70 Z"
          fill="url(#sparkfill)"
        />
        <circle cx="157" cy="16" r="3.5" fill="#34d26f" />
        <circle cx="157" cy="16" r="7" fill="none" stroke="#34d26f" strokeOpacity="0.35" />
      </g>
    </svg>
  );
}

function PreviewMuscleMap() {
  const dots: { x: number; y: number; tier: 0 | 1 | 2 }[] = [
    { x: 100, y: 30, tier: 2 },
    { x: 78, y: 36, tier: 1 },
    { x: 122, y: 36, tier: 2 },
    { x: 64, y: 50, tier: 1 },
    { x: 136, y: 50, tier: 1 },
    { x: 90, y: 58, tier: 2 },
    { x: 100, y: 70, tier: 0 },
    { x: 100, y: 84, tier: 1 },
    { x: 80, y: 76, tier: 0 },
    { x: 120, y: 76, tier: 1 },
    { x: 88, y: 100, tier: 1 },
    { x: 112, y: 100, tier: 2 },
  ];
  const tierColor = ["#ff5d6c", "#ffd23f", "#34d26f"];
  return (
    <svg viewBox="0 0 200 124" fill="none">
      <g transform="translate(0, -2)">
        <path
          d="M82 22 Q100 18 118 22 L122 50 L116 60 L116 100 L114 124 L106 124 L104 102 L100 102 L96 124 L88 124 L86 100 L86 60 L80 50 Z M80 24 L66 50 L70 70 M120 24 L134 50 L130 70"
          stroke="rgba(23,23,23,0.16)"
          strokeWidth="1.2"
          fill="rgba(23,23,23,0.04)"
        />
        <circle
          cx="100"
          cy="14"
          r="6"
          stroke="rgba(23,23,23,0.16)"
          strokeWidth="1.2"
          fill="rgba(23,23,23,0.04)"
        />
        {dots.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r={4} fill={tierColor[d.tier]} />
            <circle
              cx={d.x}
              cy={d.y}
              r={7}
              fill="none"
              stroke={tierColor[d.tier]}
              strokeOpacity="0.3"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

function PreviewFuture() {
  return (
    <svg viewBox="0 0 200 124" fill="none">
      <defs>
        <linearGradient id="fade1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(23,23,23,0.18)" />
          <stop offset="100%" stopColor="rgba(23,23,23,0.05)" />
        </linearGradient>
      </defs>
      <g transform="translate(0, 4)">
        <path
          d="M48 22 Q60 18 72 22 L76 50 L72 56 L72 96 L70 116 L64 116 L62 96 L58 96 L56 116 L50 116 L48 96 L48 56 L44 50 Z"
          stroke="rgba(23,23,23,0.18)"
          strokeWidth="1.2"
          fill="url(#fade1)"
        />
        <circle cx="60" cy="14" r="6" stroke="rgba(23,23,23,0.18)" strokeWidth="1.2" fill="url(#fade1)" />
        <path
          d="M88 64 L112 64 M104 58 L112 64 L104 70"
          stroke="#34d26f"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="100"
          y="52"
          textAnchor="middle"
          fontFamily="Geist Mono, monospace"
          fontSize="6"
          fill="#34d26f"
          letterSpacing="1"
          fontWeight="600"
        >
          +6 MO
        </text>
        <path
          d="M128 22 Q140 16 152 22 L158 48 L152 54 L152 96 L150 116 L144 116 L142 96 L138 96 L136 116 L130 116 L128 96 L128 54 L122 48 Z"
          stroke="#171717"
          strokeWidth="1.4"
          fill="rgba(52,210,111,0.08)"
        />
        <circle cx="140" cy="12" r="6" stroke="#171717" strokeWidth="1.4" fill="rgba(52,210,111,0.08)" />
      </g>
    </svg>
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
    setStage({ kind: "processing" });
    track("bf_tool_estimate_requested", { sex: sex ?? "skip" });

    try {
      const { base64 } = await preprocessImage(file);
      const payload = {
        client_id: getOrCreateClientId(),
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
        track("bf_tool_rate_limited");
        setStage({
          kind: "rate_limited",
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

  const ctaCards = (
    <div className="bff-cta-section">
      <p className="bff-cta-eyebrow">Take it further</p>
      <h2 className="bff-cta-title">Beyond the single estimate</h2>
      <div className="bff-cta-grid">
        <CTACard
          href={appStoreUrl("cta_track")}
          ctaContent="cta_track"
          title="Track this every week"
          body="Side-by-side compare and trend charts as you cut or bulk."
          preview={<PreviewSparkline />}
        />
        <CTACard
          href={appStoreUrl("cta_muscles")}
          ctaContent="cta_muscles"
          title="Muscle-by-muscle scoring"
          body="12 muscle groups rated Needs Work → Strong, with growth tips."
          preview={<PreviewMuscleMap />}
        />
        <CTACard
          href={appStoreUrl("cta_future")}
          ctaContent="cta_future"
          title="See yourself at 12% body fat"
          body="AI-generated future physique at 3, 6, and 12 months."
          preview={<PreviewFuture />}
        />
      </div>
    </div>
  );

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
                className="bff-spectrum-cta"
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
                <small>Opens the Body Fat Visualizer at your estimate</small>
              </a>
            </div>
          );
        })()}

        <a
          className="bff-primary-cta"
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
          <span className="bff-primary-cta-body">
            <span className="bff-primary-cta-eyebrow">For precision tracking</span>
            <span className="bff-primary-cta-title">
              Get GainFrame on iOS
            </span>
            <span className="bff-primary-cta-sub">
              Multi-photo body fat, weekly trends, 12 muscle scores. Free to start.
            </span>
          </span>
          <span className="bff-primary-cta-arrow" aria-hidden>→</span>
        </a>

        {ctaCards}

        <p className="bff-retry-note">
          Today's free estimate used · Come back tomorrow or get the app
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
          <p className="bff-msg-title">Daily limit reached</p>
          <p className="bff-msg-sub">{stage.message}</p>
          <a
            className="bff-submit"
            style={{ maxWidth: 280, margin: "0 auto", textDecoration: "none", textAlign: "center" }}
            href={appStoreUrl("cta_rate_limited")}
            target="_blank"
            rel="noopener"
            // outbound_app_store_click comes from the global tracker; these
            // attributes keep its source consistent with the other BF CTAs.
            data-cta-source={CTA_CAMPAIGN}
            data-cta-content="cta_rate_limited"
            onClick={() =>
              track("bf_tool_cta_clicked", { cta_content: "cta_rate_limited" })
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
