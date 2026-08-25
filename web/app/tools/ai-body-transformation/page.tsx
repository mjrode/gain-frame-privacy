import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import TransformClient from "./TransformClient";

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

const PAGE_PATH = "/tools/ai-body-transformation/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;

export const metadata: Metadata = {
  title: {
    absolute:
      "What Would I Look Like If I Lost Weight? Free AI Body Transformation | GainFrame",
  },
  description:
    "See what you'd look like if you lost weight and trained for a year. Free AI body transformation generator — upload one photo, get your future body on the same face and setting. One free render, no signup.",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "What Would I Look Like If I Lost Weight? Free AI Body Transformation",
    description:
      "Upload one photo and see what you'd look like after a year of losing weight and training. Free AI render, no signup.",
    type: "website",
    url: PAGE_URL,
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "What Would I Look Like If I Lost Weight? Free AI Body Transformation",
    description:
      "Upload one photo and see what you'd look like after a year of losing weight and training. Free AI render, no signup.",
    images: [SITE.ogImage],
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Body Transformation Generator",
  url: PAGE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "All",
  description:
    "Free AI tool that shows what you'd look like if you lost weight and trained consistently for a year, rendered from a single photo. One free render per user, plus one more with email.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "GainFrame", url: SITE.url },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to see your body transformation with AI",
  description:
    "Three-step process for generating an AI preview of your physique after a year of training, from one smartphone photo.",
  totalTime: "PT1M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  supply: [{ "@type": "HowToSupply", name: "One clear photo, torso visible" }],
  tool: [{ "@type": "HowToTool", name: "Smartphone camera or webcam" }],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload one clear photo",
      text: "A mirror selfie or progress photo works. Good light, at least your torso visible — tight or sports clothing gives the AI the most to work with.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Aim the transformation",
      text: "Pick your year — lose fat, build muscle, or both — and up to three areas to emphasize: shoulders, chest, arms, core, back, glutes, or legs.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Drag the before/after divider",
      text: "The AI renders the same photo of the same person with one year of consistent training applied. Save the side-by-side or download the render.",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What will I look like if I work out for a year?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "With consistent 4-5x/week training and dialed-in nutrition, most people see a visibly leaner waist, more developed shoulders, chest, and arms, and better overall proportions within a year. This tool shows an AI projection of that on your own photo — same face, same setting, your future body composition. Individual results depend on genetics, consistency, and starting point.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free AI body transformation generator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — this one. Upload a photo and get one free AI transformation render, no signup required. You can unlock a second render with your email. AI image generation is expensive to run, which is why the free tier is one render rather than unlimited.",
      },
    },
    {
      "@type": "Question",
      name: "Will the result still look like me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "That's the entire design goal. The AI is instructed to preserve your face, hair, skin tone, tattoos, scars, pose, and background exactly, and to change only body composition. The output should read as the same photograph of the same person, one year fitter.",
      },
    },
    {
      "@type": "Question",
      name: "Is my photo stored or used to train AI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Your photo is sent to the AI service for the render call only. It's not stored on GainFrame's servers and not used to train models. The generated image is returned to your browser and exists only there.",
      },
    },
    {
      "@type": "Question",
      name: "Why do I only get one free render?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each render costs real money in AI compute — noticeably more than a text analysis. One free render (plus one with email) keeps the tool free for everyone. The GainFrame iOS app includes unlimited Future You renders with adjustable intensity.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work for women?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Select the female reference and the transformation follows female training outcomes — typically emphasis on glutes, legs, and overall shape rather than maximal upper-body mass. You can steer it further with the emphasis areas.",
      },
    },
    {
      "@type": "Question",
      name: "Is this a realistic prediction of my results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It's a motivational projection, not a guarantee. The render is calibrated to what a dedicated year of consistent training and nutrition can realistically produce for most people — but genetics, sleep, adherence, and starting point all matter. Treat it as a target to train toward, not a promise.",
      },
    },
  ],
};

export default function AiBodyTransformationPage() {
  return (
    <div className={`${geist.className} ${geistMono.className}`}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/ai-body-transformation.css" />
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

      <div className="btf-body">
        <BlogNav />

        <section className="btf-hero">
          <div className="btf-hero-inner">
            <span className="btf-eyebrow">
              <span className="dot" aria-hidden />
              AI body transformation · Free · 1 render
            </span>
            {/* Carries the same query as the title tag — this is the only
                part of the page a phone shows above the fold, so it has to
                match what someone searched to get here. */}
            <h1>
              What would you look like{" "}
              <span className="accent">if you lost weight?</span>
            </h1>
            <p className="btf-hero-sub">
              Upload one photo, pick what to emphasize, and AI renders what a
              year of consistent training and diet builds — same face, same
              setting, your future body.
            </p>
            <div className="btf-hero-meta">
              <span>Free · No signup</span>
              <span className="sep" aria-hidden />
              <span>~20s render</span>
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

        <main className="btf-main">
          <TransformClient />
        </main>

        <section className="btf-section">
          <div className="btf-section-inner">
            <p className="btf-section-eyebrow">Process</p>
            <h2>How the transformation works.</h2>
            <div className="btf-steps">
              <div className="btf-step">
                <p className="btf-step-num">Step 01</p>
                <h3>Upload one clear photo</h3>
                <p>
                  A mirror selfie or progress photo works. Good light, torso
                  visible — tight or sports clothing gives the AI the most to
                  read.
                </p>
              </div>
              <div className="btf-step">
                <p className="btf-step-num">Step 02</p>
                <h3>Aim the year</h3>
                <p>
                  Lose fat, build muscle, or both — then pick up to three
                  areas to emphasize: shoulders, chest, arms, core, back,
                  glutes, or legs.
                </p>
              </div>
              <div className="btf-step">
                <p className="btf-step-num">Step 03</p>
                <h3>Drag the divider</h3>
                <p>
                  The render keeps your face, hair, tattoos, pose, and
                  background — only body composition changes. Save the
                  side-by-side.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="btf-section">
          <div className="btf-section-inner">
            <p className="btf-section-eyebrow">Honesty &amp; Methodology</p>
            <h2>What a &ldquo;year of perfect training&rdquo; means here.</h2>
            <p>
              The render is calibrated to what a dedicated year of consistent
              4-5x/week training and dialed-in nutrition realistically
              produces: a visibly leaner midsection, developed shoulders and
              arms, better proportions — <em>not</em> a contest-prep physique
              or a magazine cover. The AI is explicitly instructed to keep
              skin natural, avoid exaggerated vascularity, and stay inside
              what a natural trainee can achieve.
            </p>
            <p>
              It&apos;s still a projection, not a prediction. Genetics, sleep,
              adherence, and your starting point all move the real outcome.
              Two things we know from experience: people who{" "}
              <a href="/blog/before-after-comparing-progress-photos/">
                compare progress photos stay more consistent
              </a>
              , and a concrete visual target beats an abstract goal. That&apos;s
              what this render is for — put it somewhere you&apos;ll see it.
            </p>
            <p>
              Want the reverse — where you are <em>right now</em>? Our{" "}
              <a href="/tools/body-fat-from-photo/">
                AI body fat estimator
              </a>{" "}
              reads your current body fat from the same kind of photo.
            </p>
          </div>
        </section>

        <section className="btf-section">
          <div className="btf-section-inner">
            <p className="btf-section-eyebrow">Related tools</p>
            <h2>Know where you&apos;re starting from.</h2>
            <a
              className="btf-crosslink-card"
              href="/tools/six-pack-timeline/"
            >
              <div className="btf-crosslink-text">
                <strong>Six Pack Timeline Calculator</strong>
                <span>
                  Aim the transformation at defined abs with a photo-based
                  body-fat range and one of four calorie deficits.
                </span>
              </div>
              <span className="btf-crosslink-arrow">Open →</span>
            </a>
            <a
              className="btf-crosslink-card"
              href="/tools/body-fat-from-photo/"
            >
              <div className="btf-crosslink-text">
                <strong>AI Body Fat Estimator</strong>
                <span>
                  The other direction — upload the same photo and get your
                  current body fat percentage in ~8 seconds.
                </span>
              </div>
              <span className="btf-crosslink-arrow">Open →</span>
            </a>
            <a className="btf-crosslink-card" href="/tools/physique-rater/">
              <div className="btf-crosslink-text">
                <strong>AI Physique Rater</strong>
                <span>
                  Score where you are today — a 1–100 physique rating with body
                  fat, muscle, proportions, and goal fit from one photo.
                </span>
              </div>
              <span className="btf-crosslink-arrow">Open →</span>
            </a>
            <a
              className="btf-crosslink-card"
              href="/tools/body-fat-visualizer/"
            >
              <div className="btf-crosslink-text">
                <strong>Body Fat Visualizer</strong>
                <span>
                  See standardized reference physiques at every body fat
                  level — useful for setting a realistic target.
                </span>
              </div>
              <span className="btf-crosslink-arrow">Open →</span>
            </a>
            <a
              className="btf-crosslink-card"
              href="/tools/progress-photo-setup/"
            >
              <div className="btf-crosslink-text">
                <strong>Progress Photo Setup</strong>
                <span>
                  Chasing the render? Start taking comparable progress photos
                  today — same pose, same light, every week.
                </span>
              </div>
              <span className="btf-crosslink-arrow">Open →</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
