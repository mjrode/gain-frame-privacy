"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import styles from "./page.module.css";
import ToolConversionCard from "@/components/ToolConversionCard";
import {
  reportWebToolCompletion,
  WEB_TOOL_COMPLETED_DOM_EVENT,
} from "@/lib/web-tool-usage";
import {
  bodyVisualizerRender,
  type BodyVisualizerSex,
} from "@/lib/body-visualizer";

type UnitSystem = "metric" | "us";
type ReferenceSex = BodyVisualizerSex;
type ReferenceView = "front" | "back";

type MetricInputs = {
  heightCm: string;
  weightKg: string;
};

type UsInputs = {
  feet: string;
  inches: string;
  pounds: string;
};

type Measurements = {
  heightM: number;
  weightKg: number;
};

const POUNDS_PER_KG = 2.2046226218;
const CM_PER_INCH = 2.54;
const PHYSIQUE_ROOT =
  "/tools/body-fat-visualizer/assets/physiques";

function parseNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function measurementsFrom(
  unit: UnitSystem,
  metric: MetricInputs,
  us: UsInputs,
): Measurements | null {
  if (unit === "metric") {
    const heightCm = parseNumber(metric.heightCm);
    const weightKg = parseNumber(metric.weightKg);
    if (
      heightCm === null ||
      weightKg === null ||
      heightCm < 120 ||
      heightCm > 230 ||
      weightKg < 35 ||
      weightKg > 250
    ) {
      return null;
    }
    return { heightM: heightCm / 100, weightKg };
  }

  const feet = parseNumber(us.feet);
  const inches = parseNumber(us.inches);
  const pounds = parseNumber(us.pounds);
  if (
    feet === null ||
    inches === null ||
    pounds === null ||
    feet < 3 ||
    feet > 7 ||
    inches < 0 ||
    inches > 11.9 ||
    pounds < 77 ||
    pounds > 551
  ) {
    return null;
  }
  const totalInches = feet * 12 + inches;
  if (totalInches < 47.2 || totalInches > 90.6) return null;
  return {
    heightM: (totalInches * CM_PER_INCH) / 100,
    weightKg: pounds / POUNDS_PER_KG,
  };
}

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
  const reportedUsage = useRef(false);
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [referenceSex, setReferenceSex] =
    useState<ReferenceSex>("female");
  const [referenceView, setReferenceView] =
    useState<ReferenceView>("front");
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
  const render = bodyVisualizerRender(bmi ?? 23.5, referenceSex);
  const renderBodyFat = render.bodyFat;
  const imageBasePath = `${PHYSIQUE_ROOT}/${referenceSex}-age30s-bf${renderBodyFat}`;
  const canonicalImagePath = `${imageBasePath}-${referenceView}.webp`;
  const legacyImagePath = `${imageBasePath}.webp`;

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

  function markUsed() {
    if (reportedUsage.current) return;
    reportedUsage.current = true;
    void reportWebToolCompletion("body-visualizer");
    window.dispatchEvent(new CustomEvent(WEB_TOOL_COMPLETED_DOM_EVENT));
  }

  function updateMetric(key: keyof MetricInputs, value: string) {
    markUsed();
    setMetric((current) => ({ ...current, [key]: value }));
  }

  function updateUs(key: keyof UsInputs, value: string) {
    markUsed();
    setUs((current) => ({ ...current, [key]: value }));
  }

  function switchUnit(nextUnit: UnitSystem) {
    if (nextUnit === unit) return;
    markUsed();
    const current = measurementsFrom(unit, metric, us);
    if (current) {
      if (nextUnit === "metric") {
        setMetric({
          heightCm: compactNumber(current.heightM * 100, 1),
          weightKg: compactNumber(current.weightKg, 1),
        });
      } else {
        const totalInches = (current.heightM * 100) / CM_PER_INCH;
        const feet = Math.floor(totalInches / 12);
        setUs({
          feet: String(feet),
          inches: compactNumber(totalInches - feet * 12, 1),
          pounds: compactNumber(current.weightKg * POUNDS_PER_KG, 1),
        });
      }
    }
    setUnit(nextUnit);
  }

  return (
    <section className={styles.visualizerShell} aria-labelledby="visualizer-title">
      <div className={styles.instrumentBar}>
        <span className={styles.instrumentName}>
          <span className={styles.liveDot} aria-hidden="true" />
          Body shape reference
        </span>
        <span className={styles.instrumentMeta}>Adult BMI · v1.1</span>
      </div>

      <div className={styles.visualizerGrid}>
        <div className={styles.controlPanel}>
          <div className={styles.panelIntro}>
            <p className={styles.stepLabel}>01 · Your measurements</p>
            <h2 id="visualizer-title">Build your body reference</h2>
            <p>
              Enter height and weight. Your result updates instantly—nothing is
              uploaded or saved.
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
                  <span className={styles.heightPair} role="group" aria-labelledby="height-label">
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
                      max="551"
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
            Adult range: 120–230 cm and 35–250 kg (about 3&apos;11&quot;–7&apos;6&quot;
            and 77–551 lb).
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
                    referenceSex === value ? styles.referenceActive : undefined
                  }
                  onClick={() => {
                    markUsed();
                    setReferenceSex(value);
                  }}
                >
                  {value === "female" ? "Female" : "Male"}
                </button>
              ))}
            </div>
            <p>This changes the reference art only. It does not change BMI.</p>
          </fieldset>

          <div className={styles.resultCard} aria-live="polite" aria-atomic="true">
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
                <div className={styles.bmiScale} style={markerStyle} aria-hidden="true">
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
                <span>Enter a height and weight inside the adult range above.</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.displayPanel}>
          <div className={styles.displayHeader}>
            <div>
              <span>Illustrative output</span>
              <strong>{referenceSex === "female" ? "Female" : "Male"} reference</strong>
            </div>
            <span className={styles.renderBand}>
              Band {render.index + 1}/{render.count}
            </span>
          </div>
          <div className={styles.imageChamber}>
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
                  className={
                    referenceView === value ? styles.viewActive : undefined
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
            <Image
              key={canonicalImagePath}
              className={styles.physiqueImage}
              src={canonicalImagePath}
              alt={`Illustrative ${referenceSex} body-shape reference, ${referenceView} view, for the calculated BMI band; not a prediction of the user's body`}
              width={768}
              height={1029}
              sizes="(max-width: 760px) 92vw, 45vw"
              onError={(event) => {
                const image = event.currentTarget;
                if (image.dataset.legacyFallback === "true") return;
                image.dataset.legacyFallback = "true";
                image.srcset = "";
                image.src = legacyImagePath;
              }}
            />
            <span className={styles.axisLine} aria-hidden="true" />
            <span className={styles.frameCornerOne} aria-hidden="true" />
            <span className={styles.frameCornerTwo} aria-hidden="true" />
            <div className={styles.imageNote}>
              Standardized {referenceView}-view render
              <span>Fixed age-30s atlas set for visual consistency</span>
            </div>
          </div>
          <div className={styles.cautionNote}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10v6M12 7h.01" />
            </svg>
            <p>
              <strong>This image is illustrative, not predictive.</strong> BMI
              cannot tell muscle from fat or show where either sits. People at
              the same BMI can look very different.
            </p>
          </div>
        </div>
      </div>

      <ToolConversionCard
        tool="body_visualizer"
        campaign="web-body-visualizer"
        placement="result"
        activation="tool_completed"
        headline={
          bmi !== null
            ? `BMI ${bmi.toFixed(1)} is one number. GainFrame tracks the body behind it.`
            : "BMI is one number. GainFrame tracks the body behind it."
        }
        body="Progress photos become body-composition estimates, muscle scores, and comparisons you can actually track — free to start."
        desktopBody="Scan with your iPhone to turn progress photos into body-composition estimates and muscle scores — free to start."
      />
    </section>
  );
}
