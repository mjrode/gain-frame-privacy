import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import BFEstimatorClient from "./BFEstimatorClient";

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

const PAGE_PATH = "/tools/body-fat-from-photo/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;

export const metadata: Metadata = {
  title: {
    absolute: "Free AI Body Fat Estimator from a Photo | GainFrame",
  },
  description:
    "Free AI body fat estimator and calculator that reads a single photo — no measurements, no signup. Up to 3 free scans (one per day), instant result. Try GainFrame on iOS for precision multi-photo tracking.",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Free AI Body Fat Estimator — From a Photo",
    description:
      "Upload one photo, get an AI body fat estimate in seconds. No tape, no calipers.",
    type: "website",
    url: PAGE_URL,
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Body Fat Estimator — From a Photo",
    description:
      "Upload one photo, get an AI body fat estimate in seconds. No tape, no calipers.",
    images: [SITE.ogImage],
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Body Fat Estimator from a Photo",
  url: PAGE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "All",
  description:
    "Free AI tool that estimates body fat percentage from a single photo. Up to 3 free estimates per user, one per day.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "GainFrame", url: SITE.url },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to estimate body fat percentage from a photo with AI",
  description:
    "Three-step process for getting an AI body fat estimate from a single smartphone photo using GainFrame's free web tool.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  supply: [{ "@type": "HowToSupply", name: "One clear front-facing photo" }],
  tool: [{ "@type": "HowToTool", name: "Smartphone camera or webcam" }],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload one clear photo",
      text: "Front-facing, with your torso and limbs visible. Tight clothing or shirtless gives the AI more visual information to read.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Pick a reference",
      text: "Body fat ranges differ meaningfully between male and female physiques. Selecting yours improves the estimate.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Get a number plus a confidence read",
      text: "An estimated percentage with a low, medium, or high confidence label. Use it as a rough starting point, not a measurement of small weekly changes.",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How accurate is a body fat estimate from one photo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Treat one photo as a rough estimate, not a measured body fat percentage. Lighting, pose, clothing, and body shape affect the result. GainFrame has published an internal DEXA comparison, but that study does not establish a guaranteed error range for this free browser tool. A confidence label is not a statistical confidence interval.",
      },
    },
    {
      "@type": "Question",
      name: "Is my photo stored or used to train AI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Your photo is sent to Google's AI service for the analysis call only. It's not stored on GainFrame's servers and not used to train AI models. The image is processed and discarded.",
      },
    },
    {
      "@type": "Question",
      name: "Why is the tool limited to 3 free scans?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The web tool offers 3 free estimates per user, with a maximum of one per day, to keep AI compute costs sustainable. For ongoing check-ins, the GainFrame iOS app adds a photo timeline, comparisons, and multi-angle body fat estimates. App features and usage limits depend on your plan.",
      },
    },
    {
      "@type": "Question",
      name: "What kind of photo works best?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use a clear front-facing photo with even lighting, a relaxed pose, and your torso, arms, and upper legs visible. Fitted workout clothing makes your outline easier to assess. Avoid filters, flexing, and wide-angle distortion. Face-only photos and loose clothing do not provide enough information for a useful estimate.",
      },
    },
    {
      "@type": "Question",
      name: "Does this work for women?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool offers male and female reference options because visible fat distribution differs. Choose the appropriate reference before uploading. The result is still approximate: a photo cannot directly measure body composition, and individual anatomy can differ from the reference patterns.",
      },
    },
    {
      "@type": "Question",
      name: "Is this an AI body fat calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. This AI body fat calculator estimates a percentage from one photo instead of tape-measure inputs. The U.S. Navy method uses circumference measurements and a formula. Both are estimates with different sources of error; neither measures fat directly. Our free Navy calculator is another option if you prefer using measurements.",
      },
    },
  ],
};

export default function BodyFatFromPhotoPage() {
  return (
    <div className={`${geist.className} ${geistMono.className}`}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/body-fat-from-photo.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bff-body">
        <BlogNav />

        <section className="bff-hero">
          <div className="bff-hero-inner">
            <span className="bff-eyebrow">
              <span className="dot" aria-hidden />
              AI body fat scan · Free · 3 scans
            </span>
            <h1>
              Free AI Body Fat Estimator from a Photo
            </h1>
            <p className="bff-hero-sub">
              Upload one gym pic. AI reads the visual cues and returns a
              body fat estimate in seconds. No tape, no calipers, no signup.
            </p>
            <div className="bff-hero-meta">
              <span>Free · No signup</span>
              <span className="sep" aria-hidden />
              <span>±4–5% margin</span>
              <span className="sep" aria-hidden />
              <span>~8s scan</span>
            </div>
            {/* Mascot peeks in from the right */}
            <img
              className="bff-hero-mascot"
              src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp"
              alt=""
              aria-hidden
              width={130}
              height={130}
            />
          </div>
        </section>

        <main className="bff-main">
          <BFEstimatorClient />
        </main>

        <section className="bff-section">
          <div className="bff-section-inner">
            <p className="bff-section-eyebrow">Process</p>
            <h2>How the scan works.</h2>
            <div className="bff-steps">
              <div className="bff-step">
                <p className="bff-step-num">Step 01</p>
                <h3>Upload one clear photo</h3>
                <p>
                  Front-facing, torso and limbs visible. Tight clothing or
                  shirtless gives the AI more visual information to read.
                </p>
              </div>
              <div className="bff-step">
                <p className="bff-step-num">Step 02</p>
                <h3>Pick a reference</h3>
                <p>
                  Body fat ranges differ meaningfully between male and female
                  physiques. Selecting yours improves the estimate.
                </p>
              </div>
              <div className="bff-step">
                <p className="bff-step-num">Step 03</p>
                <h3>Get a number plus a confidence read</h3>
                <p>
                  An estimated percentage with a low, medium, or high
                  confidence label. Use it as a rough starting point, not a
                  measurement of small weekly changes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bff-section">
          <div className="bff-section-inner">
            <p className="bff-section-eyebrow">Accuracy &amp; Methodology</p>
            <h2>How accurate is body fat from a photo?</h2>
            <p>
              A photo can provide a rough starting estimate, but lighting,
              posture, clothing, and individual fat distribution affect the
              result. This tool does not directly measure fat or diagnose health
              conditions. Its low, medium, or high confidence label describes
              the model&apos;s assessment of the photo, not a statistical error range.
            </p>
            <p>
              In our <a href="/blog/ai-body-fat-estimator-accuracy-dexa-test/">internal
              DEXA comparison</a>, we tested 36 front-view photo states with DEXA
              labels removed and repeated each estimate three times. The tested
              configuration missed the DEXA value by an average of 3.77 percentage
              points; 29 of 36 averaged results were within 5 points. These were
              female photo states from about 27 individuals, not 36 independent
              participants or an independent clinical trial.
            </p>
            <p>
              Those results describe the configuration in that study. The free
              browser tool uses a separate estimation workflow, so the study
              does not establish its error range. Read the full method and
              limitations before comparing the numbers. For ongoing tracking,
              the GainFrame iOS app supports multi-angle check-ins and photo
              comparisons; keep your setup consistent and look for changes
              across several check-ins.
            </p>
            <p>
              Prefer circumference measurements? Try our <a href="/tools/body-fat-estimator/">U.S.
              Navy body fat calculator</a>. For a comparison of measurement
              methods and their limitations, see our <a href="/blog/dexa-scan-alternative/">DEXA
              alternatives guide</a>.
            </p>
          </div>
        </section>

        <section className="bff-section" aria-labelledby="bff-faq-heading">
          <div className="bff-section-inner">
            <p className="bff-section-eyebrow">Common questions</p>
            <h2 id="bff-faq-heading">Before you estimate body fat from a photo</h2>
            <div className="bff-faq">
              {faqSchema.mainEntity.map((question) => (
                <details key={question.name}>
                  <summary>{question.name}</summary>
                  <p>{question.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Server-rendered spectrum strip — the estimator result view is
            client-side, so crawlers never see the personalized version.
            This static section guarantees the visualizer links are visible
            on every crawl. */}
        <section className="bff-section">
          <div className="bff-section-inner">
            <p className="bff-section-eyebrow">Browse the spectrum</p>
            <h2>What does each body fat percentage look like?</h2>
            <p>
              These are standardized reference physiques from our{" "}
              <a href="/tools/body-fat-visualizer/">body fat visualizer</a> —
              the same build, pose, and lighting at every level, so the only
              thing changing between images is body fat. Tap any figure to
              explore every percentage from 8% to 40%, across ages 20s to 60s.
            </p>
            <div className="bff-spectrum-strip bff-spectrum-strip--static">
              {[12, 18, 25, 30].map((bf) => (
                <a
                  key={bf}
                  className="bff-spectrum-fig"
                  href={`/tools/body-fat-visualizer/?g=male&bf=${bf}&age=30s`}
                  title={`See ${bf}% body fat in the visualizer`}
                >
                  <span className="frame">
                    <img
                      src={`/tools/body-fat-visualizer/assets/physiques/male-age30s-bf${bf}-front.webp`}
                      alt={`${bf} percent body fat on a man — reference physique`}
                      loading="lazy"
                      width={220}
                      height={295}
                    />
                  </span>
                  <span className="delta">{bf}%</span>
                </a>
              ))}
            </div>
            <a className="bff-spectrum-cta" href="/tools/body-fat-visualizer/">
              Open the Body Fat Visualizer →
              <small>Every level, male &amp; female, ages 20s–60s</small>
            </a>
          </div>
        </section>

        <section className="bff-section">
          <div className="bff-section-inner">
            <p className="bff-section-eyebrow">Related tools</p>
            <h2>More ways to measure.</h2>
            <a className="bff-crosslink-card" href="/tools/physique-rater/">
              <div className="bff-crosslink-text">
                <strong>AI Physique Rater</strong>
                <span>
                  Body fat is one input — get the full 1–100 physique score
                  from the same photo, broken into body fat, muscle,
                  proportions, and goal fit.
                </span>
              </div>
              <span className="bff-crosslink-arrow">Open →</span>
            </a>
            <a
              className="bff-crosslink-card"
              href="/tools/ai-body-transformation/"
            >
              <div className="bff-crosslink-text">
                <strong>AI Body Transformation</strong>
                <span>
                  You know where you are — now see where a year of consistent
                  training takes you. AI renders your future body on your own
                  photo.
                </span>
              </div>
              <span className="bff-crosslink-arrow">Open →</span>
            </a>
            <a className="bff-crosslink-card" href="/tools/body-fat-estimator/">
              <div className="bff-crosslink-text">
                <strong>U.S. Navy tape-measure calculator</strong>
                <span>
                  Estimate body fat from circumference measurements using
                  a formula. No photo or AI required.
                </span>
              </div>
              <span className="bff-crosslink-arrow">Open →</span>
            </a>
            <a className="bff-crosslink-card" href="/tools/body-fat-visualizer/">
              <div className="bff-crosslink-text">
                <strong>Body Fat Visualizer</strong>
                <span>
                  Drag two sliders to see photorealistic references for every
                  body fat percentage (men 8–33%, women 18–42%).
                </span>
              </div>
              <span className="bff-crosslink-arrow">Open →</span>
            </a>
            <a className="bff-crosslink-card" href="/tools/ffmi-calculator/">
              <div className="bff-crosslink-text">
                <strong>FFMI Calculator</strong>
                <span>
                  Once you have your body fat %, plug it in here for a
                  fat-free mass index — the natty-limit metric.
                </span>
              </div>
              <span className="bff-crosslink-arrow">Open →</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
