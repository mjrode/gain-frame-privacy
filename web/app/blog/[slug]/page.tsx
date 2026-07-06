import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import BlogNav from "@/components/BlogNav";
import BlogFonts from "@/components/BlogFonts";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import AuthorByline from "@/components/AuthorByline";
import ByLine from "@/components/ByLine";
import PostTable from "@/components/PostTable";

// Markdown pipe tables (GFM) get the same styling as hand-written
// <table className="post-table"> markup — without this mapping they render
// unstyled (and without remark-gfm they don't render as tables at all).
const mdxComponents = {
  PostTable,
  table: (props: React.ComponentPropsWithoutRef<"table">) => (
    <div className="post-table-wrapper">
      <table className="post-table" {...props} />
    </div>
  ),
};

type PostFrontmatter = {
  title?: string;
  description?: string;
  slug?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumbCategory?: string;
  displayCategory?: string;
  displayDate?: string;
  readTime?: string;
  subtitle?: string;
  coverImage?: string;
  coverAlt?: string;
  schemas?: unknown[];
  customStyles?: string;
};

const contentDir = () => path.join(process.cwd(), "content", "blog");

async function getSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(contentDir());
    return files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, ""))
      .sort();
  } catch {
    return [];
  }
}

async function loadPost(
  slug: string,
): Promise<{ source: string } | null> {
  const file = path.join(contentDir(), `${slug}.mdx`);
  try {
    const source = await fs.readFile(file, "utf8");
    return { source };
  } catch {
    return null;
  }
}

// Resolve post-relative cover image paths to absolute URL under /blog/<slug>/
function resolveCover(slug: string, p?: string): string | undefined {
  if (!p) return undefined;
  if (/^https?:\/\//.test(p) || p.startsWith("/")) return p;
  return `/blog/${slug}/${p}`;
}

// Two header layouts:
//   Layout B (when subtitle present): post-meta → h1 → post-subtitle → hero
//   Layout A (default): breadcrumb → h1 → post-meta → hero
function PostHeader({
  frontmatter,
  cover,
}: {
  frontmatter: PostFrontmatter;
  cover?: string;
}) {
  const meta =
    frontmatter.displayCategory ||
    frontmatter.displayDate ||
    frontmatter.readTime ? (
      <div className="post-meta">
        {frontmatter.displayCategory ? (
          <span className="post-category">{frontmatter.displayCategory}</span>
        ) : null}
        {frontmatter.displayDate ? (
          <span className="post-date">{frontmatter.displayDate}</span>
        ) : null}
        {frontmatter.readTime ? (
          <span className="post-read-time">{frontmatter.readTime}</span>
        ) : null}
      </div>
    ) : null;

  const heroImage = cover ? (
    <div className="post-hero-image">
      <img
        src={cover}
        alt={frontmatter.coverAlt || frontmatter.title || ""}
        loading="eager"
      />
    </div>
  ) : null;

  if (frontmatter.subtitle) {
    // Layout B
    return (
      <header className="post-header">
        {meta}
        {frontmatter.title ? (
          <h1 className="post-title">{frontmatter.title}</h1>
        ) : null}
        <p className="post-subtitle">{frontmatter.subtitle}</p>
        {heroImage}
      </header>
    );
  }

  // Layout A
  return (
    <header className="post-header">
      {frontmatter.breadcrumbCategory ? (
        <div className="post-breadcrumb">
          <Link href="/blog/">Blog</Link>
          <span> › </span>
          <span>{frontmatter.breadcrumbCategory}</span>
        </div>
      ) : null}
      {frontmatter.title ? <h1>{frontmatter.title}</h1> : null}
      {meta}
      {heroImage}
    </header>
  );
}

export async function generateStaticParams() {
  const slugs = await getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  const { frontmatter } = await compileMDX<PostFrontmatter>({
    source: post.source,
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [[remarkGfm, { singleTilde: false }]] }, scope: {}, blockJS: false },
  });
  const fm = frontmatter;
  return {
    // bare string lets the layout's "%s | GainFrame" template apply
    title: fm.title,
    description: fm.description,
    alternates: { canonical: `/blog/${slug}/` },
    openGraph: {
      title: fm.ogTitle,
      description: fm.ogDescription,
      url: fm.canonical,
      type: "article",
      siteName: "GainFrame",
      images: fm.ogImage ? [{ url: fm.ogImage }] : undefined,
      ...(fm.datePublished ? { publishedTime: fm.datePublished } : {}),
      ...(fm.dateModified ? { modifiedTime: fm.dateModified } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fm.twitterTitle,
      description: fm.twitterDescription,
      images: fm.twitterImage ? [fm.twitterImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const { content, frontmatter } = await compileMDX<PostFrontmatter>({
    source: post.source,
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [[remarkGfm, { singleTilde: false }]] }, scope: {}, blockJS: false },
    components: mdxComponents,
  });

  const cover = resolveCover(slug, frontmatter.coverImage);

  return (
    <>
      <BlogFonts />
      {(frontmatter.schemas || []).map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BlogNav />
      <BlogScrollReveal />
      {frontmatter.customStyles ? (
        <style dangerouslySetInnerHTML={{ __html: frontmatter.customStyles }} />
      ) : null}

      <div className="post-container">
        <PostHeader frontmatter={frontmatter} cover={cover} />

        <ByLine displayDate={frontmatter.displayDate} />

        <article className="post-body">{content}</article>

        <AuthorByline />
      </div>
    </>
  );
}
