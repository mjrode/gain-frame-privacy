import type { Metadata } from "next";
import BlogArchive from "@/components/BlogArchive";
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

export default async function BlogPage() {
  return <BlogArchive page={1} />;
}
