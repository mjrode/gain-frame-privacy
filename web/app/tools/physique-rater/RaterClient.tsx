"use client";

import { useEffect, useRef, useState } from "react";
import { APP_STORE_PROVIDER_TOKEN, SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

const FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/physique-rate";

const CTA_CAMPAIGN = "physique_rater";
const MASCOT_SRC = "/assets/gainframe-guy/poses/gainframe-guy-wave.webp";

type Sex = "male" | "female" | "skip";
type Goal = "lose_fat" | "build_muscle" | "recomp" | "skip";
type Confidence = "low" | "medium" | "high";

type Subscores = {
  body_fat: number;
  muscle: number;
  proportions: number;
  goal_fit: number;
};

type Rating = {
  score: number;
  band: string;
  subscores: Subscores;
  headline: string;
  strongest_area: string;
  biggest_opportunity: string;
  confidence: Confidence;
  remaining_lifetime: number;
};

type Stage =
  | { kind: "idle" }
  | { kind: "processing" }
  | { kind: "result"; rating: Rating }
  | { kind: "unusable"; message: string }
  // lifetime: true = all 3 free ratings used, terminal — vs the daily limit
  // where tomorrow works.
  | { kind: "rate_limited"; message: string; lifetime: boolean }
  | { kind: "error"; message: string };

type ErrorResponse = { error: string; message?: string };

const PROCESSING_MESSAGES = [
  "Reading the photo",
  "Scoring leanness",
  "Checking development",
  "Weighing proportions",
];

const SUBSCORE_LABELS: Array<{ key: keyof Subscores; label: string; hint: string }> = [
  { key: "body_fat", label: "Body Fat", hint: "How lean you read for your sex" },
  { key: "muscle", label: "Muscle", hint: "Visible development for your frame" },
  { key: "proportions", label: "Proportions", hint: "Taper, balance, symmetry" },
  { key: "goal_fit", label: "Goal Fit", hint: "Fit for the goal you picked" },
];

// Secret URL bypass for the per-day rate limit, mirroring the BF tool:
// `?dev=gainframe` (or window.GF_DEV_BYPASS = true) uses a fresh UUID per
// run so the (ip + client_id) fingerprint never collides during testing.
const DEV_BYPASS_TOKEN = "gainframe";

function isDevBypass(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("dev") === DEV_BYPASS_TOKEN) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return Boolean((window as unknown as { GF_DEV_BYPASS?: boolean }).GF_DEV_BYPASS);
}

function getOrCreateClientId(): string {
  if (isDevBypass()) return crypto.randomUUID();
  // Shared with the BF tool on purpose: same browser, same anonymous id.
  // Quotas stay separate because the function salts the hash per tool.
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

function appStoreUrl(content: string): string {
  const params = new URLSearchParams({
    utm_source: "web",
    utm_medium: "tool",
    utm_campaign: CTA_CAMPAIGN,
    utm_content: content,
    // Apple campaign tokens — UTM params never reach App Store Connect.
    pt: APP_STORE_PROVIDER_TOKEN,
    ct: "web-rater",
    mt: "8",
  });
  return `${SITE.appStoreUrl}?${params.toString()}`;
}

function ScoreRing({ score, band }: { score: number; band: string }) {
  const CIRC = 2 * Math.PI * 54;
  const dash = (Math.min(100, Math.max(0, score)) / 100) * CIRC;
  return (
    <div className="pr-ring" role="img" aria-label={`Physique score ${score} out of 100, ${band}`}>
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

function SubscoreBar({ label, hint, value }: { label: string; hint: string; value: number }) {
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

export default function RaterClient() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [sex, setSex] = useState<Sex>("skip");
  const [goal, setGoal] = useState<Goal>("skip");
  const [preview, setPreview] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

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

    try {
      const { base64 } = await preprocessImage(file);
      track("physique_rater_requested", {
        sex: sex === "skip" ? "unknown" : sex,
        goal: goal === "skip" ? "unknown" : goal,
      });

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: getOrCreateClientId(),
          photo_base64: base64,
          photo_mime: "image/jpeg",
          sex: sex === "skip" ? null : sex,
          goal: goal === "skip" ? null : goal,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as Rating;
        track("physique_rater_scored", { score: data.score, band: data.band });
        setStage({ kind: "result", rating: data });
        return;
      }

      const err = (await res.json().catch(() => ({}))) as ErrorResponse;
      if (res.status === 422) {
        setStage({
          kind: "unusable",
          message: err.message ?? "We couldn't read that photo. Try a clearer shot.",
        });
        return;
      }
      if (res.status === 429) {
        setStage({
          kind: "rate_limited",
          message: err.message ?? "You've used your free rating.",
          lifetime: err.error === "lifetime_limited",
        });
        return;
      }
      if (res.status === 413) {
        setStage({ kind: "error", message: "That photo is too large — try one under 5MB." });
        return;
      }
      setStage({
        kind: "error",
        message: "The rater is having a moment. Try again in a minute.",
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
            <div className="pr-control">
              <span className="pr-control-label">Your goal</span>
              <div className="pr-segments" role="group" aria-label="Goal">
                {(["lose_fat", "build_muscle", "recomp", "skip"] as Goal[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`pr-segment${goal === v ? " is-active" : ""}`}
                    aria-pressed={goal === v}
                    disabled={busy}
                    onClick={() => setGoal(v)}
                  >
                    {v === "lose_fat"
                      ? "Lose fat"
                      : v === "build_muscle"
                        ? "Build muscle"
                        : v === "recomp"
                          ? "Both"
                          : "No goal"}
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
              <strong>Upload a photo to get your score</strong>
              <span>
                Front-facing, good light, torso visible. Tight or sports clothing reads best.
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
            {preview && <img className="pr-result-photo" src={preview} alt="The photo you rated" />}
            <div className="pr-result-score">
              <ScoreRing score={stage.rating.score} band={stage.rating.band} />
              <span className="pr-band" data-band={stage.rating.band.toLowerCase()}>
                {stage.rating.band}
              </span>
              <span className="pr-conf">{stage.rating.confidence} confidence</span>
            </div>
          </div>

          <p className="pr-headline">{stage.rating.headline}</p>

          <div className="pr-subs">
            {SUBSCORE_LABELS.map(({ key, label, hint }) => (
              <SubscoreBar
                key={key}
                label={label}
                hint={hint}
                value={stage.rating.subscores[key]}
              />
            ))}
          </div>

          <div className="pr-notes">
            <div className="pr-note">
              <span className="pr-note-label">Strongest</span>
              <p>{stage.rating.strongest_area}</p>
            </div>
            <div className="pr-note">
              <span className="pr-note-label">Biggest opportunity</span>
              <p>{stage.rating.biggest_opportunity}</p>
            </div>
          </div>

          <p className="pr-caveat">
            One casual photo, one moment. A score is only useful as a trend —
            which is the whole point of scoring every check-in instead of once.
          </p>

          <div className="pr-cta">
            <a
              className="pr-cta-primary"
              href={appStoreUrl("result")}
              target="_blank"
              rel="noopener"
              data-track-exempt
              onClick={() => track("physique_rater_cta_click", { placement: "result" })}
            >
              Score every check-in — GainFrame free on iOS
            </a>
            <button type="button" className="pr-cta-secondary" onClick={reset}>
              Rate another photo
              {stage.rating.remaining_lifetime > 0
                ? ` (${stage.rating.remaining_lifetime} left)`
                : ""}
            </button>
          </div>
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
          <h3>{stage.lifetime ? "That's all 3 free ratings" : "Back tomorrow"}</h3>
          <p>{stage.message}</p>
          <a
            className="pr-cta-primary"
            href={appStoreUrl(stage.lifetime ? "lifetime_limit" : "daily_limit")}
            target="_blank"
            rel="noopener"
            data-track-exempt
            onClick={() =>
              track("physique_rater_cta_click", {
                placement: stage.lifetime ? "lifetime_limit" : "daily_limit",
              })
            }
          >
            Get unlimited scoring on iOS
          </a>
        </div>
      )}
    </div>
  );
}
