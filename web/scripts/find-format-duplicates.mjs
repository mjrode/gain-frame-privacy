#!/usr/bin/env node
// Identifies cases where docs/ has duplicate format pairs (e.g. foo.PNG and
// foo.webp side by side). The webp/jpg version is generally what's used by
// the site; the original PNG/MOV is dead weight.

import { readdir, stat } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const docsDir = path.join(repoRoot, "docs");

const ROOTS = ["assets", "app-screenshots", "blog"];
const PRUNE_EXTS = new Set([".PNG", ".png", ".MOV", ".mov", ".HEIC"]);
const KEEP_EXTS = new Set([".webp", ".jpg", ".jpeg"]);

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const e of entries) {
    if (e.name === ".DS_Store") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, files);
    else if (e.isFile()) files.push(full);
  }
  return files;
}

function fmtBytes(n) {
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
  return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

async function main() {
  const allFiles = [];
  for (const r of ROOTS) {
    const dir = path.join(docsDir, r);
    if (existsSync(dir)) await walk(dir, allFiles);
  }

  // Group by stem (path without extension)
  const groups = new Map();
  for (const f of allFiles) {
    const ext = path.extname(f);
    const stem = f.slice(0, -ext.length);
    const lc = stem.toLowerCase(); // foo.PNG and foo.webp share stem
    if (!groups.has(lc)) groups.set(lc, []);
    groups.get(lc).push({ full: f, ext, size: statSync(f).size });
  }

  const duplicates = [];
  for (const items of groups.values()) {
    if (items.length < 2) continue;
    const hasKept = items.some((i) => KEEP_EXTS.has(i.ext));
    const prunable = items.filter((i) => PRUNE_EXTS.has(i.ext));
    if (hasKept && prunable.length) {
      duplicates.push(...prunable);
    }
  }

  duplicates.sort((a, b) => b.size - a.size);

  const total = duplicates.reduce((a, b) => a + b.size, 0);

  console.log(
    `Found ${duplicates.length} prunable duplicate-format files (${fmtBytes(total)})`,
  );
  console.log("\nTOP 15 LARGEST PRUNABLE DUPLICATES:\n");
  for (const d of duplicates.slice(0, 15)) {
    const rel = "/" + path.relative(docsDir, d.full);
    console.log(`  ${fmtBytes(d.size).padStart(10)}  ${rel}`);
  }

  // Write a deletion plan
  const plan = duplicates.map((d) => ({
    path: "/" + path.relative(docsDir, d.full),
    size: d.size,
  }));
  const fs = await import("node:fs/promises");
  await fs.writeFile(
    path.join(__dirname, "format-duplicates.json"),
    JSON.stringify({ count: plan.length, totalBytes: total, files: plan }, null, 2),
  );
  console.log(
    `\nFull list written to scripts/format-duplicates.json (${plan.length} files)`,
  );
}

await main();
