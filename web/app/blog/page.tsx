import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import BlogNav from "@/components/BlogNav";
import BlogFonts from "@/components/BlogFonts";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "GainFrame Blog — AI Progress Photos, Body Composition & Training Tips",
  description:
    "Tips, guides, and updates from GainFrame — the AI-powered progress photo app for gym-goers. Learn about body fat tracking, physique scoring, and transformation science.",
  alternates: { canonical: "/blog/" },
  openGraph: {
    title:
      "GainFrame Blog — AI Progress Photos, Body Composition & Training Tips",
    description:
      "Tips, guides, and updates from GainFrame — the AI-powered progress photo app for gym-goers.",
    type: "website",
    url: `${SITE.url}/blog/`,
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainFrame Blog — AI Progress Photos & Training Tips",
    description:
      "Tips, guides, and updates from GainFrame — the AI-powered progress photo app for gym-goers.",
    images: [SITE.ogImage],
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "GainFrame Blog",
  description:
    "Tips, guides, and updates from GainFrame — the AI-powered progress photo app for gym-goers.",
  url: "https://gainframe.app/blog/",
  isPartOf: {
    "@type": "WebSite",
    name: "GainFrame",
    url: "https://gainframe.app",
  },
};

export default async function BlogPage() {
  const bodyHtml = await fs.readFile(
    path.join(process.cwd(), "lib", "_extracted", "blog-body.html"),
    "utf8",
  );

  return (
    <>
      <BlogFonts />
      <link rel="stylesheet" href="/styles/blog-index-page.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BlogScrollReveal />
      <div className="blog-index-page">
        <BlogNav />
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>
    </>
  );
}
