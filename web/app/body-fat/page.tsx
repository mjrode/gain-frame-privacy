import type { Metadata } from "next";
import Link from "next/link";
import BlogNav from "@/components/BlogNav";
import BlogFonts from "@/components/BlogFonts";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import { SITE } from "@/lib/site";
import { BF_GALLERY_PAGES, physiqueImage } from "@/lib/body-fat-gallery";

const TITLE = "Body Fat Percentage Pictures: Men & Women at Every Level";
const DESCRIPTION =
  "See what every body fat percentage looks like with photorealistic pictures — men from 8% to 30%, women from 18% to 40%, each shown across ages 20s to 60s.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | GainFrame` },
  description: DESCRIPTION,
  alternates: { canonical: "/body-fat/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/body-fat/`,
    type: "website",
    siteName: "GainFrame",
    images: [{ url: `${SITE.url}${physiqueImage("male", "30s", 13)}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const hubStyles = `
.bf-hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; margin: 24px 0 40px; }
.bf-hub-grid a { display: block; text-decoration: none; color: inherit; border: 1px solid var(--post-line); border-radius: 14px; overflow: hidden; background: var(--post-paper-bright); }
.bf-hub-grid img { width: 100%; height: auto; display: block; }
.bf-hub-grid .bf-hub-label { display: block; padding: 8px 10px; font-weight: 700; font-size: 0.9rem; }
`;

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Body Fat Percentage Pictures",
  itemListElement: BF_GALLERY_PAGES.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.h1,
    url: `${SITE.url}/body-fat/${p.slug}/`,
  })),
};

function GenderSection({ gender }: { gender: "male" | "female" }) {
  const pages = BF_GALLERY_PAGES.filter((p) => p.gender === gender).sort(
    (a, b) => a.percent - b.percent,
  );
  const noun = gender === "male" ? "man" : "woman";
  return (
    <>
      <h2>{gender === "male" ? "Men" : "Women"}</h2>
      <div className="bf-hub-grid">
        {pages.map((p) => (
          <Link key={p.slug} href={`/body-fat/${p.slug}/`}>
            <img
              src={physiqueImage(gender, "30s", p.primaryBf)}
              alt={`${p.percent}% body fat ${noun}`}
              loading="lazy"
            />
            <span className="bf-hub-label">{p.percent}% body fat</span>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function BodyFatHubPage() {
  return (
    <>
      <BlogFonts />
      <link rel="stylesheet" href="/styles/blog-post-page.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="blog-post-page">
        <style dangerouslySetInnerHTML={{ __html: hubStyles }} />
        <BlogNav />
        <BlogScrollReveal />
        <main className="post-container">
          <header className="post-header">
            <h1>Body Fat Percentage Pictures</h1>
          </header>
          <article className="post-body">
            <p>
              Charts tell you a number; pictures tell you what the number
              actually looks like. Every page below shows a photorealistic
              reference physique at one body fat percentage — including how the
              same percentage presents across five decades of age, which almost
              no chart bothers to show.
            </p>
            <p>
              Percentages aren&apos;t comparable across sexes: women carry
              roughly 8–10 points more essential fat than men, so a woman at
              25% and a man at 15% are in similar relative condition. Pick your
              section below.
            </p>

            <GenderSection gender="male" />
            <GenderSection gender="female" />

            <h2>Find your own number</h2>
            <p>
              Once you know what the percentages look like, get yours three
              ways: an{" "}
              <a href="/tools/body-fat-from-photo/">AI estimate from a photo</a>{" "}
              (free, no signup), the{" "}
              <a href="/tools/body-fat-estimator/">
                U.S. Navy tape-measure calculator
              </a>{" "}
              (±3% accuracy, repeatable), or the interactive{" "}
              <a href="/tools/body-fat-visualizer/">body fat visualizer</a> to
              match yourself against every reference at once.
            </p>
          </article>
        </main>
      </div>
    </>
  );
}
