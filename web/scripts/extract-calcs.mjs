#!/usr/bin/env node
// Extracts each docs/tools/<slug>/index.html into:
//   web/lib/_extracted/calc/<slug>-meta.json    (title, desc, canonical, og, twitter, schemas[])
//   web/lib/_extracted/calc/<slug>-body.html    (body markup, scripts stripped)
//   web/lib/_extracted/calc/<slug>-scripts.js   (concatenated inline JS, ready to eval)
//   web/public/styles/calc/<slug>.css           (inline page styles)
//
// Run: node scripts/extract-calcs.mjs

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const toolsDir = path.join(repoRoot, "docs", "tools");
const extractedDir = path.join(__dirname, "..", "lib", "_extracted", "calc");
const stylesDir = path.join(__dirname, "..", "public", "styles", "calc");

function findAttr(re, html) {
  const m = re.exec(html);
  return m ? m[1].trim() : undefined;
}

function pick(html, name) {
  return findAttr(
    new RegExp(
      `<meta\\s+(?:name|property)=["']${name}["'][^>]*content=["']([^"']+)["']`,
      "i",
    ),
    html,
  );
}

function pickAlt(html, name) {
  // multi-line content attribute (description often wraps)
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
  const file = path.join(toolsDir, slug, "index.html");
  if (!existsSync(file)) return null;
  const html = await readFile(file, "utf8");

  // ---- HEAD ----
  const headMatch = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html);
  const head = headMatch ? headMatch[1] : "";

  const title = findAttr(/<title>([\s\S]*?)<\/title>/i, head);
  const description = pickAlt(head, "description");
  const canonical = findAttr(
    /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
    head,
  );
  const ogTitle = pick(head, "og:title");
  const ogDescription = pickAlt(head, "og:description");
  const ogImage = pick(head, "og:image");
  const twitterTitle = pick(head, "twitter:title");
  const twitterDescription = pickAlt(head, "twitter:description");

  // JSON-LD schemas
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

  // Inline <style> blocks
  const styleBlocks = extractAll(/<style[^>]*>([\s\S]*?)<\/style>/gi, head);
  const css = styleBlocks.join("\n\n/* --- next style block --- */\n\n");

  // ---- BODY ----
  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
  let body = bodyMatch ? bodyMatch[1] : "";

  // Pull out inline <script> blocks BEFORE stripping
  const scriptMatches = [];
  body = body.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (_full, attrs, content) => {
      // skip external <script src=...> (we don't want shared-nav.js, gtag, etc.)
      if (/\bsrc\s*=/.test(attrs)) return "";
      // skip JSON-LD ld+json type scripts
      if (/type=["']application\/ld\+json["']/.test(attrs)) return "";
      // skip TikTok/CF analytics (recognized by content keywords)
      const c = content.trim();
      if (/TiktokAnalyticsObject|cloudflareinsights/i.test(c)) return "";
      if (/googletagmanager|gtag/.test(c)) return "";
      scriptMatches.push(c);
      return ""; // remove from body
    },
  );

  // Remove the data-site-nav stub (our BlogNav replaces it)
  body = body
    .replace(/<div\s+data-site-nav><\/div>/gi, "")
    .replace(/<div\s+data-newsletter-signup><\/div>/gi, "")
    // make relative asset paths absolute (forms work universally)
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\/assets\//g, `$1="/assets/`)
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\/favicon/g, `$1="/favicon`)
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\/styles/g, `$1="/styles`)
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\/index\.html/g, `$1="/`)
    .replace(/(\b(?:src|href))=["']\.\.\/\.\.\//g, `$1="/`)
    .replace(/(\b(?:src|href))=["']\.\.\//g, `$1="/tools/`)
    .replace(/(\b(?:src|href))=["']\.\//g, `$1="/tools/${slug}/`)
    .replace(/(\b(?:src|href))=["']assets\//g, `$1="/tools/${slug}/assets/`);

  const scripts = scriptMatches.join("\n\n;//---next-script-block---\n\n");

  const meta = {
    slug,
    title,
    description,
    canonical: canonical || `https://gainframe.app/tools/${slug}/`,
    ogTitle: ogTitle || title,
    ogDescription: ogDescription || description,
    ogImage: ogImage || "https://gainframe.app/assets/gainframe-og-1200x630.png",
    twitterTitle: twitterTitle || ogTitle || title,
    twitterDescription: twitterDescription || ogDescription || description,
    schemas,
  };

  await writeFile(
    path.join(extractedDir, `${slug}-meta.json`),
    JSON.stringify(meta, null, 2),
  );
  await writeFile(path.join(extractedDir, `${slug}-body.html`), body);
  await writeFile(path.join(extractedDir, `${slug}-scripts.js`), scripts);
  await writeFile(path.join(stylesDir, `${slug}.css`), css);

  return slug;
}

async function main() {
  const entries = await readdir(toolsDir, { withFileTypes: true });
  const slugs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  console.log("Processing", slugs.length, "calculators…");
  const ok = [];
  for (const slug of slugs) {
    const r = await processOne(slug);
    if (r) ok.push(r);
  }
  console.log("Wrote", ok.length, "calculators:", ok.join(", "));
}

await main();
