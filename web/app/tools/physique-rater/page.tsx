import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import RaterClient from "./RaterClient";

const PAGE_PATH = "/tools/physique-rater/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;

/* Search targeting: this page deliberately leads on "rate my physique" / "rate
 * my body" / "body rater" rather than the bare head term "physique rater".
 * /blog/ai-physique-rating-apps/ already ranks around position 7 for "physique
 * rater" and carries the impressions; pointing both pages at the same query
 * splits the signal. The roundup keeps the head term and links down here. */
const DESCRIPTION =
  "Rate my physique, free. Upload one photo and an AI body rater returns a 1–100 score broken into body fat, muscle, proportions, and goal fit. Three free ratings, no signup.";

export const metadata: Metadata = {
  title: {
    absolute: "Rate My Physique — Free AI Body Rater From One Photo | GainFrame",
  },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Rate My Physique — Free AI Body Rater From One Photo",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rate My Physique — Free AI Body Rater From One Photo",
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Physique Rater",
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
      name: "Is there a free AI physique rater?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — this one. Upload a photo and get a 1–100 physique score with four sub-scores, free and without signing up. You get three free ratings per browser, one per day. The GainFrame iOS app scores every check-in with no cap.",
      },
    },
    {
      "@type": "Question",
      name: "How does the AI rate my physique?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The AI reads four things from your photo and scores each 1–100: body fat (how lean you read for your sex), muscle (visible development for your frame), proportions (taper, balance, symmetry), and goal fit (how well your current physique suits the goal you picked). The overall score is a weighted blend, weighted most toward body fat and muscle.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good physique score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most people who lift consistently land between 51 and 70, which reads as Solid. 71–85 (Impressive) means visible conditioning that most gym-goers never reach. Above 86 is Elite and genuinely rare. Below 50 is normal for beginners and anyone carrying more body fat — it is a starting line, not a verdict.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is a physique score from one photo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Directionally useful, not precise. A single casual photo carries real error from lighting, angle, posture, and clothing, so the score is deliberately banded rather than exact. Its value is as a repeated measure: the same method on the same pose every week shows change that a one-off number cannot.",
      },
    },
    {
      "@type": "Question",
      name: "Is my photo stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Your photo is sent to the AI for the scoring call only. It is not stored on GainFrame's servers and is not used to train models. Nothing about the photo persists after the score comes back.",
      },
    },
    {
      "@type": "Question",
      name: "Does the physique rater work for women?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Pick female before uploading and the body fat sub-score is anchored to female ranges, which sit roughly 8–10 points higher than male ranges at the same visual leanness. Scoring against the wrong sex is the single biggest source of a misleading result, so it is worth setting.",
      },
    },
  ],
};

const BANDS: Array<{ range: string; name: string; note: string }> = [
  { range: "1–30", name: "Starting", note: "Little visible muscular development yet. Everyone starts here." },
  { range: "31–50", name: "Building", note: "Training is showing, usually under a layer that hides the detail." },
  { range: "51–70", name: "Solid", note: "Where most consistent lifters live. Clearly trained in a t-shirt." },
  { range: "71–85", name: "Impressive", note: "Visible conditioning most gym-goers never reach." },
  { range: "86–100", name: "Elite", note: "Genuinely rare. Contest-adjacent leanness plus real mass." },
];

export default function PhysiqueRaterPage() {
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
              AI body rater · Free · No signup
            </span>
            <h1>
              Rate my physique, <span className="accent">honestly.</span>
            </h1>
            <p className="pr-hero-sub">
              Upload one photo and this free AI body rater returns a 1–100 score,
              broken into body fat, muscle, proportions, and goal fit — with the
              one change that would move it most.
            </p>
            <div className="pr-hero-meta">
              <span>3 free ratings</span>
              <span className="sep" aria-hidden />
              <span>~8s</span>
              <span className="sep" aria-hidden />
              <span>Photo never stored</span>
            </div>
          </div>
        </section>

        <main className="pr-main">
          <RaterClient />
        </main>

        <section className="pr-section">
          <div className="pr-section-inner">
            <p className="pr-section-eyebrow">The scale</p>
            <h2>What each score actually means.</h2>
            <p>
              Most physique raters hand you a number with no anchor, which makes
              a 72 meaningless. These are the bands this tool scores against, and
              they are deliberately hard — the middle of the distribution sits in
              Solid, not Elite.
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
            <h2>How the four sub-scores work.</h2>
            <p>
              <strong>Body fat</strong> scores how lean you read, anchored to
              your sex — female ranges sit roughly 8–10 points higher than male
              ranges at the same visual leanness, which is why picking your sex
              changes the result more than anything else you can set.
            </p>
            <p>
              <strong>Muscle</strong> judges development for your frame — shoulder
              cap, chest fullness, arm and back thickness — independently of how
              lean you are, so a genuinely thick build scores well here even
              under a softer layer. <strong>Proportions</strong> reads taper,
              upper-to-lower balance, and symmetry. <strong>Goal fit</strong> asks
              whether your current physique is positioned for the goal you picked:
              someone lean who wants to build muscle scores high, someone who
              should cut first scores lower.
            </p>
            <p>
              The overall score weights body fat and muscle most heavily, then
              proportions, then goal fit. It is the same four-part framework the{" "}
              <a href="/blog/understanding-ai-physique-score/">
                GainFrame Score in the iOS app
              </a>{" "}
              uses — this is the single-photo version of it.
            </p>
          </div>
        </section>

        <section className="pr-section">
          <div className="pr-section-inner">
            <p className="pr-section-eyebrow">Honesty</p>
            <h2>What one photo can&apos;t tell you.</h2>
            <p>
              A casual photo carries real error. Lighting changes visible
              definition more than a week of training does, a slight camera angle
              changes your apparent taper, and clothing can hide most of what the
              score depends on. That is why the bands are wide and the confidence
              rating exists.
            </p>
            <p>
              The number is a snapshot, and a snapshot is the least useful form of
              this measurement. What actually tells you something is the same
              score, same pose, same lighting, week over week — which is exactly
              why{" "}
              <a href="/blog/why-do-i-look-smaller-in-photos/">
                photos taken inconsistently mislead you
              </a>{" "}
              and why the app scores every check-in instead of once.
            </p>
            <p>
              If you want the underlying number rather than the composite, the{" "}
              <a href="/tools/body-fat-from-photo/">AI body fat estimator</a>{" "}
              reads body fat percentage from the same kind of photo.
            </p>
          </div>
        </section>

        <section className="pr-section">
          <div className="pr-section-inner">
            <p className="pr-section-eyebrow">Questions</p>
            <h2>Physique rating, answered.</h2>
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
            <h2>Go deeper than one number.</h2>
            <a className="pr-crosslink-card" href="/tools/body-fat-from-photo/">
              <div className="pr-crosslink-text">
                <strong>AI Body Fat Estimator</strong>
                <span>
                  The single number behind the biggest sub-score — body fat
                  percentage from the same photo.
                </span>
              </div>
              <span className="pr-crosslink-arrow">Open →</span>
            </a>
            <a className="pr-crosslink-card" href="/tools/ai-body-transformation/">
              <div className="pr-crosslink-text">
                <strong>AI Body Transformation</strong>
                <span>
                  See what a year of consistent training builds on your own
                  photo — the score you&apos;re aiming at.
                </span>
              </div>
              <span className="pr-crosslink-arrow">Open →</span>
            </a>
            <a className="pr-crosslink-card" href="/blog/ai-physique-rating-apps/">
              <div className="pr-crosslink-text">
                <strong>AI Physique Rating Apps, Tested</strong>
                <span>
                  How five other physique raters score, what they measure, and
                  where they break down.
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
