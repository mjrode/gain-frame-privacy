// Builds an aggregate-only scoring calibration snapshot for /admin.
//
// Source artifacts in gain-frame/tools/scoring-eval/results contain case-level
// model output and must never be shipped to the website. This script reads the
// newest local artifact and writes only fleet-safe summary numbers: expectation
// pass cells, validation failures, latency, and same-image repeat spread.
//
// Run manually when a canonical scoring eval is approved:
//   node scripts/extract-scoring-eval.mjs

// The output is served under /admin-data/, which the worker gates behind the
// same authenticated allowlist as the admin API.

import { execSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GAIN_FRAME_ROOT =
  process.env.GAIN_FRAME_REPO ?? path.resolve(__dirname, "../../../gain-frame");
const RESULTS_DIR = path.join(GAIN_FRAME_ROOT, "tools/scoring-eval/results");
const OUT_PATH = path.resolve(
  __dirname,
  "../public/admin-data/scoring-eval.json",
);

function numeric(values) {
  return values.filter((value) => Number.isFinite(value));
}

function average(values) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

/** Nearest-rank percentile: conservative for small repeat sets. */
function percentile(values, q) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(q * sorted.length) - 1);
  return sorted[index];
}

function rounded(value, digits = 1) {
  if (value === null) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function spread(values) {
  if (values.length < 2) return null;
  return Math.max(...values) - Math.min(...values);
}

function spreadSummary(values) {
  const spreads = numeric(values);
  return {
    groups: spreads.length,
    median: rounded(percentile(spreads, 0.5)),
    p90: rounded(percentile(spreads, 0.9)),
    worst: rounded(spreads.length ? Math.max(...spreads) : null),
    average: rounded(average(spreads)),
  };
}

function latencySummary(values) {
  const latencies = numeric(values);
  return {
    samples: latencies.length,
    medianMs: rounded(percentile(latencies, 0.5), 0),
    p90Ms: rounded(percentile(latencies, 0.9), 0),
  };
}

function gradeCell(values, expected) {
  if (!Array.isArray(expected) || expected.length !== 2 || !values.length) {
    return null;
  }
  const mean = average(values);
  return mean !== null && mean >= expected[0] && mean <= expected[1];
}

function summarizeModel(document, model) {
  let gradedCells = 0;
  let passedCells = 0;
  const scoreSpreads = [];
  const bfSpreads = [];
  const runs = [];

  for (const result of document.results ?? []) {
    const modelRuns = (result.runs ?? []).filter((run) => run.model === model);
    runs.push(...modelRuns);
    const scores = numeric(modelRuns.map((run) => run.score));
    const bodyFat = numeric(modelRuns.map((run) => run.bf));

    const scoreGrade = gradeCell(scores, result.case?.expected_score);
    if (scoreGrade !== null) {
      gradedCells += 1;
      if (scoreGrade) passedCells += 1;
    }
    const bfGrade = gradeCell(bodyFat, result.case?.expected_bf);
    if (bfGrade !== null) {
      gradedCells += 1;
      if (bfGrade) passedCells += 1;
    }

    scoreSpreads.push(spread(scores));
    bfSpreads.push(spread(bodyFat));
  }

  const validationFailures = runs.filter((run) => run.validationCode).length;
  const rejected = runs.filter((run) => run.isProgressPhoto === false).length;

  return {
    model,
    runs: runs.length,
    gradedCells,
    passedCells,
    passRatePercent:
      gradedCells > 0 ? rounded((passedCells / gradedCells) * 100) : null,
    validationFailures,
    rejectedAsNonProgressPhoto: rejected,
    scoreSpread: spreadSummary(scoreSpreads),
    bodyFatSpread: spreadSummary(bfSpreads),
    latency: latencySummary(runs.map((run) => run.latencyMs)),
  };
}

function newestArtifact() {
  if (!existsSync(RESULTS_DIR)) {
    throw new Error(`Scoring eval results not found at ${RESULTS_DIR}`);
  }
  const files = readdirSync(RESULTS_DIR)
    .filter((file) => file.endsWith("-eval.json"))
    .map((file) => ({ file, mtime: statSync(path.join(RESULTS_DIR, file)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!files.length) throw new Error(`No scoring eval artifacts in ${RESULTS_DIR}`);
  return files[0].file;
}

function main() {
  const sourceArtifact = newestArtifact();
  const document = JSON.parse(
    readFileSync(path.join(RESULTS_DIR, sourceArtifact), "utf8"),
  );
  const commit = execSync("git rev-parse --short HEAD", {
    cwd: GAIN_FRAME_ROOT,
    encoding: "utf8",
  }).trim();

  const snapshot = {
    configured: true,
    generatedAt: new Date().toISOString(),
    sourceGeneratedAt: document.generated_at ?? null,
    sourceArtifact,
    gainFrameCommit: commit,
    manifestCases: Array.isArray(document.results) ? document.results.length : 0,
    repetitions: Number.isFinite(document.reps) ? document.reps : null,
    models: (document.models ?? []).map((model) =>
      summarizeModel(document, model),
    ),
    privacy:
      "Aggregate summary only. No image path, case identifier, expected range, model reasoning, prompt, or raw response is included.",
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote ${OUT_PATH}`);
  console.log(
    `${snapshot.manifestCases} cases · ${snapshot.models.length} models · source ${sourceArtifact}`,
  );
}

main();
