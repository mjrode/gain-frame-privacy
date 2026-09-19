"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import { track } from "@/lib/analytics";
import { trackToolFunnelStep } from "@/lib/tool-funnel";
import {
  createWinterArcPlan, defaultArcStart, formatArcDate, winterArcCalendar,
  winterArcChecklist, WINTER_ARC_GOALS, type WinterArcGoal, type WinterArcPlan,
} from "@/lib/winter-arc";
import styles from "./page.module.css";

const TOOL = "winter_arc_planner";

export default function WinterArcPlannerClient() {
  const [defaultStart, setDefaultStart] = useState("2026-10-01");
  const [goal, setGoal] = useState<WinterArcGoal>("consistency");
  const [plan, setPlan] = useState<WinterArcPlan | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const started = useRef(false);
  const viewed = useRef(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDefaultStart(defaultArcStart());
    if (viewed.current) return;
    viewed.current = true;
    trackToolFunnelStep(TOOL, "viewed");
  }, []);

  useEffect(() => {
    if (plan) resultHeading.current?.focus({ preventScroll: true });
  }, [plan]);

  function markStarted() {
    if (started.current) return;
    started.current = true;
    trackToolFunnelStep(TOOL, "started");
  }

  function clearPlan() {
    markStarted();
    setPlan(null);
    setError("");
    setStatus("");
  }

  function generate(event: FormEvent) {
    event.preventDefault();
    markStarted();
    try {
      const next = createWinterArcPlan(dateInput.current?.value ?? "", goal);
      setPlan(next);
      setStatus("");
      setError("");
      trackToolFunnelStep(TOOL, "result_shown", { check_in_count: next.checkIns.length });
    } catch (cause) {
      setPlan(null);
      setError(cause instanceof Error ? cause.message : "Choose a valid start date.");
      dateInput.current?.focus();
    }
  }

  function download(kind: "calendar" | "checklist") {
    if (!plan) return;
    try {
      const calendar = kind === "calendar";
      const text = calendar ? winterArcCalendar(plan) : winterArcChecklist(plan);
      const blob = new Blob([text], { type: calendar ? "text/calendar;charset=utf-8" : "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "my-winter-arc-" + plan.start + (calendar ? ".ics" : ".txt");
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      track("winter_arc_export_clicked", { format: kind });
      setStatus(calendar ?
        "Calendar file ready. Open or import the .ics file in your calendar app to add all 14 dates." :
        "Checklist file ready. Keep it in your files or paste it into your notes.");
    } catch {
      setStatus("The download could not start. Use Print / save PDF to keep your plan instead.");
    }
  }

  return (
    <>
      <section className={styles.workspace} id="planner" aria-label="Build your Winter Arc plan">
        <form className={styles.form} onSubmit={generate} noValidate>
          <span className={styles.overline}>Let’s put a date on it</span>
          <h2>Build your Winter Arc.</h2>
          <label className={styles.fieldLabel} htmlFor="arc-start">Start date</label>
          <input ref={dateInput} id="arc-start" type="date" min="2020-01-01" max="2099-12-31"
            defaultValue={defaultStart} aria-invalid={Boolean(error)} aria-describedby={error ? "arc-error" : "arc-date-hint"}
            onInput={clearPlan} onChange={clearPlan} />
          <p className={styles.hint} id="arc-date-hint">October 1 is popular. Any day works.</p>
          <fieldset className={styles.goals}>
            <legend>Your focus</legend>
            {Object.entries(WINTER_ARC_GOALS).map(([value, label]) => (
              <label key={value} className={goal === value ? styles.goalSelected : styles.goal}>
                <input type="radio" name="arc-goal" value={value} checked={goal === value}
                  onChange={() => { clearPlan(); setGoal(value as WinterArcGoal); }} />
                {label}
              </label>
            ))}
          </fieldset>
          <p className={styles.hint}>Your focus labels the plan. Bring your own training routine.</p>
          {error && <p id="arc-error" role="alert" className={styles.error}>{error}</p>}
          <button className={styles.primary} type="submit">Build my free plan <span aria-hidden="true">↗</span></button>
          <p className={styles.freeNote}>Free calendar, checklist, and printable plan.</p>
        </form>

        <div className={styles.plan} aria-label={plan ? "Your generated plan" : "Plan preview"}>
          {plan ? (
            <>
              <div className={styles.planTop}>
                <span className={styles.overline}>Your next chapter</span>
                <span className={styles.planTag}>90 days</span>
              </div>
              <h2 ref={resultHeading} tabIndex={-1} className={styles.planTitle}>
                {formatArcDate(plan.start)} <span aria-hidden="true">→</span> {formatArcDate(plan.finish)}
              </h2>
              <p className={styles.planMeta}>{formatArcDate(plan.start, true)} – {formatArcDate(plan.finish, true)} · {WINTER_ARC_GOALS[plan.goal]}</p>
              <div className={styles.planStats}><span><strong>14</strong> photo dates</span><span><strong>3</strong> bigger comparisons</span></div>
              <ol className={styles.checkIns}>
                {plan.checkIns.map((item) => (
                  <li key={item.date} className={item.review ? styles.review : undefined}>
                    <span className={styles.checkBox} aria-hidden="true" />
                    <span className={styles.day}>Day {item.day}</span>
                    <time dateTime={item.date}>{formatArcDate(item.date)}</time>
                    <span className={styles.checkInLabel}>{item.label}</span>
                  </li>
                ))}
              </ol>
              <p className={styles.scheduleNote}>Day 1 counts toward your 90 days. Your final comparison is five days after the last weekly photo.</p>
              <div className={styles.resultActions}>
                <button type="button" className={styles.calendarButton} onClick={() => download("calendar")}>Download calendar (.ics)</button>
                <button type="button" onClick={() => download("checklist")}>Save checklist (.txt)</button>
                <button type="button" onClick={() => { track("winter_arc_export_clicked", { format: "print" }); window.print(); }}>Print / save PDF</button>
              </div>
              <p role="status" className={styles.status}>{status}</p>
              <div className={styles.printSetup}>
                <h3>Your repeatable photo setup</h3>
                <p>Same light · Same camera height and distance · Same poses · Similar clothing and time of day</p>
                <p>Track your full Winter Arc in GainFrame.<br />gainframe.app/tools/winter-arc-planner/</p>
              </div>
            </>
          ) : (
            <div className={styles.preview}>
              <span className={styles.overline}>Your photo roadmap</span>
              <h3>Your arc,<br />all mapped out.</h3>
              <p>Start with a baseline. Check in each week. Look back at the whole season.</p>
              <div className={styles.previewMilestones}>
                <div><span>Day 01</span><strong>The starting line</strong><p>Your first photo.</p></div>
                <div><span>Day 29 + 57</span><strong>The bigger picture</strong><p>Compare with where you started.</p></div>
                <div><span>Day 90</span><strong>Your full Winter Arc</strong><p>Put the whole season side by side.</p></div>
              </div>
              <div className={styles.previewFooter}><span>Calendar</span><span>Checklist</span><span>Print / PDF</span></div>
            </div>
          )}
        </div>
      </section>
      <div className={styles.bridge}>
        <ToolConversionCard key={plan ? "result" : "intro"} tool={TOOL} campaign="web-winter-arc"
          placement={plan ? "winter_arc_result" : "winter_arc_intro"} sticky={false}
          mascotSrc="/blog/winter-arc-challenge/assets/winter-arc-mascot.webp"
          headline="Track your full Winter Arc in GainFrame."
          body="Keep every check-in photo together, line up your before-and-afters, and see how your physique changes across the full 90 days."
          desktopBody="Keep your whole Winter Arc together. Scan the code with your iPhone to save check-in photos and compare your progress in GainFrame."
          eyebrow={plan ? "You have the plan. Keep the progress." : "From your first photo to your full arc"}
          iosLabel="Track my Winter Arc"
          proof="iPhone app · Free to start · Progress photos, all together" />
      </div>
    </>
  );
}
