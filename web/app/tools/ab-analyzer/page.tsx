import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import AbAnalyzerClient from "./AbAnalyzerClient";

const PAGE_PATH = "/tools/ab-analyzer/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;

/* Search targeting: the assessment-intent family. "do i have abs" (rising
 * sharply), "six pack calculator", "abs rating", plus the timeline questions
 * ("how long does it take to get a six pack / abs") that the result answers
 * directly. The informational guide /blog/how-long-to-see-abs/ keeps the
 * long-form timeline queries and links down here; this page is the tool. */
const DESCRIPTION =
  "Do you have abs? Upload one photo and the free AI ab analyzer scores your six pack 1 to 100, reads upper abs, lower abs, and obliques, estimates your body fat range, and projects how many months until visible abs. Three free scans, no signup.";

export const metadata: Metadata = {
  title: {
    absolute: "AI Ab Analyzer: Six Pack Score & Timeline From One Photo | GainFrame",
  },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "AI Ab Analyzer: Six Pack Score & Timeline From One Photo",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Ab Analyzer: Six Pack Score & Timeline From One Photo",
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Ab Analyzer",
  url: PAGE_URL,
  applicationCategory: "HealthApplication",
  operatingSystem: "All",
  description: DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "GainFrame", url: SITE.url },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "At what body fat percentage do abs show?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For most men, an ab outline appears under roughly 15 percent body fat and a defined six pack under roughly 12 percent. For most women the equivalents are roughly 22 and 19 percent, because women carry more essential fat. Genetics move these thresholds a few points in either direction, which is why the analyzer reports a range rather than a single number.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to get a six pack?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends almost entirely on your starting body fat. A sustainable cut loses roughly 1 to 1.5 body fat percentage points per month, so someone at 22 percent is realistically 6 to 9 months from a defined six pack, while someone at 15 percent may be 2 to 3 months out. The analyzer estimates your months from your photo. Ab training matters, but the visibility timeline is set by fat loss.",
      },
    },
    {
      "@type": "Question",
      name: "How does the AI ab analyzer score my abs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The AI reads your midsection from one photo and scores overall ab visibility 1 to 100 across five bands: Hidden, Emerging, Visible, Defined, and Shredded. It also reads upper abs, lower abs, and obliques separately, estimates your body fat as a range, and projects a months-to-visible-abs estimate from the gap between that range and the visibility threshold for your sex.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a free six pack calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, this one. Most six pack calculators ask for numbers you have to guess. This one works from a photo instead: upload one shot and it returns an ab score, an estimated body fat range, and a projected timeline to visible abs. You get three free scans per browser, one per day, with no signup.",
      },
    },
    {
      "@type": "Question",
      name: "Why do lower abs show last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fat storage on the abdomen is bottom-weighted for most people, so the layer over the lower abs is the last to thin out. It is normal to have a clear upper four while the bottom rows stay covered, and it is a body fat situation rather than a training gap. The region breakdown in your result shows exactly this lag.",
      },
    },
    {
      "@type": "Question",
      name: "Is my photo stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Your photo is sent to the AI for the one scoring call and nothing else. It is not stored on GainFrame's servers and is not used to train models. Nothing about the photo persists after your result comes back.",
      },
    },
    {
      "@type": "Question",
      name: "Does the ab analyzer work for women?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Pick female before uploading and the body fat estimate and timeline are anchored to female thresholds, which sit roughly 7 points higher than male thresholds at the same visual leanness. Scoring against the wrong sex is the biggest source of a misleading timeline, so it is worth setting.",
      },
    },
  ],
};

const BANDS: Array<{ range: string; name: string; note: string }> = [
  { range: "1-25", name: "Hidden", note: "No visible ab detail yet. The midsection reads smooth or soft. Almost everyone starts here." },
  { range: "26-45", name: "Emerging", note: "Faint upper-ab lines in good light. The first sign a cut is working." },
  { range: "46-65", name: "Visible", note: "A clear outline in normal light. Lower abs usually still lag." },
  { range: "66-85", name: "Defined", note: "The full six-pack outline with real separation. What most people mean by having abs." },
  { range: "86-100", name: "Shredded", note: "Deep separation with visible obliques and serratus. Contest-adjacent leanness." },
];

export default function AbAnalyzerPage() {
  return (
    <>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/physique-rater.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="pr-body">
        <BlogNav />

        <section className="pr-hero">
          <div className="pr-hero-inner">
            <span className="pr-eyebrow">
              <span className="dot" aria-hidden />
              AI ab scan · Free · No signup
            </span>
            <h1>
              Do you have abs? <span className="accent">Find out honestly.</span>
            </h1>
            <p className="pr-hero-sub">
              Upload one photo and this free AI ab analyzer scores your six pack
              1 to 100, reads upper abs, lower abs, and obliques separately,
              estimates your body fat range, and projects how many months until
              your abs are actually visible.
            </p>
            <div className="pr-hero-meta">
              <span>3 free scans</span>
              <span className="sep" aria-hidden />
              <span>~8s</span>
              <span className="sep" aria-hidden />
              <span>Photo never stored</span>
            </div>
          </div>
        </section>

        <main className="pr-main">
          <AbAnalyzerClient />
        </main>

        <section className="pr-section">
          <div className="pr-section-inner">
            <p className="pr-section-eyebrow">The scale</p>
            <h2>What each ab score actually means.</h2>
            <p>
              A six pack is a threshold effect: the muscle is already there, and
              the score mostly measures how much of it the fat layer lets you
              see. These are the bands the analyzer scores against, and they are
              deliberately hard. Most casual photos land in Hidden or Emerging.
            </p>
            <div className="pr-bands">
              {BANDS.map((b) => (
                <div className="pr-band-row" key={b.name}>
                  <span className="pr-band-range">{b.range}</span>
                  <span>
                    <strong>{b.name}</strong>
                    <span>{b.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pr-section">
          <div className="pr-section-inner">
            <p className="pr-section-eyebrow">Method</p>
            <h2>How the timeline estimate works.</h2>
            <p>
              The analyzer reads your estimated body fat range from the photo,
              takes the gap to the visibility threshold for your sex (roughly 12
              percent for men, 19 percent for women), and divides by a
              sustainable fat-loss pace of about 1 to 1.5 percentage points per
              month. That produces a months range, never a date and never a
              promise. Genetics set your personal threshold a few points either
              side of those anchors.
            </p>
            <p>
              The region breakdown exists because abs do not appear all at once.
              Upper abs show first, lower abs last, and obliques only at
              genuinely low body fat. Seeing which region lags tells you where
              you are in that sequence. Our guide to{" "}
              <a href="/blog/how-long-to-see-abs/">
                how long it takes to see abs
              </a>{" "}
              walks the full progression, and the{" "}
              <a href="/blog/body-fat-percentage-chart/">
                body fat percentage chart
              </a>{" "}
              shows what each level looks like on a whole body.
            </p>
          </div>
        </section>

        <section className="pr-section">
          <div className="pr-section-inner">
            <p className="pr-section-eyebrow">Honesty</p>
            <h2>What one photo can&apos;t tell you.</h2>
            <p>
              Lighting changes visible ab definition more than a week of dieting
              does. A pump, the meal you just ate, and camera angle all move a
              one-off score. That is why the analyzer reports bands and ranges,
              carries a confidence rating, and refuses to score photos where the
              midsection is covered.
            </p>
            <p>
              The timeline is the honest version of a question most tools
              dodge, and it is still an estimate built on an estimate. What
              actually answers it is the same scan on the same pose week over
              week while you cut. That trend is exactly what the{" "}
              <a href="/tools/body-fat-from-photo/">AI body fat estimator</a>{" "}
              and the GainFrame app track.
            </p>
          </div>
        </section>

        <section className="pr-section">
          <div className="pr-section-inner">
            <p className="pr-section-eyebrow">Questions</p>
            <h2>Abs, answered.</h2>
            <div className="pr-faq">
              {faqSchema.mainEntity.map((qa) => (
                <details key={qa.name}>
                  <summary>{qa.name}</summary>
                  <p>{qa.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pr-section">
          <div className="pr-section-inner">
            <p className="pr-section-eyebrow">Related tools</p>
            <h2>Go deeper than one region.</h2>
            <a className="pr-crosslink-card" href="/tools/body-fat-from-photo/">
              <div className="pr-crosslink-text">
                <strong>AI Body Fat Estimator</strong>
                <span>
                  The number behind your ab timeline: body fat percentage from
                  the same kind of photo.
                </span>
              </div>
              <span className="pr-crosslink-arrow">Open →</span>
            </a>
            <a className="pr-crosslink-card" href="/tools/physique-rater/">
              <div className="pr-crosslink-text">
                <strong>AI Physique Rater</strong>
                <span>
                  The whole-body version: one score across body fat, muscle,
                  and proportions.
                </span>
              </div>
              <span className="pr-crosslink-arrow">Open →</span>
            </a>
            <a className="pr-crosslink-card" href="/blog/how-long-to-see-abs/">
              <div className="pr-crosslink-text">
                <strong>How Long Until You See Abs?</strong>
                <span>
                  The full timeline guide: what changes at each body fat level
                  and how to hold muscle through the cut.
                </span>
              </div>
              <span className="pr-crosslink-arrow">Read →</span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
