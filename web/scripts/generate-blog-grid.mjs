#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(WEB_DIR, "content", "blog");
const TARGET = path.join(WEB_DIR, "lib", "_extracted", "blog-body.html");
const GRID_START = "<!-- BLOG_GRID:START -->";
const GRID_END = "<!-- BLOG_GRID:END -->";
const FILTER_START = "<!-- BLOG_FILTER:START -->";
const FILTER_END = "<!-- BLOG_FILTER:END -->";

// Canonical category names. Frontmatter `displayCategory` values drifted over
// time (casing + singular/plural variants), which would otherwise produce
// duplicate filter chips like "Body Composition" and "BODY COMPOSITION".
// Keyed by category.trim().toLowerCase(); value is the canonical display name.
const CATEGORY_CANON = {
  "body composition": "Body Composition",
  "guide": "Guide",
  "guides": "Guide",
  "founder story": "Founder Story",
  "deep dive": "Deep Dive",
  "app reviews": "App Reviews",
  "app review": "App Reviews",
  "training": "Training",
  "roundup": "Roundup",
  "app roundup": "Roundup",
  "product update": "Product Update",
  "product": "Product Update",
  "fitness apps": "Fitness Apps",
  "app comparison": "Comparison",
  "comparison": "Comparison",
  "how-to": "How-To",
  "science": "Science",
  "progress photos": "Progress Photos",
  "integration": "Integration",
  "feature guide": "Feature Guide",
  "community": "Community",
  "case study": "Case Study",
  "announcement": "Announcement",
};

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const titleCase = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Map a raw frontmatter category to its canonical display name.
function canonicalCategory(raw) {
  const key = String(raw || "").trim().toLowerCase();
  return CATEGORY_CANON[key] || titleCase(raw) || "Article";
}

// URL-safe slug used for the ?tag= query param and data-category attribute.
const tagSlug = (name = "") =>
  String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function loadPosts() {
  const entries = await fs.readdir(POSTS_DIR);
  const mdxFiles = entries.filter((f) => f.endsWith(".mdx"));

  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const raw = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
      const { data } = matter(raw);
      const slug = data.slug || file.replace(/\.mdx$/, "");
      const category = canonicalCategory(
        data.displayCategory || data.breadcrumbCategory || "Article",
      );
      return {
        slug,
        title: data.title || slug,
        category,
        categorySlug: tagSlug(category),
        displayDate: data.displayDate || "",
        sortDate: data.displayDate ? new Date(data.displayDate).getTime() : 0,
        cardText: data.subtitle || data.description || "",
        coverAlt: data.coverAlt || data.description || data.title || slug,
      };
    }),
  );

  posts.sort((a, b) => b.sortDate - a.sortDate);
  return posts;
}

function renderCard(post, index) {
  const loadingAttr = index < 3 ? "eager" : "lazy";
  return `                <a href="/blog/${post.slug}/" class="blog-card scroll-reveal" data-category="${escapeHtml(post.categorySlug)}">
                    <div class="blog-card-image">
                        <img src="/blog/${post.slug}/assets/cover.webp"
                            alt="${escapeHtml(post.coverAlt)}"
                            width="800" height="500"
                            loading="${loadingAttr}"
                            decoding="async">
                    </div>
                    <div class="blog-card-content">
                        <div class="post-meta">
                            <span class="post-category">${escapeHtml(post.category)}</span>
                            <span class="post-date">${escapeHtml(post.displayDate)}</span>
                        </div>
                        <h3>${escapeHtml(post.title)}</h3>
                        <p>${escapeHtml(post.cardText)}</p>
                    </div>
                </a>`;
}

function renderFilter(posts) {
  // Tally posts per canonical category.
  const counts = new Map();
  for (const p of posts) {
    const entry = counts.get(p.categorySlug) || { name: p.category, count: 0 };
    entry.count += 1;
    counts.set(p.categorySlug, entry);
  }

  // Most-used categories first, then alphabetical for ties.
  const ordered = [...counts.entries()].sort((a, b) => {
    if (b[1].count !== a[1].count) return b[1].count - a[1].count;
    return a[1].name.localeCompare(b[1].name);
  });

  const chip = (slug, label, count, active) =>
    `                <button type="button" class="blog-filter-chip${active ? " is-active" : ""}" data-tag="${escapeHtml(slug)}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(label)}<span class="blog-filter-count">${count}</span></button>`;

  const chips = [
    chip("all", "All", posts.length, true),
    ...ordered.map(([slug, { name, count }]) => chip(slug, name, count, false)),
  ].join("\n");

  return `<div class="blog-filter" role="group" aria-label="Filter posts by topic">
${chips}
            </div>
            <p class="blog-filter-status" data-blog-filter-status aria-live="polite"></p>`;
}

async function main() {
  const posts = await loadPosts();
  const cards = posts.map((post, i) => renderCard(post, i)).join("\n\n");
  const gridBlock = `${GRID_START}\n${cards}\n                ${GRID_END}`;
  const filterBlock = `${FILTER_START}\n            ${renderFilter(posts)}\n            ${FILTER_END}`;

  let html = await fs.readFile(TARGET, "utf8");

  html = replaceBetween(html, GRID_START, GRID_END, gridBlock);
  html = replaceBetween(html, FILTER_START, FILTER_END, filterBlock);

  await fs.writeFile(TARGET, html, "utf8");
  console.log(
    `[blog-grid] Wrote ${posts.length} cards + filter bar to ${path.relative(WEB_DIR, TARGET)}`,
  );
}

function replaceBetween(html, startMarker, endMarker, block) {
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Markers not found in ${TARGET}. Expected ${startMarker} and ${endMarker}.`,
    );
  }
  return html.slice(0, startIdx) + block + html.slice(endIdx + endMarker.length);
}

main().catch((err) => {
  console.error("[blog-grid] Failed:", err.message);
  process.exit(1);
});
