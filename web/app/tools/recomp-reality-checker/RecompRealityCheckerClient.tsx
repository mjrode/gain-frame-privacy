"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import {
  assessRecompReality,
  validateRecompRealityInputs,
  type RecompRealityAssessment,
  type RecompRealityField,
  type RecompRealityInputs,
  type StrengthPerformanceTrend,
} from "@/lib/recomp-reality-checker";
import { buildToolResultCtaExperiment } from "@/lib/tool-cta-experiment";
import { trackToolFunnelStep } from "@/lib/tool-funnel";
import styles from "./page.module.css";

const TOOL_ID = "recomp_reality_checker" as const;

type UnitSystem = "us" | "metric";

type FormValues = {
  weeks: string;
  beginningWeight: string;
  currentWeight: string;
  beginningWaist: string;
  currentWaist: string;
  beginningBodyFat: string;
  currentBodyFat: string;
};

const INITIAL_VALUES: FormValues = {
  weeks: "8",
  beginningWeight: "",
  currentWeight: "",
  beginningWaist: "",
  currentWaist: "",
  beginningBodyFat: "",
  currentBodyFat: "",
};

const STRENGTH_OPTIONS: Array<{
  value: StrengthPerformanceTrend;
  label: string;
  note: string;
}> = [
  {
    value: "improved",
    label: "Improved",
    note: "More load, reps, or quality",
  },
  {
    value: "stable",
    label: "About the same",
    note: "Comparable work held steady",
  },
  {
    value: "declined",
    label: "Declined",
    note: "Less load, reps, or quality",
  },
];

function parsedNumber(value: string): number {
  if (!value.trim()) return Number.NaN;
  return Number(value);
}

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  return Number(value);
}

function compact(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

function converted(value: string, factor: number): string {
  const number = Number(value);
  return Number.isFinite(number) && value.trim()
    ? compact(number * factor)
    : value;
}

function signalMark(direction: string): string {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  if (direction === "stable") return "≈";
  return "○";
}

function classificationCode(assessment: RecompRealityAssessment): string {
  if (assessment.classification === "likely_recomp") return "R / 01";
  if (assessment.classification === "likely_cut") return "C / 02";
  if (assessment.classification === "likely_surplus") return "S / 03";
  return "? / 04";
}

export default function RecompRealityCheckerClient() {
  const [unit, setUnit] = useState<UnitSystem>("us");
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [strengthTrend, setStrengthTrend] =
    useState<StrengthPerformanceTrend | null>(null);
  const [includeBodyFat, setIncludeBodyFat] = useState(false);
  const [assessment, setAssessment] =
    useState<RecompRealityAssessment | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<RecompRealityField, string>>
  >({});
  const [submittedWithErrors, setSubmittedWithErrors] = useState(false);
  const startedRef = useRef(false);
  const viewedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackToolFunnelStep(TOOL_ID, "viewed", {
      input_mode: "measurements",
    });
  }, []);

  const unitLabels = useMemo(
    () => unit === "us"
      ? { weight: "lb", waist: "in" }
      : { weight: "kg", waist: "cm" },
    [unit],
  );

  function markStarted(trigger: string) {
    if (startedRef.current) return;
    startedRef.current = true;
    trackToolFunnelStep(TOOL_ID, "started", {
      input_mode: "measurements",
      start_trigger: trigger,
    });
  }

  function clearStaleResult() {
    setAssessment(null);
    setSubmittedWithErrors(false);
  }

  function updateValue(key: keyof FormValues, value: string) {
    markStarted(key);
    clearStaleResult();
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function chooseStrength(value: StrengthPerformanceTrend) {
    markStarted("strength_selected");
    clearStaleResult();
    setStrengthTrend(value);
    setErrors((current) => ({ ...current, strengthTrend: undefined }));
  }

  function switchUnit(nextUnit: UnitSystem) {
    if (nextUnit === unit) return;
    markStarted("unit_changed");
    clearStaleResult();
    const weightFactor = nextUnit === "metric" ? 0.45359237 : 2.20462262;
    const waistFactor = nextUnit === "metric" ? 2.54 : 1 / 2.54;
    setValues((current) => ({
      ...current,
      beginningWeight: converted(current.beginningWeight, weightFactor),
      currentWeight: converted(current.currentWeight, weightFactor),
      beginningWaist: converted(current.beginningWaist, waistFactor),
      currentWaist: converted(current.currentWaist, waistFactor),
    }));
    setErrors({});
    setUnit(nextUnit);
  }

  function toggleBodyFat(enabled: boolean) {
    markStarted("body_fat_toggled");
    clearStaleResult();
    setIncludeBodyFat(enabled);
    if (!enabled) {
      setValues((current) => ({
        ...current,
        beginningBodyFat: "",
        currentBodyFat: "",
      }));
      setErrors((current) => ({
        ...current,
        beginningBodyFat: undefined,
        currentBodyFat: undefined,
      }));
    }
  }

  function currentInputs(): RecompRealityInputs {
    return {
      weeks: parsedNumber(values.weeks),
      beginningWeight: parsedNumber(values.beginningWeight),
      currentWeight: parsedNumber(values.currentWeight),
      beginningWaist: parsedNumber(values.beginningWaist),
      currentWaist: parsedNumber(values.currentWaist),
      strengthTrend: strengthTrend ?? ("" as StrengthPerformanceTrend),
      beginningBodyFat: includeBodyFat
        ? optionalNumber(values.beginningBodyFat)
        : null,
      currentBodyFat: includeBodyFat
        ? optionalNumber(values.currentBodyFat)
        : null,
    };
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markStarted("assessment_submitted");
    const input = currentInputs();
    const issues = validateRecompRealityInputs(input);
    if (issues.length > 0) {
      const nextErrors: Partial<Record<RecompRealityField, string>> = {};
      for (const issue of issues) {
        nextErrors[issue.field] ??= issue.message;
      }
      setErrors(nextErrors);
      setSubmittedWithErrors(true);
      setAssessment(null);
      const firstField = issues[0]?.field;
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>(`[data-field="${firstField}"]`)
          ?.focus();
      });
      return;
    }

    const nextAssessment = assessRecompReality(input);
    setErrors({});
    setSubmittedWithErrors(false);
    setAssessment(nextAssessment);
    trackToolFunnelStep(TOOL_ID, "result_shown", {
      input_mode: "measurements",
      result_type: nextAssessment.classification,
      confidence: nextAssessment.confidence,
      weeks: input.weeks,
      body_fat_included: includeBodyFat,
    });
    requestAnimationFrame(() => resultHeadingRef.current?.focus());
  }

  function reset() {
    setValues(INITIAL_VALUES);
    setStrengthTrend(null);
    setIncludeBodyFat(false);
    setAssessment(null);
    setErrors({});
    setSubmittedWithErrors(false);
    requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLInputElement>("[data-field=beginningWeight]")
        ?.focus();
    });
  }

  function errorFor(field: RecompRealityField): string | undefined {
    return errors[field];
  }

  return (
    <section className={styles.toolSection} id="checker" aria-labelledby="checker-title">
      <div className={styles.toolIntro}>
        <p className={styles.sectionKicker}>The evidence check</p>
        <h2 id="checker-title">Put the scale, tape, and training log on one page.</h2>
        <p>
          Use weekly averages and measurements taken the same way. The checker
          looks for a pattern across 4 to 12 weeks, then tells you where the
          evidence agrees and where it does not.
        </p>
      </div>

      <div className={styles.instrumentShell}>
        <div className={styles.instrumentBar}>
          <span><i aria-hidden /> Recomp reality checker</span>
          <span>Local calculation · nothing uploaded</span>
        </div>

        <form ref={formRef} className={styles.form} noValidate onSubmit={submit}>
          {submittedWithErrors && (
            <div className={styles.formAlert} role="alert">
              <strong>Check the highlighted fields.</strong>
              <span>The assessment needs all four core signals.</span>
            </div>
          )}

          <div className={styles.formHeader}>
            <div>
              <span className={styles.stepNumber}>01</span>
              <div>
                <h3>Define the comparison</h3>
                <p>Beginning means the first weekly average in the period.</p>
              </div>
            </div>
            <div className={styles.unitSwitch} aria-label="Measurement units">
              <button
                type="button"
                aria-pressed={unit === "us"}
                className={unit === "us" ? styles.activeUnit : undefined}
                onClick={() => switchUnit("us")}
              >
                U.S.
              </button>
              <button
                type="button"
                aria-pressed={unit === "metric"}
                className={unit === "metric" ? styles.activeUnit : undefined}
                onClick={() => switchUnit("metric")}
              >
                Metric
              </button>
            </div>
          </div>

          <label className={styles.periodField}>
            <span>Comparison period</span>
            <span className={styles.selectWrap}>
              <select
                value={values.weeks}
                data-field="weeks"
                aria-invalid={Boolean(errorFor("weeks"))}
                aria-describedby={errorFor("weeks") ? "weeks-error" : "weeks-hint"}
                onChange={(event) => updateValue("weeks", event.target.value)}
              >
                {Array.from({ length: 9 }, (_, index) => index + 4).map((weeks) => (
                  <option key={weeks} value={weeks}>{weeks} weeks</option>
                ))}
              </select>
            </span>
            <small id="weeks-hint">Long enough to reduce the influence of one unusual day.</small>
            {errorFor("weeks") && <small className={styles.fieldError} id="weeks-error">{errorFor("weeks")}</small>}
          </label>

          <div className={styles.measurementGrid}>
            <fieldset className={styles.measurementGroup}>
              <legend>
                <span>Weekly-average weight</span>
                <small>Average at least 3 comparable weigh-ins per week.</small>
              </legend>
              <div className={styles.pairedInputs}>
                <label>
                  <span>Beginning</span>
                  <span className={styles.inputWrap}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={unit === "us" ? 66 : 30}
                      max={unit === "us" ? 772 : 350}
                      step="0.1"
                      value={values.beginningWeight}
                      data-field="beginningWeight"
                      aria-invalid={Boolean(errorFor("beginningWeight"))}
                      aria-describedby={errorFor("beginningWeight") ? "beginning-weight-error" : undefined}
                      onChange={(event) => updateValue("beginningWeight", event.target.value)}
                    />
                    <span>{unitLabels.weight}</span>
                  </span>
                  {errorFor("beginningWeight") && <small className={styles.fieldError} id="beginning-weight-error">{errorFor("beginningWeight")}</small>}
                </label>
                <span className={styles.inputArrow} aria-hidden>→</span>
                <label>
                  <span>Current</span>
                  <span className={styles.inputWrap}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={unit === "us" ? 66 : 30}
                      max={unit === "us" ? 772 : 350}
                      step="0.1"
                      value={values.currentWeight}
                      data-field="currentWeight"
                      aria-invalid={Boolean(errorFor("currentWeight"))}
                      aria-describedby={errorFor("currentWeight") ? "current-weight-error" : undefined}
                      onChange={(event) => updateValue("currentWeight", event.target.value)}
                    />
                    <span>{unitLabels.weight}</span>
                  </span>
                  {errorFor("currentWeight") && <small className={styles.fieldError} id="current-weight-error">{errorFor("currentWeight")}</small>}
                </label>
              </div>
            </fieldset>

            <fieldset className={styles.measurementGroup}>
              <legend>
                <span>Waist measurement</span>
                <small>Same landmark, posture, tape tension, and time of day.</small>
              </legend>
              <div className={styles.pairedInputs}>
                <label>
                  <span>Beginning</span>
                  <span className={styles.inputWrap}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={unit === "us" ? 16 : 40}
                      max={unit === "us" ? 79 : 200}
                      step="0.1"
                      value={values.beginningWaist}
                      data-field="beginningWaist"
                      aria-invalid={Boolean(errorFor("beginningWaist"))}
                      aria-describedby={errorFor("beginningWaist") ? "beginning-waist-error" : undefined}
                      onChange={(event) => updateValue("beginningWaist", event.target.value)}
                    />
                    <span>{unitLabels.waist}</span>
                  </span>
                  {errorFor("beginningWaist") && <small className={styles.fieldError} id="beginning-waist-error">{errorFor("beginningWaist")}</small>}
                </label>
                <span className={styles.inputArrow} aria-hidden>→</span>
                <label>
                  <span>Current</span>
                  <span className={styles.inputWrap}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={unit === "us" ? 16 : 40}
                      max={unit === "us" ? 79 : 200}
                      step="0.1"
                      value={values.currentWaist}
                      data-field="currentWaist"
                      aria-invalid={Boolean(errorFor("currentWaist"))}
                      aria-describedby={errorFor("currentWaist") ? "current-waist-error" : undefined}
                      onChange={(event) => updateValue("currentWaist", event.target.value)}
                    />
                    <span>{unitLabels.waist}</span>
                  </span>
                  {errorFor("currentWaist") && <small className={styles.fieldError} id="current-waist-error">{errorFor("currentWaist")}</small>}
                </label>
              </div>
            </fieldset>
          </div>

          <fieldset
            className={styles.strengthGroup}
            aria-describedby={errorFor("strengthTrend") ? "strength-error" : undefined}
          >
            <legend>
              <span className={styles.stepNumber}>02</span>
              <span>
                <strong>How did comparable training performance change?</strong>
                <small>Think the same lifts, similar rep ranges, and similar effort.</small>
              </span>
            </legend>
            <div className={styles.strengthOptions}>
              {STRENGTH_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-field={option.value === "improved" ? "strengthTrend" : undefined}
                  aria-pressed={strengthTrend === option.value}
                  className={strengthTrend === option.value ? styles.activeStrength : undefined}
                  onClick={() => chooseStrength(option.value)}
                >
                  <span>{option.label}</span>
                  <small>{option.note}</small>
                </button>
              ))}
            </div>
            {errorFor("strengthTrend") && <p className={styles.fieldError} id="strength-error">{errorFor("strengthTrend")}</p>}
          </fieldset>

          <div className={styles.optionalSection}>
            <label className={styles.optionalToggle}>
              <input
                type="checkbox"
                checked={includeBodyFat}
                onChange={(event) => toggleBodyFat(event.target.checked)}
              />
              <span aria-hidden />
              <span>
                <strong>Add a consistent body-fat estimate</strong>
                <small>Optional. Use the same device or method under similar conditions.</small>
              </span>
            </label>

            {includeBodyFat && (
              <div className={styles.bodyFatInputs}>
                <label>
                  <span>Beginning</span>
                  <span className={styles.inputWrap}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="2"
                      max="70"
                      step="0.1"
                      value={values.beginningBodyFat}
                      data-field="beginningBodyFat"
                      aria-invalid={Boolean(errorFor("beginningBodyFat"))}
                      aria-describedby={errorFor("beginningBodyFat") ? "beginning-bf-error" : undefined}
                      onChange={(event) => updateValue("beginningBodyFat", event.target.value)}
                    />
                    <span>%</span>
                  </span>
                  {errorFor("beginningBodyFat") && <small className={styles.fieldError} id="beginning-bf-error">{errorFor("beginningBodyFat")}</small>}
                </label>
                <span className={styles.inputArrow} aria-hidden>→</span>
                <label>
                  <span>Current</span>
                  <span className={styles.inputWrap}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="2"
                      max="70"
                      step="0.1"
                      value={values.currentBodyFat}
                      data-field="currentBodyFat"
                      aria-invalid={Boolean(errorFor("currentBodyFat"))}
                      aria-describedby={errorFor("currentBodyFat") ? "current-bf-error" : undefined}
                      onChange={(event) => updateValue("currentBodyFat", event.target.value)}
                    />
                    <span>%</span>
                  </span>
                  {errorFor("currentBodyFat") && <small className={styles.fieldError} id="current-bf-error">{errorFor("currentBodyFat")}</small>}
                </label>
              </div>
            )}
          </div>

          <div className={styles.submitRow}>
            <button className={styles.submitButton} type="submit">
              Read my trend <span aria-hidden>→</span>
            </button>
            <p>
              Uses conservative noise guards. No login, upload, or health data
              leaves this page.
            </p>
          </div>
        </form>
      </div>

      {assessment && (
        <div className={styles.resultWrap} aria-live="polite">
          <article
            className={styles.result}
            data-classification={assessment.classification}
            aria-labelledby="recomp-result-heading"
          >
            <header className={styles.resultHeader}>
              <span className={styles.resultCode}>{classificationCode(assessment)}</span>
              <div>
                <p>Your read</p>
                <h2
                  id="recomp-result-heading"
                  ref={resultHeadingRef}
                  tabIndex={-1}
                >
                  {assessment.label}
                </h2>
              </div>
              <span className={styles.confidence} data-confidence={assessment.confidence}>
                {assessment.confidence} confidence
              </span>
            </header>

            <p className={styles.resultSummary}>{assessment.summary}</p>

            <div className={styles.signalGrid} aria-label="Entered trend signals">
              {assessment.signals.map((signal) => (
                <section key={signal.key} className={styles.signalCard} data-direction={signal.direction}>
                  <span className={styles.signalMark} aria-hidden>{signalMark(signal.direction)}</span>
                  <p>{signal.label}</p>
                  <strong>{signal.displayValue}</strong>
                  <small>{signal.note}</small>
                </section>
              ))}
            </div>

            <div className={styles.evidenceGrid}>
              <section className={styles.agreementPanel}>
                <p className={styles.panelLabel}>Signals that agree</p>
                <ul>
                  {assessment.agreeingSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </section>
              <section className={styles.conflictPanel}>
                <p className={styles.panelLabel}>Conflicts and limits</p>
                {assessment.conflictingSignals.length > 0 ? (
                  <ul>
                    {assessment.conflictingSignals.map((signal) => (
                      <li key={signal}>{signal}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No major contradiction appeared in the signals entered.</p>
                )}
              </section>
            </div>

            <div className={styles.nextRead}>
              <span className={styles.stepNumber}>03</span>
              <div>
                <p className={styles.panelLabel}>When to check again</p>
                <strong>{assessment.checkAgainInWeeks} more weeks</strong>
                <p>{assessment.checkAgain}</p>
              </div>
            </div>

            <div className={styles.resultFooter}>
              <div>
                <p className={styles.panelLabel}>Why confidence is {assessment.confidence}</p>
                <p>{assessment.confidenceRationale}</p>
              </div>
              <button type="button" onClick={reset}>Start a new check</button>
            </div>

            <p className={styles.disclaimer}>{assessment.disclaimer}</p>
          </article>

          <ToolConversionCard
            tool={TOOL_ID}
            campaign="web-recomp-checker"
            placement="result"
            headline="Track the pattern instead of guessing at it."
            body="Pair consistent photos with weight, body-fat context, and comparisons that show whether the trend repeats."
            desktopBody="Scan with your iPhone to pair consistent progress photos with the measurements behind this trend."
            experiment={buildToolResultCtaExperiment({ tool: TOOL_ID })}
          />
        </div>
      )}
    </section>
  );
}
