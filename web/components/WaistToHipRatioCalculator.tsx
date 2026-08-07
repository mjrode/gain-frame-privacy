"use client";

import {
  type FormEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  toCm,
  toInches,
  whrBand,
  type Sex,
  type WhrBand,
} from "@/lib/waist-percentiles";

type Unit = "in" | "cm";
type Field = "waist" | "hips";
type FieldErrors = Record<Field, string | null>;

const LIMITS_CM: Record<Field, readonly [number, number]> = {
  waist: [40, 200],
  hips: [50, 250],
};

const BAND_COPY: Record<
  Sex,
  Record<WhrBand, { label: string; range: string; explanation: string }>
> = {
  male: {
    favorable: {
      label: "Generally favorable",
      range: "Under ~0.90",
      explanation:
        "Your waist is comfortably inside your hip line — the fat-distribution pattern commonly read as favorable for men.",
    },
    moderate: {
      label: "Borderline / moderate",
      range: "~0.90–0.99",
      explanation:
        "Your ratio sits in the borderline band for men. Treat it as a prompt to look at waist size and waist-to-height too, not as a verdict.",
    },
    elevated: {
      label: "Commonly flagged as elevated",
      range: "~1.0 and above",
      explanation:
        "Your waist matches or exceeds your hips — the pattern screening guidance commonly flags as elevated risk in men. It is a screening result, not a diagnosis.",
    },
  },
  female: {
    favorable: {
      label: "Generally favorable",
      range: "Under ~0.80",
      explanation:
        "Your waist is comfortably inside your hip line — the fat-distribution pattern commonly read as favorable for women.",
    },
    moderate: {
      label: "Borderline / moderate",
      range: "~0.80–0.85",
      explanation:
        "Your ratio sits in the borderline band for women. Treat it as a prompt to look at waist size and waist-to-height too, not as a verdict.",
    },
    elevated: {
      label: "Commonly flagged as elevated",
      range: "~0.85 and above",
      explanation:
        "Your ratio is at or past the commonly cited 0.85 line for women — a signal of abdominal-leaning fat storage. It is a screening result, not a diagnosis.",
    },
  },
};

const BAND_TONE: Record<WhrBand, string> = {
  favorable: "healthy",
  moderate: "increased",
  elevated: "high",
};

function parseMeasurement(value: string): number | null {
  const normalized = value.trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function validateMeasurement(
  value: string,
  field: Field,
  unit: Unit,
): string | null {
  if (!value.trim()) return `Enter your ${field === "hips" ? "hip" : "waist"} measurement.`;
  const number = parseMeasurement(value);
  if (number === null) return "Enter a positive number using digits only.";

  const [minimumCm, maximumCm] = LIMITS_CM[field];
  const numberCm = unit === "in" ? toCm(number) : number;
  // A small tolerance keeps a valid boundary value valid after it has been
  // converted and rounded to one decimal place by the unit toggle.
  if (numberCm < minimumCm - 0.15 || numberCm > maximumCm + 0.15) {
    const minimum = unit === "in" ? toInches(minimumCm).toFixed(1) : minimumCm;
    const maximum = unit === "in" ? toInches(maximumCm).toFixed(1) : maximumCm;
    return `Enter ${minimum}–${maximum} ${unit} for an adult ${
      field === "hips" ? "hip" : "waist"
    } measurement.`;
  }
  return null;
}

function formatInput(number: number): string {
  return number.toFixed(1).replace(/\.0$/, "");
}

function convertInput(value: string, from: Unit, to: Unit): string {
  const number = parseMeasurement(value);
  if (number === null || from === to) return value;
  return formatInput(to === "cm" ? toCm(number) : toInches(number));
}

function formatMeasurement(number: number, unit: Unit): string {
  return `${number.toFixed(1)} ${unit}`;
}

export default function WaistToHipRatioCalculator() {
  const id = useId();
  const waistRef = useRef<HTMLInputElement>(null);
  const hipsRef = useRef<HTMLInputElement>(null);
  const [unit, setUnit] = useState<Unit>("in");
  const [sex, setSex] = useState<Sex>("male");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    waist: false,
    hips: false,
  });

  const errors = useMemo<FieldErrors>(
    () => ({
      waist: validateMeasurement(waist, "waist", unit),
      hips: validateMeasurement(hips, "hips", unit),
    }),
    [hips, unit, waist],
  );

  const values = useMemo(() => {
    if (errors.waist || errors.hips) return null;
    const parsedWaist = parseMeasurement(waist);
    const parsedHips = parseMeasurement(hips);
    if (parsedWaist === null || parsedHips === null) return null;
    return { waist: parsedWaist, hips: parsedHips };
  }, [errors.hips, errors.waist, hips, waist]);

  const result = attempted && values ? values.waist / values.hips : null;

  function changeUnit(nextUnit: Unit) {
    if (nextUnit === unit) return;
    setWaist((value) => convertInput(value, unit, nextUnit));
    setHips((value) => convertInput(value, unit, nextUnit));
    setUnit(nextUnit);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setTouched({ waist: true, hips: true });

    if (errors.waist) {
      waistRef.current?.focus();
    } else if (errors.hips) {
      hipsRef.current?.focus();
    }
  }

  const waistErrorVisible = (attempted || touched.waist) && errors.waist;
  const hipsErrorVisible = (attempted || touched.hips) && errors.hips;

  return (
    <section
      className="waist-tool whtr-calculator"
      aria-labelledby={`${id}-title`}
    >
      <div className="waist-tool-head">
        <h2 className="waist-tool-title" id={`${id}-title`}>
          Calculate your waist-to-hip ratio
        </h2>
        <div className="waist-tool-sub">
          Enter both measurements in the same unit. The calculator runs here in
          your browser — nothing is uploaded or saved.
        </div>
      </div>

      <form onSubmit={submit} noValidate>
        <div className="whtr-calculator-unit-row">
          <span className="waist-tool-label">Measurement unit</span>
          <div
            className="waist-tool-toggle"
            role="group"
            aria-label="Measurement unit"
          >
            {(["in", "cm"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={unit === option ? "is-on" : ""}
                aria-pressed={unit === option}
                onClick={() => changeUnit(option)}
              >
                {option === "in" ? "Inches" : "Centimeters"}
              </button>
            ))}
          </div>
        </div>

        <div className="whtr-calculator-unit-row">
          <span className="waist-tool-label">Compare against</span>
          <div
            className="waist-tool-toggle"
            role="group"
            aria-label="Screening cutoffs to compare against"
          >
            {(["male", "female"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={sex === option ? "is-on" : ""}
                aria-pressed={sex === option}
                onClick={() => setSex(option)}
              >
                {option === "male" ? "Men's cutoffs" : "Women's cutoffs"}
              </button>
            ))}
          </div>
        </div>

        <div className="waist-tool-controls">
          <div className="waist-tool-field">
            <label className="waist-tool-label" htmlFor={`${id}-waist`}>
              Waist at the navel ({unit})
            </label>
            <input
              ref={waistRef}
              id={`${id}-waist`}
              className="waist-tool-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={unit === "in" ? "34" : "86"}
              value={waist}
              aria-invalid={Boolean(waistErrorVisible)}
              aria-describedby={`${id}-waist-hint${
                waistErrorVisible ? ` ${id}-waist-error` : ""
              }`}
              onBlur={() =>
                setTouched((current) => ({ ...current, waist: true }))
              }
              onChange={(event) => setWaist(event.target.value)}
            />
            <span className="whtr-calculator-hint" id={`${id}-waist-hint`}>
              Measure after a relaxed exhale; do not use your pants size.
            </span>
            {waistErrorVisible ? (
              <span
                className="whtr-calculator-error"
                id={`${id}-waist-error`}
                role="alert"
              >
                {errors.waist}
              </span>
            ) : null}
          </div>

          <div className="waist-tool-field">
            <label className="waist-tool-label" htmlFor={`${id}-hips`}>
              Hips at the widest point ({unit})
            </label>
            <input
              ref={hipsRef}
              id={`${id}-hips`}
              className="waist-tool-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={unit === "in" ? "40" : "102"}
              value={hips}
              aria-invalid={Boolean(hipsErrorVisible)}
              aria-describedby={`${id}-hips-hint${
                hipsErrorVisible ? ` ${id}-hips-error` : ""
              }`}
              onBlur={() =>
                setTouched((current) => ({ ...current, hips: true }))
              }
              onChange={(event) => setHips(event.target.value)}
            />
            <span className="whtr-calculator-hint" id={`${id}-hips-hint`}>
              Tape around the widest point of the buttocks, feet together.
            </span>
            {hipsErrorVisible ? (
              <span
                className="whtr-calculator-error"
                id={`${id}-hips-error`}
                role="alert"
              >
                {errors.hips}
              </span>
            ) : null}
          </div>
        </div>

        <button className="whtr-calculator-submit" type="submit">
          Calculate my ratio
        </button>
      </form>

      {result === null || values === null ? (
        <div className="whtr-calculator-empty">
          <strong>Your result will appear here.</strong>
          <span>Example: a 34 in waist ÷ 40 in hips = 0.85.</span>
        </div>
      ) : (
        <RatioResult
          ratio={result}
          waist={values.waist}
          hips={values.hips}
          unit={unit}
          sex={sex}
        />
      )}

      <p className="waist-tool-source">
        For adults. Waist-to-hip ratio is a screening tool, not a diagnosis. The
        cutoffs are commonly used population-level thresholds; different bodies of
        guidance draw the lines slightly differently.
      </p>
    </section>
  );
}

function RatioResult({
  ratio,
  waist,
  hips,
  unit,
  sex,
}: {
  ratio: number;
  waist: number;
  hips: number;
  unit: Unit;
  sex: Sex;
}) {
  const band = whrBand(ratio, sex);
  const copy = BAND_COPY[sex][band];
  const marker = Math.min(100, Math.max(0, ((ratio - 0.6) / 0.5) * 100));

  return (
    <div
      className={`waist-tool-result whtr-calculator-result is-${BAND_TONE[band]}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="whtr-calculator-result-top">
        <div>
          <span className="whtr-calculator-result-label">Your ratio</span>
          <strong className="whtr-calculator-ratio">{ratio.toFixed(2)}</strong>
        </div>
        <div className="whtr-calculator-band">
          <strong>{copy.label}</strong>
          <span>{copy.range}</span>
        </div>
      </div>

      <div className="whtr-calculator-gauge" aria-hidden="true">
        <div className="whtr-calculator-gauge-track">
          <span
            className="whtr-calculator-gauge-marker"
            style={{ left: `${marker}%` }}
          />
        </div>
        <div className="whtr-calculator-gauge-scale">
          <span>0.60</span>
          <span>0.70</span>
          <span>0.80</span>
          <span>0.90</span>
          <span>1.00</span>
          <span>1.10</span>
        </div>
      </div>

      <p className="whtr-calculator-explanation">{copy.explanation}</p>
      <p className="waist-tool-note">
        Calculation: {formatMeasurement(waist, unit)} ÷{" "}
        {formatMeasurement(hips, unit)} = {ratio.toFixed(2)}, compared against the{" "}
        {sex === "male" ? "men's" : "women's"} screening cutoffs.
      </p>
    </div>
  );
}
