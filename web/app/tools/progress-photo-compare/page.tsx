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
  "Compare two progress photos with manual alignment, side-by-side, wipe and ghost modes. Add optional face blur and export a PNG locally—no upload or signup.";

export const metadata: Metadata = {
  title: {
    absolute: "Private Progress Photo Compare & Align Tool | GainFrame",
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
    title: "Compare Progress Photos Privately — Align, Overlay & Export",
    description: DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Private Progress Photo Compare & Align Tool",
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};

const FAQS = [
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
  name: "GainFrame Private Progress Photo Compare & Align",
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
              Compare the work.
              <span>Not the camera angle.</span>
            </h1>
            <p>
              Load two progress photos, line up the frame, and inspect the
              change with a wipe or ghost overlay. Your photos never leave
              this browser.
            </p>
            <a href="#compare-workspace" className={styles.heroCta}>
              Open the private darkroom <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className={styles.heroProof}>
            <strong>Zero-image-transfer architecture</strong>
            <p>
              No upload endpoint. No account. No cloud copy. Closing the tab
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
                Compare relaxed with relaxed—not flexed with unflexed.
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
