import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import ProgressPhotoCompareClient from "./ProgressPhotoCompareClient";
import styles from "./page.module.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--ppc-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--ppc-body",
  display: "swap",
});

const PAGE_PATH = "/tools/progress-photo-compare/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;
const DESCRIPTION =
  "Compare progress photos side by side. Try sample photos, align your own images, add dates or face blur, and export a free PNG. No upload or signup.";

export const metadata: Metadata = {
  title: {
    absolute: "Free Progress Photo Comparison: Align, Overlay and Export",
  },
  description: DESCRIPTION,
  keywords: [
    "progress photo comparison tool",
    "compare progress photos online",
    "progress photo overlay",
    "progress photo alignment",
    "before and after photo comparison",
    "private photo comparison tool",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Free Progress Photo Comparison: Align, Overlay and Export",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Progress Photo Comparison: Align, Overlay and Export",
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};

const FAQS = [
  {
    question: "Can I try the comparison tool without choosing my own photos?",
    answer:
      "Yes. Choose Try sample photos to load two public example images. You can test alignment, side-by-side, wipe, ghost and PNG export. Sample comparisons are labeled, and choosing Use my photos clears them so you can start with your own images.",
  },
  {
    question: "Can I add dates or labels to my before-and-after photo?",
    answer:
      "Yes. Open Dates and labels in the comparison controls, then enter an optional date and short label for either photo. They appear in the preview and exported PNG. Turn off Include labels in PNG for an image without your labels. Sample exports always retain their sample marker.",
  },
  {
    question: "Are my progress photos uploaded or stored?",
    answer:
      "No. Both images stay inside your browser tab. The comparison, alignment, optional face blur, and PNG export run locally on your device. GainFrame never receives the image files.",
  },
  {
    question: "How do I align two progress photos?",
    answer:
      "Use the shared zoom control to match body scale, then adjust the horizontal and vertical position of each image independently. Wipe and ghost modes make differences in pose or framing easier to spot.",
  },
  {
    question: "What is ghost overlay mode?",
    answer:
      "Ghost mode places the after photo transparently over the before photo. Matching landmarks such as shoulders, hips, knees, and the floor line helps reveal changes while also exposing setup differences.",
  },
  {
    question: "Can I hide my face before exporting?",
    answer:
      "Yes. Turn on privacy blur, then position a separate face mask for the before and after photo. The blur is baked into the exported PNG on your device.",
  },
  {
    question: "Does a photo comparison prove muscle gain or fat loss?",
    answer:
      "No. Lighting, pose, camera distance, clothing, hydration, and time of day can change appearance. Use similar conditions and treat the result as a visual record, not a body-composition measurement or medical assessment.",
  },
] as const;

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GainFrame Progress Photo Comparison",
  alternateName: "Progress Photo Comparison Tool",
  url: PAGE_URL,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript and local image support",
  description: DESCRIPTION,
  featureList: [
    "Local-only progress photo comparison",
    "Shared zoom and independent image alignment",
    "Side-by-side, wipe, and ghost overlay modes",
    "Optional manual face blur",
    "Public sample photos to try the controls",
    "Optional dates and labels in PNG exports",
    "Local PNG export",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
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

export default function ProgressPhotoComparePage() {
  return (
    <div className={`${styles.page} ${display.variable} ${body.variable}`}>
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
        <header className={styles.hero}>
          <div className={styles.heroMark} aria-hidden="true">
            <span>01</span>
            <i />
            <span>02</span>
          </div>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Free tool · Local-only · No signup</span>
            <h1>
              Compare Progress Photos{" "}
              <span>Side by Side</span>
            </h1>
            <p>
              Load two progress photos, line up the frame, and inspect the
              change with a wipe or ghost overlay. Your photos never leave
              this browser.
            </p>
            <a href="#compare-workspace" className={styles.heroCta}>
              Compare your photos <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className={styles.heroProof}>
            <strong>Your photos stay on your device</strong>
            <p>
              No upload. No account. Closing the tab
              clears the working images from the page.
            </p>
            <div>
              <span>Align</span>
              <span>Blur</span>
              <span>Export</span>
            </div>
          </div>
        </header>

        <ProgressPhotoCompareClient />

        <section className={styles.demoSection} aria-labelledby="sample-comparison-heading">
          <div>
            <span className={styles.sectionKicker}>See the comparison</span>
            <h2 id="sample-comparison-heading">Start with a sample. Then compare your own photos.</h2>
            <p>These public example photos show how the tool works. Their different framing and lighting are reasons to compare carefully, not proof of a specific physical change.</p>
            <p>For your next check-in, follow our <a href="/blog/take-progress-photos-by-yourself/">progress-photo setup guide</a> and repeat the <a href="/blog/progress-photo-poses/">same front, side and back poses</a>.</p>
          </div>
          <figure>
            <img src="/assets/progress-photo-compare/sample-comparison.webp" alt="Sample progress photos displayed side by side in the comparison tool, with before and after labels." width={1000} height={660} loading="lazy" />
            <figcaption>Screenshot of this tool using GainFrame&apos;s already-public sample photos. No dates or results are implied.</figcaption>
          </figure>
        </section>

        <section className={styles.methodSection}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionKicker}>A fair comparison starts before the tool</span>
            <h2>Make the setup boring. Let the change be interesting.</h2>
            <p>
              Alignment removes framing noise. It cannot remove a different
              pose, pump, lens, or lighting setup. Repeat these three conditions
              whenever you can.
            </p>
          </div>
          <div className={styles.methodGrid}>
            <article>
              <span>01 / Frame</span>
              <h3>Lock the camera</h3>
              <p>
                Use the same lens, distance, height, and 4:5 crop. Line up the
                floor or a fixed background edge before comparing your body.
              </p>
            </article>
            <article>
              <span>02 / Light</span>
              <h3>Repeat the light</h3>
              <p>
                Face the same direction at the same time of day. Hard overhead
                light can create definition that disappears in soft light.
              </p>
            </article>
            <article>
              <span>03 / Pose</span>
              <h3>Stay neutral</h3>
              <p>
                Match stance, breath, arm position, and distance from camera.
                Compare relaxed with relaxed, not flexed with unflexed.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.modeSection}>
          <div>
            <span className={styles.sectionKicker}>Three lenses on the same evidence</span>
            <h2>Side by side finds the story. Overlay checks the setup.</h2>
          </div>
          <div className={styles.modeNotes}>
            <p>
              <strong>Side by side</strong> is easiest to read and share. Use it
              after alignment for the clearest before-and-after record.
            </p>
            <p>
              <strong>Wipe</strong> lets you scan from one image into the other.
              <strong> Ghost</strong> is the strictest alignment check: doubled
              shoulders or hips usually mean the pose or scale still differs.
            </p>
          </div>
        </section>

        <section className={styles.faqSection} aria-labelledby="progress-compare-faq">
          <div className={styles.faqIntro}>
            <span className={styles.sectionKicker}>Questions before you load a photo</span>
            <h2 id="progress-compare-faq">Private by construction.</h2>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
