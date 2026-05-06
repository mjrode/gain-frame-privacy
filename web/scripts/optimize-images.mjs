#!/usr/bin/env node
// Walks selected asset folders and emits .webp siblings for any .png / .jpg /
// .jpeg that doesn't already have one. Idempotent — safe to run on every build.
//
// Run with WEBP_FORCE=1 to re-encode existing .webp outputs.
// Run with WEBP_DRY=1 to list what would change without writing.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DOCS_ROOT = path.join(REPO_ROOT, "docs");

// Paths are relative to docs/ — every served public asset lives under there.
const TARGETS = [
  "assets/tiktok/comic",
  "assets/misc-images",
  "assets/before-after",
  "assets/bf-precision",
  "assets/gainframe-guy",
  "assets/blog-covers",
  "assets/deep-dive-compare",
  "assets/deep-dive-single-updated",
  "assets/GF-Promo",
  "assets/shared",
  "assets/team",
  "assets/og-images",
  "app-screenshots",
];

const RASTER = new Set([".png", ".jpg", ".jpeg"]);
const QUALITY = 80;
const FORCE = process.env.WEBP_FORCE === "1";
const DRY = process.env.WEBP_DRY === "1";
const CONCURRENCY = Number(process.env.WEBP_CONCURRENCY) || 8;

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function convert(srcPath) {
  const ext = path.extname(srcPath).toLowerCase();
  if (!RASTER.has(ext)) return { skipped: true };

  const webpPath = srcPath.slice(0, -ext.length) + ".webp";

  const webpExists = await fileExists(webpPath);
  if (!FORCE && webpExists) {
    return { skipped: true };
  }

  const srcStat = await fs.stat(srcPath);

  if (DRY) {
    return { converted: true, srcSize: srcStat.size, dstSize: 0, webpPath };
  }

  await sharp(srcPath, { failOn: "error" })
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(webpPath);

  const dstStat = await fs.stat(webpPath);
  return {
    converted: true,
    srcSize: srcStat.size,
    dstSize: dstStat.size,
    webpPath,
  };
}

async function processInBatches(items, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  const allFiles = [];
  for (const target of TARGETS) {
    const dir = path.join(DOCS_ROOT, target);
    for await (const file of walk(dir)) allFiles.push(file);
  }

  const candidates = allFiles.filter((f) =>
    RASTER.has(path.extname(f).toLowerCase()),
  );

  const results = await processInBatches(candidates, async (f) => {
    try {
      const r = await convert(f);
      return { file: f, ...r };
    } catch (err) {
      return { file: f, error: err.message };
    }
  });

  let converted = 0;
  let skipped = 0;
  let errors = 0;
  let srcBytes = 0;
  let dstBytes = 0;
  for (const r of results) {
    if (r.error) {
      errors++;
      console.error(`  ✗ ${path.relative(REPO_ROOT, r.file)}: ${r.error}`);
    } else if (r.converted) {
      converted++;
      srcBytes += r.srcSize;
      dstBytes += r.dstSize;
    } else if (r.skipped) {
      skipped++;
    }
  }

  const fmt = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
  console.log(
    `[optimize-images] converted=${converted} skipped=${skipped} errors=${errors}` +
      (converted
        ? ` | ${fmt(srcBytes)} → ${fmt(dstBytes)} (${(((srcBytes - dstBytes) / srcBytes) * 100).toFixed(0)}% smaller)`
        : ""),
  );

  if (errors) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
