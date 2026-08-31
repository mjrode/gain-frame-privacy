import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArchive from "@/components/BlogArchive";
import { getBlogPageCount, loadBlogIndex } from "@/lib/blog-archive";
import { SITE } from "@/lib/site";

type BlogArchivePageProps = {
  params: Promise<{ page: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const pageCount = getBlogPageCount(await loadBlogIndex());
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

function parsePage(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 2 ? page : null;
}

export async function generateMetadata({
  params,
}: BlogArchivePageProps): Promise<Metadata> {
  const page = parsePage((await params).page);
  if (!page) return {};

  const title = `GainFrame Blog — Page ${page}`;
  const description =
    "Browse more GainFrame guides on progress photos, body composition, training, and building a better physique.";
  const url = `${SITE.url}/blog/page/${page}/`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/page/${page}/` },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "GainFrame",
      images: [{ url: SITE.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE.ogImage],
    },
  };
}

export default async function BlogArchivePage({ params }: BlogArchivePageProps) {
  const page = parsePage((await params).page);
  if (!page) notFound();

  const pageCount = getBlogPageCount(await loadBlogIndex());
  if (page > pageCount) notFound();

  return <BlogArchive page={page} />;
}
