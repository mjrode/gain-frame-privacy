"use client";

import {
  type FormEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  swrBand,
  swrWomenBand,
  toCm,
  toInches,
  type Sex,
  type SwrBand,
  type SwrWomenBand,
} from "@/lib/waist-percentiles";

type Unit = "in" | "cm";
type Field = "shoulders" | "waist";
type FieldErrors = Record<Field, string | null>;

const LIMITS_CM: Record<Field, readonly [number, number]> = {
  shoulders: [70, 200],
  waist: [40, 200],
};

const MALE_BAND_COPY: Record<
  SwrBand,
  { label: string; range: string; explanation: string }
> = {
  minimal: {
    label: "Minimal V-taper",
    range: "Below 1.3",
    explanation:
      "Shoulders and waist read close to the same width. Both levers are open: shoulder and lat development widens the numerator, waist fat loss shrinks the denominator.",
  },
  some: {
    label: "Some taper",
    range: "1.3-1.44",
    explanation:
      "The silhouette is starting to show. Most men land in this band before a focused block of delt and lat work or a cut moves them up.",
  },
  clear: {
    label: "Clear V-taper",
    range: "1.45-1.54",
    explanation:
      "Visually athletic, and the band most natural lifters reach at their best composition. From here the waist is usually the cheaper lever.",
  },
  strong: {
    label: "Strong aesthetics",
    range: "1.55-1.617",
    explanation:
      "Noticeable shoulder dominance. You are approaching the golden ratio, which very few natural lifters reach without wide clavicles.",
  },
  golden: {
    label: "Golden ratio",
    range: "1.618 and above",
    explanation:
      "At or past the classical 1.618 ideal. Rare naturally, and a ceiling reference rather than a maintenance target for most people.",
  },
};

const FEMALE_BAND_COPY: Record<
  SwrWomenBand,
  { label: string; range: string; explanation: string }
> = {
  below: {
    label: "Below the cited zone",
    range: "Below 1.3",
    explanation:
      "Below the commonly cited 1.3-1.4 zone for women. Shoulder and back training adds apparent width without bulk if more taper is the goal.",
  },
  target: {
    label: "In the cited zone",
    range: "1.3-1.4",
    explanation:
      "Inside the range commonly cited as the aesthetic target for women; proportion guidance for women leans on the waist-to-hip ratio alongside this number.",
  },
  above: {
    label: "Above the cited zone",
    range: "1.45 and above",
    explanation:
      "Above the commonly cited zone, a proportion that reads more athlete- or bodybuilder-styled. Whether that is a goal or not is entirely yours.",
  },
};

const MALE_TONE: Record<SwrBand, string> = {
  minimal: "increased",
  some: "increased",
  clear: "healthy",
  strong: "healthy",
  golden: "healthy",
};

const FEMALE_TONE: Record<SwrWomenBand, string> = {
  below: "increased",
  target: "healthy",
  above: "increased",
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
  if (!value.trim()) {
    return `Enter your ${field === "shoulders" ? "shoulder" : "waist"} measurement.`;
  }
  const number = parseMeasurement(value);
  if (number === null) return "Enter a positive number using digits only.";

  const [minimumCm, maximumCm] = LIMITS_CM[field];
  const numberCm = unit === "in" ? toCm(number) : number;
  // A small tolerance keeps a valid boundary value valid after it has been
  // converted and rounded to one decimal place by the unit toggle.
  if (numberCm < minimumCm - 0.15 || numberCm > maximumCm + 0.15) {
    const minimum = unit === "in" ? toInches(minimumCm).toFixed(1) : minimumCm;
    const maximum = unit === "in" ? toInches(maximumCm).toFixed(1) : maximumCm;
    return `Enter ${minimum}-${maximum} ${unit} for an adult ${
      field === "shoulders" ? "shoulder" : "waist"
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

export default function ShoulderToWaistRatioCalculator() {
  const id = useId();
  const shouldersRef = useRef<HTMLInputElement>(null);
  const waistRef = useRef<HTMLInputElement>(null);
  const [unit, setUnit] = useState<Unit>("in");
  const [sex, setSex] = useState<Sex>("male");
  const [shoulders, setShoulders] = useState("");
  const [waist, setWaist] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    shoulders: false,
    waist: false,
  });

  const errors = useMemo<FieldErrors>(
    () => ({
      shoulders: validateMeasurement(shoulders, "shoulders", unit),
      waist: validateMeasurement(waist, "waist", unit),
    }),
    [shoulders, unit, waist],
  );

  const values = useMemo(() => {
    if (errors.shoulders || errors.waist) return null;
    const parsedShoulders = parseMeasurement(shoulders);
    const parsedWaist = parseMeasurement(waist);
    if (parsedShoulders === null || parsedWaist === null) return null;
    return { shoulders: parsedShoulders, waist: parsedWaist };
  }, [errors.shoulders, errors.waist, shoulders, waist]);

  const result = attempted && values ? values.shoulders / values.waist : null;

  function changeUnit(nextUnit: Unit) {
    if (nextUnit === unit) return;
    setShoulders((value) => convertInput(value, unit, nextUnit));
    setWaist((value) => convertInput(value, unit, nextUnit));
    setUnit(nextUnit);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setTouched({ shoulders: true, waist: true });

    if (errors.shoulders) {
      shouldersRef.current?.focus();
    } else if (errors.waist) {
      waistRef.current?.focus();
    }
  }

  const shouldersErrorVisible =
    (attempted || touched.shoulders) && errors.shoulders;
  const waistErrorVisible = (attempted || touched.waist) && errors.waist;

  return (
    <section
      className="waist-tool whtr-calculator"
      aria-labelledby={`${id}-title`}
    >
      <div className="waist-tool-head">
        <h2 className="waist-tool-title" id={`${id}-title`}>
          Calculate your shoulder-to-waist ratio
        </h2>
        <div className="waist-tool-sub">
          Enter both circumferences in the same unit. The calculator runs here
          in your browser. Nothing is uploaded or saved.
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
            aria-label="Reference bands to compare against"
          >
            {(["male", "female"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={sex === option ? "is-on" : ""}
                aria-pressed={sex === option}
                onClick={() => setSex(option)}
              >
                {option === "male" ? "Men's bands" : "Women's zone"}
              </button>
            ))}
          </div>
        </div>

        <div className="waist-tool-controls">
          <div className="waist-tool-field">
            <label className="waist-tool-label" htmlFor={`${id}-shoulders`}>
              Shoulders at the widest point ({unit})
            </label>
            <input
              ref={shouldersRef}
              id={`${id}-shoulders`}
              className="waist-tool-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={unit === "in" ? "46" : "117"}
              value={shoulders}
              aria-invalid={Boolean(shouldersErrorVisible)}
              aria-describedby={`${id}-shoulders-hint${
                shouldersErrorVisible ? ` ${id}-shoulders-error` : ""
              }`}
              onBlur={() =>
                setTouched((current) => ({ ...current, shoulders: true }))
              }
              onChange={(event) => setShoulders(event.target.value)}
            />
            <span className="whtr-calculator-hint" id={`${id}-shoulders-hint`}>
              Tape around the deltoid heads, horizontal, relaxed (not flexed).
            </span>
            {shouldersErrorVisible ? (
              <span
                className="whtr-calculator-error"
                id={`${id}-shoulders-error`}
                role="alert"
              >
                {errors.shoulders}
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
              placeholder={unit === "in" ? "31" : "79"}
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
          <span>Example: 46 in shoulders ÷ 31 in waist = 1.48.</span>
        </div>
      ) : (
        <RatioResult
          ratio={result}
          shoulders={values.shoulders}
          waist={values.waist}
          unit={unit}
          sex={sex}
        />
      )}

      <p className="waist-tool-source">
        For adults, using circumference measurements. The bands are the
        aesthetic reference ranges published in the chart above. They describe
        proportion preferences rather than health thresholds.
      </p>
    </section>
  );
}

function RatioResult({
  ratio,
  shoulders,
  waist,
  unit,
  sex,
}: {
  ratio: number;
  shoulders: number;
  waist: number;
  unit: Unit;
  sex: Sex;
}) {
  const copy = sex === "male"
    ? MALE_BAND_COPY[swrBand(ratio)]
    : FEMALE_BAND_COPY[swrWomenBand(ratio)];
  const tone = sex === "male"
    ? MALE_TONE[swrBand(ratio)]
    : FEMALE_TONE[swrWomenBand(ratio)];
  const marker = Math.min(100, Math.max(0, ((ratio - 1.1) / 0.7) * 100));
  const goldenWaist = shoulders / 1.618;

  return (
    <div
      className={`waist-tool-result whtr-calculator-result is-${tone}`}
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
          <span>1.1</span>
          <span>1.2</span>
          <span>1.3</span>
          <span>1.4</span>
          <span>1.5</span>
          <span>1.6</span>
          <span>1.8</span>
        </div>
      </div>

      <p className="whtr-calculator-explanation">{copy.explanation}</p>
      <p className="waist-tool-note">
        Calculation: {formatMeasurement(shoulders, unit)} ÷{" "}
        {formatMeasurement(waist, unit)} = {ratio.toFixed(2)}.
        {sex === "male" ? (
          <>
            {" "}
            At your current shoulder measurement, the golden-ratio (1.618) waist
            target is {formatMeasurement(goldenWaist, unit)}.
          </>
        ) : null}
      </p>
    </div>
  );
}
