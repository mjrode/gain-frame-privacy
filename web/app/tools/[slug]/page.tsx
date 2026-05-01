import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import BlogNav from "@/components/BlogNav";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import CalcEmbed from "@/components/CalcEmbed";

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
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Outfit:wght@500;600;700;800;900&display=swap"
      />
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
    </>
  );
}
