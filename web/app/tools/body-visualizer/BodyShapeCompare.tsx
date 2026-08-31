"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import {
  BODY_SHAPE_FIELDS,
  bodyShapeInputLimits,
  buildBodyShapeProfile,
  buildBodyShapeSilhouette,
  compareBodyShapes,
  convertBodyShapeValue,
  normalizeBodyShapeInput,
  validateBodyShapeMeasurements,
  type BodyShapeField,
  type BodyShapeInput,
  type BodyShapeMeasurements,
  type BodyShapeSilhouette,
  type BodyShapeSummary,
  type BodyShapeUnit,
} from "@/lib/body-shape-compare";
import { buildToolResultCtaExperiment } from "@/lib/tool-cta-experiment";
import { trackToolFunnelStep } from "@/lib/tool-funnel";
import styles from "./page.module.css";

type DisplayMeasurements = Record<BodyShapeField, string>;
type MeasurementSetKey = "current" | "goal";
type ParsedSet = {
  measurements: BodyShapeMeasurements | null;
  errors: Partial<Record<BodyShapeField, string>>;
  missing: number;
};

const EMPTY_MEASUREMENTS: DisplayMeasurements = {
  height: "",
  weight: "",
  shoulders: "",
  chest: "",
  waist: "",
  hips: "",
  inseam: "",
  bodyFat: "",
};

const EXAMPLE_METRIC: Record<MeasurementSetKey, DisplayMeasurements> = {
  current: {
    height: "178",
    weight: "82",
    shoulders: "121",
    chest: "103",
    waist: "88",
    hips: "102",
    inseam: "81",
    bodyFat: "22",
  },
  goal: {
    height: "178",
    weight: "77",
    shoulders: "123",
    chest: "104",
    waist: "82",
    hips: "99",
    inseam: "81",
    bodyFat: "18",
  },
};

const FIELD_DETAILS: Array<{
  key: BodyShapeField;
  label: string;
  optional?: boolean;
}> = [
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "shoulders", label: "Shoulders" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "inseam", label: "Inseam" },
  { key: "bodyFat", label: "Body fat", optional: true },
];

const CANONICAL_TO_FIELD = {
  heightCm: "height",
  weightKg: "weight",
  shouldersCm: "shoulders",
  chestCm: "chest",
  waistCm: "waist",
  hipsCm: "hips",
  inseamCm: "inseam",
  bodyFatPercent: "bodyFat",
} as const satisfies Record<keyof BodyShapeMeasurements, BodyShapeField>;

function parseNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMeasurementSet(
  values: DisplayMeasurements,
  unit: BodyShapeUnit,
): ParsedSet {
  const numeric: Partial<Record<BodyShapeField, number>> = {};
  let missing = 0;

  for (const field of BODY_SHAPE_FIELDS) {
    const value = parseNumber(values[field]);
    if (value === null) {
      if (field !== "bodyFat") missing += 1;
      continue;
    }
    numeric[field] = value;
  }

  const normalized = normalizeBodyShapeInput(
    {
      height: numeric.height ?? Number.NaN,
      weight: numeric.weight ?? Number.NaN,
      shoulders: numeric.shoulders ?? Number.NaN,
      chest: numeric.chest ?? Number.NaN,
      waist: numeric.waist ?? Number.NaN,
      hips: numeric.hips ?? Number.NaN,
      inseam: numeric.inseam ?? Number.NaN,
      ...(numeric.bodyFat === undefined ? {} : { bodyFat: numeric.bodyFat }),
    },
    unit,
  );
  const canonicalErrors = validateBodyShapeMeasurements(normalized);
  const errors: Partial<Record<BodyShapeField, string>> = {};
  for (const [canonicalKey, message] of Object.entries(canonicalErrors)) {
    errors[
      CANONICAL_TO_FIELD[canonicalKey as keyof BodyShapeMeasurements]
    ] = message;
  }

  return {
    measurements:
      missing === 0 && Object.keys(errors).length === 0 ? normalized : null,
    errors,
    missing,
  };
}

function compact(value: number, decimals = 1): string {
  return value.toFixed(decimals).replace(/\.0$/, "");
}

function unitFor(field: BodyShapeField, unit: BodyShapeUnit): string {
  if (field === "bodyFat") return "%";
  if (field === "weight") return unit === "metric" ? "kg" : "lb";
  return unit === "metric" ? "cm" : "in";
}

function convertSet(
  values: DisplayMeasurements,
  from: BodyShapeUnit,
  to: BodyShapeUnit,
): DisplayMeasurements {
  return Object.fromEntries(
    BODY_SHAPE_FIELDS.map((field) => {
      const value = parseNumber(values[field]);
      return [
        field,
        value === null
          ? values[field]
          : compact(convertBodyShapeValue(field, value, from, to)),
      ];
    }),
  ) as DisplayMeasurements;
}

function exampleFor(unit: BodyShapeUnit): Record<MeasurementSetKey, DisplayMeasurements> {
  if (unit === "metric") {
    return {
      current: { ...EXAMPLE_METRIC.current },
      goal: { ...EXAMPLE_METRIC.goal },
    };
  }
  return {
    current: convertSet(EXAMPLE_METRIC.current, "metric", "us"),
    goal: convertSet(EXAMPLE_METRIC.goal, "metric", "us"),
  };
}

function deltaText(summary: BodyShapeSummary, unit: BodyShapeUnit): string {
  const direction = summary.delta < 0 ? "lower" : "higher";
  const magnitude = Math.abs(summary.delta);
  if (Math.abs(summary.delta) < 0.0005) return "Same as current";
  if (summary.key === "weight") {
    const displayDelta = unit === "metric"
      ? magnitude
      : convertBodyShapeValue("weight", magnitude, "metric", "us");
    return `${compact(displayDelta)} ${unit === "metric" ? "kg" : "lb"} ${direction}`;
  }
  if (summary.key === "body_fat") {
    return `${compact(magnitude)} percentage points ${direction}`;
  }
  return `${magnitude.toFixed(3)} ${direction}`;
}

function summaryValue(
  summary: BodyShapeSummary,
  value: number,
  unit: BodyShapeUnit,
): string {
  if (summary.key === "weight") {
    const displayed = unit === "metric"
      ? value
      : convertBodyShapeValue("weight", value, "metric", "us");
    return `${compact(displayed)} ${unit === "metric" ? "kg" : "lb"}`;
  }
  if (summary.key === "body_fat") return `${compact(value)}%`;
  return value.toFixed(3);
}

function SilhouetteFigure({
  label,
  measurements,
  tone,
}: {
  label: string;
  measurements: BodyShapeMeasurements;
  tone: "current" | "goal";
}) {
  const titleId = useId();
  const descriptionId = useId();
  const profile = buildBodyShapeProfile(measurements);
  const silhouette: BodyShapeSilhouette = buildBodyShapeSilhouette(profile);

  return (
    <figure className={`${styles.silhouetteCard} ${styles[`silhouette${tone}`]}`}>
      <figcaption>
        <span>{tone === "current" ? "A" : "B"}</span>
        <strong>{label}</strong>
      </figcaption>
      <div className={styles.silhouetteViewport}>
        <span className={styles.silhouetteAxis} aria-hidden="true" />
        <svg
          className={styles.silhouetteSvg}
          viewBox="0 0 220 360"
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
        >
          <title id={titleId}>{label} illustrative silhouette</title>
          <desc id={descriptionId}>
            A two-dimensional outline generated from the entered proportions.
            It is not a prediction of how a person looks.
          </desc>
          <g className={styles.silhouetteGridLines} aria-hidden="true">
            <path d="M 18 70 H 202 M 18 155 H 202 M 18 196 H 202 M 18 334 H 202" />
          </g>
          <g className={styles.silhouetteBody}>
            <circle
              cx={silhouette.head.cx}
              cy={silhouette.head.cy}
              r={silhouette.head.radius}
            />
            <path d={silhouette.leftArmPath} />
            <path d={silhouette.rightArmPath} />
            <path d={silhouette.leftLegPath} />
            <path d={silhouette.rightLegPath} />
            <path d={silhouette.torsoPath} />
          </g>
          <g className={styles.measurementGuides} aria-hidden="true">
            <path
              d={`M ${110 - profile.shoulderHalf} 70 H ${110 + profile.shoulderHalf}`}
            />
            <path
              d={`M ${110 - profile.waistHalf} 155 H ${110 + profile.waistHalf}`}
            />
            <path
              d={`M ${110 - profile.hipHalf} ${Math.min(196, profile.crotchY - 24)} H ${110 + profile.hipHalf}`}
            />
          </g>
        </svg>
      </div>
      <dl className={styles.silhouetteStats}>
        <div>
          <dt>Waist / height</dt>
          <dd>{profile.waistToHeight.toFixed(3)}</dd>
        </div>
        <div>
          <dt>Shoulder / waist</dt>
          <dd>{profile.shoulderToWaist.toFixed(3)}</dd>
        </div>
      </dl>
    </figure>
  );
}

function MeasurementFieldset({
  setKey,
  values,
  parsed,
  unit,
  onChange,
  onCopyCurrent,
}: {
  setKey: MeasurementSetKey;
  values: DisplayMeasurements;
  parsed: ParsedSet;
  unit: BodyShapeUnit;
  onChange: (setKey: MeasurementSetKey, field: BodyShapeField, value: string) => void;
  onCopyCurrent?: () => void;
}) {
  const fieldsetNoteId = `shape-${setKey}-measurement-note`;

  return (
    <fieldset className={styles.measurementSet}>
      <legend>
        <span>{setKey === "current" ? "A" : "B"}</span>
        {setKey === "current" ? "Current measurements" : "Goal / reference measurements"}
      </legend>
      <div className={styles.measurementSetTopline}>
        <p id={fieldsetNoteId}>
          {setKey === "current"
            ? "Use a flexible tape without pulling it tight."
            : "This can be a goal, past set, or another reference—not an ideal."}
        </p>
        {onCopyCurrent && (
          <button type="button" onClick={onCopyCurrent}>
            Copy current
          </button>
        )}
      </div>
      <div className={styles.compareFieldGrid}>
        {FIELD_DETAILS.map(({ key, label, optional }) => {
          const [minimum, maximum] = bodyShapeInputLimits(key, unit);
          const error = values[key].trim() === "" ? undefined : parsed.errors[key];
          const errorId = `shape-${setKey}-${key}-error`;
          const describedBy = error
            ? `${fieldsetNoteId} ${errorId}`
            : fieldsetNoteId;
          return (
            <label className={styles.compareInput} key={key}>
              <span>
                {label}
                {optional && <small>Optional</small>}
              </span>
              <span className={styles.compareInputWrap}>
                <input
                  type="number"
                  inputMode="decimal"
                  min={compact(minimum)}
                  max={compact(maximum)}
                  step="0.1"
                  required={!optional}
                  autoComplete="off"
                  value={values[key]}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  onChange={(event) => onChange(setKey, key, event.target.value)}
                />
                <span>{unitFor(key, unit)}</span>
              </span>
              {error && (
                <small className={styles.compareFieldError} id={errorId}>
                  {error}
                </small>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function BodyShapeCompare({ active }: { active: boolean }) {
  const viewedRef = useRef(false);
  const startedRef = useRef(false);
  const resultShownRef = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [unit, setUnit] = useState<BodyShapeUnit>("metric");
  const [sets, setSets] = useState<Record<MeasurementSetKey, DisplayMeasurements>>({
    current: { ...EMPTY_MEASUREMENTS },
    goal: { ...EMPTY_MEASUREMENTS },
  });

  const parsedCurrent = useMemo(
    () => parseMeasurementSet(sets.current, unit),
    [sets.current, unit],
  );
  const parsedGoal = useMemo(
    () => parseMeasurementSet(sets.goal, unit),
    [sets.goal, unit],
  );
  const result = parsedCurrent.measurements && parsedGoal.measurements
    ? {
        current: parsedCurrent.measurements,
        goal: parsedGoal.measurements,
        summaries: compareBodyShapes(
          parsedCurrent.measurements,
          parsedGoal.measurements,
        ),
      }
    : null;

  useEffect(() => {
    if (!active || viewedRef.current) return;
    viewedRef.current = true;
    trackToolFunnelStep("body_shape_compare", "viewed", {
      input_mode: "measurements",
    });
  }, [active]);

  useEffect(() => {
    if (!active || !hasInteracted || !result || resultShownRef.current) return;
    resultShownRef.current = true;
    trackToolFunnelStep("body_shape_compare", "result_shown", {
      input_mode: "measurements",
      result_type: "silhouette_comparison",
      unit,
    });
  }, [active, hasInteracted, result, unit]);

  function markStarted(
    trigger: "measurement_changed" | "unit_changed" | "example_loaded" | "current_copied",
    reportingUnit: BodyShapeUnit = unit,
  ) {
    setHasInteracted(true);
    if (startedRef.current) return;
    startedRef.current = true;
    trackToolFunnelStep("body_shape_compare", "started", {
      input_mode: "measurements",
      start_trigger: trigger,
      unit: reportingUnit,
    });
  }

  function updateSet(
    setKey: MeasurementSetKey,
    field: BodyShapeField,
    value: string,
  ) {
    markStarted("measurement_changed");
    setSets((current) => ({
      ...current,
      [setKey]: { ...current[setKey], [field]: value },
    }));
  }

  function switchUnit(nextUnit: BodyShapeUnit) {
    if (nextUnit === unit) return;
    markStarted("unit_changed", nextUnit);
    setSets((current) => ({
      current: convertSet(current.current, unit, nextUnit),
      goal: convertSet(current.goal, unit, nextUnit),
    }));
    setUnit(nextUnit);
  }

  function loadExample() {
    markStarted("example_loaded");
    setSets(exampleFor(unit));
  }

  function copyCurrent() {
    markStarted("current_copied");
    setSets((current) => ({
      ...current,
      goal: { ...current.current },
    }));
  }

  const remainingRequired = parsedCurrent.missing + parsedGoal.missing;

  return (
    <div
      id="body-shape-compare-panel"
      className={styles.compareMode}
      role="tabpanel"
      aria-labelledby="measurements-tab"
      hidden={!active}
    >
      <div className={styles.compareWorkspace}>
        <div className={styles.compareControls}>
          <div className={styles.compareIntro}>
            <p className={styles.stepLabel}>01 · Two measurement sets</p>
            <h2 id="shape-compare-title">Compare entered proportions</h2>
            <p>
              Enter current and goal/reference measurements to draw two
              proportion-led 2D outlines. Everything stays in this browser.
            </p>
          </div>

          <div className={styles.compareToolbar}>
            <div className={styles.segmented} aria-label="Comparison measurement units">
              <button
                type="button"
                aria-pressed={unit === "metric"}
                className={unit === "metric" ? styles.segmentActive : undefined}
                onClick={() => switchUnit("metric")}
              >
                Metric
                <span>cm · kg</span>
              </button>
              <button
                type="button"
                aria-pressed={unit === "us"}
                className={unit === "us" ? styles.segmentActive : undefined}
                onClick={() => switchUnit("us")}
              >
                U.S.
                <span>in · lb</span>
              </button>
            </div>
            <button className={styles.exampleButton} type="button" onClick={loadExample}>
              Load example
            </button>
          </div>

          <div className={styles.measurementSets}>
            <MeasurementFieldset
              setKey="current"
              values={sets.current}
              parsed={parsedCurrent}
              unit={unit}
              onChange={updateSet}
            />
            <MeasurementFieldset
              setKey="goal"
              values={sets.goal}
              parsed={parsedGoal}
              unit={unit}
              onChange={updateSet}
              onCopyCurrent={copyCurrent}
            />
          </div>

          <p className={styles.compareStatus} aria-live="polite">
            {result
              ? "Both sets are complete. The comparison is updated."
              : remainingRequired > 0
                ? `${remainingRequired} required ${remainingRequired === 1 ? "field" : "fields"} remaining.`
                : "Check the highlighted values against the supported range."}
          </p>
          <p className={styles.tapeNote}>
            Shoulders, chest, waist, and hips are circumferences. In U.S. mode,
            enter height and inseam as total inches.
          </p>
        </div>

        <div className={styles.shapeStage}>
          <div className={styles.shapeStageHeader}>
            <div>
              <span>Illustrative output</span>
              <strong>Current vs. goal / reference</strong>
            </div>
            <span className={styles.renderBand}>2D · proportional</span>
          </div>

          {result ? (
            <>
              <div className={styles.silhouetteGrid}>
                <SilhouetteFigure
                  label="Current"
                  measurements={result.current}
                  tone="current"
                />
                <SilhouetteFigure
                  label="Goal / reference"
                  measurements={result.goal}
                  tone="goal"
                />
              </div>
              <div className={styles.shapeSummary}>
                <div className={styles.shapeSummaryHeading}>
                  <span>Entered change summary</span>
                  <strong>Descriptive, not a score</strong>
                </div>
                <div className={styles.summaryGrid}>
                  {result.summaries.map((summary) => (
                    <div key={summary.key}>
                      <span>{summary.label}</span>
                      <strong>
                        {summaryValue(summary, summary.current, unit)}
                        <i aria-hidden="true">→</i>
                        {summaryValue(summary, summary.goal, unit)}
                      </strong>
                      <small>{deltaText(summary, unit)}</small>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.compareEmpty}>
              <span aria-hidden="true">A:B</span>
              <strong>Two sets make the comparison</strong>
              <p>
                Complete the current and reference columns, or load the example
                to see how the outline responds.
              </p>
            </div>
          )}

          <div className={styles.compareCaution}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10v6M12 7h.01" />
            </svg>
            <p>
              <strong>Illustrative only.</strong> This 2D mapping is not a body
              prediction, an ideal, or medical advice. Real appearance depends
              on anatomy, muscle, fat distribution, posture, and measurement
              technique that an outline cannot capture.
            </p>
          </div>
        </div>
      </div>

      {active && hasInteracted && result && (
        <ToolConversionCard
          tool="body_shape_compare"
          campaign="web-body-shape-compare"
          placement="result"
          headline="A reference outline is a snapshot. GainFrame makes progress visible over time."
          body="Track progress photos, body-composition estimates, and muscle scores in one private timeline — free to start."
          desktopBody="Scan with your iPhone to turn progress photos into a private, trackable body-composition timeline — free to start."
          experiment={buildToolResultCtaExperiment({
            tool: "body_shape_compare",
          })}
        />
      )}
    </div>
  );
}
