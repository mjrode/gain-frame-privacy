#!/usr/bin/env node
// Extracts each docs/blog/<slug>/index.html into:
//   web/lib/_extracted/blog-posts/<slug>-meta.json    (title, desc, canonical, og, twitter, schemas[])
//   web/lib/_extracted/blog-posts/<slug>-body.html    (article body, scripts/byline-stub stripped, asset paths rewritten)

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const blogDir = path.join(repoRoot, "docs", "blog");
const extractedDir = path.join(__dirname, "..", "lib", "_extracted", "blog-posts");

function findAttr(re, html) {
  const m = re.exec(html);
  return m ? m[1].trim() : undefined;
}

function pickMeta(html, name) {
  return findAttr(
    new RegExp(
      `<meta\\s+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`,
      "is",
    ),
    html,
  );
}

function extractAll(re, html) {
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

async function processOne(slug) {
  const file = path.join(blogDir, slug, "index.html");
  if (!existsSync(file)) return null;
  const html = await readFile(file, "utf8");

  const headMatch = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html);
  const head = headMatch ? headMatch[1] : "";

  const title = findAttr(/<title>([\s\S]*?)<\/title>/i, head);
  const description = pickMeta(head, "description");
  const canonical = findAttr(
    /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
    head,
  );
  const ogTitle = pickMeta(head, "og:title");
  const ogDescription = pickMeta(head, "og:description");
  const ogImage = pickMeta(head, "og:image");
  const ogType = pickMeta(head, "og:type") || "article";
  const twitterTitle = pickMeta(head, "twitter:title");
  const twitterDescription = pickMeta(head, "twitter:description");
  const twitterImage = pickMeta(head, "twitter:image");

  // JSON-LD schemas — pull all
  const schemas = extractAll(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    head,
  )
    .map((s) => {
      try {
        return JSON.parse(s.trim());
      } catch (e) {
        console.warn(`[${slug}] JSON-LD parse failed:`, e.message);
        return null;
      }
    })
    .filter(Boolean);

  // Pull date from Article schema if present
  const articleSchema = schemas.find(
    (s) => s["@type"] === "Article" || s["@type"] === "BlogPosting",
  );
  const datePublished = articleSchema?.datePublished;
  const dateModified = articleSchema?.dateModified;
  const articleImage = articleSchema?.image;

  // ---- BODY ----
  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
  let body = bodyMatch ? bodyMatch[1] : "";

  // Strip ALL inline scripts (gtag, shared-nav stub, scroll-reveal, TikTok, CF, etc.)
  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

  // Remove the data-site-nav placeholder div and similar shared-script triggers
  body = body
    .replace(/<div\s+data-site-nav><\/div>/gi, "")
    .replace(/<div\s+data-newsletter-signup><\/div>/gi, "")
    .replace(/<div\s+data-email-capture><\/div>/gi, "");

  // Asset path rewrites:
  //   ../../assets/...  → /assets/...    (root-level assets)
  //   ../../favicon...  → /favicon...
  //   ../../styles...   → /styles...
  //   ../foo            → /blog/foo      (sibling blog post, jump up one level)
  //   ./foo             → /blog/<slug>/foo
  // POST-RELATIVE PATHS like `assets/cover.webp` are LEFT RELATIVE — they resolve
  // correctly against /blog/<slug>/ via the public/blog symlink.
  body = body
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\/assets\//g, `$1="/assets/`)
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\/favicon/g, `$1="/favicon`)
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\/styles/g, `$1="/styles`)
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\//g, `$1="/`)
    .replace(/(\b(?:src|href))=["']\.\.\//g, `$1="/blog/`)
    .replace(/(\b(?:src|href))=["']\.\//g, `$1="/blog/${slug}/`);

  const meta = {
    slug,
    title,
    description,
    canonical: canonical || `https://gainframe.app/blog/${slug}/`,
    ogTitle: ogTitle || title,
    ogDescription: ogDescription || description,
    ogImage:
      ogImage ||
      articleImage ||
      "https://gainframe.app/assets/og-images/og-image.png",
    ogType,
    twitterTitle: twitterTitle || ogTitle || title,
    twitterDescription: twitterDescription || ogDescription || description,
    twitterImage: twitterImage || ogImage || articleImage,
    datePublished,
    dateModified,
    schemas,
  };

  await writeFile(
    path.join(extractedDir, `${slug}-meta.json`),
    JSON.stringify(meta, null, 2),
  );
  await writeFile(path.join(extractedDir, `${slug}-body.html`), body);

  return slug;
}

async function main() {
  const entries = await readdir(blogDir, { withFileTypes: true });
  const slugs = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const indexPath = path.join(blogDir, e.name, "index.html");
    if (existsSync(indexPath)) slugs.push(e.name);
  }
  slugs.sort();

  console.log("Processing", slugs.length, "blog posts…");
  const ok = [];
  const failed = [];
  for (const slug of slugs) {
    try {
      const r = await processOne(slug);
      if (r) ok.push(r);
    } catch (e) {
      failed.push({ slug, error: e.message });
    }
  }
  console.log(`OK: ${ok.length}  Failed: ${failed.length}`);
  if (failed.length) console.log("Failures:", failed);

  // Emit a slug index for use by the dynamic route
  await writeFile(
    path.join(extractedDir, "_slugs.json"),
    JSON.stringify(ok, null, 2),
  );
  console.log("Wrote _slugs.json with", ok.length, "entries");
}

await main();
