import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogNav from "@/components/BlogNav";
import BlogFonts from "@/components/BlogFonts";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import { SITE } from "@/lib/site";
import {
  BF_AGES,
  BF_GALLERY_PAGES,
  getAdjacentBfPages,
  getBfPage,
  physiqueImage,
} from "@/lib/body-fat-gallery";

// Layout styles shared by every gallery page: two-up reference panel, five-up
// by-age grid, prev/next pager. Everything else inherits blog-post-page.css.
const galleryStyles = `
.bf-ref-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 28px 0; }
.bf-ref-panel figure, .bf-age-grid figure { margin: 0; }
.bf-ref-panel img, .bf-age-grid img { width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--post-line); background: var(--post-paper-bright); }
.bf-ref-panel figcaption, .bf-age-grid figcaption { margin-top: 8px; font-size: 0.82rem; color: var(--post-muted); text-align: center; }
.bf-age-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 28px 0; }
@media (max-width: 720px) {
  .bf-age-grid { grid-template-columns: repeat(2, 1fr); }
  .bf-age-grid figure:last-child { grid-column: span 2; max-width: 50%; margin: 0 auto; }
}
.bf-pager { display: flex; justify-content: space-between; gap: 12px; margin: 40px 0 8px; flex-wrap: wrap; }
.bf-pager a { text-decoration: none; font-weight: 700; }
.bf-cta-list { list-style: none; padding: 0; }
.bf-cta-list li { padding: 10px 0; border-top: 1px solid var(--post-line); }
`;

export async function generateStaticParams() {
  return BF_GALLERY_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getBfPage(slug);
  if (!page) return {};
  const ogImage = `${SITE.url}${physiqueImage(page.gender, "30s", page.primaryBf)}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/body-fat/${slug}/` },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: `${SITE.url}/body-fat/${slug}/`,
      type: "article",
      siteName: "GainFrame",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [ogImage],
    },
  };
}

export default async function BodyFatGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getBfPage(slug);
  if (!page) notFound();

  const genderNoun = page.gender === "male" ? "man" : "woman";
  const { prev, next } = getAdjacentBfPages(page);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const imageSchema = BF_AGES.map((age) => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: `${SITE.url}${physiqueImage(page.gender, age, page.primaryBf)}`,
    name: `${page.primaryBf}% body fat ${genderNoun} in their ${age}`,
    description: `Photorealistic reference of a ${genderNoun} in their ${age} at ${page.primaryBf}% body fat.`,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Body Fat Pictures", item: `${SITE.url}/body-fat/` },
      { "@type": "ListItem", position: 2, name: page.h1, item: `${SITE.url}/body-fat/${page.slug}/` },
    ],
  };

  return (
    <>
      <BlogFonts />
      <link rel="stylesheet" href="/styles/blog-post-page.css" />
      {[faqSchema, breadcrumbSchema, ...imageSchema].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="blog-post-page">
        <style dangerouslySetInnerHTML={{ __html: galleryStyles }} />
        <BlogNav />
        <BlogScrollReveal />
        <main className="post-container">
          <header className="post-header">
            <div className="post-breadcrumb">
              <Link href="/body-fat/">Body Fat Pictures</Link>
              <span> › </span>
              <span>
                {page.percent}% ({page.gender})
              </span>
            </div>
            <h1>{page.h1}</h1>
          </header>

          <article className="post-body">
            {page.intro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}

            <div className="bf-ref-panel">
              <figure>
                <img
                  src={physiqueImage(page.gender, "30s", page.primaryBf)}
                  alt={`Photorealistic reference of a ${genderNoun} in their 30s at ${page.primaryBf}% body fat`}
                  loading="eager"
                />
                <figcaption>Reference at {page.primaryBf}% body fat</figcaption>
              </figure>
              <figure>
                <img
                  src={physiqueImage(page.gender, "30s", page.compareBf)}
                  alt={`Photorealistic reference of a ${genderNoun} in their 30s at ${page.compareBf}% body fat`}
                  loading="eager"
                />
                <figcaption>Compared with {page.compareBf}% body fat</figcaption>
              </figure>
            </div>
            <p>
              <em>{page.referenceNote}</em>
            </p>

            <h2>What you can see at {page.percent}% body fat</h2>
            <ul>
              {page.traits.map((trait, i) => (
                <li key={i}>{trait}</li>
              ))}
            </ul>

            <h2>
              {page.percent}% body fat by age ({page.gender === "male" ? "men" : "women"} 20s–60s)
            </h2>
            <p>
              The same body fat percentage looks different at 25 and at 60 —
              skin elasticity, muscle mass, and fat distribution all shift with
              age. These references show the {page.primaryBf}% frame across five
              decades.
            </p>
            <div className="bf-age-grid">
              {BF_AGES.map((age) => (
                <figure key={age}>
                  <img
                    src={physiqueImage(page.gender, age, page.primaryBf)}
                    alt={`${page.primaryBf}% body fat ${genderNoun} in their ${age}`}
                    loading="lazy"
                  />
                  <figcaption>{age}</figcaption>
                </figure>
              ))}
            </div>
            <p>
              Want to explore every percentage and age combination
              interactively? Use the free{" "}
              <a href="/tools/body-fat-visualizer/">body fat visualizer</a>.
            </p>

            <h2>Where {page.percent}% sits on the scale</h2>
            <p>{page.rangeContext}</p>

            <h2>How to check your own body fat percentage</h2>
            <ul className="bf-cta-list">
              <li>
                <a href="/tools/body-fat-from-photo/">
                  <strong>AI photo estimate →</strong>
                </a>{" "}
                Upload one photo, get a directional body fat number in seconds.
                Free, one scan per day, no signup.
              </li>
              <li>
                <a href="/tools/body-fat-estimator/">
                  <strong>U.S. Navy tape-measure calculator →</strong>
                </a>{" "}
                Neck, waist{page.gender === "female" ? ", and hip" : ""}{" "}
                measurements — validated to roughly ±3% and perfectly
                repeatable for tracking change.
              </li>
              <li>
                <a href="/tools/ai-body-transformation/">
                  <strong>AI body transformation →</strong>
                </a>{" "}
                See what a year of consistent training could look like rendered
                on your own photo.
              </li>
            </ul>

            <h2>Frequently asked questions</h2>
            {page.faq.map((item, i) => (
              <div key={i}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}

            <nav className="bf-pager" aria-label="More body fat levels">
              {prev ? (
                <Link href={`/body-fat/${prev.slug}/`}>
                  ← {prev.percent}% body fat ({prev.gender})
                </Link>
              ) : (
                <span />
              )}
              <Link href="/body-fat/">All percentages</Link>
              {next ? (
                <Link href={`/body-fat/${next.slug}/`}>
                  {next.percent}% body fat ({next.gender}) →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </article>
        </main>
      </div>
    </>
  );
}
