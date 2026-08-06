import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import BlogNav from "@/components/BlogNav";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import CalcEmbed from "@/components/CalcEmbed";
import VisualizerAnalytics from "@/components/VisualizerAnalytics";

const CALC_SLUGS = [
  "body-fat-estimator",
  "body-fat-visualizer",
  "calorie-deficit-calculator",
  "calories-burned-calculator",
  "ffmi-calculator",
  "macro-calculator",
  "one-rep-max-calculator",
  "progress-photo-setup",
  "strength-standards-calculator",
  "tdee-calculator",
] as const;

type RelatedTool = { slug: string; title: string; blurb: string };

// Curated cross-link set surfaced at the bottom of every calculator page,
// excluding self. Body-fat-from-photo always present (no CSS class needed —
// the page-level styles cover the .bff-section/.bff-crosslink-card classes
// for the body-fat-from-photo route; for the [slug] route we render simple
// links inside the standard prose container).
const ALL_TOOLS: RelatedTool[] = [
  {
    slug: "body-visualizer",
    title: "BMI Body Visualizer",
    blurb:
      "Enter height and weight for an adult BMI result plus an illustrative male or female body-shape reference.",
  },
  {
    slug: "body-fat-from-photo",
    title: "AI Body Fat from a Photo",
    blurb:
      "Free single-photo AI estimator. One scan per day, no signup. The fastest way to get a directional body-fat number.",
  },
  {
    slug: "ai-body-transformation",
    title: "AI Body Transformation",
    blurb:
      "See yourself after a year of consistent training — AI renders your future body on your own photo. One free render.",
  },
  {
    slug: "physique-rater",
    title: "AI Physique Rater",
    blurb:
      "Upload one photo, get a 1–100 physique score broken into body fat, muscle, proportions, and goal fit. Three free ratings, no signup.",
  },
  {
    slug: "body-fat-estimator",
    title: "U.S. Navy Tape-Measure Calculator",
    blurb:
      "Neck, waist, hip measurements → body fat %. No AI, ±3% accuracy, repeatable.",
  },
  {
    slug: "body-fat-visualizer",
    title: "Body Fat Visualizer",
    blurb:
      "Drag two sliders to see photorealistic references at every body fat % (men 8–33%, women 18–42%).",
  },
  {
    slug: "ffmi-calculator",
    title: "FFMI Calculator",
    blurb:
      "Fat-Free Mass Index — the natty-limit metric for evaluating muscle relative to height.",
  },
];

type CalcMeta = {
  slug: string;
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  schemas: unknown[];
};

const extractedDir = () =>
  path.join(process.cwd(), "lib", "_extracted", "calc");

async function loadMeta(slug: string): Promise<CalcMeta | null> {
  if (!CALC_SLUGS.includes(slug as (typeof CALC_SLUGS)[number])) return null;
  try {
    const raw = await fs.readFile(
      path.join(extractedDir(), `${slug}-meta.json`),
      "utf8",
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return CALC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await loadMeta(slug);
  if (!meta) return {};
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: `/tools/${slug}/` },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: meta.canonical,
      type: "website",
      siteName: "GainFrame",
      images: [{ url: meta.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.twitterTitle,
      description: meta.twitterDescription,
      images: [meta.ogImage],
    },
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = await loadMeta(slug);
  if (!meta) notFound();

  const [bodyHtml, scriptJs] = await Promise.all([
    fs.readFile(path.join(extractedDir(), `${slug}-body.html`), "utf8"),
    fs.readFile(path.join(extractedDir(), `${slug}-scripts.js`), "utf8"),
  ]);

  return (
    <>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href={`/styles/calc/${slug}.css`} />
      {meta.schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BlogNav />
      <BlogScrollReveal />
      <CalcEmbed html={bodyHtml} script={scriptJs} />
      {slug === "body-fat-visualizer" && <VisualizerAnalytics />}
      <RelatedToolsFooter currentSlug={slug} />
    </>
  );
}

function RelatedToolsFooter({ currentSlug }: { currentSlug: string }) {
  const related = ALL_TOOLS.filter((t) => t.slug !== currentSlug);
  return (
    <section
      style={{
        maxWidth: "780px",
        margin: "3rem auto 4rem",
        padding: "0 1.25rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.4rem",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          marginBottom: "0.5rem",
        }}
      >
        Related tools
      </h2>
      <p
        style={{
          fontSize: "0.95rem",
          color: "rgba(0,0,0,0.6)",
          marginBottom: "1.25rem",
        }}
      >
        Pair this calculator with one of the body-composition tools below for a
        fuller picture.
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {related.map((t) => (
          <li
            key={t.slug}
            style={{
              padding: "0.85rem 0",
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <a
              href={`/tools/${t.slug}/`}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <strong style={{ display: "block", fontWeight: 700 }}>
                {t.title} →
              </strong>
              <span style={{ fontSize: "0.92rem", color: "rgba(0,0,0,0.65)" }}>
                {t.blurb}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
