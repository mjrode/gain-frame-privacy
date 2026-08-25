import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productionBranch = "main";
const ciCommit = process.env.WORKERS_CI_COMMIT_SHA?.trim();
const ciBranch = process.env.WORKERS_CI_BRANCH?.trim();
const isWorkersBuild = process.env.WORKERS_CI === "1";

function run(command, args, options = {}) {
  const { capture = false } = options;
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
}

function capture(command, args) {
  return run(command, args, { capture: true }).trim();
}

function fail(message) {
  throw new Error(`Production deploy blocked: ${message}`);
}

function remoteMainSha() {
  const output = capture("git", [
    "ls-remote",
    "origin",
    `refs/heads/${productionBranch}`,
  ]);
  const sha = output.split(/\s+/)[0];
  if (!/^[0-9a-f]{40}$/.test(sha ?? "")) {
    fail(`could not resolve origin/${productionBranch}`);
  }
  return sha;
}

function isFreshRevision(expectedSha) {
  const currentSha = capture("git", ["rev-parse", "HEAD"]);
  if (currentSha !== expectedSha) {
    fail(`checkout ${currentSha} does not match expected revision ${expectedSha}`);
  }

  const latestSha = remoteMainSha();
  if (latestSha !== expectedSha) {
    if (isWorkersBuild) {
      console.log(
        `Skipping stale Workers Build ${expectedSha.slice(0, 7)}; ` +
          `origin/${productionBranch} is ${latestSha.slice(0, 7)}.`,
      );
      return false;
    }
    fail(
      `HEAD ${expectedSha.slice(0, 7)} is not the latest ` +
        `origin/${productionBranch} (${latestSha.slice(0, 7)})`,
    );
  }
  return true;
}

function assertLocalReleaseReady() {
  const branch = capture("git", ["branch", "--show-current"]);
  if (branch !== productionBranch) {
    fail(
      `local releases must run from ${productionBranch}, not ` +
        `${branch || "detached HEAD"}`,
    );
  }

  const status = capture("git", [
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ]);
  if (status) {
    fail("the working tree is not clean");
  }
}

let lockDir;

try {
  if (isWorkersBuild) {
    if (!ciCommit) fail("WORKERS_CI_COMMIT_SHA is missing");
    if (ciBranch !== productionBranch) {
      fail(
        `production deploy received Workers branch ${ciBranch || "unknown"}`,
      );
    }
  } else {
    assertLocalReleaseReady();
  }

  const expectedSha = ciCommit || capture("git", ["rev-parse", "HEAD"]);
  const gitDir = capture("git", ["rev-parse", "--git-common-dir"]);
  lockDir = resolve(repoRoot, gitDir, "gainframe-production-deploy.lock");

  try {
    mkdirSync(lockDir);
  } catch {
    fail("another production release is already running from this checkout");
  }

  if (!isFreshRevision(expectedSha)) {
    process.exitCode = 0;
  } else {
    run("npx", [
      "wrangler",
      "deploy",
      "--strict",
      "--message",
      `git:${expectedSha}`,
    ]);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (lockDir) rmSync(lockDir, { recursive: true, force: true });
}
