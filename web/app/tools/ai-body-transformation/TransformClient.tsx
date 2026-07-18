"use client";

import { useEffect, useRef, useState } from "react";
import { APP_STORE_PROVIDER_TOKEN, SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

const FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/body-transform";

const CTA_CAMPAIGN = "ai_body_transformation";
const MASCOT_SRC = "/assets/gainframe-guy/poses/gainframe-guy-wave.png";

type Sex = "male" | "female" | "skip";
type Goal = "lose_fat" | "build_muscle" | "recomp";

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
  // can_unlock: the free render is used but an email unlocks one more.
  // Terminal (both used / capacity / ip-daily) renders the app CTA instead.
  | { kind: "rate_limited"; message: string; canUnlock: boolean }
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

// Same dev bypass contract as the BF tool (?dev=gainframe), except the UUID
// is held in sessionStorage instead of minted per call: the unlock flow needs
// the same client_id across generate → unlock → generate, so per-call UUIDs
// would 403 the unlock gate mid-test.
const DEV_BYPASS_TOKEN = "gainframe";

function isDevBypass(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === DEV_BYPASS_TOKEN) return true;
  } catch {
    /* ignore */
  }
  return Boolean(
    (window as unknown as { GF_DEV_BYPASS?: boolean }).GF_DEV_BYPASS,
  );
}

function getOrCreateClientId(): string {
  if (isDevBypass()) {
    const KEY = "gf_bt_dev_tid";
    try {
      const existing = sessionStorage.getItem(KEY);
      if (existing) return existing;
      const id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
      return id;
    } catch {
      return crypto.randomUUID();
    }
  }
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

function posthogDistinctId(): string | null {
  return (
    (window.posthog as unknown as { get_distinct_id?: () => string })
      ?.get_distinct_id?.() ?? null
  );
}

async function preprocessImage(
  file: File,
  maxDim = 1024,
): Promise<{ base64: string }> {
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
    return { base64: dataUrl.split(",")[1] ?? "" };
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
    pt: APP_STORE_PROVIDER_TOKEN,
    ct: "web-bttool",
    mt: "8",
  });
  return `${SITE.appStoreUrl}?${params.toString()}`;
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
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("bt_tool_view");

    // Returning visitors with no renders left skip straight to the limit
    // screen instead of uploading a photo that can't be rendered.
    const clientId = getOrCreateClientId();
    clientIdRef.current = clientId;
    fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", client_id: clientId }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (json: { remaining: number; used: number; unlocked: boolean } | null) => {
          if (!json || json.remaining > 0) return;
          setStage({
            kind: "rate_limited",
            canUnlock: !json.unlocked && json.used >= 1,
            message: json.unlocked
              ? "Both free renders are used. GainFrame on iOS has unlimited Future You renders — plus the coaching to actually get there."
              : "You've used your free render. Drop your email to unlock one more — or get unlimited renders in the GainFrame app.",
          });
        },
      )
      .catch(() => {
        /* status is best-effort; generation still enforces server-side */
      });
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
    if (!picked.type.startsWith("image/")) {
      setStage({ kind: "error", message: "Please pick an image file." });
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
    track("bt_tool_generate_requested", {
      sex: sex ?? "skip",
      goal,
      zones: zones.join(","),
    });

    try {
      const { base64 } = await preprocessImage(file);
      const clientId = clientIdRef.current ?? getOrCreateClientId();
      clientIdRef.current = clientId;
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          client_id: clientId,
          photo_base64: base64,
          photo_mime: "image/jpeg",
          sex: sex && sex !== "skip" ? sex : null,
          goal,
          zones,
          posthog_distinct_id: posthogDistinctId(),
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as SuccessResponse;
        const afterUrl = `data:${json.image_mime};base64,${json.image_base64}`;
        afterUrlRef.current = afterUrl;
        track("bt_tool_result_shown", {
          model: json.model_used,
          remaining: json.remaining,
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

      const err = (await res.json().catch(() => ({}))) as ErrorResponse;
      if (res.status === 429) {
        const canUnlock = err.error === "lifetime_limited" &&
          err.can_unlock !== false;
        track("bt_tool_rate_limited", { kind: err.error });
        setStage({
          kind: "rate_limited",
          canUnlock,
          message: err.message ??
            "You've used your free render. The GainFrame app has no limits.",
        });
      } else if (res.status === 422) {
        track("bt_tool_unusable", {
          reason: (err as { reason?: string }).reason ?? "unknown",
        });
        setStage({
          kind: "unusable",
          message: err.message ??
            "We can't render that photo. Use a clear, recent photo of yourself with at least your torso visible.",
        });
      } else {
        track("bt_tool_error", { status: res.status, code: err.error });
        setStage({
          kind: "error",
          message: "Something went wrong. Your render wasn't used — try again.",
        });
      }
    } catch (err) {
      track("bt_tool_error", { error: (err as Error).message });
      setStage({
        kind: "error",
        message: (err as Error).message ?? "Network error. Please try again.",
      });
    } finally {
      submittingRef.current = false;
    }
  }

  async function submitUnlock() {
    if (unlockSubmittingRef.current) return;
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setUnlockStage("error");
      return;
    }
    unlockSubmittingRef.current = true;
    setUnlockStage("sending");
    track("bt_tool_email_submitted", {});
    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unlock",
          client_id: clientIdRef.current ?? getOrCreateClientId(),
          email: trimmed,
          posthog_distinct_id: posthogDistinctId(),
        }),
      });
      if (res.ok) {
        track("bt_tool_second_run_unlocked", {});
        setUnlockStage("idle");
        setUnlockedNote(true);
        setEmail("");
        // Back to the form with the photo still loaded — one tap to re-render.
        setStage({ kind: "idle" });
      } else {
        setUnlockStage("error");
      }
    } catch {
      setUnlockStage("error");
    } finally {
      unlockSubmittingRef.current = false;
    }
  }

  async function downloadShare() {
    if (!previewUrl || !afterUrlRef.current) return;
    track("bt_tool_download_clicked", {});
    try {
      const dataUrl = await buildShareImage(previewUrl, afterUrlRef.current);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "gainframe-future-you.jpg";
      a.click();
    } catch {
      // Fallback: download the raw after image.
      const a = document.createElement("a");
      a.href = afterUrlRef.current;
      a.download = "gainframe-future-you.jpg";
      a.click();
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

          <p className="btf-result-honesty">
            This is a motivational AI projection of one consistent year — not a
            guarantee. The work is still the work.
          </p>
        </div>

        <div className="btf-cta-block">
          <span className="btf-cta-glow" aria-hidden />
          <p className="btf-cta-block-title">Now make it real</p>
          <p className="btf-cta-block-sub">
            GainFrame tracks your actual progress photos, scores 12 muscle
            groups, and coaches you toward this render — free to start.
          </p>
          <a
            className="btf-cta-download"
            href={appStoreUrl("cta_primary")}
            target="_blank"
            rel="noopener"
            data-track-exempt="true"
            onClick={() => {
              track("bt_tool_cta_clicked", { cta_content: "cta_primary" });
              track("outbound_app_store_click", {
                source: CTA_CAMPAIGN,
                cta_content: "cta_primary",
                ct: "web-bttool",
              });
            }}
          >
            Download GainFrame on iOS <span aria-hidden>→</span>
          </a>

          {stage.remaining === 0 && stage.canUnlock && (
            <>
              <div className="btf-cta-divider" aria-hidden>
                or unlock one more render
              </div>
              {unlockForm("Unlock render")}
            </>
          )}
        </div>

        <p className="btf-retry-note">
          {stage.remaining > 0
            ? `${stage.remaining} render left — make it count`
            : "Free renders used · The app has no limits"}
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
            className="btf-msg-mascot"
            src={MASCOT_SRC}
            alt=""
            aria-hidden
            width={96}
            height={96}
          />
          <p className="btf-msg-title">
            {stage.canUnlock
              ? "Your free render is used"
              : "No renders left here"}
          </p>
          <p className="btf-msg-sub">{stage.message}</p>

          {stage.canUnlock ? (
            <div className="btf-msg-unlock">{unlockForm("Unlock one more")}</div>
          ) : null}

          <a
            className={stage.canUnlock ? "btf-msg-applink" : "btf-submit"}
            style={
              stage.canUnlock
                ? undefined
                : { maxWidth: 300, margin: "0 auto", textDecoration: "none", textAlign: "center" }
            }
            href={appStoreUrl(
              stage.canUnlock ? "cta_rate_limited" : "cta_lifetime_limited",
            )}
            target="_blank"
            rel="noopener"
            data-cta-source={CTA_CAMPAIGN}
            data-cta-content={
              stage.canUnlock ? "cta_rate_limited" : "cta_lifetime_limited"
            }
            onClick={() =>
              track("bt_tool_cta_clicked", {
                cta_content: stage.canUnlock
                  ? "cta_rate_limited"
                  : "cta_lifetime_limited",
              })
            }
          >
            {stage.canUnlock
              ? "Or get unlimited renders in the app →"
              : "Get GainFrame on iOS"}
          </a>
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

      <button
        type="button"
        className="btf-submit"
        disabled={submitDisabled}
        onClick={submit}
      >
        {submitDisabled ? "Pick a photo & reference" : (
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
