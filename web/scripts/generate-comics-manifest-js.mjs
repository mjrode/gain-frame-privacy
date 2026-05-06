#!/usr/bin/env node
// Mirrors web/lib/comics-manifest.mjs to docs/assets/tiktok/comic/comics-manifest.js
// (the runtime file the comics viewer reads as a global). Single source of truth
// lives in the .mjs file; this keeps the served JS in sync.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COMICS_MANIFEST } from "../lib/comics-manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.resolve(
  __dirname,
  "../../docs/assets/tiktok/comic/comics-manifest.js",
);

const banner = `// Auto-generated from web/lib/comics-manifest.mjs — do not edit directly.\n// To change comics, edit the .mjs file and run \`npm run build:comics-manifest\`.\n`;
const body = `const COMICS_MANIFEST = ${JSON.stringify(COMICS_MANIFEST, null, 2)};\n`;

await fs.writeFile(TARGET, banner + body);
console.log(`[generate-comics-manifest-js] wrote ${COMICS_MANIFEST.length} entries to ${path.relative(process.cwd(), TARGET)}`);
