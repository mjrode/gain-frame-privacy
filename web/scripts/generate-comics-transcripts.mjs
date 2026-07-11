// Generates web/lib/comics-transcripts.json — slide-by-slide text transcripts
// and alt descriptions for every comic in the gallery manifest, via Gemini
// vision OCR on the rendered slide images.
//
// The transcripts feed the per-comic pages at /comics/[slug]/ (indexable text
// for pages whose content is otherwise baked into images).
//
// Usage:  GEMINI_API_KEY=... node scripts/generate-comics-transcripts.mjs
// Resumable: slugs already present in the output file are skipped, so new
// comic batches only cost API calls for the new issues.

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { COMICS_MANIFEST } from "../lib/comics-manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMIC_ROOT = path.resolve(__dirname, "../../docs/assets/tiktok/comic");
const OUT_FILE = path.resolve(__dirname, "../lib/comics-transcripts.json");
const MODEL = "gemini-flash-latest";
const CONCURRENCY = 6;

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}

async function listSlides(slug, ext) {
  const dir = path.join(COMIC_ROOT, slug);
  const files = await fs.readdir(dir);
  const slides = files
    .filter((f) => new RegExp(`^slide-\\d+(-cover)?\\.${ext}$`).test(f))
    .sort((a, b) => {
      const n = (f) => parseInt(f.match(/slide-(\d+)/)[1], 10);
      return n(a) - n(b);
    });
  return { dir, slides };
}

async function transcribeComic(comic) {
  const { dir, slides } = await listSlides(comic.slug, comic.ext);
  if (slides.length === 0) throw new Error("no slides found");

  const parts = [
    {
      text:
        `These are the ${slides.length} slides of a fitness comic titled "${comic.title}", in reading order. ` +
        `The first image is the cover. For EACH image, in the same order, transcribe the text and describe the scene.\n\n` +
        `Return ONLY JSON matching this shape:\n` +
        `{"summary": "<2-3 plain sentences summarizing the comic's advice for a search snippet — no hype, no emoji>",` +
        `"slides": [{"text": "<all visible text on the slide, verbatim, reading order, sentence case>", ` +
        `"alt": "<one sentence describing the illustration for an img alt attribute (the character is the GainFrame mascot); include the slide's key message>"}]}\n\n` +
        `The slides array MUST have exactly ${slides.length} entries.`,
    },
  ];
  for (const f of slides) {
    const data = await fs.readFile(path.join(dir, f));
    parts.push({ inlineData: { mimeType: "image/webp", data: data.toString("base64") } });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) throw new Error("empty response");
  const parsed = JSON.parse(text);
  if (!parsed.summary || !Array.isArray(parsed.slides) || parsed.slides.length !== slides.length) {
    throw new Error(`bad shape: ${parsed.slides?.length ?? 0}/${slides.length} slides`);
  }
  return {
    summary: parsed.summary.trim(),
    slides: slides.map((file, i) => ({
      file,
      text: (parsed.slides[i].text ?? "").trim(),
      alt: (parsed.slides[i].alt ?? "").trim(),
    })),
  };
}

async function main() {
  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(OUT_FILE, "utf8"));
  } catch {
    /* first run */
  }

  const todo = COMICS_MANIFEST.filter((c) => !existing[c.slug]);
  console.log(`${COMICS_MANIFEST.length} comics in manifest, ${todo.length} to transcribe`);

  let done = 0;
  const failures = [];
  const queue = [...todo];

  async function worker() {
    while (queue.length) {
      const comic = queue.shift();
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          existing[comic.slug] = await transcribeComic(comic);
          done++;
          console.log(`[${done}/${todo.length}] ${comic.slug}`);
          break;
        } catch (err) {
          if (attempt === 3) {
            failures.push(`${comic.slug}: ${err.message}`);
            console.error(`FAILED ${comic.slug}: ${err.message}`);
          } else {
            await new Promise((r) => setTimeout(r, 2000 * attempt));
          }
        }
      }
      // checkpoint every few comics so an interrupt loses little work
      if (done % 10 === 0) {
        await fs.writeFile(OUT_FILE, JSON.stringify(existing, null, 1));
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await fs.writeFile(OUT_FILE, JSON.stringify(existing, null, 1));
  console.log(`Wrote ${Object.keys(existing).length} transcripts to ${OUT_FILE}`);
  if (failures.length) {
    console.error(`\n${failures.length} failures:\n${failures.join("\n")}`);
    process.exitCode = 1;
  }
}

main();
