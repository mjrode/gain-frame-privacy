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
    absolute: "Body Measurements & Proportion Calculator + AI Preview | GainFrame",
  },
  description:
    "Enter chest, waist, shoulders, arms, thighs, wrist and height. Compare five body proportions, set target measurements with sliders, then preview the changes on your photo with AI.",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Body Measurements & Proportion Calculator",
    description:
      "Map seven measurements, compare your ratios, build realistic targets and preview the regional changes on your own photo.",
    type: "website",
    url: PAGE_URL,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Body Measurements & Proportion Calculator",
    description:
      "Seven measurements in. Ratios, target sliders and an optional AI photo preview out.",
    images: [SITE.ogImage],
  },
};

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Body Measurements & Proportion Calculator",
    url: PAGE_URL,
    applicationCategory: "HealthApplication",
    operatingSystem: "All",
    description:
      "Free body measurement calculator covering height, wrist, shoulders, chest, waist, arms and thighs, with ratio benchmarks, target sliders and an optional AI photo preview.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What body measurements does this calculator compare?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It uses height, wrist, shoulder, chest, waist, upper-arm and thigh measurements to calculate shoulder-to-waist, waist-to-height, chest-to-waist, arm-to-wrist and thigh-to-wrist ratios.",
        },
      },
      {
        "@type": "Question",
        name: "Are the proportion targets medical advice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Only waist-to-height is presented as a general health screen. The other bands are broad aesthetic physique references, not diagnoses, requirements or universal ideals.",
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
          text: "The measurement calculator runs in the browser and does not save the numbers. If you request an AI preview, the photo is sent for that render call only and is not stored by GainFrame or used to train models.",
        },
      },
    ],
  },
];

export default function BodyMeasurementsCalculatorPage() {
  return (
    <div className={`${display.variable} ${body.variable} bmc-page`}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/body-measurements-calculator.css" />
      <link rel="stylesheet" href="/styles/ai-body-transformation.css" />
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
            <span className="bmc-hero__eyebrow">Free tool · No signup · Private by default</span>
            <h1>
              Your body,
              <span>mapped in ratios.</span>
            </h1>
            <p>
              Enter seven tape measurements. See what is already balanced,
              move the areas you want to improve, then preview that target on
              your own photo.
            </p>
            <div className="bmc-hero__proof">
              <span><strong>7</strong> measurements</span>
              <span><strong>5</strong> useful ratios</span>
              <span><strong>1</strong> optional AI preview</span>
            </div>
          </div>
          <div className="bmc-hero__map" aria-hidden="true">
            <div className="bmc-map__grid" />
            <span className="bmc-map__line is-shoulder"><i /> shoulders</span>
            <span className="bmc-map__line is-chest"><i /> chest</span>
            <span className="bmc-map__line is-waist"><i /> waist</span>
            <span className="bmc-map__line is-thigh"><i /> thigh</span>
            <div className="bmc-map__figure">
              <span className="head" />
              <span className="torso" />
              <span className="arm left" />
              <span className="arm right" />
              <span className="leg left" />
              <span className="leg right" />
            </div>
            <span className="bmc-map__stamp">GF / PROPORTION LAB</span>
          </div>
        </section>

        <BodyMeasurementsClient />

        <section className="bmc-method">
          <div>
            <span className="bmc-kicker">How to read this</span>
            <h2>A reference, not a verdict.</h2>
          </div>
          <div className="bmc-method__grid">
            <article>
              <span>01</span>
              <h3>Ratios beat raw inches</h3>
              <p>
                A 16-inch arm means something different on two frames. Height
                and wrist normalize the number; waist gives the torso ratios
                visual context.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Bands stay deliberately broad</h3>
              <p>
                Genetics, bone structure and preference matter. These are
                common physique reference zones, not a universal ideal or a
                promise of what your body should be.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Track trend over precision</h3>
              <p>
                Tape tension can move a reading. Measure under the same
                conditions monthly and pair the numbers with consistent
                photos to see the real direction.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
