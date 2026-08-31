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
const INDEX_TARGET = path.join(WEB_DIR, "public", "blog-index.json");
export const BLOG_PAGE_SIZE = 30;

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

export function renderCard(post, index) {
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

export function getBlogPageCount(totalPosts, pageSize = BLOG_PAGE_SIZE) {
  return Math.max(1, Math.ceil(totalPosts / pageSize));
}

export function getBlogPage(posts, page, pageSize = BLOG_PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return posts.slice(start, start + pageSize);
}

export function renderPagination(
  page,
  totalPosts,
  pageSize = BLOG_PAGE_SIZE,
) {
  const pageCount = getBlogPageCount(totalPosts, pageSize);
  if (pageCount <= 1) return "";

  const previousHref = page === 2 ? "/blog/" : `/blog/page/${page - 1}/`;
  const nextHref = `/blog/page/${page + 1}/`;
  const previous =
    page > 1
      ? `<a class="blog-pagination-link blog-pagination-link--previous" href="${previousHref}" rel="prev"><span aria-hidden="true">&larr;</span> Newer posts</a>`
      : '<span class="blog-pagination-spacer" aria-hidden="true"></span>';
  const next =
    page < pageCount
      ? `<a class="blog-pagination-link blog-pagination-link--next" href="${nextHref}" rel="next">Older posts <span aria-hidden="true">&rarr;</span></a>`
      : '<span class="blog-pagination-spacer" aria-hidden="true"></span>';

  return `<nav class="blog-pagination" aria-label="Blog archive pages">
                    ${previous}
                    <span class="blog-pagination-current" aria-current="page">Page ${page} of ${pageCount}</span>
                    ${next}
                </nav>`;
}

// Number of most-used categories surfaced as pills; the rest go in a dropdown.
const TOP_PILLS = 3;

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

  const top = ordered.slice(0, TOP_PILLS);
  const rest = ordered.slice(TOP_PILLS);

  const pill = (slug, label, count, active) =>
    `<button type="button" class="blog-filter-pill${active ? " is-active" : ""}" data-tag="${escapeHtml(slug)}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(label)}<span class="blog-filter-count">${count}</span></button>`;

  const pills = [
    pill("all", "All", posts.length, true),
    ...top.map(([slug, { name, count }]) => pill(slug, name, count, false)),
  ].join("\n                        ");

  // Remaining categories live in a native (styled) dropdown so the bar stays
  // compact. Each option still maps to a shareable ?tag= slug.
  const options = rest
    .map(
      ([slug, { name, count }]) =>
        `<option value="${escapeHtml(slug)}">${escapeHtml(name)} (${count})</option>`,
    )
    .join("\n                            ");

  const dropdown = rest.length
    ? `
                    <div class="blog-filter-more">
                        <select class="blog-filter-select" data-blog-filter-select aria-label="Filter by more topics">
                            <option value="">More topics…</option>
                            ${options}
                        </select>
                    </div>`
    : "";

  const initialEnd = Math.min(BLOG_PAGE_SIZE, posts.length);

  return `<div class="blog-filter" role="group" aria-label="Filter posts by topic">
                    <span class="blog-filter-label">Topics</span>
                    <div class="blog-filter-pills">
                        ${pills}
                    </div>${dropdown}
                </div>
            <p class="blog-filter-status" data-blog-filter-status aria-live="polite">Showing 1&ndash;${initialEnd} of ${posts.length} posts</p>`;
}

async function main() {
  const posts = await loadPosts();
  const indexPosts = posts.map((post, index) => ({
    categorySlug: post.categorySlug,
    html: renderCard(post, index),
  }));
  const firstPageCards = getBlogPage(indexPosts, 1)
    .map((post) => post.html)
    .join("\n\n");
  const pagination = renderPagination(1, posts.length);
  const gridBlock = `${GRID_START}\n${firstPageCards}\n\n                ${pagination}\n                ${GRID_END}`;
  const filterBlock = `${FILTER_START}\n            ${renderFilter(posts)}\n            ${FILTER_END}`;

  let html = await fs.readFile(TARGET, "utf8");

  html = replaceBetween(html, GRID_START, GRID_END, gridBlock);
  html = replaceBetween(html, FILTER_START, FILTER_END, filterBlock);

  await fs.writeFile(TARGET, html, "utf8");
  await fs.writeFile(
    INDEX_TARGET,
    `${JSON.stringify(
      {
        total: posts.length,
        pageSize: BLOG_PAGE_SIZE,
        posts: indexPosts,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(
    `[blog-grid] Wrote ${firstPageCards ? Math.min(BLOG_PAGE_SIZE, posts.length) : 0} initial cards + ${posts.length}-post deferred index`,
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

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((err) => {
    console.error("[blog-grid] Failed:", err.message);
    process.exit(1);
  });
}
