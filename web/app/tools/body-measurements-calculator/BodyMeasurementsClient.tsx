"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TransformClient from "@/app/tools/ai-body-transformation/TransformClient";
import {
  getPosthogDistinctId,
  getWebAnalyticsContext,
  track,
} from "@/lib/analytics";
import { documentAnalyticsConsentGranted } from "@/lib/analytics-consent";
import type {
  RegionalAdjustments,
  RegionalMeasurementKey,
} from "@/lib/body-proportions";
import {
  errorResponseJson,
  fetchWithTimeout,
  preprocessImageForUpload,
  validatedJson,
} from "@/lib/tool-client";
import { reportWebToolCompletion } from "@/lib/web-tool-usage";

const RATE_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/physique-rate";
const ANALYSIS_TIMEOUT_MS = 35_000;
const RAW_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

type Rating = {
  score: number;
  band: string;
  subscores: {
    body_fat: number;
    muscle: number;
    proportions: number;
    goal_fit: number;
  };
  headline: string;
  strongest_area: string;
  biggest_opportunity: string;
  confidence: "low" | "medium" | "high";
};

type AnalysisStage =
  | { kind: "idle" }
  | { kind: "processing" }
  | { kind: "result"; rating: Rating }
  | { kind: "error"; message: string };

const REGIONS: Array<{
  key: RegionalMeasurementKey;
  label: string;
  description: string;
  defaultChange: number;
}> = [
  { key: "shoulders", label: "Shoulders", description: "Width and delt shape", defaultChange: 8 },
  { key: "chest", label: "Chest", description: "Fullness and upper torso", defaultChange: 8 },
  { key: "waist", label: "Waist", description: "Midsection and taper", defaultChange: -8 },
  { key: "arms", label: "Arms", description: "Biceps and triceps size", defaultChange: 8 },
  { key: "thighs", label: "Legs", description: "Thigh size and balance", defaultChange: 8 },
];

const EMPTY_SELECTION = Object.fromEntries(
  REGIONS.map(({ key }) => [key, false]),
) as Record<RegionalMeasurementKey, boolean>;

const EMPTY_CHANGES = Object.fromEntries(
  REGIONS.map(({ key }) => [key, 0]),
) as Record<RegionalMeasurementKey, number>;

function getOrCreateClientId(): string {
  const key = "gf_tid";
  try {
    const existing = localStorage.getItem(key);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
  } catch {
    // Storage can be disabled; a session-only anonymous id still works.
  }
  const id = crypto.randomUUID();
  try {
    localStorage.setItem(key, id);
  } catch {
    // Ignore blocked storage.
  }
  return id;
}

function isRating(value: unknown): value is Rating {
  if (!value || typeof value !== "object") return false;
  const rating = value as Partial<Rating>;
  return typeof rating.score === "number" &&
    typeof rating.band === "string" &&
    typeof rating.headline === "string" &&
    typeof rating.strongest_area === "string" &&
    typeof rating.biggest_opportunity === "string" &&
    (rating.confidence === "low" ||
      rating.confidence === "medium" ||
      rating.confidence === "high") &&
    Boolean(rating.subscores) &&
    typeof rating.subscores?.proportions === "number";
}

function suggestedRegion(text: string): RegionalMeasurementKey {
  const normalized = text.toLowerCase();
  if (/chest|pec|torso/.test(normalized)) return "chest";
  if (/arm|bicep|tricep/.test(normalized)) return "arms";
  if (/leg|thigh|quad|hamstring|glute/.test(normalized)) return "thighs";
  if (/waist|midsection|core|taper|lean|body fat/.test(normalized)) return "waist";
  return "shoulders";
}

export default function BodyMeasurementsClient() {
  const [analysis, setAnalysis] = useState<AnalysisStage>({ kind: "idle" });
  const [selected, setSelected] = useState(EMPTY_SELECTION);
  const [changes, setChanges] = useState(EMPTY_CHANGES);
  const requestRef = useRef(0);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("measurements_tool_view");
  }, []);

  const adjustments = useMemo<RegionalAdjustments>(() => {
    const entries = REGIONS.flatMap(({ key }) =>
      selected[key] && Math.abs(changes[key]) >= 0.5
        ? [[key, changes[key]] as const]
        : [],
    );
    return Object.fromEntries(entries);
  }, [changes, selected]);

  async function analyzePhoto(file: File) {
    const requestId = ++requestRef.current;
    setAnalysis({ kind: "processing" });
    setSelected(EMPTY_SELECTION);
    setChanges(EMPTY_CHANGES);

    try {
      const processed = await preprocessImageForUpload(file, {
        allowedRawMimes: RAW_IMAGE_MIMES,
      });
      const analyticsConsent = documentAnalyticsConsentGranted(
        document.documentElement,
      );
      const response = await fetchWithTimeout(
        RATE_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: getOrCreateClientId(),
            photo_base64: processed.base64,
            photo_mime: processed.photoMime,
            sex: null,
            goal: "recomp",
            analytics_consent: analyticsConsent,
            ...(analyticsConsent
              ? {
                  posthog_distinct_id: getPosthogDistinctId(),
                  analytics_context: getWebAnalyticsContext(),
                }
              : {}),
          }),
        },
        ANALYSIS_TIMEOUT_MS,
      );

      if (requestId !== requestRef.current) return;

      if (response.ok) {
        const rating = await validatedJson(response, isRating);
        const suggestion = suggestedRegion(rating.biggest_opportunity);
        const suggestedChange = REGIONS.find(({ key }) => key === suggestion)
          ?.defaultChange ?? 8;
        setSelected({ ...EMPTY_SELECTION, [suggestion]: true });
        setChanges({ ...EMPTY_CHANGES, [suggestion]: suggestedChange });
        setAnalysis({ kind: "result", rating });
        track("measurements_tool_calculated", {
          source: "photo",
          score: rating.subscores.proportions,
          suggested_region: suggestion,
          confidence: rating.confidence,
        });
        void reportWebToolCompletion("body-measurements-calculator");
        return;
      }

      const error = await errorResponseJson(response);
      const message = typeof error.message === "string" ? error.message : "";
      if (response.status === 429) {
        setAnalysis({
          kind: "error",
          message:
            "Today’s free proportion estimate is used. You can still choose areas below and generate your preview.",
        });
        return;
      }
      setAnalysis({
        kind: "error",
        message: message ||
          "We couldn’t estimate this photo. Try a clear, front-facing shot with your torso and legs visible—or choose areas manually below.",
      });
    } catch {
      if (requestId !== requestRef.current) return;
      setAnalysis({
        kind: "error",
        message:
          "We couldn’t finish the estimate. You can try another photo or choose the areas manually below.",
      });
    }
  }

  function clearPhoto() {
    requestRef.current += 1;
    setAnalysis({ kind: "idle" });
    setSelected(EMPTY_SELECTION);
    setChanges(EMPTY_CHANGES);
  }

  function toggleRegion(key: RegionalMeasurementKey) {
    const region = REGIONS.find((item) => item.key === key);
    const nextSelected = !selected[key];
    setSelected((current) => ({ ...current, [key]: nextSelected }));
    setChanges((current) => ({
      ...current,
      [key]: nextSelected ? region?.defaultChange ?? 8 : 0,
    }));
    track("measurements_tool_target_changed", {
      region: key,
      selected: nextSelected,
      change_percent: nextSelected ? region?.defaultChange ?? 8 : 0,
    });
  }

  const controls = (
    <div className="bmc-photo-controls">
      <section className="bmc-estimate" aria-live="polite">
        <div className="bmc-step-label">
          <span>2</span>
          <div>
            <strong>Review your estimate</strong>
            <small>AI reads visible balance—not exact tape measurements.</small>
          </div>
        </div>

        {analysis.kind === "processing" && (
          <div className="bmc-estimate-loading">
            <span aria-hidden />
            <div>
              <strong>Estimating your proportions…</strong>
              <small>Checking taper, balance and visible development.</small>
            </div>
          </div>
        )}

        {analysis.kind === "result" && (
          <div className="bmc-estimate-result">
            <div className="bmc-proportion-score">
              <span>{analysis.rating.subscores.proportions}</span>
              <small>/100<br />proportions</small>
            </div>
            <div className="bmc-estimate-notes">
              <p><strong>Strongest:</strong> {analysis.rating.strongest_area}</p>
              <p><strong>Best opportunity:</strong> {analysis.rating.biggest_opportunity}</p>
              <span>{analysis.rating.confidence} confidence · single-photo estimate</span>
            </div>
          </div>
        )}

        {analysis.kind === "error" && (
          <div className="bmc-estimate-error">
            <strong>Estimate unavailable</strong>
            <p>{analysis.message}</p>
          </div>
        )}
      </section>

      <section className="bmc-adjust">
        <div className="bmc-step-label">
          <span>3</span>
          <div>
            <strong>Choose what you want to change</strong>
            <small>Tap an area, then move its slider. Only selected areas change.</small>
          </div>
        </div>

        <div className="bmc-area-picker" role="group" aria-label="Body areas to adjust">
          {REGIONS.map((region) => (
            <button
              key={region.key}
              type="button"
              className={selected[region.key] ? "is-selected" : ""}
              aria-pressed={selected[region.key]}
              onClick={() => toggleRegion(region.key)}
            >
              <span aria-hidden>{selected[region.key] ? "✓" : "+"}</span>
              {region.label}
            </button>
          ))}
        </div>

        <div className="bmc-slider-list">
          {REGIONS.filter(({ key }) => selected[key]).map((region) => {
            const value = changes[region.key];
            return (
              <label className="bmc-change-slider" key={region.key}>
                <span className="bmc-change-slider__head">
                  <span>
                    <strong>{region.label}</strong>
                    <small>{region.description}</small>
                  </span>
                  <b className={value < 0 ? "is-smaller" : "is-larger"}>
                    {value > 0 ? "+" : ""}{value}%
                  </b>
                </span>
                <input
                  type="range"
                  min={-15}
                  max={15}
                  step={1}
                  value={value}
                  aria-label={`${region.label} size change`}
                  onChange={(event) => setChanges((current) => ({
                    ...current,
                    [region.key]: Number(event.target.value),
                  }))}
                  onPointerUp={() => track("measurements_tool_target_changed", {
                    region: region.key,
                    change_percent: value,
                  })}
                />
                <span className="bmc-change-slider__scale" aria-hidden>
                  <small>Smaller</small><small>No change</small><small>Larger</small>
                </span>
              </label>
            );
          })}
          {Object.keys(adjustments).length === 0 && (
            <p className="bmc-no-selection">Select at least one area to create your preview.</p>
          )}
        </div>
      </section>

      <div className="bmc-generate-label">
        <span>4</span>
        <div>
          <strong>Generate your new image</strong>
          <small>Directional AI preview · not a promise or exact measurement</small>
        </div>
      </div>
    </div>
  );

  return (
    <section className="bmc-tool-shell" id="proportion-tool" aria-labelledby="bmc-tool-title">
      <div className="bmc-tool-intro">
        <span className="bmc-kicker">Try it on your own photo</span>
        <h2 id="bmc-tool-title">See your proportions. Shape your target.</h2>
        <p>
          Upload once. GainFrame estimates your visible proportions, suggests
          a starting area, and lets you control exactly what the preview changes.
        </p>
      </div>

      <div className="bmc-step-strip" aria-label="How the tool works">
        <span><b>1</b> Upload</span>
        <i aria-hidden>→</i>
        <span><b>2</b> Estimate</span>
        <i aria-hidden>→</i>
        <span><b>3</b> Adjust</span>
        <i aria-hidden>→</i>
        <span><b>4</b> Generate</span>
      </div>

      <TransformClient
        variant="measurements"
        regionalAdjustments={adjustments}
        onPhotoSelected={(file) => void analyzePhoto(file)}
        onPhotoCleared={clearPhoto}
        measurementsControls={controls}
        onPreviewStarted={() => track("measurements_tool_preview_started", {
          region_count: Object.keys(adjustments).length,
        })}
      />
    </section>
  );
}
