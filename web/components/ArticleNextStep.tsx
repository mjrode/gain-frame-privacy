import styles from "./ArticleNextStep.module.css";

const NEXT_STEPS = {
  "average-waist-size-men": {
    intent: "body-fat",
    placement: "after_answer",
    title: "Add context to your waist measurement.",
    copy: "Your tape records circumference. A photo-based body-fat estimate adds another reference point beside it.",
    tool: "/tools/body-fat-from-photo/",
    toolLabel: "Try the body-fat photo tool",
    note: "Free browser tool · AI estimate, not a clinical measurement",
    guide: "/blog/best-ai-body-fat-apps/",
    guideLabel: "Compare apps for tracking body fat over time",
  },
  "average-bicep-size": {
    intent: "progress",
    placement: "after_chart",
    title: "Put your arm measurement beside a photo.",
    copy: "Compare two photos with a similar pose and lighting. A visual record can add context to your tape log without treating every change as new muscle.",
    tool: "/tools/progress-photo-compare/",
    toolLabel: "Compare my progress photos",
    note: "Free browser tool · Photos stay in your browser · No signup",
    guide: "/blog/best-free-progress-photo-apps/",
    guideLabel: "Compare apps for keeping a progress-photo log",
  },
  "average-thigh-size": {
    intent: "progress",
    placement: "after_chart",
    title: "Track your own legs over time.",
    copy: "Keep a photo beside your thigh measurement. Line up two dates with a similar stance and lighting to see the visible change alongside the number.",
    tool: "/tools/progress-photo-compare/",
    toolLabel: "Compare my progress photos",
    note: "Free browser tool · Photos stay in your browser · No signup",
    guide: "/blog/best-free-progress-photo-apps/",
    guideLabel: "Compare apps for keeping a progress-photo log",
  },
  "ideal-body-measurements-women": {
    intent: "proportions",
    placement: "after_chart",
    title: "Explore your proportions on your own terms.",
    copy: "Use a photo to explore the visual balance of your shoulders, waist and legs. The tool estimates proportions; it does not measure inches or define an ideal body.",
    tool: "/tools/body-measurements-calculator/",
    toolLabel: "Explore my proportions",
    note: "Free browser tool · Photo-based estimates, not tape measurements",
    guide: "/blog/best-body-scanning-measurement-apps/",
    guideLabel: "Compare measurement logs, scanners and photo apps",
  },
} as const;

type MeasurementArticle = keyof typeof NEXT_STEPS;

/** An editorial next step; existing app CTA experiment assignments stay intact. */
export default function ArticleNextStep({ slug }: { slug: MeasurementArticle }) {
  const step = NEXT_STEPS[slug];
  const tracking = {
    "data-article-next-step": "measurement_v1",
    "data-article-slug": slug,
    "data-journey-intent": step.intent,
    "data-placement": step.placement,
  };

  return (
    <aside
      id="measurement-next-step"
      className={styles.panel}
      aria-labelledby="measurement-next-step-title"
      data-article-next-step-panel="measurement_v1"
    >
      <p className={styles.label}>Put the reference to use</p>
      <h3 id="measurement-next-step-title" className={styles.title}>{step.title}</h3>
      <p className={styles.copy}>{step.copy}</p>
      <a className={styles.button} href={step.tool} {...tracking} data-destination-kind="tool">
        {step.toolLabel} <span aria-hidden="true">→</span>
      </a>
      <p className={styles.note}>{step.note}</p>
      <a className={styles.guide} href={step.guide} {...tracking} data-destination-kind="guide">
        {step.guideLabel} <span aria-hidden="true">→</span>
      </a>
    </aside>
  );
}
