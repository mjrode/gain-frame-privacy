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
  whtrBand,
  type WhtrBand,
} from "@/lib/waist-percentiles";

type Unit = "in" | "cm";
type Field = "height" | "waist";
type FieldErrors = Record<Field, string | null>;

const LIMITS_CM: Record<Field, readonly [number, number]> = {
  height: [120, 230],
  waist: [40, 200],
};

const BAND_COPY: Record<
  WhtrBand,
  { label: string; range: string; explanation: string }
> = {
  low: {
    label: "Low band",
    range: "Below 0.40",
    explanation:
      "Your waist is small relative to your height. This ratio alone cannot tell whether you are underweight, well-muscled, or adequately nourished.",
  },
  healthy: {
    label: "Healthy central-fat band",
    range: "0.40 to 0.49",
    explanation:
      "Your waist is below the commonly used half-your-height screening line.",
  },
  increased: {
    label: "Elevated band",
    range: "0.50 to 0.59",
    explanation:
      "Your waist is above the commonly used 0.50 screening line. Treat that as a prompt to look at the broader picture, not as a diagnosis.",
  },
  high: {
    label: "High band",
    range: "0.60 and above",
    explanation:
      "Your ratio is at or above the commonly cited 0.60 line. It is a screening result, not a diagnosis or a measure of your overall health.",
  },
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
  if (!value.trim()) return `Enter your ${field}.`;
  const number = parseMeasurement(value);
  if (number === null) return "Enter a positive number using digits only.";

  const [minimumCm, maximumCm] = LIMITS_CM[field];
  const numberCm = unit === "in" ? toCm(number) : number;
  // A small tolerance keeps a valid boundary value valid after it has been
  // converted and rounded to one decimal place by the unit toggle.
  if (numberCm < minimumCm - 0.15 || numberCm > maximumCm + 0.15) {
    const minimum = unit === "in" ? toInches(minimumCm).toFixed(1) : minimumCm;
    const maximum = unit === "in" ? toInches(maximumCm).toFixed(1) : maximumCm;
    return `Enter ${minimum}–${maximum} ${unit} for an adult ${field}.`;
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

export default function WaistToHeightRatioCalculator() {
  const id = useId();
  const heightRef = useRef<HTMLInputElement>(null);
  const waistRef = useRef<HTMLInputElement>(null);
  const [unit, setUnit] = useState<Unit>("in");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    height: false,
    waist: false,
  });

  const errors = useMemo<FieldErrors>(
    () => ({
      height: validateMeasurement(height, "height", unit),
      waist: validateMeasurement(waist, "waist", unit),
    }),
    [height, unit, waist],
  );

  const values = useMemo(() => {
    if (errors.height || errors.waist) return null;
    const parsedHeight = parseMeasurement(height);
    const parsedWaist = parseMeasurement(waist);
    if (parsedHeight === null || parsedWaist === null) return null;
    return { height: parsedHeight, waist: parsedWaist };
  }, [errors.height, errors.waist, height, waist]);

  const result = attempted && values ? values.waist / values.height : null;

  function changeUnit(nextUnit: Unit) {
    if (nextUnit === unit) return;
    setHeight((value) => convertInput(value, unit, nextUnit));
    setWaist((value) => convertInput(value, unit, nextUnit));
    setUnit(nextUnit);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setTouched({ height: true, waist: true });

    if (errors.height) {
      heightRef.current?.focus();
    } else if (errors.waist) {
      waistRef.current?.focus();
    }
  }

  const heightErrorVisible = (attempted || touched.height) && errors.height;
  const waistErrorVisible = (attempted || touched.waist) && errors.waist;

  return (
    <section
      className="waist-tool whtr-calculator"
      aria-labelledby={`${id}-title`}
    >
      <div className="waist-tool-head">
        <h2 className="waist-tool-title" id={`${id}-title`}>
          Calculate your waist-to-height ratio
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

        <div className="waist-tool-controls">
          <div className="waist-tool-field">
            <label className="waist-tool-label" htmlFor={`${id}-height`}>
              Height ({unit})
            </label>
            <input
              ref={heightRef}
              id={`${id}-height`}
              className="waist-tool-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={unit === "in" ? "70" : "178"}
              value={height}
              aria-invalid={Boolean(heightErrorVisible)}
              aria-describedby={`${id}-height-hint${
                heightErrorVisible ? ` ${id}-height-error` : ""
              }`}
              onBlur={() =>
                setTouched((current) => ({ ...current, height: true }))
              }
              onChange={(event) => setHeight(event.target.value)}
            />
            <span className="whtr-calculator-hint" id={`${id}-height-hint`}>
              {unit === "in"
                ? "Use total inches — 5 ft 10 in is 70 in."
                : "Measure without shoes."}
            </span>
            {heightErrorVisible ? (
              <span
                className="whtr-calculator-error"
                id={`${id}-height-error`}
                role="alert"
              >
                {errors.height}
              </span>
            ) : null}
          </div>

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
              placeholder={unit === "in" ? "35" : "89"}
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
        </div>

        <button className="whtr-calculator-submit" type="submit">
          Calculate my ratio
        </button>
      </form>

      {result === null || values === null ? (
        <div className="whtr-calculator-empty">
          <strong>Your result will appear here.</strong>
          <span>Example: a 35 in waist ÷ 70 in height = 0.500.</span>
        </div>
      ) : (
        <RatioResult
          ratio={result}
          height={values.height}
          waist={values.waist}
          unit={unit}
        />
      )}

      <p className="waist-tool-source">
        For adults. Waist-to-height ratio is a screening tool, not a diagnosis. It
        cannot evaluate your body composition, bloodwork, symptoms, or the age-adjusted
        guidance used for children.
      </p>
    </section>
  );
}

function RatioResult({
  ratio,
  height,
  waist,
  unit,
}: {
  ratio: number;
  height: number;
  waist: number;
  unit: Unit;
}) {
  const band = whtrBand(ratio);
  const copy = BAND_COPY[band];
  const halfHeight = height * 0.5;
  const difference = waist - halfHeight;
  const marker = Math.min(100, Math.max(0, ((ratio - 0.3) / 0.4) * 100));

  const thresholdCopy =
    Math.abs(difference) < 0.05
      ? `Your waist is right on the half-your-height line (${formatMeasurement(
          halfHeight,
          unit,
        )}).`
      : `Your waist is ${formatMeasurement(Math.abs(difference), unit)} ${
          difference < 0 ? "below" : "above"
        } the half-your-height line (${formatMeasurement(
          halfHeight,
          unit,
        )} at your height).`;

  return (
    <div
      className={`waist-tool-result whtr-calculator-result is-${band}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="whtr-calculator-result-top">
        <div>
          <span className="whtr-calculator-result-label">Your ratio</span>
          <strong className="whtr-calculator-ratio">{ratio.toFixed(3)}</strong>
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
          <span>0.30</span>
          <span>0.40</span>
          <span>0.50</span>
          <span>0.60</span>
          <span>0.70</span>
        </div>
      </div>

      <p className="whtr-calculator-explanation">{copy.explanation}</p>
      <p className="whtr-calculator-threshold">{thresholdCopy}</p>
      <p className="waist-tool-note">
        Calculation: {formatMeasurement(waist, unit)} ÷{" "}
        {formatMeasurement(height, unit)} = {ratio.toFixed(3)}.
      </p>
    </div>
  );
}
