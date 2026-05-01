#!/usr/bin/env node
// Walks the web/ project + extracted artifacts for asset references,
// then diffs against docs/ to find orphans (unused) and broken references.
//
// Run: node scripts/audit-assets.mjs

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const webDir = path.join(repoRoot, "web");
const docsDir = path.join(repoRoot, "docs");

// File types that may contain asset references
const SOURCE_EXTS = new Set([
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
  ".html",
  ".css",
  ".json",
  ".md",
  ".mdx",
  ".webmanifest",
  ".xml",
  ".txt",
]);

// Asset path types we want to track (under docs/ tree)
const ASSET_ROOTS = ["assets", "app-screenshots", "blog", "favicon"];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "out",
  ".git",
  "_extracted", // we read this separately so we don't grep our own JSON
  // The public/blog symlink resolves to docs/blog — those legacy HTML files
  // reference assets (e.g. shared-footer.js) that are not used by the new
  // Next routes. Scanning them would inflate the "referenced" set with
  // legacy-only refs.
  "blog",
]);
const SKIP_FILES = new Set([
  "asset-audit-report.json",
]);

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, files);
    } else if (e.isFile()) {
      files.push(full);
    } else if (e.isSymbolicLink()) {
      // resolve symlinks but don't recurse into the target if it's another part
      // of the docs tree we'll walk separately
      try {
        const s = await stat(full);
        if (s.isDirectory()) await walk(full, files);
        else files.push(full);
      } catch {
        // dangling symlink — skip
      }
    }
  }
  return files;
}

async function walkPhysical(dir, files = []) {
  // Only physical files. No symlink traversal.
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walkPhysical(full, files);
    } else if (e.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function normalizePath(raw) {
  // Strip query, fragment, https://gainframe.app prefix, leading "./"
  let p = raw.trim();
  p = p.replace(/^https?:\/\/gainframe\.app/, "");
  p = p.split("?")[0].split("#")[0];
  if (p.startsWith("./")) p = p.slice(1);
  if (!p.startsWith("/")) return null;
  // ignore obviously non-asset paths (api, mailto, etc. dropped earlier)
  if (/^\/(blog|tools|comics|about|privacy|api|_next|sitemap|robots)\b/.test(p))
    return null;
  return p;
}

const REFERENCE_RE =
  /["'`(]\s*((?:\/|https?:\/\/gainframe\.app\/)[\w./@-]+\.[A-Za-z0-9]{2,5})/g;

// Match relative asset paths inside extracted blog post bodies.
// e.g. src="assets/cover.webp" — resolves against /blog/<slug>/
const RELATIVE_RE = /\b(?:src|href|poster)\s*=\s*["']([\w./-]+\.[A-Za-z0-9]{2,5})["']/g;

async function collectReferences() {
  // Collect references from web/ source + extracted artifacts
  const sources = await walk(webDir);
  const filtered = sources.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return SOURCE_EXTS.has(ext) && !SKIP_FILES.has(path.basename(f));
  });

  // Also scan extracted blog-post body HTML — these are skipped above
  // because _extracted is in SKIP_DIRS. Read them explicitly so we can
  // correctly resolve their post-relative `assets/...` paths.
  const extractedBlogDir = path.join(
    webDir,
    "lib",
    "_extracted",
    "blog-posts",
  );
  let extractedBlogFiles = [];
  if (existsSync(extractedBlogDir)) {
    extractedBlogFiles = (await readdir(extractedBlogDir))
      .filter((n) => n.endsWith("-body.html"))
      .map((n) => path.join(extractedBlogDir, n));
  }

  const refs = new Set();
  const fileRefs = {};

  // 1) Absolute references everywhere in web/
  for (const file of filtered) {
    let content;
    try {
      content = await readFile(file, "utf8");
    } catch {
      continue;
    }
    let m;
    REFERENCE_RE.lastIndex = 0;
    while ((m = REFERENCE_RE.exec(content))) {
      const p = normalizePath(m[1]);
      if (!p) continue;
      const top = p.split("/")[1];
      if (!ASSET_ROOTS.includes(top) && p !== "/favicon.ico") continue;
      refs.add(p);
      const rel = path.relative(repoRoot, file);
      (fileRefs[p] ||= []).push(rel);
    }
  }

  // 2) Per-post-relative references in extracted blog post bodies.
  //    Each file is named <slug>-body.html; relative `assets/foo.png` resolves
  //    to /blog/<slug>/assets/foo.png.
  for (const file of extractedBlogFiles) {
    const slug = path
      .basename(file)
      .replace(/-body\.html$/, "");
    let content;
    try {
      content = await readFile(file, "utf8");
    } catch {
      continue;
    }
    let m;
    RELATIVE_RE.lastIndex = 0;
    while ((m = RELATIVE_RE.exec(content))) {
      let p = m[1];
      if (p.startsWith("/") || /^https?:/.test(p)) continue; // already abs
      if (p.startsWith("./")) p = p.slice(2);
      if (p.startsWith("../")) continue; // unusual; ignore for now
      // Drop query/fragment
      p = p.split("?")[0].split("#")[0];
      const abs = `/blog/${slug}/${p}`;
      refs.add(abs);
      (fileRefs[abs] ||= []).push(
        path.relative(repoRoot, file),
      );
    }
  }

  return {
    refs,
    fileRefs,
    scanned: filtered.length + extractedBlogFiles.length,
  };
}

async function collectDocsAssets() {
  // Walk physical files under docs/<asset roots>
  const out = [];
  for (const root of ASSET_ROOTS) {
    const dir = path.join(docsDir, root);
    if (!existsSync(dir)) continue;
    const files = await walkPhysical(dir);
    for (const f of files) {
      const rel = "/" + path.relative(docsDir, f);
      const s = statSync(f);
      out.push({ path: rel, size: s.size, full: f });
    }
  }
  // single-file assets at docs root that may be referenced
  for (const f of ["favicon.ico", "site.webmanifest"]) {
    const full = path.join(docsDir, f);
    if (existsSync(full)) {
      const s = statSync(full);
      out.push({ path: "/" + f, size: s.size, full });
    }
  }
  return out;
}

function fmtBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
  return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

function categoryOf(p) {
  const parts = p.split("/").filter(Boolean);
  if (parts[0] === "assets" && parts[1]) return `/assets/${parts[1]}`;
  if (parts[0] === "blog" && parts[1]) return `/blog/${parts[1]}`;
  if (parts[0] === "app-screenshots" && parts[1])
    return `/app-screenshots/${parts[1]}`;
  return "/" + parts[0];
}

async function main() {
  console.log("Scanning web/ for asset references…");
  const { refs, fileRefs, scanned } = await collectReferences();
  console.log(`  scanned ${scanned} source files`);
  console.log(`  found ${refs.size} unique referenced paths`);

  console.log("Walking docs/ for physical assets…");
  const assets = await collectDocsAssets();
  console.log(`  found ${assets.length} asset files`);

  const totalSize = assets.reduce((a, b) => a + b.size, 0);
  console.log(`  total size: ${fmtBytes(totalSize)}\n`);

  // Mark referenced
  const refSet = refs;
  const referenced = [];
  const orphans = [];
  for (const a of assets) {
    if (refSet.has(a.path)) referenced.push(a);
    else orphans.push(a);
  }

  // Broken refs: paths in source that don't exist on disk
  const presentSet = new Set(assets.map((a) => a.path));
  const broken = [...refs].filter((r) => !presentSet.has(r));

  // ---- SUMMARY ----
  const refSize = referenced.reduce((a, b) => a + b.size, 0);
  const orphSize = orphans.reduce((a, b) => a + b.size, 0);

  console.log("=".repeat(64));
  console.log("SUMMARY");
  console.log("=".repeat(64));
  console.log(
    `Referenced:   ${referenced.length.toString().padStart(5)} files   ${fmtBytes(refSize)}`,
  );
  console.log(
    `Orphans:      ${orphans.length.toString().padStart(5)} files   ${fmtBytes(orphSize)}   (${((orphSize / totalSize) * 100).toFixed(1)}% of total)`,
  );
  console.log(
    `Broken refs:  ${broken.length.toString().padStart(5)} (referenced but file missing)`,
  );

  // ---- ORPHANS BY CATEGORY ----
  console.log("\n" + "=".repeat(64));
  console.log("ORPHANS BY CATEGORY (top sources of waste)");
  console.log("=".repeat(64));
  const byCat = new Map();
  for (const o of orphans) {
    const c = categoryOf(o.path);
    const v = byCat.get(c) || { count: 0, size: 0 };
    v.count++;
    v.size += o.size;
    byCat.set(c, v);
  }
  const sortedCats = [...byCat.entries()].sort((a, b) => b[1].size - a[1].size);
  for (const [cat, v] of sortedCats.slice(0, 25)) {
    console.log(
      `${fmtBytes(v.size).padStart(10)}   ${v.count.toString().padStart(5)} files   ${cat}`,
    );
  }

  // ---- TOP 25 LARGEST ORPHANS ----
  console.log("\n" + "=".repeat(64));
  console.log("TOP 25 LARGEST ORPHAN FILES");
  console.log("=".repeat(64));
  const topOrphans = [...orphans].sort((a, b) => b.size - a.size).slice(0, 25);
  for (const o of topOrphans) {
    console.log(`${fmtBytes(o.size).padStart(10)}   ${o.path}`);
  }

  // ---- BROKEN REFS ----
  if (broken.length) {
    console.log("\n" + "=".repeat(64));
    console.log("BROKEN REFERENCES (source mentions, file missing)");
    console.log("=".repeat(64));
    for (const r of broken.slice(0, 30)) {
      const sources = (fileRefs[r] || []).slice(0, 2).join(", ");
      console.log(`  ${r}\n    referenced in: ${sources}`);
    }
    if (broken.length > 30) console.log(`  …and ${broken.length - 30} more`);
  }

  // ---- WRITE ARTIFACT ----
  const report = {
    summary: {
      scannedSourceFiles: scanned,
      uniqueReferences: refs.size,
      assetFiles: assets.length,
      totalSize,
      referencedCount: referenced.length,
      referencedSize: refSize,
      orphanCount: orphans.length,
      orphanSize: orphSize,
      brokenRefs: broken.length,
    },
    orphansByCategory: sortedCats.map(([cat, v]) => ({
      category: cat,
      count: v.count,
      size: v.size,
    })),
    largestOrphans: topOrphans.map((o) => ({ path: o.path, size: o.size })),
    brokenReferences: broken.slice(0, 100),
  };
  const reportPath = path.join(__dirname, "asset-audit-report.json");
  await (await import("node:fs/promises")).writeFile(
    reportPath,
    JSON.stringify(report, null, 2),
  );
  console.log(
    `\nDetailed report written to ${path.relative(repoRoot, reportPath)}`,
  );
}

await main();
