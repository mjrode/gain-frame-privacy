import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import Script from "next/script";
import BlogNav from "@/components/BlogNav";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import ComicsGrid from "@/components/ComicsGrid";
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
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/comics-page.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BlogNav />
      <BlogScrollReveal />

      <ComicsGrid />

      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      {/* The grid above is server-rendered; this script only powers the
          viewer modal, filter pills, share buttons, and read-tracking. */}
      <Script
        src="/assets/tiktok/comic/comics-manifest.js"
        strategy="afterInteractive"
      />
      <Script src="/comics-render.js" strategy="afterInteractive" />
    </>
  );
}
