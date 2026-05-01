import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import Script from "next/script";
import BlogNav from "@/components/BlogNav";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "GainFrame Comics — Science-Backed Gym Tips & Fitness Education",
  description:
    "Visual guides to nutrition, training, and body composition. Swipe-through comics that make fitness science simple.",
  alternates: { canonical: "/comics/" },
  openGraph: {
    title: "GainFrame Comics — Science-Backed Gym Tips & Fitness Education",
    description:
      "Visual guides to nutrition, training, and body composition. Swipe-through comics that make fitness science simple.",
    type: "website",
    url: `${SITE.url}/comics/`,
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainFrame Comics — Science-Backed Gym Tips & Fitness Education",
    description:
      "Visual guides to nutrition, training, and body composition. Swipe-through comics that make fitness science simple.",
    images: [SITE.ogImage],
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "GainFrame Comics",
  description:
    "Visual guides to nutrition, training, and body composition. Swipe-through comics that make fitness science simple.",
  url: "https://gainframe.app/comics/",
  isPartOf: {
    "@type": "WebSite",
    name: "GainFrame",
    url: "https://gainframe.app",
  },
};

export default async function ComicsPage() {
  const bodyHtml = await fs.readFile(
    path.join(process.cwd(), "lib", "_extracted", "comics-body.html"),
    "utf8",
  );

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=UnifrakturCook:wght@700&display=swap"
      />
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/comics-page.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BlogNav />
      <BlogScrollReveal />
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {/* Comics manifest defines COMICS_MANIFEST and must load before
          the render script. afterInteractive runs both as soon as React
          hydration finishes — no flash of empty grid for users on a fast
          connection, and the static structure (masthead, mascot, filter
          bar) renders immediately while the cards populate. */}
      <Script
        src="/assets/tiktok/comic/comics-manifest.js"
        strategy="afterInteractive"
      />
      <Script src="/comics-render.js" strategy="afterInteractive" />
    </>
  );
}
