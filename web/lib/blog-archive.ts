import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

const BODY_PATH = path.join(
  process.cwd(),
  "lib",
  "_extracted",
  "blog-body.html",
);
const INDEX_PATH = path.join(process.cwd(), "public", "blog-index.json");
const GRID_START = "<!-- BLOG_GRID:START -->";
const GRID_END = "<!-- BLOG_GRID:END -->";

export type BlogIndexPost = {
  categorySlug: string;
  html: string;
};

export type BlogIndex = {
  total: number;
  pageSize: number;
  posts: BlogIndexPost[];
};

function isBlogIndex(value: unknown): value is BlogIndex {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BlogIndex>;
  return (
    Number.isInteger(candidate.total) &&
    typeof candidate.pageSize === "number" &&
    candidate.pageSize > 0 &&
    Array.isArray(candidate.posts) &&
    candidate.posts.every(
      (post) =>
        post &&
        typeof post.categorySlug === "string" &&
        typeof post.html === "string",
    )
  );
}

export async function loadBlogIndex(): Promise<BlogIndex> {
  const raw = await fs.readFile(INDEX_PATH, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isBlogIndex(parsed)) {
    throw new Error(
      "Invalid blog index. Run `npm run build:blog-grid` to regenerate it.",
    );
  }
  return parsed;
}

export function getBlogPageCount(index: BlogIndex): number {
  return Math.max(1, Math.ceil(index.total / index.pageSize));
}

function renderPagination(page: number, pageCount: number): string {
  if (pageCount <= 1) return "";

  const previousHref = page === 2 ? "/blog/" : `/blog/page/${page - 1}/`;
  const previous =
    page > 1
      ? `<a class="blog-pagination-link blog-pagination-link--previous" href="${previousHref}" rel="prev"><span aria-hidden="true">&larr;</span> Newer posts</a>`
      : '<span class="blog-pagination-spacer" aria-hidden="true"></span>';
  const next =
    page < pageCount
      ? `<a class="blog-pagination-link blog-pagination-link--next" href="/blog/page/${page + 1}/" rel="next">Older posts <span aria-hidden="true">&rarr;</span></a>`
      : '<span class="blog-pagination-spacer" aria-hidden="true"></span>';

  return `<nav class="blog-pagination" aria-label="Blog archive pages">
                    ${previous}
                    <span class="blog-pagination-current" aria-current="page">Page ${page} of ${pageCount}</span>
                    ${next}
                </nav>`;
}

function replaceBetween(
  html: string,
  startMarker: string,
  endMarker: string,
  replacement: string,
): string {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Blog grid markers are missing or out of order.");
  }

  return html.slice(0, start) + replacement + html.slice(end + endMarker.length);
}

export async function renderBlogArchiveBody(page: number): Promise<string> {
  const [bodyHtml, index] = await Promise.all([
    fs.readFile(BODY_PATH, "utf8"),
    loadBlogIndex(),
  ]);
  const pageCount = getBlogPageCount(index);
  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    throw new RangeError(`Blog page ${page} is outside 1-${pageCount}.`);
  }

  const startIndex = (page - 1) * index.pageSize;
  const endIndex = Math.min(startIndex + index.pageSize, index.total);
  const cards = index.posts
    .slice(startIndex, endIndex)
    .map((post, pageIndex) =>
      post.html.replace(
        /loading="(?:eager|lazy)"/,
        `loading="${pageIndex < 3 ? "eager" : "lazy"}"`,
      )
    )
    .join("\n\n");
  const grid = `${GRID_START}\n${cards}\n\n                ${renderPagination(page, pageCount)}\n                ${GRID_END}`;
  const paginatedBody = replaceBetween(bodyHtml, GRID_START, GRID_END, grid);
  const status = `Showing ${startIndex + 1}&ndash;${endIndex} of ${index.total} posts`;

  return paginatedBody.replace(
    /(<p class="blog-filter-status" data-blog-filter-status aria-live="polite">)[\s\S]*?(<\/p>)/,
    `$1${status}$2`,
  );
}
