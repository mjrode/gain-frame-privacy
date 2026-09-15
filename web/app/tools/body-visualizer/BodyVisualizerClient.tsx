"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import styles from "./page.module.css";
import ToolConversionCard from "@/components/ToolConversionCard";
import { track } from "@/lib/analytics";
import { trackToolFunnelStep } from "@/lib/tool-funnel";
import {
  reportWebToolCompletion,
  WEB_TOOL_COMPLETED_DOM_EVENT,
} from "@/lib/web-tool-usage";
import {
  bodyVisualizerRender,
  bodyVisualizerWeightRange,
  BODY_VISUALIZER_BMI_RANGE,
  BODY_VISUALIZER_VERSION,
  type BodyVisualizerSex,
} from "@/lib/body-visualizer";
import {
  bodyVisualizerUnitInputs,
  measurementsFrom,
  POUNDS_PER_KG,
  type UnitSystem,
  type MetricInputs,
  type UsInputs,
} from "@/lib/body-visualizer-measurements";
import BodyShapeCompare from "./BodyShapeCompare";
import BodyReferenceImage from "./BodyReferenceImage";

type ReferenceSex = BodyVisualizerSex;
type ReferenceView = "front" | "back";
type VisualizerMode = "height_weight" | "measurements";

function bmiCategory(bmi: number) {
  if (bmi < 18.5) {
    return {
      label: "Underweight range",
      shortLabel: "Underweight",
      tone: "low",
    } as const;
  }
  if (bmi < 25) {
    return {
      label: "Healthy weight range",
      shortLabel: "Healthy range",
      tone: "healthy",
    } as const;
  }
  if (bmi < 30) {
    return {
      label: "Overweight range",
      shortLabel: "Overweight",
      tone: "high",
    } as const;
  }
  return {
    label: "Obesity range",
    shortLabel: "Obesity range",
    tone: "higher",
  } as const;
}

function compactNumber(value: number, decimals = 0): string {
  return value.toFixed(decimals).replace(/\.0$/, "");
}

export default function BodyVisualizerClient() {
  const viewedRef = useRef(false);
  const reportedUsage = useRef(false);
  const reportedCompletion = useRef(false);
  const reportedResultShown = useRef(false);
  const [mode, setMode] = useState<VisualizerMode>("height_weight");
  const [locationResolved, setLocationResolved] = useState(false);
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [referenceSex, setReferenceSex] = useState<ReferenceSex>("female");
  const [referenceView, setReferenceView] = useState<ReferenceView>("front");
  const [metric, setMetric] = useState<MetricInputs>({
    heightCm: "170",
    weightKg: "68",
  });
  const [us, setUs] = useState<UsInputs>({
    feet: "5",
    inches: "7",
    pounds: "150",
  });

  const measurements = useMemo(
    () => measurementsFrom(unit, metric, us),
    [metric, unit, us],
  );
  const bmi = measurements
    ? measurements.weightKg / measurements.heightM ** 2
    : null;
  const category = bmi === null ? null : bmiCategory(bmi);
  const render = bodyVisualizerRender(bmi, referenceSex);
  const sliderRange = measurements
    ? bodyVisualizerWeightRange(measurements.heightM, unit === "us")
    : null;
  const sliderWeight = measurements
    ? measurements.weightKg * (unit === "us" ? POUNDS_PER_KG : 1)
    : 0;
  const adjacentImages = render
    ? [-1, 1].flatMap((offset) => {
        const index = render.index + offset;
        if (index < 0 || index >= render.count) return [];
        const neighbor = bodyVisualizerRender(
          BODY_VISUALIZER_BMI_RANGE.min + index,
          referenceSex,
        );
        return neighbor ? [neighbor[referenceView]] : [];
      })
    : [];

  const range = measurements
    ? {
        lowKg: 18.5 * measurements.heightM ** 2,
        highKg: 24.9 * measurements.heightM ** 2,
      }
    : null;
  const markerPosition =
    bmi === null ? 47 : Math.min(96, Math.max(4, ((bmi - 14) / 26) * 100));
  const markerStyle = {
    "--marker-position": `${markerPosition}%`,
  } as CSSProperties;

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get(
      "mode",
    );
    if (requestedMode === "measurements") setMode("measurements");
    setLocationResolved(true);
  }, []);

  useEffect(() => {
    if (!locationResolved || mode !== "height_weight" || viewedRef.current)
      return;
    viewedRef.current = true;
    trackToolFunnelStep("body_visualizer", "viewed", {
      input_mode: "height_weight",
      visualizer_version: BODY_VISUALIZER_VERSION,
    });
  }, [locationResolved, mode]);

  function switchMode(nextMode: VisualizerMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    const url = new URL(window.location.href);
    if (nextMode === "measurements") {
      url.searchParams.set("mode", "measurements");
    } else {
      url.searchParams.delete("mode");
    }
    window.history.replaceState(window.history.state, "", url);
  }

  function markUsed(
    nextUnit: UnitSystem = unit,
    nextReferenceSex: ReferenceSex = referenceSex,
    nextMetric: MetricInputs = metric,
    nextUs: UsInputs = us,
  ) {
    if (!reportedUsage.current) {
      reportedUsage.current = true;
      trackToolFunnelStep("body_visualizer", "started", {
        input_mode: "height_weight",
        visualizer_version: BODY_VISUALIZER_VERSION,
        unit: nextUnit,
        reference_sex: nextReferenceSex,
      });
    }

    const nextMeasurements = measurementsFrom(nextUnit, nextMetric, nextUs);
    if (nextMeasurements && !reportedCompletion.current) {
      reportedCompletion.current = true;
      void reportWebToolCompletion("body-visualizer");
      window.dispatchEvent(new CustomEvent(WEB_TOOL_COMPLETED_DOM_EVENT));
    }

    if (!reportedResultShown.current && nextMeasurements) {
      reportedResultShown.current = true;
      track("body_visualizer_result_shown", {
        unit: nextUnit,
        reference_sex: nextReferenceSex,
      });
      trackToolFunnelStep("body_visualizer", "result_shown", {
        input_mode: "height_weight",
        visualizer_version: BODY_VISUALIZER_VERSION,
        unit: nextUnit,
        reference_sex: nextReferenceSex,
      });
    }
  }

  function updateMetric(key: keyof MetricInputs, value: string) {
    const nextMetric = { ...metric, [key]: value };
    markUsed(unit, referenceSex, nextMetric, us);
    setMetric(nextMetric);
  }

  function updateUs(key: keyof UsInputs, value: string) {
    const nextUs = { ...us, [key]: value };
    markUsed(unit, referenceSex, metric, nextUs);
    setUs(nextUs);
  }

  function switchUnit(nextUnit: UnitSystem) {
    if (nextUnit === unit) return;
    const current = measurementsFrom(unit, metric, us);
    let nextMetric = metric;
    let nextUs = us;
    if (current) {
      const converted = bodyVisualizerUnitInputs(current);
      if (nextUnit === "metric") {
        nextMetric = converted.metric;
        setMetric(nextMetric);
      } else {
        nextUs = converted.us;
        setUs(nextUs);
      }
    }
    markUsed(nextUnit, referenceSex, nextMetric, nextUs);
    setUnit(nextUnit);
  }

  return (
    <section
      className={styles.visualizerShell}
      aria-labelledby="visualizer-mode-title"
    >
      <div className={styles.instrumentBar}>
        <span className={styles.instrumentName}>
          <span className={styles.liveDot} aria-hidden="true" />
          Body shape reference
        </span>
        <span className={styles.instrumentMeta}>
          {mode === "height_weight"
            ? "30 stages · Front + back"
            : "Tape proportions · v1.0"}
        </span>
      </div>

      <div className={styles.modeChooser}>
        <div>
          <span>Visualizer mode</span>
          <strong id="visualizer-mode-title">Choose how to visualize</strong>
        </div>
        <div
          className={styles.modeTabs}
          role="tablist"
          aria-label="Choose body visualizer mode"
        >
          <button
            id="height-weight-tab"
            type="button"
            role="tab"
            aria-selected={mode === "height_weight"}
            aria-controls="height-weight-panel"
            tabIndex={mode === "height_weight" ? 0 : -1}
            className={
              mode === "height_weight" ? styles.modeTabActive : undefined
            }
            onClick={() => switchMode("height_weight")}
            onKeyDown={(event) => {
              if (event.key !== "ArrowRight" && event.key !== "End") return;
              event.preventDefault();
              switchMode("measurements");
              document.getElementById("measurements-tab")?.focus();
            }}
          >
            <span>01</span>
            Height + weight
            <small>BMI reference</small>
          </button>
          <button
            id="measurements-tab"
            type="button"
            role="tab"
            aria-selected={mode === "measurements"}
            aria-controls="body-shape-compare-panel"
            tabIndex={mode === "measurements" ? 0 : -1}
            className={
              mode === "measurements" ? styles.modeTabActive : undefined
            }
            onClick={() => switchMode("measurements")}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "Home") return;
              event.preventDefault();
              switchMode("height_weight");
              document.getElementById("height-weight-tab")?.focus();
            }}
          >
            <span>02</span>
            Measurements
            <small>Current vs. reference</small>
          </button>
        </div>
      </div>

      <div
        id="height-weight-panel"
        role="tabpanel"
        aria-labelledby="height-weight-tab"
        hidden={mode !== "height_weight"}
      >
        <div className={styles.visualizerGrid}>
          <div className={styles.controlPanel}>
            <div className={styles.panelIntro}>
              <p className={styles.stepLabel}>01 · Your measurements</p>
              <h2 id="visualizer-title">Explore your body reference</h2>
              <p>
                Enter height and weight. Move the weight slider to explore
                different sizes. Your measurements stay in this browser.
              </p>
            </div>

            <div className={styles.segmented} aria-label="Measurement units">
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
                <span>ft · in · lb</span>
              </button>
            </div>

            <div className={styles.inputGrid}>
              {unit === "metric" ? (
                <>
                  <label className={styles.inputGroup}>
                    <span>Height</span>
                    <span className={styles.inputWrap}>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="120"
                        max="230"
                        step="0.1"
                        value={metric.heightCm}
                        aria-describedby="measurement-limits"
                        onChange={(event) =>
                          updateMetric("heightCm", event.target.value)
                        }
                      />
                      <span>cm</span>
                    </span>
                  </label>
                  <label className={styles.inputGroup}>
                    <span>Weight</span>
                    <span className={styles.inputWrap}>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="35"
                        max="250"
                        step="0.1"
                        value={metric.weightKg}
                        aria-describedby="measurement-limits"
                        onChange={(event) =>
                          updateMetric("weightKg", event.target.value)
                        }
                      />
                      <span>kg</span>
                    </span>
                  </label>
                </>
              ) : (
                <>
                  <div className={styles.inputGroup}>
                    <span id="height-label">Height</span>
                    <span
                      className={styles.heightPair}
                      role="group"
                      aria-labelledby="height-label"
                    >
                      <span className={styles.inputWrap}>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="3"
                          max="7"
                          step="1"
                          value={us.feet}
                          aria-label="Height in feet"
                          aria-describedby="measurement-limits"
                          onChange={(event) =>
                            updateUs("feet", event.target.value)
                          }
                        />
                        <span>ft</span>
                      </span>
                      <span className={styles.inputWrap}>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="11.9"
                          step="0.1"
                          value={us.inches}
                          aria-label="Additional height in inches"
                          aria-describedby="measurement-limits"
                          onChange={(event) =>
                            updateUs("inches", event.target.value)
                          }
                        />
                        <span>in</span>
                      </span>
                    </span>
                  </div>
                  <label className={styles.inputGroup}>
                    <span>Weight</span>
                    <span className={styles.inputWrap}>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="77"
                        max="551.2"
                        step="0.1"
                        value={us.pounds}
                        aria-describedby="measurement-limits"
                        onChange={(event) =>
                          updateUs("pounds", event.target.value)
                        }
                      />
                      <span>lb</span>
                    </span>
                  </label>
                </>
              )}
            </div>
            <p className={styles.limitNote} id="measurement-limits">
              Adult range: 120–230 cm and 35–250 kg (about
              3&apos;11&quot;–7&apos;6&quot; and 77–551 lb).
            </p>

            <fieldset className={styles.referencePicker}>
              <legend>02 · Choose the illustration set</legend>
              <div className={styles.referenceButtons}>
                {(["female", "male"] as ReferenceSex[]).map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={referenceSex === value}
                    className={
                      referenceSex === value
                        ? styles.referenceActive
                        : undefined
                    }
                    onClick={() => {
                      markUsed(unit, value);
                      setReferenceSex(value);
                    }}
                  >
                    {value === "female" ? "Female" : "Male"}
                  </button>
                ))}
              </div>
              <p>
                This changes the reference art only. It does not change BMI.
              </p>
            </fieldset>
          </div>

          <div className={styles.displayPanel}>
            <div className={styles.displayHeader}>
              <div>
                <span>Illustrative output</span>
                <strong>
                  {referenceSex === "female" ? "Female" : "Male"} reference
                </strong>
              </div>
              <span className={styles.renderBand}>
                {render
                  ? `Stage ${render.stage} / ${render.count}`
                  : "Enter measurements"}
              </span>
            </div>
            <div className={styles.imageChamber}>
              {render ? (
                <>
                  <div
                    className={styles.viewButtons}
                    role="radiogroup"
                    aria-label="Physique view"
                  >
                    {(["front", "back"] as ReferenceView[]).map((value) => (
                      <button
                        type="button"
                        role="radio"
                        key={value}
                        aria-checked={referenceView === value}
                        tabIndex={referenceView === value ? 0 : -1}
                        id={`reference-view-${value}`}
                        onKeyDown={(event) => {
                          if (
                            ![
                              "ArrowLeft",
                              "ArrowRight",
                              "ArrowUp",
                              "ArrowDown",
                              "Home",
                              "End",
                            ].includes(event.key)
                          )
                            return;
                          event.preventDefault();
                          const nextView =
                            event.key === "Home"
                              ? "front"
                              : event.key === "End"
                                ? "back"
                                : referenceView === "front"
                                  ? "back"
                                  : "front";
                          markUsed();
                          setReferenceView(nextView);
                          document
                            .getElementById(`reference-view-${nextView}`)
                            ?.focus();
                        }}
                        className={
                          referenceView === value
                            ? styles.viewActive
                            : undefined
                        }
                        onClick={() => {
                          markUsed();
                          setReferenceView(value);
                        }}
                      >
                        {value === "front" ? "Front" : "Back"}
                      </button>
                    ))}
                  </div>
                  <BodyReferenceImage
                    src={render[referenceView]}
                    alt={`AI-generated ${referenceSex} size illustration, ${referenceView} view, stage ${render.stage} of ${render.count}. A general reference, not a prediction of your body.`}
                    adjacent={adjacentImages}
                  />
                </>
              ) : (
                <div className={styles.invalidImage} role="status">
                  <strong>Let’s check those numbers.</strong>
                  <span>
                    Enter a valid height and weight to see the illustration.
                  </span>
                </div>
              )}
            </div>
            {render && measurements && sliderRange && (
              <div className={styles.weightExplorer}>
                <div className={styles.weightExplorerHeading}>
                  <label htmlFor="visualizer-weight-slider">
                    Explore weight at this height
                  </label>
                  <output htmlFor="visualizer-weight-slider">
                    {compactNumber(sliderWeight, 1)}{" "}
                    <span>{unit === "us" ? "lb" : "kg"}</span>
                  </output>
                </div>
                <input
                  id="visualizer-weight-slider"
                  type="range"
                  min={sliderRange.min}
                  max={sliderRange.max}
                  step={1}
                  value={Math.min(
                    sliderRange.max,
                    Math.max(sliderRange.min, sliderWeight),
                  )}
                  aria-valuetext={`${compactNumber(Math.min(sliderRange.max, Math.max(sliderRange.min, sliderWeight)))} ${unit === "us" ? "pounds" : "kilograms"}`}
                  aria-describedby="weight-slider-note"
                  onChange={(event) =>
                    unit === "metric"
                      ? updateMetric("weightKg", event.target.value)
                      : updateUs("pounds", event.target.value)
                  }
                />
                <div className={styles.sliderEndpoints} aria-hidden="true">
                  <span>
                    {sliderRange.min} {unit === "us" ? "lb" : "kg"}
                  </span>
                  <span>
                    {sliderRange.max} {unit === "us" ? "lb" : "kg"}
                  </span>
                </div>
                <p id="weight-slider-note">
                  30 size stages · AI-generated illustrations
                </p>
                {render.outsideRange && (
                  <p className={styles.rangeNotice} role="status">
                    Your BMI is outside the image range of 16–45. The nearest
                    endpoint is shown; your calculated BMI below is unchanged.
                  </p>
                )}
              </div>
            )}
            <details className={styles.bmiDetails}>
              <summary>
                <span>
                  {bmi === null
                    ? "Check measurements"
                    : `BMI ${bmi.toFixed(1)}`}
                </span>
                <span>{category?.shortLabel ?? "Enter valid values"}</span>
                <span aria-hidden="true">＋</span>
              </summary>
              <div
                className={styles.resultCard}
                aria-live="polite"
                aria-atomic="true"
              >
                {bmi !== null && category && range ? (
                  <>
                    <div className={styles.resultTopline}>
                      <span>Your BMI</span>
                      <span
                        className={`${styles.categoryChip} ${styles[`tone${category.tone}`]}`}
                      >
                        {category.shortLabel}
                      </span>
                    </div>
                    <div className={styles.resultNumber}>{bmi.toFixed(1)}</div>
                    <p className={styles.resultCategory}>{category.label}</p>
                    <div
                      className={styles.bmiScale}
                      style={markerStyle}
                      aria-hidden="true"
                    >
                      <span className={styles.scaleLow} />
                      <span className={styles.scaleHealthy} />
                      <span className={styles.scaleHigh} />
                      <span className={styles.scaleHigher} />
                      <i />
                    </div>
                    <div className={styles.scaleLabels} aria-hidden="true">
                      <span>18.5</span>
                      <span>25</span>
                      <span>30+</span>
                    </div>
                    <div className={styles.referenceRange}>
                      <span>Adult BMI 18.5–24.9 at this height</span>
                      <strong>
                        {unit === "metric"
                          ? `${compactNumber(range.lowKg)}–${compactNumber(range.highKg)} kg`
                          : `${compactNumber(range.lowKg * POUNDS_PER_KG)}–${compactNumber(
                              range.highKg * POUNDS_PER_KG,
                            )} lb`}
                      </strong>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyResult} role="status">
                    <strong>Check your measurements</strong>
                    <span>
                      Enter a height and weight inside the adult range above.
                    </span>
                  </div>
                )}
              </div>
            </details>
            <div className={styles.cautionNote}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 10v6M12 7h.01" />
              </svg>
              <p>
                <strong>A size reference, not your body.</strong> These
                AI-generated images aren’t validated predictions. BMI cannot
                distinguish muscle from fat; people with the same BMI can look
                very different.
              </p>
            </div>
          </div>
          {mode === "height_weight" && bmi !== null && (
            <div className={styles.resultBridge}>
              <ToolConversionCard
                tool="body_visualizer"
                campaign="web-body-visualizer"
                placement="atlas_v3_result"
                sticky={false}
                eyebrow="Make it personal"
                headline="See what your own photo reveals."
                body="Get a body-fat estimate and a muscle-by-muscle breakdown from your photo. Compare check-ins to see what changes."
                desktopBody="Scan with your iPhone for a body-fat estimate, a muscle-by-muscle breakdown, and progress you can compare."
                iosLabel="Analyze my photo in GainFrame"
                proof="Free to start · iPhone app"
              />
            </div>
          )}
        </div>
      </div>

      <BodyShapeCompare active={mode === "measurements"} />
    </section>
  );
}
