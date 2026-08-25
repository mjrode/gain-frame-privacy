"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import TransformClient from "@/app/tools/ai-body-transformation/TransformClient";
import {
  MEASUREMENT_KEYS,
  calculateProportions,
  formatMeasurement,
  formatRatio,
  fromCentimeters,
  regionalAdjustments,
  suggestTargets,
  toCentimeters,
  validateMeasurements,
  type MeasurementKey,
  type Measurements,
  type MeasurementUnit,
  type ProportionSex,
  type RegionalMeasurementKey,
} from "@/lib/body-proportions";
import { track } from "@/lib/analytics";
import { SEO_PHYSIQUE_TOOLS_CPP } from "@/lib/site";
import { reportWebToolCompletion } from "@/lib/web-tool-usage";

const FIELDS: Array<{
  key: MeasurementKey;
  label: string;
  hint: string;
  imperial: string;
  metric: string;
}> = [
  { key: "height", label: "Height", hint: "Barefoot", imperial: "70", metric: "178" },
  { key: "wrist", label: "Wrist", hint: "At the wrist bone", imperial: "7", metric: "18" },
  { key: "shoulders", label: "Shoulders", hint: "Around the widest point", imperial: "48", metric: "122" },
  { key: "chest", label: "Chest", hint: "Nipple line, relaxed", imperial: "41", metric: "104" },
  { key: "waist", label: "Waist", hint: "At the navel, exhaled", imperial: "32", metric: "81" },
  { key: "arms", label: "Upper arm", hint: "Largest point, flexed", imperial: "15.5", metric: "39" },
  { key: "thighs", label: "Thigh", hint: "Largest point, relaxed", imperial: "23", metric: "58" },
];

const TARGET_KEYS: RegionalMeasurementKey[] = [
  "shoulders",
  "chest",
  "waist",
  "arms",
  "thighs",
];

const TARGET_LABELS: Record<RegionalMeasurementKey, string> = {
  shoulders: "Shoulders",
  chest: "Chest",
  waist: "Waist",
  arms: "Arms",
  thighs: "Thighs",
};

type InputValues = Record<MeasurementKey, string>;

const EMPTY_INPUTS = Object.fromEntries(
  MEASUREMENT_KEYS.map((key) => [key, ""]),
) as InputValues;

function parseInputs(values: InputValues, unit: MeasurementUnit): Partial<Measurements> {
  return Object.fromEntries(
    MEASUREMENT_KEYS.map((key) => {
      const normalized = values[key].trim();
      const parsed = /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)
        ? Number(normalized)
        : Number.NaN;
      return [key, Number.isFinite(parsed) ? toCentimeters(parsed, unit) : undefined];
    }),
  );
}

function scoreLabel(score: number): string {
  if (score >= 92) return "Highly balanced";
  if (score >= 80) return "Strong proportions";
  if (score >= 65) return "Solid base";
  return "Clear room to shape";
}

export default function BodyMeasurementsClient() {
  const [unit, setUnit] = useState<MeasurementUnit>("in");
  const [sex, setSex] = useState<ProportionSex>("male");
  const [inputs, setInputs] = useState<InputValues>(EMPTY_INPUTS);
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState<Measurements | null>(null);
  const [targets, setTargets] = useState<Measurements | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("measurements_tool_view");
  }, []);

  const parsed = useMemo(() => parseInputs(inputs, unit), [inputs, unit]);
  const errors = useMemo(() => validateMeasurements(parsed), [parsed]);
  const result = useMemo(
    () => (current ? calculateProportions(current, sex) : null),
    [current, sex],
  );
  const targetResult = useMemo(
    () => (targets ? calculateProportions(targets, sex) : null),
    [targets, sex],
  );
  const adjustments = useMemo(
    () => (current && targets ? regionalAdjustments(current, targets) : {}),
    [current, targets],
  );

  function changeUnit(next: MeasurementUnit) {
    if (next === unit) return;
    setInputs((existing) => Object.fromEntries(
      MEASUREMENT_KEYS.map((key) => {
        const value = Number(existing[key]);
        if (!Number.isFinite(value) || existing[key].trim() === "") {
          return [key, existing[key]];
        }
        const centimeters = toCentimeters(value, unit);
        return [
          key,
          fromCentimeters(centimeters, next).toFixed(1).replace(/\.0$/, ""),
        ];
      }),
    ) as InputValues);
    setUnit(next);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    const complete = parsed as Measurements;
    const nextTargets = suggestTargets(complete, sex);
    setCurrent(complete);
    setTargets(nextTargets);
    const calculated = calculateProportions(complete, sex);
    track("measurements_tool_calculated", {
      reference: sex,
      unit,
      score: calculated.score,
      focus_ratio: calculated.focus.key,
    });
    void reportWebToolCompletion("body-measurements-calculator");
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function resetSuggestedTargets() {
    if (!current) return;
    setTargets(suggestTargets(current, sex));
    track("measurements_tool_targets_reset", { reference: sex });
  }

  function updateTarget(key: RegionalMeasurementKey, displayValue: number) {
    setTargets((existing) => existing
      ? { ...existing, [key]: toCentimeters(displayValue, unit) }
      : existing);
  }

  return (
    <>
      <section className="bmc-workbench" aria-labelledby="bmc-form-title">
        <div className="bmc-workbench__head">
          <div>
            <span className="bmc-kicker">Tape in. Targets out.</span>
            <h2 id="bmc-form-title">Build your proportion map</h2>
          </div>
          <div className="bmc-toggles">
            <div className="bmc-toggle" role="group" aria-label="Measurement unit">
              {(["in", "cm"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={unit === option}
                  className={unit === option ? "is-active" : ""}
                  onClick={() => changeUnit(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="bmc-toggle" role="group" aria-label="Reference bands">
              {(["male", "female"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={sex === option}
                  className={sex === option ? "is-active" : ""}
                  onClick={() => {
                    setSex(option);
                    if (current) setTargets(suggestTargets(current, option));
                  }}
                >
                  {option === "male" ? "Men" : "Women"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="bmc-input-grid">
            {FIELDS.map((field, index) => {
              const error = submitted ? errors[field.key] : undefined;
              return (
                <label className="bmc-field" key={field.key}>
                  <span className="bmc-field__number">0{index + 1}</span>
                  <span className="bmc-field__label">{field.label}</span>
                  <span className="bmc-field__input-wrap">
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={inputs[field.key]}
                      placeholder={unit === "in" ? field.imperial : field.metric}
                      aria-invalid={Boolean(error)}
                      onChange={(event) => setInputs((existing) => ({
                        ...existing,
                        [field.key]: event.target.value,
                      }))}
                    />
                    <span>{unit}</span>
                  </span>
                  <span className={error ? "bmc-field__hint is-error" : "bmc-field__hint"}>
                    {error ?? field.hint}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="bmc-form-foot">
            <p>
              Your numbers stay in this browser. Use the same tape tension and
              side of the body each time.
            </p>
            <button type="submit">
              Map my proportions <span aria-hidden>→</span>
            </button>
          </div>
        </form>
      </section>

      {current && targets && result && targetResult ? (
        <section className="bmc-results" ref={resultRef} aria-labelledby="bmc-result-title">
          <div className="bmc-score-card">
            <div className="bmc-score-card__number">
              <span>{result.score}</span><small>/100</small>
            </div>
            <div>
              <span className="bmc-kicker">Your calculator balance score</span>
              <h2 id="bmc-result-title">{scoreLabel(result.score)}</h2>
              <p>
                Strongest signal: <strong>{result.strongest.label}</strong>.
                Biggest lever: <strong>{result.focus.label}</strong>.
              </p>
            </div>
          </div>

          <div className="bmc-ratio-grid">
            {result.metrics.map((item) => (
              <article className={`bmc-ratio is-${item.status}`} key={item.key}>
                <div className="bmc-ratio__top">
                  <span>{item.shortLabel}</span>
                  <span>{item.status === "in_range" ? "In range" : item.status}</span>
                </div>
                <strong>{formatRatio(item.value)}</strong>
                <h3>{item.label}</h3>
                <p>Reference {item.low.toFixed(2)}–{item.high.toFixed(2)}</p>
              </article>
            ))}
          </div>

          <div className="bmc-targets">
            <div className="bmc-targets__intro">
              <div>
                <span className="bmc-kicker">Target lab</span>
                <h2>Shape a realistic next version.</h2>
                <p>
                  We started each slider near the middle of your reference
                  bands and capped the first move. Adjust the target to match
                  what you actually want—not somebody else&apos;s ideal.
                </p>
              </div>
              <button type="button" onClick={resetSuggestedTargets}>
                Reset suggestions
              </button>
            </div>

            <div className="bmc-targets__body">
              <div className="bmc-target-list">
                {TARGET_KEYS.map((key) => {
                  const currentDisplay = fromCentimeters(current[key], unit);
                  const targetDisplay = fromCentimeters(targets[key], unit);
                  const change = ((targets[key] / current[key]) - 1) * 100;
                  return (
                    <label className="bmc-slider" key={key}>
                      <span className="bmc-slider__head">
                        <span>
                          <strong>{TARGET_LABELS[key]}</strong>
                          <small>Now {formatMeasurement(current[key], unit)}</small>
                        </span>
                        <span className={change >= 0 ? "is-positive" : "is-negative"}>
                          {formatMeasurement(targets[key], unit)}
                          <small>{change > 0 ? "+" : ""}{change.toFixed(1)}%</small>
                        </span>
                      </span>
                      <input
                        type="range"
                        min={currentDisplay * 0.75}
                        max={currentDisplay * 1.25}
                        step={0.1}
                        value={targetDisplay}
                        aria-label={`${TARGET_LABELS[key]} target`}
                        onChange={(event) => updateTarget(key, Number(event.target.value))}
                        onPointerUp={() => track("measurements_tool_target_changed", {
                          region: key,
                          change_percent: Math.round(change * 10) / 10,
                        })}
                      />
                    </label>
                  );
                })}
              </div>

              <div className="bmc-target-score">
                <span className="bmc-kicker">Projected balance</span>
                <strong>{result.score}<span>→</span>{targetResult.score}</strong>
                <p>{Object.keys(adjustments).length} regional changes ready for preview</p>
                <div className="bmc-adjustment-list">
                  {Object.entries(adjustments).map(([key, value]) => (
                    <span key={key}>
                      {key === "thighs" ? "legs" : key}
                      <b>{Number(value) > 0 ? "+" : ""}{Number(value).toFixed(1).replace(/\.0$/, "")}%</b>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ToolConversionCard
            tool="body_measurements"
            campaign="web-measurements"
            customProductPageId={SEO_PHYSIQUE_TOOLS_CPP.id}
            placement="calculator_result"
            eyebrow={`${result.score}/100 · ${result.focus.shortLabel} is your next lever`}
            headline="Turn the tape target into a visible progress trend."
            body="GainFrame analyzes repeat progress photos for body fat, 12 muscle groups, and proportions—so you can see whether the shape is changing even when the scale is not."
            desktopBody="Scan with your iPhone to turn repeat progress photos into body-fat, muscle-group, and proportion trends."
            iosLabel="Track my physique in GainFrame"
            proof="iPhone app · Free to start · Private progress timeline"
            onCtaClick={() => track("measurements_tool_cta_clicked", {
              placement: "calculator_result",
              score: result.score,
              focus_ratio: result.focus.key,
            })}
          />

          <div className="bmc-preview" id="ai-preview">
            <div className="bmc-preview__head">
              <div>
                <span className="bmc-kicker">AI preview · Beta</span>
                <h2>Now put those targets on your photo.</h2>
              </div>
              <p>
                This is a directional visualization, not a measurement
                guarantee. The model changes regional shape by percentage; it
                cannot confirm an exact circumference from pixels.
              </p>
            </div>
            <TransformClient
              variant="measurements"
              regionalAdjustments={adjustments}
              referenceSex={sex}
              onPreviewStarted={() => track("measurements_tool_preview_started", {
                reference: sex,
                region_count: Object.keys(adjustments).length,
              })}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
