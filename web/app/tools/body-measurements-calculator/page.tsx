import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import BodyMeasurementsClient from "./BodyMeasurementsClient";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--bmc-display",
  display: "swap",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--bmc-body",
  display: "swap",
});

const PAGE_PATH = "/tools/body-measurements-calculator/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;

export const metadata: Metadata = {
  title: {
    absolute: "AI Body Proportion & Measurements Calculator | GainFrame",
  },
  description:
    "Upload a photo for an AI body proportion estimate, choose shoulders, chest, waist, arms or legs, adjust sliders and generate a personalized physique preview.",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "AI Body Proportion Calculator & Photo Preview",
    description:
      "Upload one photo, estimate your proportions, choose areas to change and generate a personalized AI preview.",
    type: "website",
    url: PAGE_URL,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Body Proportion Calculator & Photo Preview",
    description:
      "Upload a photo, get a proportion estimate, move regional sliders and generate your preview.",
    images: [SITE.ogImage],
  },
};

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Body Proportion & Measurements Calculator",
    url: PAGE_URL,
    applicationCategory: "HealthApplication",
    operatingSystem: "All",
    description:
      "Free AI body proportion estimator that analyzes one photo, suggests visible areas to improve and generates a regional physique preview from adjustable sliders.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does the AI body proportion calculator estimate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It estimates visible body balance from one photo, including overall proportions, strongest visible area and the area most likely to improve the physique. It does not claim exact tape measurements from pixels.",
        },
      },
      {
        "@type": "Question",
        name: "Can I choose which body areas change?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. After the estimate, select shoulders, chest, waist, arms or legs and use a slider to make each selected area directionally smaller or larger in the generated preview.",
        },
      },
      {
        "@type": "Question",
        name: "Can AI show exact target body measurements from a photo?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The optional AI preview applies directional regional percentage changes to the photo. It is a motivational visualization, not proof that the rendered body has an exact tape circumference.",
        },
      },
      {
        "@type": "Question",
        name: "Are my measurements or photo stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The photo is sent to the AI service for the estimate and preview calls only. GainFrame does not store it or use it to train models.",
        },
      },
    ],
  },
];

export default function BodyMeasurementsCalculatorPage() {
  return (
    <div className={`${display.variable} ${body.variable} bmc-page`}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/ai-body-transformation.css" />
      <link rel="stylesheet" href="/styles/body-measurements-calculator.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BlogNav />

      <main>
        <section className="bmc-hero">
          <div className="bmc-hero__copy">
            <span className="bmc-hero__eyebrow">AI proportion estimator + physique preview</span>
            <h1>
              Upload a photo.
              <span>Build your target.</span>
            </h1>
            <p>
              GainFrame estimates your visible proportions, shows your biggest
              opportunity, then lets you choose exactly which areas to make
              smaller or larger in a new AI image.
            </p>
            <a className="bmc-hero__cta" href="#proportion-tool">
              Upload my photo <span aria-hidden>→</span>
            </a>
            <div className="bmc-hero__proof">
              <span>One upload</span>
              <span>No signup</span>
              <span>Photo never stored</span>
            </div>
          </div>
          <div className="bmc-hero__example">
            <img
              src="/assets/misc-images/product-hunt/4-future-physique.webp"
              alt="GainFrame AI physique preview showing a real before and after transformation"
            />
            <span className="bmc-example-badge is-before">Photo</span>
            <span className="bmc-example-badge is-after">AI preview</span>
            <div className="bmc-example-caption">
              <strong>This is what the tool does.</strong>
              <span>Your photo in. Your selected changes out.</span>
            </div>
          </div>
        </section>

        <BodyMeasurementsClient />

        <section className="bmc-method">
          <div>
            <span className="bmc-kicker">Simple by design</span>
            <h2>One photo. Three decisions.</h2>
          </div>
          <div className="bmc-method__grid">
            <article>
              <span>01</span>
              <h3>Use a clear photo</h3>
              <p>
                Front-facing, even lighting, with your torso and legs visible.
                Fitted clothing or normal progress-photo attire reads best.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Pick only what matters</h3>
              <p>
                Select shoulders, chest, waist, arms or legs. The preview leaves
                every unselected region as close to the source photo as possible.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Treat it as direction</h3>
              <p>
                The estimate and generated image are motivational guides, not
                exact measurements, medical advice or a promise of results.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
