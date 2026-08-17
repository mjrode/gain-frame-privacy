// Extracts AI prompt templates from the gain-frame repo into a JSON snapshot
// served (behind auth) by the /api/admin/ai-flows worker endpoint.
//
// Prompts are deliberately never persisted at runtime anywhere in the
// platform — the only source of truth is the source code itself, split
// between the iOS client (Swift, V1-parity flows) and the Supabase edge
// functions (TypeScript, V2 flows). This script pulls large string literals
// out of a hand-curated per-flow file manifest.
//
// The snapshot is committed to the repo (worker/api/ai-prompts.snapshot.json)
// so deploys don't depend on the sibling checkout. Refresh it whenever
// prompts change:
//
//   node scripts/extract-ai-prompts.mjs
//
// The dashboard shows each flow's live `prompt_version` from PostHog next to
// the snapshot's capture commit, so a stale snapshot is visible, not silent.

import { execSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GAIN_FRAME_ROOT =
  process.env.GAIN_FRAME_REPO ?? path.resolve(__dirname, "../../../gain-frame");
// Served as a static asset, but the worker gates /admin-data/* behind the
// same auth check as /api/admin/* (run_worker_first routes every request
// through the worker before the asset binding).
const OUT_PATH = path.resolve(__dirname, "../public/admin-data/ai-prompts.json");

// Excerpts shorter than this are almost never prompts (keys, labels, URLs).
const MIN_EXCERPT_LENGTH = 200;

// Per-file cap keeps schema-heavy files from drowning the actual prompts.
const MAX_EXCERPTS_PER_FILE = 15;

/** Heuristic: drop literals that are clearly not prompt text. */
function looksLikePrompt(text) {
  const head = text.slice(0, 40).trimStart();
  if (/^(SELECT|INSERT|UPDATE|DELETE|WITH)\b/i.test(head)) return false; // SQL
  if (head.startsWith("{") || head.startsWith("[")) return false; // JSON
  if (head.startsWith("<")) return false; // HTML/XML
  return true;
}

const FN = "supabase/functions";
const SHARED_AI = `${FN}/_shared/ai`;
const SWIFT = "GainFrame/Services/Gemini";

// flow → source files (relative to the gain-frame repo root). A directory
// entry includes every .ts file directly inside it.
const MANIFEST = {
  classify_score: [`${SHARED_AI}/v2/classify-score.ts`, `${SWIFT}/GeminiService+Classification.swift`],
  review: [`${SHARED_AI}/v2/classify-score.ts`, `${SWIFT}/GeminiService+Classification.swift`],
  deep_dive: [`${SHARED_AI}/v2/deep-dive-report.ts`, `${SWIFT}/GeminiService+DeepDive.swift`],
  deep_dive_retry: [`${SHARED_AI}/v2/deep-dive-report.ts`],
  deep_dive_preview: [`${SHARED_AI}/v2/deep-dive-preview.ts`],
  deep_dive_preview_retry: [`${SHARED_AI}/v2/deep-dive-preview.ts`],
  deep_dive_compare: [`${SHARED_AI}/v2/deep-dive-compare.ts`, `${SWIFT}/GeminiService+DeepDive.swift`],
  deep_dive_compare_retry: [`${SHARED_AI}/v2/deep-dive-compare.ts`],
  check_in_read: [`${SHARED_AI}/v2/check-in-read.ts`],
  caption: [`${SHARED_AI}/v2/caption.ts`],
  target_assessment: [`${SHARED_AI}/v2/target-training-analysis.ts`, `${SWIFT}/GeminiService+TargetTraining.swift`],
  exercise_suggestion: [`${SHARED_AI}/v2/target-exercises.ts`, `${SWIFT}/GeminiService+TargetTraining.swift`],
  replacement_exercise: [`${SHARED_AI}/v2/target-exercises.ts`],
  progress_evaluation: [`${SHARED_AI}/v2/target-training-analysis.ts`],
  correlation_prose: [`${SHARED_AI}/v2/correlation-prose.ts`, `${SWIFT}/GeminiService+CorrelationProse.swift`],
  precision_bf: [`${SHARED_AI}/v2/precision-bf.ts`, `${SWIFT}/GeminiService+PrecisionBF.swift`],
  weekly_summary: [`${SWIFT}/GeminiService+WeeklySummary.swift`],
  pose_analysis: [`${SHARED_AI}/v2/pose-analysis.ts`, `${SWIFT}/GeminiService+PoseAnalysis.swift`],
  memory_extractor: [`${SHARED_AI}/v2/memory-extractor.ts`],
  nutrition_label_parse: [`${SWIFT}/GeminiService+FoodEstimate.swift`, `${SWIFT}/GeminiService+MealPhoto.swift`],
  nutrition_recipe_import: [`${SHARED_AI}/v2/nutrition-recipe-import.ts`],
  starter_questions_general: [`${SWIFT}/GeminiService+StarterQuestions.swift`],
  starter_questions: [`${SWIFT}/GeminiService+StarterQuestions.swift`],
  comparison: [`${SWIFT}/GeminiService+DeepDive.swift`, `${SWIFT}/GeminiPromptHelpers.swift`],
  prediction: [`${SHARED_AI}/v2/prediction-analysis.ts`, `${SWIFT}/GeminiService+Predictions.swift`],
  prediction_image: [`${SHARED_AI}/v2/image-generation.ts`, `${SWIFT}/GeminiService+Predictions.swift`],
  coach_hero_image: [`${SHARED_AI}/v2/image-generation.ts`, `${SWIFT}/GeminiService+CoachHeroImage.swift`],
  coach_hero_photo_style: [`${SWIFT}/GeminiService+CoachHeroImage.swift`],
  goal_preview_image: [`${SHARED_AI}/v2/image-generation.ts`, `${SWIFT}/GeminiService+GoalPreviewImage.swift`],
  onboarding_image: [`${SHARED_AI}/v2/image-generation.ts`, `${SWIFT}/GeminiService+OnboardingFutureImage.swift`],
  coach_chat: [`${FN}/coach-chat/system-prompt.ts`, `${FN}/coach-chat/sections`],
  coach_daily_read: [`${FN}/coach-daily-read/read-prompt.ts`],
  bf_estimate: [`${FN}/bf-estimate`],
  bf_full_report: [`${FN}/bf-full-report`],
  physique_rate: [`${FN}/physique-rate`],
  ab_analyze: [`${FN}/ab-analyze`],
  history_scoring: [`${FN}/_shared/history-scoring.ts`, `${SHARED_AI}/v2/classify-score.ts`],
  body_transform_moderation: [`${FN}/body-transform`],
  body_transform_image: [`${FN}/body-transform`],
  report_cover: [`${FN}/generate-cover`],
  report_body: [`${FN}/generate-body`],
  report_why: [`${FN}/generate-why`],
  report_letter: [`${FN}/generate-letter`],
  report_trajectory: [`${FN}/generate-trajectory`],
  report_recovery: [`${FN}/generate-recovery`],
  report_lifts: [`${FN}/generate-lifts`],
  report_weekly_chapter: [`${FN}/generate-weekly-chapter`],
  report: [`${FN}/generate-report`],
};

/** Swift multi-line string literals: """ ... """ */
function extractSwift(source) {
  const out = [];
  const re = /"""\n?([\s\S]*?)"""/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    const text = match[1].trim();
    if (text.length >= MIN_EXCERPT_LENGTH && looksLikePrompt(text)) out.push(text);
  }
  return out.slice(0, MAX_EXCERPTS_PER_FILE);
}

/** TS/JS template literals: ` ... ` (best-effort; nested backticks not handled) */
function extractTemplateLiterals(source) {
  const out = [];
  const re = /`([\s\S]*?)`/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    const text = match[1].trim();
    if (text.length >= MIN_EXCERPT_LENGTH && looksLikePrompt(text)) out.push(text);
  }
  return out.slice(0, MAX_EXCERPTS_PER_FILE);
}

function extractFromFile(absPath) {
  const source = readFileSync(absPath, "utf8");
  return absPath.endsWith(".swift")
    ? extractSwift(source)
    : extractTemplateLiterals(source);
}

function resolveFiles(relPath) {
  const abs = path.join(GAIN_FRAME_ROOT, relPath);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isDirectory()) {
    return readdirSync(abs)
      .filter((f) => f.endsWith(".ts") && !f.includes("_test"))
      .map((f) => path.join(relPath, f));
  }
  return [relPath];
}

function main() {
  if (!existsSync(GAIN_FRAME_ROOT)) {
    console.error(
      `gain-frame repo not found at ${GAIN_FRAME_ROOT}. ` +
        "Set GAIN_FRAME_REPO to the checkout path.",
    );
    process.exit(1);
  }

  const commit = execSync("git rev-parse --short HEAD", {
    cwd: GAIN_FRAME_ROOT,
    encoding: "utf8",
  }).trim();

  const flows = {};
  const warnings = [];

  for (const [flow, entries] of Object.entries(MANIFEST)) {
    const sources = [];
    for (const entry of entries) {
      const files = resolveFiles(entry);
      if (files.length === 0) {
        warnings.push(`${flow}: missing ${entry}`);
        continue;
      }
      for (const rel of files) {
        const excerpts = extractFromFile(path.join(GAIN_FRAME_ROOT, rel));
        if (excerpts.length > 0) sources.push({ file: rel, excerpts });
      }
    }
    if (sources.length === 0) warnings.push(`${flow}: no excerpts extracted`);
    flows[flow] = { sources };
  }

  const snapshot = {
    generated_at: new Date().toISOString(),
    gain_frame_commit: commit,
    flows,
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);

  const flowCount = Object.keys(flows).length;
  const excerptCount = Object.values(flows).reduce(
    (sum, f) => sum + f.sources.reduce((s, src) => s + src.excerpts.length, 0),
    0,
  );
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`${flowCount} flows, ${excerptCount} excerpts, commit ${commit}`);
  for (const warning of warnings) console.warn(`WARN ${warning}`);
}

main();
