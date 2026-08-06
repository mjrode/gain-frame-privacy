import type { MetadataRoute } from "next";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { SITE } from "@/lib/site";
import { COMICS_MANIFEST } from "@/lib/comics-manifest.mjs";

export const dynamic = "force-static";

type PostMeta = {
  slug: string;
  datePublished?: string;
  dateModified?: string;
};

const today = () => new Date().toISOString().slice(0, 10);

async function loadBlogPosts(): Promise<PostMeta[]> {
  const dir = path.join(process.cwd(), "content", "blog");
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));
  return Promise.all(
    mdxFiles.map(async (f) => {
      const slug = f.replace(/\.mdx$/, "");
      const raw = await fs.readFile(path.join(dir, f), "utf8");
      const { data } = matter(raw);
      const fmt = (v: unknown) =>
        v instanceof Date
          ? v.toISOString().slice(0, 10)
          : typeof v === "string"
            ? v
            : undefined;
      return {
        slug,
        datePublished: fmt(data.datePublished),
        dateModified: fmt(data.dateModified),
      };
    }),
  );
}

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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await loadBlogPosts();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE.url}/`,
      lastModified: today(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE.url}/blog/`,
      lastModified: today(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE.url}/about/`,
      lastModified: today(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/comics/`,
      lastModified: today(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/tools/`,
      lastModified: today(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/tools/body-fat-from-photo/`,
      lastModified: today(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/tools/body-visualizer/`,
      lastModified: today(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/tools/physique-rater/`,
      lastModified: today(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/tools/ai-body-transformation/`,
      lastModified: today(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE.url}/privacy/`,
      lastModified: today(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const calcEntries: MetadataRoute.Sitemap = CALC_SLUGS.map((slug) => ({
    url: `${SITE.url}/tools/${slug}/`,
    lastModified: today(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}/`,
    lastModified: post.dateModified || post.datePublished || today(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const comicEntries: MetadataRoute.Sitemap = (
    COMICS_MANIFEST as Array<{ slug: string; date: string }>
  ).map((comic) => ({
    url: `${SITE.url}/comics/${comic.slug}/`,
    lastModified: comic.date,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticEntries, ...calcEntries, ...blogEntries, ...comicEntries];
}
