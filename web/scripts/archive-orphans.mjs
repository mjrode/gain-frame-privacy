#!/usr/bin/env node
// Moves prunable orphan files from docs/ into docs/_archive/ preserving the
// relative directory structure. Reversible: just `mv docs/_archive/<x> docs/<x>`.
//
// Pulls the prunable list from:
//   - scripts/format-duplicates.json (PNG/MOV files with webp siblings)
//   - hardcoded categorical orphans below (old screenshot dirs, etc.)

import { readFile, mkdir, rename, readdir, stat } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const docsDir = path.join(repoRoot, "docs");
const archiveDir = path.join(docsDir, "_archive");

// Categorical orphans (entire dirs / specific files)
const ORPHAN_PATHS = [
  "/app-screenshots/1.0.20",
  "/app-screenshots/1.1",
  "/app-screenshots/1.19",
  "/app-screenshots/1.2",
  "/app-screenshots/1.2-black-red",
  "/app-screenshots/1.22-ios",
  "/app-screenshots/1.3",
  "/app-screenshots/listing-slots",
  "/app-screenshots/1.21/screen-recording-1-21.MP4",
  "/assets/tiktok/comic/stop-program-hopping",
];

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function dirSize(p) {
  let total = 0;
  try {
    const s = await stat(p);
    if (s.isFile()) return s.size;
    if (!s.isDirectory()) return 0;
  } catch {
    return 0;
  }
  const entries = await readdir(p, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(p, e.name);
    if (e.isDirectory()) total += await dirSize(full);
    else if (e.isFile()) total += statSync(full).size;
  }
  return total;
}

async function archiveOne(srcRel) {
  const src = path.join(docsDir, srcRel);
  const dest = path.join(archiveDir, srcRel.replace(/^\/+/, ""));
  if (!(await fileExists(src))) {
    return { srcRel, status: "missing", size: 0 };
  }
  const size = await dirSize(src);
  await mkdir(path.dirname(dest), { recursive: true });
  // If dest already exists (re-run), skip silently
  if (await fileExists(dest)) {
    return { srcRel, status: "already-archived", size };
  }
  await rename(src, dest);
  return { srcRel, status: "moved", size };
}

function fmtBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
  return (n / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

async function main() {
  await mkdir(archiveDir, { recursive: true });

  // Load format-duplicates.json
  const dupesPath = path.join(__dirname, "format-duplicates.json");
  const dupes = JSON.parse(await readFile(dupesPath, "utf8"));
  const dupePaths = dupes.files.map((f) => f.path);

  console.log("=".repeat(64));
  console.log("ARCHIVING TO docs/_archive/");
  console.log("=".repeat(64));

  const allSrc = [...dupePaths, ...ORPHAN_PATHS];
  let totalMoved = 0;
  let movedCount = 0;
  let alreadyCount = 0;
  let missingCount = 0;

  for (const src of allSrc) {
    const r = await archiveOne(src);
    if (r.status === "moved") {
      movedCount++;
      totalMoved += r.size;
    } else if (r.status === "already-archived") {
      alreadyCount++;
    } else if (r.status === "missing") {
      missingCount++;
      console.log(`  MISSING (already gone?):  ${r.srcRel}`);
    }
  }

  console.log("");
  console.log(`Moved:           ${movedCount} entries (${fmtBytes(totalMoved)})`);
  console.log(`Already archived: ${alreadyCount}`);
  console.log(`Missing:         ${missingCount}`);
  console.log("");
  console.log(`Archive location: docs/_archive/`);
  console.log("To restore:  cd docs && for f in _archive/*; do mv \"$f\" \"$(basename $f)\"; done");
}

await main();
