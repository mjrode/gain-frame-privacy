import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import BFEstimatorClient from "./BFEstimatorClient";

const PAGE_PATH = "/tools/body-fat-from-photo/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;

export const metadata: Metadata = {
  title: {
    absolute: "Free AI Body Fat Estimator from a Photo | GainFrame",
  },
  description:
    "Free body fat estimator that analyzes a single photo with AI. No measurements, no signup. One estimate per day, instant result. Try GainFrame on iOS for precision multi-photo tracking.",
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
    "Free AI tool that estimates body fat percentage from a single photo. One estimate per user per day.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "GainFrame", url: SITE.url },
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
        text: "A single-photo estimate typically carries ±4–5% error compared to DEXA. It's good enough for a directional read on lean / average / overweight, but not for tracking small week-over-week changes. The GainFrame iOS app uses multiple angles per check-in to cut that error roughly in half.",
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
      name: "Why am I limited to one estimate per day?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The web tool is free and rate-limited to one estimate per day per user to keep AI compute costs sustainable. The GainFrame iOS app removes the limit and adds tracking, scoring, and comparison features.",
      },
    },
    {
      "@type": "Question",
      name: "What kind of photo works best?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A clear, well-lit photo where your torso, arms, and at least the upper part of your legs are visible. Tight or revealing clothing helps. Baggy clothing, side angles, and face-only shots produce poor estimates.",
      },
    },
    {
      "@type": "Question",
      name: "Does this work for women?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The visual reference ranges shift between male and female bodies, so selecting your sex before submission improves accuracy.",
      },
    },
  ],
};

export default function BodyFatFromPhotoPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap"
      />
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/body-fat-from-photo.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
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
              AI body fat scan · Free · 1/day
            </span>
            <h1>
              Find out your body fat from one photo.
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
              src="/assets/gainframe-guy/poses/gainframe-guy-wave.png"
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
                  A single percentage with confidence band. Single-photo
                  carries ±4–5% error — directional, not week-to-week.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bff-section">
          <div className="bff-section-inner">
            <p className="bff-section-eyebrow">Other methods</p>
            <h2>Want a more precise number?</h2>
            <a className="bff-crosslink-card" href="/tools/body-fat-estimator/">
              <div className="bff-crosslink-text">
                <strong>U.S. Navy tape-measure calculator</strong>
                <span>
                  Slightly more effort — neck, waist, hip — but tighter ±3%
                  accuracy and zero AI involved.
                </span>
              </div>
              <span className="bff-crosslink-arrow">Open →</span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
