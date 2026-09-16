"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import {
  calculateLeanBodyMass,
  convertMass,
  type MassUnit,
  type LeanBodyMassResult,
} from "@/lib/lean-body-mass";
import { trackToolFunnelStep } from "@/lib/tool-funnel";
import styles from "./page.module.css";

const TOOL = "lean_body_mass_calculator" as const;
const number = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });

export default function LeanBodyMassClient() {
  const [unit, setUnit] = useState<MassUnit>("lb");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [showRange, setShowRange] = useState(false);
  const [uncertainty, setUncertainty] = useState("2");
  const [result, setResult] = useState<LeanBodyMassResult | null>(null);
  const [error, setError] = useState("");
  const viewed = useRef(false);
  const started = useRef(false);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!viewed.current) viewed.current = trackToolFunnelStep(TOOL, "viewed");
  }, []);

  function begin() {
    if (!started.current)
      started.current = trackToolFunnelStep(TOOL, "started");
    setResult(null);
    setError("");
  }

  function changeUnit(next: MassUnit) {
    if (next === unit) return;
    if (weight.trim() && Number.isFinite(Number(weight))) {
      setWeight(
        String(Math.round(convertMass(Number(weight), unit, next) * 100) / 100),
      );
    }
    setUnit(next);
    begin();
  }

  function calculate(event: FormEvent) {
    event.preventDefault();
    begin();
    try {
      const value = calculateLeanBodyMass(
        weight.trim() ? Number(weight) : NaN,
        bodyFat.trim() ? Number(bodyFat) : NaN,
        showRange ? (uncertainty.trim() ? Number(uncertainty) : NaN) : null,
      );
      setResult(value);
      trackToolFunnelStep(TOOL, "result_shown", {
        unit,
        sensitivity_enabled: showRange,
      });
      requestAnimationFrame(() =>
        resultRef.current?.focus({ preventScroll: true }),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Check your numbers and try again.",
      );
    }
  }

  return (
    <section
      className={styles.workspace}
      id="calculator"
      aria-label="Lean body mass calculator"
    >
      <form className={styles.form} onSubmit={calculate}>
        <p className={styles.kicker}>01 / Your inputs</p>
        <h2>Start with two numbers.</h2>
        <fieldset className={styles.units}>
          <legend>Weight unit</legend>
          {(["lb", "kg"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={unit === value}
              onClick={() => changeUnit(value)}
            >
              {value === "lb" ? "Pounds (lb)" : "Kilograms (kg)"}
            </button>
          ))}
        </fieldset>
        <label htmlFor="lbm-weight">
          Body weight <span>{unit}</span>
        </label>
        <input
          id="lbm-weight"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="any"
          required
          placeholder={unit === "lb" ? "180" : "80"}
          value={weight}
          onChange={(event) => {
            begin();
            setWeight(event.target.value);
          }}
        />
        <label htmlFor="lbm-bf">
          Body fat <span>%</span>
        </label>
        <input
          id="lbm-bf"
          type="number"
          inputMode="decimal"
          min="0.01"
          max="99.99"
          step="any"
          required
          placeholder="20"
          value={bodyFat}
          onChange={(event) => {
            begin();
            setBodyFat(event.target.value);
          }}
          aria-describedby="bf-help"
        />
        <p className={styles.help} id="bf-help">
          Use your existing estimate. Need a starting point?{" "}
          <a href="/tools/body-fat-from-photo/">Try a photo estimate</a>.
        </p>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={showRange}
            onChange={(event) => {
              begin();
              setShowRange(event.target.checked);
            }}
          />{" "}
          Show how uncertainty changes the result
        </label>
        {showRange && (
          <div className={styles.rangeInput}>
            <label htmlFor="lbm-range">
              Body-fat uncertainty <span>± percentage points</span>
            </label>
            <input
              id="lbm-range"
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="any"
              required
              value={uncertainty}
              onChange={(event) => {
                begin();
                setUncertainty(event.target.value);
              }}
              aria-describedby="range-help"
            />
            <p className={styles.help} id="range-help">
              Choose your own range. The suggested ±2 points is an illustration,
              with no accuracy guarantee or statistical confidence level.
            </p>
          </div>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.calculate} type="submit">
          Calculate lean body mass <span aria-hidden>→</span>
        </button>
        <p className={styles.privacy}>
          Calculated in your browser. No account or upload.
        </p>
      </form>
      <section
        className={styles.result}
        ref={resultRef}
        tabIndex={-1}
        aria-labelledby="lbm-result-title"
        aria-live="polite"
      >
        <p className={styles.kicker}>02 / Your mass breakdown</p>
        <h2 id="lbm-result-title">
          {result
            ? "Your estimated lean body mass"
            : "See what your weight contains."}
        </h2>
        {result ? (
          <>
            <div className={styles.mainNumber}>
              <strong>{number(result.fatFreeMass)}</strong>
              <span>{unit}</span>
            </div>
            <p className={styles.resultLabel}>Fat-free mass</p>
            <div className={styles.massBar} aria-hidden>
              <span style={{ width: `${100 - result.bodyFat}%` }} />
              <span style={{ width: `${result.bodyFat}%` }} />
            </div>
            <dl className={styles.breakdown}>
              <div>
                <dt>Fat mass</dt>
                <dd>
                  {number(result.fatMass)} {unit}
                </dd>
              </div>
              <div>
                <dt>Total weight</dt>
                <dd>
                  {number(result.weight)} {unit}
                </dd>
              </div>
            </dl>
            <p className={styles.formula}>
              {number(result.weight)} × (1 − {number(result.bodyFat)} ÷ 100) ={" "}
              {number(result.fatFreeMass)} {unit}
            </p>
            {result.range && (
              <div className={styles.sensitivity}>
                <h3>Your sensitivity range</h3>
                <strong>
                  {number(result.range.lowMass)} to{" "}
                  {number(result.range.highMass)} {unit}
                </strong>
                <p>
                  If body fat were {number(result.range.lowBodyFat)}% to{" "}
                  {number(result.range.highBodyFat)}%, fat-free mass would fall
                  in this range. This varies body fat only; weight error is not
                  modeled.
                </p>
              </div>
            )}
            <p className={styles.note}>
              This includes muscle, water, organs, bone and other fat-free
              tissue. It cannot isolate your muscle mass. Any error in your
              body-fat estimate carries into this result.
            </p>
            <a className={styles.nextLink} href="/tools/ffmi-calculator/">
              Put this number in context with FFMI <span aria-hidden>↗</span>
            </a>
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.exampleRing} aria-hidden>
              <span>LBM</span>
            </div>
            <p>
              Enter weight and body fat to see estimated fat-free mass, fat
              mass, and the arithmetic behind both.
            </p>
            <button
              type="button"
              onClick={() => {
                begin();
                setUnit("lb");
                setWeight("180");
                setBodyFat("20");
              }}
            >
              Fill an example: 180 lb at 20%
            </button>
          </div>
        )}
      </section>
      {result && (
        <div className={styles.conversion}>
          <ToolConversionCard
            tool={TOOL}
            campaign="web-lean-body-mass"
            placement="lean_body_mass_result"
            sticky={false}
            headline="Keep your progress in the picture"
            body="Track consistent photos alongside your weight and estimates. GainFrame helps you compare check-ins on iPhone."
            desktopBody="Scan with your iPhone to organize progress photos and compare your check-ins."
          />
        </div>
      )}
    </section>
  );
}
