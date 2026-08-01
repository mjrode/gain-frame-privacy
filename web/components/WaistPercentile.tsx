"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  ALL_ADULTS,
  BANDS,
  PERCENTILE_POINTS,
  SOURCE,
  type PercentileResult,
  type Sex,
  bandById,
  formatWaist,
  ordinal,
  percentileFor,
  toCm,
  toInches,
  waistToHeight,
  WHTR_COPY,
  whtrBand,
} from "@/lib/waist-percentiles";

/* Interactive waist percentile check, embedded above the fold in the
 * average-waist-size posts.
 *
 * The point is to answer something a SERP snippet structurally cannot: not
 * "what is the average waist" (Google answers that inline and takes the click)
 * but "where does MY waist sit against people my age". Everything renders
 * client-side from a static table — no network call, no signup, works instantly.
 */

type Unit = "in" | "cm";

const AGE_HINT = "Age bands follow the NHANES reporting groups.";

export default function WaistPercentile({
  defaultSex = "male",
  defaultAgeBand = "30-39",
}: {
  defaultSex?: Sex;
  defaultAgeBand?: string;
}) {
  const [sex, setSex] = useState<Sex>(defaultSex);
  const [ageId, setAgeId] = useState(defaultAgeBand);
  const [unit, setUnit] = useState<Unit>("in");
  const [waist, setWaist] = useState("");
  const [height, setHeight] = useState("");
  const tracked = useRef(false);

  // Age bands are sex-specific tables but share ids, so a sex switch keeps the
  // selected band instead of resetting the user's input.
  const bands = BANDS[sex];
  const band = bandById(sex, ageId) ?? bands[0];

  const waistCm = useMemo(() => {
    const n = parseFloat(waist);
    if (!Number.isFinite(n) || n <= 0) return null;
    const cm = unit === "in" ? toCm(n) : n;
    // Reject values that are almost certainly a typo or the wrong unit rather
    // than reporting a confident percentile for an impossible measurement.
    return cm >= 40 && cm <= 200 ? cm : null;
  }, [waist, unit]);

  const heightCm = useMemo(() => {
    const n = parseFloat(height);
    if (!Number.isFinite(n) || n <= 0) return null;
    return unit === "in" ? toCm(n) : n;
  }, [height, unit]);

  const result = waistCm === null ? null : percentileFor(waistCm, band);
  const vsAll = waistCm === null ? null : percentileFor(waistCm, ALL_ADULTS[sex]);
  const whtr = waistCm !== null && heightCm !== null ? waistToHeight(waistCm, heightCm) : null;

  // One event per mount, on the first usable measurement — enough to answer
  // "did the widget get used" without firing a call per keystroke.
  const resultKind = result?.kind;
  const resultValue = result?.kind === "exact" ? Math.round(result.value) : null;
  useEffect(() => {
    if (!resultKind || tracked.current) return;
    tracked.current = true;
    track("waist_tool_calculated", {
      sex,
      age_band: band.id,
      unit,
      percentile: resultValue ?? resultKind,
    });
    // Deliberately keyed on the first usable result only; re-running on every
    // input tweak would defeat the once-per-mount intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultKind]);

  const median = band.values[PERCENTILE_POINTS.indexOf(50)];
  const noun = sex === "male" ? "men" : "women";

  return (
    <div className="waist-tool">
      <div className="waist-tool-head">
        <h2 className="waist-tool-title">Where does your waist actually sit?</h2>
        {/* Deliberately a <div>, not a <p>: as the sibling right after the first
         * <h2> in the article body this would match `.post-body h2:first-of-type
         * + p`, the pull-quote lede rule — which sets font-size with !important
         * and so can't be overridden by specificity. Not being a <p> sidesteps
         * it entirely. */}
        <div className="waist-tool-sub">
          Enter your measurement to see your percentile against US {noun} your age.
          Nothing is sent anywhere — this runs in your browser.
        </div>
      </div>

      <div className="waist-tool-controls">
        <div className="waist-tool-field">
          <span className="waist-tool-label">You are</span>
          <div className="waist-tool-toggle" role="group" aria-label="Sex">
            {(["male", "female"] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={sex === s ? "is-on" : ""}
                aria-pressed={sex === s}
                onClick={() => setSex(s)}
              >
                {s === "male" ? "Man" : "Woman"}
              </button>
            ))}
          </div>
        </div>

        <div className="waist-tool-field">
          <label className="waist-tool-label" htmlFor="waist-age">
            Age
          </label>
          <select
            id="waist-age"
            className="waist-tool-select"
            value={ageId}
            onChange={(e) => setAgeId(e.target.value)}
            title={AGE_HINT}
          >
            {bands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="waist-tool-field">
          <label className="waist-tool-label" htmlFor="waist-value">
            Waist at the navel
          </label>
          <div className="waist-tool-input-row">
            <input
              id="waist-value"
              className="waist-tool-input"
              type="number"
              inputMode="decimal"
              placeholder={unit === "in" ? "38" : "97"}
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
            <div className="waist-tool-toggle" role="group" aria-label="Units">
              {(["in", "cm"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  className={unit === u ? "is-on" : ""}
                  aria-pressed={unit === u}
                  onClick={() => setUnit(u)}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="waist-tool-field">
          <label className="waist-tool-label" htmlFor="waist-height">
            Height <span className="waist-tool-optional">optional</span>
          </label>
          <input
            id="waist-height"
            className="waist-tool-input"
            type="number"
            inputMode="decimal"
            placeholder={unit === "in" ? "70" : "178"}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
      </div>

      {result === null ? (
        <p className="waist-tool-empty">
          The median {sex === "male" ? "man" : "woman"} aged {band.label} measures{" "}
          <strong>{formatWaist(median, unit)}</strong>. Enter yours to compare.
        </p>
      ) : (
        <Result
          result={result}
          vsAll={vsAll}
          band={band.label}
          noun={noun}
          median={median}
          waistCm={waistCm as number}
          unit={unit}
          whtr={whtr}
        />
      )}

      <p className="waist-tool-source">
        Percentiles from{" "}
        <a href={SOURCE.url} rel="nofollow noopener" target="_blank">
          {SOURCE.label}
        </a>
        . Measured at the iliac crest, not at your pants label — the two differ by
        several inches on most people.
      </p>
    </div>
  );
}

function Result({
  result,
  vsAll,
  band,
  noun,
  median,
  waistCm,
  unit,
  whtr,
}: {
  result: PercentileResult;
  vsAll: PercentileResult | null;
  band: string;
  noun: string;
  median: number;
  waistCm: number;
  unit: Unit;
  whtr: number | null;
}) {
  const diff = waistCm - median;
  const diffLabel =
    unit === "in"
      ? `${Math.abs(toInches(diff)).toFixed(1)}"`
      : `${Math.abs(diff).toFixed(1)} cm`;

  // Marker position: percentile maps directly onto the 0–100 track. Out-of-range
  // results pin to the ends, matching the "below 5th / above 95th" wording.
  const pct = result.kind === "exact" ? result.value : result.kind === "below" ? 2 : 98;

  const headline =
    result.kind === "exact" ? (
      <>
        You're at the <strong>{ordinal(result.value)} percentile</strong> for {noun}{" "}
        aged {band}.
      </>
    ) : result.kind === "below" ? (
      <>
        Your waist is <strong>below the 5th percentile</strong> for {noun} aged {band} —
        smaller than at least 95% of them.
      </>
    ) : (
      <>
        Your waist is <strong>above the 95th percentile</strong> for {noun} aged {band}.
      </>
    );

  return (
    <div className="waist-tool-result">
      <p className="waist-tool-headline">{headline}</p>

      <div className="waist-tool-bar" aria-hidden="true">
        <div className="waist-tool-track">
          <span className="waist-tool-marker" style={{ left: `${pct}%` }} />
        </div>
        <div className="waist-tool-scale">
          <span>5th</span>
          <span>25th</span>
          <span>50th</span>
          <span>75th</span>
          <span>95th</span>
        </div>
      </div>

      <ul className="waist-tool-facts">
        <li>
          {diff === 0 ? (
            <>Exactly the median for your age band ({formatWaist(median, unit)}).</>
          ) : (
            <>
              <strong>{diffLabel}</strong> {diff > 0 ? "above" : "below"} the median for
              your age band ({formatWaist(median, unit)}).
            </>
          )}
        </li>
        {vsAll?.kind === "exact" ? (
          <li>
            Against all US adult {noun} regardless of age:{" "}
            <strong>{ordinal(vsAll.value)} percentile</strong>.
          </li>
        ) : null}
        {whtr !== null ? (
          <li>
            Waist-to-height ratio <strong>{whtr.toFixed(2)}</strong> —{" "}
            {WHTR_COPY[whtrBand(whtr)]}
          </li>
        ) : null}
      </ul>

      <p className="waist-tool-note">
        Percentile is a description of the population, not a health verdict — the US
        average sits above the threshold most guidance flags. The waist-to-height
        ratio is the more useful personal target.
      </p>
    </div>
  );
}
