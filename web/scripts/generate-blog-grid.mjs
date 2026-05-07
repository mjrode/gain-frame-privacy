#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(WEB_DIR, "content", "blog");
const TARGET = path.join(WEB_DIR, "lib", "_extracted", "blog-body.html");
const START_MARKER = "<!-- BLOG_GRID:START -->";
const END_MARKER = "<!-- BLOG_GRID:END -->";

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

async function loadPosts() {
  const entries = await fs.readdir(POSTS_DIR);
  const mdxFiles = entries.filter((f) => f.endsWith(".mdx"));

  const posts = await Promise.all(
    mdxFiles.map(async (file) => {
      const raw = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
      const { data } = matter(raw);
      const slug = data.slug || file.replace(/\.mdx$/, "");
      return {
        slug,
        title: data.title || slug,
        category: data.displayCategory || data.breadcrumbCategory || "Article",
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
  return `                <a href="/blog/${post.slug}/" class="blog-card scroll-reveal">
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

async function main() {
  const posts = await loadPosts();
  const cards = posts.map((post, i) => renderCard(post, i)).join("\n\n");
  const block = `${START_MARKER}\n${cards}\n                ${END_MARKER}`;

  const html = await fs.readFile(TARGET, "utf8");
  const startIdx = html.indexOf(START_MARKER);
  const endIdx = html.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `Markers not found in ${TARGET}. Expected ${START_MARKER} and ${END_MARKER}.`,
    );
  }

  const before = html.slice(0, startIdx);
  const after = html.slice(endIdx + END_MARKER.length);
  const next = `${before}${block}${after}`;

  await fs.writeFile(TARGET, next, "utf8");
  console.log(
    `[blog-grid] Wrote ${posts.length} cards to ${path.relative(WEB_DIR, TARGET)}`,
  );
}

main().catch((err) => {
  console.error("[blog-grid] Failed:", err.message);
  process.exit(1);
});
