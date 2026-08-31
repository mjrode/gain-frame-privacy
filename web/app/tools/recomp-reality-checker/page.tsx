import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import RecompRealityCheckerClient from "./RecompRealityCheckerClient";
import styles from "./page.module.css";

const PAGE_PATH = "/tools/recomp-reality-checker/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;
const DESCRIPTION =
  "Check whether 4 to 12 weeks of weight, waist, strength, and optional body-fat trends look more like recomp, a cut, a surplus, or mixed evidence.";

export const metadata: Metadata = {
  title: {
    absolute: "Body Recomposition Calculator & Reality Checker | GainFrame",
  },
  description: DESCRIPTION,
  keywords: [
    "body recomposition calculator",
    "recomp calculator",
    "am I gaining muscle and losing fat",
    "cut or recomp",
    "body recomposition progress",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Body Recomposition Reality Checker",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Body Recomposition Reality Checker",
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};

const FAQS = [
  {
    question: "How can I tell if I am recomping?",
    answer:
      "A recomp-like pattern usually combines a stable or slightly rising weekly-average weight with a smaller waist and stable or improving training performance. A consistently measured body-fat estimate moving down can add support, but none of these signals proves exact muscle gain or fat loss by itself.",
  },
  {
    question: "Why does the checker use weekly-average weight?",
    answer:
      "A single weigh-in can move with hydration, sodium, carbohydrate intake, digestion, and timing. A weekly average reduces the influence of one unusual day and makes a 4 to 12 week direction easier to read.",
  },
  {
    question: "What counts as a meaningful change?",
    answer:
      "The checker treats weekly weight changes smaller than 0.15 percent, waist changes smaller than 1.25 percent, and body-fat changes smaller than 1 percentage point as neutral. These are conservative noise guards for this tool, not clinical or biological thresholds.",
  },
  {
    question: "Can this calculator prove how much muscle or fat I gained?",
    answer:
      "No. Weight, tape measurements, gym performance, and consumer body-fat estimates are indirect signals. The result classifies the pattern they form and deliberately avoids calculating exact pounds or kilograms of muscle or fat gained.",
  },
  {
    question: "What should I do when the evidence is mixed?",
    answer:
      "Keep the measurement setup the same and collect another two to four weeks. Use weekly weight averages, measure the same waist landmark, and compare similar lifts at similar effort. A repeated pattern is more useful than forcing an answer from conflicting readings.",
  },
  {
    question: "Is the recomp reality checker medical advice?",
    answer:
      "No. It is a private trend-organizing tool for general fitness education. It cannot diagnose health or body composition and is not a substitute for a clinician or registered dietitian.",
  },
] as const;

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Body Recomposition Reality Checker",
    url: PAGE_URL,
    applicationCategory: "HealthApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    featureList: [
      "4 to 12 week trend comparison",
      "Weight, waist, and strength signal analysis",
      "Optional consistent body-fat signal",
      "Recomp, cut, surplus, or mixed classification",
      "No account or upload required",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
] as const;

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function RecompRealityCheckerPage() {
  return (
    <div className={styles.page}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ))}

      <BlogNav />

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGrid} aria-hidden />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden /> Free trend checker · no signup
            </p>
            <h1>Are you actually recomping?</h1>
            <p className={styles.heroLead}>
              Put 4 to 12 weeks of weekly-average weight, waist, and training
              performance into one honest read. Add body fat only if you
              measured it the same way both times.
            </p>
            <a className={styles.heroCta} href="#checker">
              Check my trend <span aria-hidden>↓</span>
            </a>
            <div className={styles.heroProof}>
              <span>Runs in your browser</span>
              <span>No upload</span>
              <span>No exact tissue claims</span>
            </div>
          </div>

          <div className={styles.heroLedger} aria-label="Signals used by the checker">
            <div className={styles.ledgerTop}>
              <span>Trend evidence</span>
              <span>4 signals · 1 read</span>
            </div>
            <div className={styles.ledgerRow}>
              <span>01</span><strong>Weekly-average weight</strong><i>direction</i>
            </div>
            <div className={styles.ledgerRow}>
              <span>02</span><strong>Waist measurement</strong><i>change</i>
            </div>
            <div className={styles.ledgerRow}>
              <span>03</span><strong>Training performance</strong><i>context</i>
            </div>
            <div className={styles.ledgerRow}>
              <span>04</span><strong>Body fat</strong><i>optional</i>
            </div>
            <div className={styles.ledgerOutput}>
              <span>Output</span>
              <strong>Pattern, confidence, conflicts, next check</strong>
            </div>
          </div>
        </section>

        <RecompRealityCheckerClient />

        <section className={styles.methodSection} aria-labelledby="method-title">
          <div className={styles.methodHeading}>
            <p className={styles.sectionKicker}>How the read works</p>
            <h2 id="method-title">Direction first. Precision second.</h2>
            <p>
              The checker normalizes weight change by the number of weeks,
              filters out small movements, then looks for agreement across
              signals. It does not turn indirect measurements into fictional
              pounds of muscle or fat.
            </p>
          </div>
          <div className={styles.methodBands}>
            <article>
              <span>±0.15%</span>
              <div>
                <h3>Weekly weight guard</h3>
                <p>Smaller weekly movement is treated as stable.</p>
              </div>
            </article>
            <article>
              <span>±1.25%</span>
              <div>
                <h3>Waist guard</h3>
                <p>Small tape differences stay neutral instead of becoming a story.</p>
              </div>
            </article>
            <article>
              <span>±1 pt</span>
              <div>
                <h3>Body-fat guard</h3>
                <p>Optional estimates must clear a wider consistency buffer.</p>
              </div>
            </article>
          </div>
          <p className={styles.methodNote}>
            These are conservative product rules, not clinical thresholds.
            Hydration, digestion, tape placement, device choice, and training
            fatigue can all move individual readings.
          </p>
        </section>

        <section className={styles.patternSection} aria-labelledby="patterns-title">
          <div className={styles.patternIntro}>
            <p className={styles.sectionKicker}>Four possible reads</p>
            <h2 id="patterns-title">A label only appears when the signals earn it.</h2>
          </div>
          <div className={styles.patternTable}>
            <article>
              <span>R</span>
              <div>
                <h3>Likely recomp</h3>
                <p>Weight holds or rises while a leaner signal appears and performance does not decline.</p>
              </div>
            </article>
            <article>
              <span>C</span>
              <div>
                <h3>Likely cut</h3>
                <p>Weekly-average weight moves down without waist or body-fat evidence pointing up.</p>
              </div>
            </article>
            <article>
              <span>S</span>
              <div>
                <h3>Likely surplus</h3>
                <p>Weekly-average weight moves up with another surplus-like signal.</p>
              </div>
            </article>
            <article>
              <span>?</span>
              <div>
                <h3>Mixed evidence</h3>
                <p>The measurements disagree, stay too quiet, or lack enough confirmation.</p>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.faqSection} aria-labelledby="faq-title">
          <div className={styles.faqHeading}>
            <p className={styles.sectionKicker}>Questions, answered plainly</p>
            <h2 id="faq-title">Recomp reality checker FAQ</h2>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}<span aria-hidden>+</span></summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
