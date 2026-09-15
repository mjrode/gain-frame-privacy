import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { SITE } from "@/lib/site";
import BodyVisualizerClient from "./BodyVisualizerClient";
import workspaceStyles from "./VisualizerWorkspace.module.css";
import styles from "./page.module.css";

const PAGE_PATH = "/tools/body-visualizer/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;
const DESCRIPTION =
  "Compare current and goal body measurements with illustrative 2D silhouettes, or use height and weight for a BMI reference. Free, private, no signup.";

export const metadata: Metadata = {
  title: {
    absolute: "Body Visualizer by Height, Weight & Measurements | GainFrame",
  },
  description: DESCRIPTION,
  keywords: [
    "body visualizer",
    "body shape visualizer",
    "female body visualizer",
    "BMI visualizer",
    "body visualizer with measurements",
    "body measurements visualizer",
    "body proportions visualizer",
    "body shape comparison",
    "male body visualizer",
    "masculine body visualizer",
    "weight visualizer",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Body Visualizer — BMI & Measurement Comparison",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Body Visualizer — BMI & Measurement Comparison",
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};

const FAQS = [
  {
    question: "Is this a BMI body visualizer by height and weight?",
    answer:
      "Yes. Height + weight mode calculates adult BMI and selects from 30 illustrated size stages per sex, each with matching front and back views. The AI-generated images are general size references, not validated predictions of appearance or estimates of body fat.",
  },
  {
    question: "How accurate are the reference images?",
    answer:
      "The BMI calculation uses height and weight, but the pictures are AI-generated illustrations. The 30 stages cover a design range of BMI 16–45 and do not represent measured people or a medically validated BMI-to-appearance model. Pose, clothing, framing, and size progression are reviewed for consistency. Outside this range, the nearest image is shown and the calculated BMI remains unchanged.",
  },
  {
    question: "Can I compare current and goal body measurements?",
    answer:
      "Yes. Switch to Measurements and enter current and goal/reference sets for height, weight, shoulders, chest, waist, hips, inseam, and optional body-fat percentage. The tool draws two proportion-led 2D outlines and reports neutral ratio changes side by side.",
  },
  {
    question: "Does measurement mode predict my future body or show an ideal?",
    answer:
      "No. The outlines are deterministic illustrations of the numbers entered, not predictions, targets, medical assessments, or definitions of an ideal body. Anatomy, fat distribution, muscle, posture, and measurement technique all affect real appearance.",
  },
  {
    question: "Are my body measurements uploaded or saved?",
    answer:
      "No. The BMI calculation and measurement comparison run in your browser. The funnel analytics record that the mode was viewed, started, or produced a result, but do not include the measurements you entered.",
  },
  {
    question: "Is a BMI visualizer the same as a body fat visualizer?",
    answer:
      "No. BMI uses only height and weight. It cannot separate fat mass from muscle or bone, so it does not calculate body fat percentage. Use a body fat estimator when body composition—not weight relative to height—is the question.",
  },
  {
    question: "Why can people with the same BMI look different?",
    answer:
      "The same weight can be distributed differently across muscle, fat, and bone. Height proportions, frame size, age, and where a person carries fat also change visible body shape. That is why every physique render on this page is labeled illustrative.",
  },
  {
    question: "Can I use this as a female body visualizer?",
    answer:
      "Yes. Choose Female to see the standardized female body-shape reference for the BMI band calculated from your height and weight. The illustration is a broad reference, not a personalized prediction of your body.",
  },
  {
    question: "Can I use this as a male body visualizer?",
    answer:
      "Yes. Choose Male to see the standardized male body-shape reference for the BMI band calculated from your height and weight. Selecting male or female changes the illustration set, not the standard adult BMI formula.",
  },
  {
    question: "Can I enter height and weight in cm and kg?",
    answer:
      "Yes. Metric mode accepts centimeters and kilograms. In Height + weight mode, U.S. height uses feet and inches; in Measurements mode, U.S. lengths use total inches and weight uses pounds. Switching units converts the values already entered.",
  },
  {
    question: "Is this a 3D body visualizer?",
    answer:
      "No. Height + weight mode uses standardized front- and back-view reference images, while Measurements mode draws responsive 2D silhouettes. Neither mode is a rotatable 3D scan, custom avatar, or recreation of your exact body.",
  },
  {
    question: "Who should not use this adult BMI visualizer?",
    answer:
      "The categories on this page are for adults age 20 and older. Children and teens need age- and sex-specific BMI percentiles. Pregnancy, high muscularity, and some health conditions can also make adult BMI categories less useful; ask a qualified clinician for an individual assessment.",
  },
] as const;

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GainFrame Body Visualizer",
  alternateName: "BMI and Measurement Body Shape Visualizer",
  url: PAGE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript",
  description: DESCRIPTION,
  featureList: [
    "Adult BMI reference from height and weight",
    "30 illustrated size stages per sex with front and back views",
    "Interactive weight slider",
    "Current and goal measurement comparison",
    "Metric and U.S. units",
    "Illustrative 2D proportion silhouettes",
    "Browser-based calculation",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "GainFrame", url: SITE.url },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function BodyVisualizerPage() {
  return (
    <div className={styles.page}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <BlogNav />
      <main>
        <header className={workspaceStyles.hero}>
          <div className={workspaceStyles.heroHeading}>
            <h1>Body Visualizer</h1>
            <span>Free &amp; private</span>
          </div>
          <p>Set your height. Explore different weights.</p>
        </header>

        <div className={workspaceStyles.toolWrap}>
          <BodyVisualizerClient />
        </div>

        <section className={styles.editorialSection}>
          <div className={styles.sectionKicker}>
            How this body visualizer works
          </div>
          <div className={styles.editorialGrid}>
            <h2>Two ways to build a useful body-shape reference.</h2>
            <div className={styles.prose}>
              <p>
                Height + weight mode calculates adult BMI and selects a male or
                female reference from 30 illustrated size stages. Each has front
                and back views. Enter cm and kg or switch to feet, inches, and
                pounds, then use the weight slider beneath the image to explore
                the progression at the same height.
              </p>
              <p>
                Measurements mode accepts current and goal/reference sets for
                height, weight, shoulders, chest, waist, hips, inseam, and
                optional body fat. It maps those proportions into two
                deterministic 2D outlines and describes the entered changes
                without scoring either body.
              </p>
              <p>
                Both modes are broad visual references—not personalized body
                predictions, definitions of an ideal, or medical assessments.
                The values stay in your browser and are not attached to the
                analytics events used to understand the tool funnel.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.editorialSection}>
          <div className={styles.sectionKicker}>Read the result correctly</div>
          <div className={styles.editorialGrid}>
            <h2>A body shape visualizer, not a body prediction.</h2>
            <div className={styles.prose}>
              <p>
                BMI is weight divided by height squared. It is useful as a quick
                screening measure, but it does not measure body fat and cannot
                distinguish fat from muscle or bone. A muscular lifter and a
                sedentary person can share a BMI while having visibly different
                bodies.
              </p>
              <p>
                That limitation matters on a weight visualizer. The render above
                is selected from a standardized physique library to make broad
                bands easier to picture. Measurement mode responds to the tape
                values you enter, but its simplified outline still cannot know
                anatomy, muscle shape, fat distribution, or posture. Neither
                view should be treated as a forecast of how you do—or
                should—look.
              </p>
              <p className={styles.sourceNote}>
                The BMI formula and categories follow the{" "}
                <a
                  href="https://www.cdc.gov/bmi/faq/index.html"
                  target="_blank"
                  rel="noopener"
                >
                  CDC adult BMI guidance
                </a>
                . This tool is for adults 20 and older and is not a diagnosis.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.differenceSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionKicker}>
              Same number, different body
            </span>
            <h2>Why the visual can only be illustrative.</h2>
            <p>
              Three things BMI and simplified measurement outlines leave out can
              completely change the body in the mirror.
            </p>
          </div>
          <div className={styles.factorGrid}>
            <article>
              <span>01</span>
              <h3>Muscle &amp; bone</h3>
              <p>
                BMI counts every kilogram the same. It cannot tell a bigger
                muscle cross-section from additional fat mass.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Fat distribution</h3>
              <p>
                Two people can carry the same amount of fat in different places,
                changing waist, hip, chest, and limb shape.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Frame &amp; proportions</h3>
              <p>
                Limb length, shoulder width, pelvis shape, age, and posture all
                alter appearance without changing the BMI equation.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.compareSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionKicker}>Choose the right tool</span>
            <h2>
              BMI, body fat, and visual change answer different questions.
            </h2>
          </div>
          <div className={styles.toolCards}>
            <a href="/tools/body-fat-visualizer/">
              <span>Reference atlas</span>
              <strong>Body Fat Visualizer</strong>
              <p>
                Compare male and female body-fat reference images across ages
                and percentages.
              </p>
              <em>Explore the atlas →</em>
            </a>
            <a href="/tools/body-fat-from-photo/">
              <span>Photo analysis</span>
              <strong>AI Body Fat Estimator</strong>
              <p>
                Upload one clear photo for a directional body-fat estimate—no
                tape or calipers.
              </p>
              <em>Estimate from a photo →</em>
            </a>
            <a href="/tools/ffmi-calculator/">
              <span>Lean mass</span>
              <strong>FFMI Calculator</strong>
              <p>
                Add body-fat percentage to evaluate lean mass relative to your
                height.
              </p>
              <em>Calculate FFMI →</em>
            </a>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.faqIntro}>
            <span className={styles.sectionKicker}>Body visualizer FAQ</span>
            <h2>The useful questions, answered plainly.</h2>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq, index) => (
              <details key={faq.question} open={index === 0}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.appCta}>
          <div className={styles.appCtaCopy}>
            <span className={styles.sectionKicker}>Beyond BMI</span>
            <h2>Your body changes deserve more than one number.</h2>
            <p>
              GainFrame turns consistent progress photos into body-composition
              estimates, muscle scores, and comparisons you can actually track.
            </p>
          </div>
          <div className={styles.appCtaAction}>
            <PlatformDownloadLink
              campaign="web-body-visualizer"
              content="closing_app_store"
              source="body_visualizer"
            >
              Get GainFrame on the App Store
              <span aria-hidden="true">↗</span>
            </PlatformDownloadLink>
            <small>iPhone · Free to start</small>
          </div>
        </section>
      </main>
    </div>
  );
}
