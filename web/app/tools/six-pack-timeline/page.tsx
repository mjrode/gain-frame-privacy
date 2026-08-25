import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import SixPackTimelineClient from "./SixPackTimelineClient";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const PAGE_PATH = "/tools/six-pack-timeline/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;
const DESCRIPTION =
  "Upload a photo, choose one of four calorie deficits, and get a personalized estimate of how long it may take to reveal a six pack — plus a free AI preview of your leaner physique.";

export const metadata: Metadata = {
  title: {
    absolute: "How Long to Get a Six Pack? Free Photo Timeline Calculator | GainFrame",
  },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "How Long to Get a Six Pack? Photo Timeline Calculator",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Long to Get a Six Pack? Photo Timeline Calculator",
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Six Pack Timeline Calculator",
  url: PAGE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "All",
  description: DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "GainFrame", url: SITE.url },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to estimate your timeline to visible abs",
  description:
    "Use a current photo, current weight, and planned calorie deficit to estimate a realistic six-pack timeline.",
  totalTime: "PT2M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  supply: [{ "@type": "HowToSupply", name: "One clear, front-facing photo" }],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Add your current weight and reference",
      text: "Current weight turns the calorie deficit into an expected weekly rate. The reference sets the appropriate visible-ab threshold.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Choose a calorie deficit",
      text: "Pick a 250, 400, 500, or 750 calorie daily deficit.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Upload one clear photo",
      text: "AI estimates a body-fat range, calculates the timeline, and creates an illustrative leaner preview.",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does it take to get a six pack?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your current body fat, body weight, and calorie deficit. Someone already near the visibility threshold may be weeks away; someone farther from it may need many months. This calculator combines all three inputs and returns a range rather than a promise.",
      },
    },
    {
      "@type": "Question",
      name: "What calorie deficit is best for revealing abs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A 400 to 500 calorie daily deficit is a practical starting point for many adults because it projects roughly 0.8 to 1 pound of weekly weight loss before normal adaptation. Smaller bodies may need less, and a pace above 1 percent of body weight per week deserves extra caution.",
      },
    },
    {
      "@type": "Question",
      name: "At what body fat percentage does a six pack show?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Defined abs often appear around 12 percent body fat for men and 19 percent for women, but genetics, fat distribution, and ab development can move the threshold several points. The calculator uses these as planning anchors, not biological guarantees.",
      },
    },
    {
      "@type": "Question",
      name: "Is the future-body image a prediction?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. It is an AI illustration of a leaner version of the uploaded photo, not a guaranteed outcome. Your actual appearance depends on fat distribution, muscle retention, training, genetics, and adherence.",
      },
    },
    {
      "@type": "Question",
      name: "Is my photo stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The photo is sent to the AI services for the analysis and render calls only. GainFrame does not store it or use it to train models.",
      },
    },
  ],
};

export default function SixPackTimelinePage() {
  return (
    <div className={`${geist.className} ${geistMono.className}`}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/ai-body-transformation.css" />
      <link rel="stylesheet" href="/styles/six-pack-timeline.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      {[webAppSchema, howToSchema, faqSchema].map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="btf-body">
        <BlogNav />

        <section className="btf-hero">
          <div className="btf-hero-inner">
            <span className="btf-eyebrow">
              <span className="dot" aria-hidden />
              AI six-pack timeline · Free preview
            </span>
            <h1>
              How long will it take to{" "}
              <span className="accent">get a six pack?</span>
            </h1>
            <p className="btf-hero-sub">
              Upload one photo, choose your calorie deficit, and get a realistic
              visible-abs window—plus an AI preview of the leaner you.
            </p>
            <div className="btf-hero-meta">
              <span>Free · No signup</span>
              <span className="sep" aria-hidden />
              <span>4 deficit presets</span>
              <span className="sep" aria-hidden />
              <span>Photo never stored</span>
            </div>
            <img
              className="btf-hero-mascot"
              src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp"
              alt=""
              aria-hidden
              width={130}
              height={130}
            />
          </div>
        </section>

        <main className="btf-main" id="six-pack-calculator">
          <SixPackTimelineClient />
        </main>

        <section className="btf-section">
          <div className="btf-section-inner">
            <p className="btf-section-eyebrow">Process</p>
            <h2>How the timeline works.</h2>
            <div className="btf-steps">
              <div className="btf-step">
                <p className="btf-step-num">Step 01</p>
                <h3>Photo → body-fat range</h3>
                <p>
                  AI reads the visible cues and returns a range. Lighting,
                  clothing, and fat distribution make a decimal dishonest.
                </p>
              </div>
              <div className="btf-step">
                <p className="btf-step-num">Step 02</p>
                <h3>Deficit → weeks</h3>
                <p>
                  Weight turns the selected calorie deficit into a weekly pace,
                  then the estimated fat-loss range becomes a date window.
                </p>
              </div>
              <div className="btf-step">
                <p className="btf-step-num">Step 03</p>
                <h3>Photo → leaner preview</h3>
                <p>
                  The render preserves your identity and setting while slimming
                  the physique. It is motivation, not a medical prediction.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="btf-section">
          <div className="btf-section-inner">
            <p className="btf-section-eyebrow">Honesty &amp; Methodology</p>
            <h2>A six pack is not one universal body-fat number.</h2>
            <p>
              The calculator anchors defined abs around 12% for men and 19% for
              women. Some people show earlier. Others need to get leaner. Ab
              thickness, genetics, skin, posture, and where you store fat all
              move the finish line, so the answer is a range and the rendered
              photo is illustrative.
            </p>
            <p>
              If the selected deficit projects more than 1% of your bodyweight
              per week, the result flags it. Faster is not automatically
              better—especially if keeping muscle is part of the goal.
            </p>
          </div>
        </section>

        <section className="btf-section">
          <div className="btf-section-inner">
            <p className="btf-section-eyebrow">Related tools</p>
            <h2>Measure the starting line from three angles.</h2>
            <a className="btf-crosslink-card" href="/tools/ab-analyzer/">
              <div className="btf-crosslink-text">
                <strong>AI Ab Analyzer</strong>
                <span>Score upper abs, lower abs, and obliques from one photo.</span>
              </div>
              <span className="btf-crosslink-arrow">Open →</span>
            </a>
            <a className="btf-crosslink-card" href="/tools/calorie-deficit-calculator/">
              <div className="btf-crosslink-text">
                <strong>Calorie Deficit Calculator</strong>
                <span>Build a full calorie target and goal-weight timeline.</span>
              </div>
              <span className="btf-crosslink-arrow">Open →</span>
            </a>
            <a className="btf-crosslink-card" href="/tools/body-fat-from-photo/">
              <div className="btf-crosslink-text">
                <strong>AI Body Fat Estimator</strong>
                <span>Get the whole-body number behind the abs timeline.</span>
              </div>
              <span className="btf-crosslink-arrow">Open →</span>
            </a>
          </div>
        </section>

        <section className="btf-section">
          <div className="btf-section-inner">
            <p className="btf-section-eyebrow">FAQ</p>
            <h2>The questions behind the countdown.</h2>
            <div className="spt-faq-list">
              {faqSchema.mainEntity.map((item) => (
                <details key={item.name}>
                  <summary>{item.name}</summary>
                  <p>{item.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
