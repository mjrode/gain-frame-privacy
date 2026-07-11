import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import BlogNav from "@/components/BlogNav";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import { COMICS_MANIFEST } from "@/lib/comics-manifest.mjs";
import { getTag } from "@/components/ComicsGrid";
import { SITE } from "@/lib/site";

type Comic = { slug: string; title: string; date: string; ext: string };
type TranscriptSlide = { file: string; text: string; alt: string };
type Transcript = { summary: string; slides: TranscriptSlide[] };

const MANIFEST = COMICS_MANIFEST as Comic[];

async function loadTranscripts(): Promise<Record<string, Transcript>> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "lib", "comics-transcripts.json"),
      "utf8",
    );
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function generateStaticParams() {
  return MANIFEST.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const comic = MANIFEST.find((c) => c.slug === slug);
  if (!comic) return {};
  const transcripts = await loadTranscripts();
  const summary = transcripts[slug]?.summary;
  const description = (
    summary ??
    `${comic.title} — a swipe-through fitness comic from GainFrame. Gym, nutrition, and body-composition tips illustrated.`
  ).slice(0, 300);
  const title = `${comic.title} — Fitness Comic`;
  const cover = `${SITE.url}/assets/tiktok/comic/${slug}/slide-0-cover.${comic.ext}`;
  return {
    title,
    description,
    alternates: { canonical: `/comics/${slug}/` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE.url}/comics/${slug}/`,
      siteName: "GainFrame",
      images: [{ url: cover }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cover],
    },
  };
}

export default async function ComicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = MANIFEST.findIndex((c) => c.slug === slug);
  if (idx === -1) notFound();
  const comic = MANIFEST[idx];
  const tag = getTag(slug);

  const transcripts = await loadTranscripts();
  const transcript = transcripts[slug];
  // Slide list comes from the transcript file (generated for every comic by
  // scripts/generate-comics-transcripts.mjs); fall back to the cover alone.
  const slideFiles = transcript
    ? transcript.slides.map((s) => s.file)
    : [`slide-0-cover.${comic.ext}`];

  const newer = idx > 0 ? MANIFEST[idx - 1] : null;
  const older = idx < MANIFEST.length - 1 ? MANIFEST[idx + 1] : null;
  const related = MANIFEST.filter(
    (c) => c.slug !== slug && getTag(c.slug) === tag,
  ).slice(0, 4);

  const coverUrl = `${SITE.url}/assets/tiktok/comic/${slug}/slide-0-cover.${comic.ext}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${comic.title} — Fitness Comic`,
    description:
      transcript?.summary ??
      `${comic.title} — a swipe-through fitness comic from GainFrame.`,
    image: coverUrl,
    datePublished: comic.date,
    dateModified: comic.date,
    author: {
      "@type": "Person",
      name: "Michael Rode",
      url: "https://gainframe.app/about",
    },
    publisher: {
      "@type": "Organization",
      name: "GainFrame",
      url: "https://gainframe.app",
      logo: {
        "@type": "ImageObject",
        url: "https://gainframe.app/assets/favicons/favicon.webp",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/comics/${slug}/`,
    },
    articleSection: tag,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Fitness Comics",
        item: `${SITE.url}/comics/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: comic.title,
        item: `${SITE.url}/comics/${slug}/`,
      },
    ],
  };

  const displayDate = new Date(comic.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <>
      <link rel="stylesheet" href="/styles.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <style>{`
        .comic-page-wrap { max-width: 640px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
        .comic-page-breadcrumb { font-size: 0.85rem; color: var(--color-text-secondary, #888); margin-bottom: 1.5rem; }
        .comic-page-breadcrumb a { color: inherit; }
        .comic-page-wrap h1 { font-size: 2rem; line-height: 1.2; margin-bottom: 0.5rem; }
        .comic-page-meta { font-size: 0.85rem; color: var(--color-text-secondary, #888); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1.5rem; }
        .comic-page-summary { border-left: 3px solid var(--color-accent, #48BB78); padding: 0.75rem 1rem; margin-bottom: 2rem; font-size: 1.05rem; line-height: 1.6; background: var(--color-surface, rgba(128,128,128,0.06)); border-radius: 0 8px 8px 0; }
        .comic-page-slide { margin: 0 0 2.25rem; }
        .comic-page-slide img { width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--color-border, rgba(128,128,128,0.25)); display: block; }
        .comic-page-slide figcaption { font-size: 0.95rem; line-height: 1.55; margin-top: 0.6rem; color: var(--color-text-secondary, #999); }
        .comic-page-nav { display: flex; justify-content: space-between; gap: 1rem; margin: 2.5rem 0; font-size: 0.95rem; }
        .comic-page-related { margin-top: 2.5rem; }
        .comic-page-related h2 { font-size: 1.2rem; margin-bottom: 0.75rem; }
        .comic-page-related ul { list-style: none; padding: 0; margin: 0; }
        .comic-page-related li { margin-bottom: 0.5rem; }
      `}</style>
      <BlogNav />
      <BlogScrollReveal />

      <main className="comic-page-wrap">
        <nav className="comic-page-breadcrumb" aria-label="Breadcrumb">
          <a href="/comics/">&larr; All fitness comics</a>
        </nav>

        <article>
          <h1>{comic.title}</h1>
          <p className="comic-page-meta">
            {tag} comic &middot; {displayDate} &middot; {slideFiles.length}{" "}
            slides
          </p>

          {transcript?.summary ? (
            <p className="comic-page-summary">{transcript.summary}</p>
          ) : null}

          {slideFiles.map((file, i) => {
            const slide = transcript?.slides[i];
            return (
              <figure className="comic-page-slide" key={file}>
                <img
                  src={`/assets/tiktok/comic/${slug}/${file}`}
                  alt={
                    slide?.alt ||
                    `${comic.title} — slide ${i + 1} of ${slideFiles.length}`
                  }
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
                {slide?.text ? <figcaption>{slide.text}</figcaption> : null}
              </figure>
            );
          })}
        </article>

        <div className="blog-post-cta scroll-reveal">
          <h3>Like the comics? The app does the tracking.</h3>
          <p>
            GainFrame turns progress photos into body fat estimates, muscle
            scores, and honest trend lines — the stuff these comics keep
            nagging you about. Free to start on iOS.
          </p>
          <a
            href="https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082"
            className="cta-button"
            target="_blank"
            rel="noopener"
          >
            Download GainFrame Free
          </a>
        </div>

        <nav className="comic-page-nav" aria-label="More comics">
          {newer ? (
            <a href={`/comics/${newer.slug}/`}>&larr; {newer.title}</a>
          ) : (
            <span />
          )}
          {older ? (
            <a href={`/comics/${older.slug}/`}>{older.title} &rarr;</a>
          ) : (
            <span />
          )}
        </nav>

        {related.length ? (
          <div className="comic-page-related">
            <h2>More {tag} comics</h2>
            <ul>
              {related.map((c) => (
                <li key={c.slug}>
                  <a href={`/comics/${c.slug}/`}>{c.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>
    </>
  );
}
