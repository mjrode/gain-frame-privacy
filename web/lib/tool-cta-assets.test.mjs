import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  TOOL_CTA_MASCOT_SRC,
  TOOL_CTA_PROGRESS_PREVIEW_SRC,
} from "./tool-cta-assets.ts";

async function assertContentFingerprint(assetUrl) {
  const url = new URL(assetUrl, "https://gainframe.app");
  const version = url.searchParams.get("v");

  assert.match(version ?? "", /^[a-f0-9]{12}$/);

  const filePath = fileURLToPath(
    new URL(`../public${url.pathname}`, import.meta.url),
  );
  const digest = createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");

  assert.equal(version, digest.slice(0, version.length));
}

test("shared tool CTA images use fingerprints matching their content", async () => {
  await Promise.all([
    assertContentFingerprint(TOOL_CTA_PROGRESS_PREVIEW_SRC),
    assertContentFingerprint(TOOL_CTA_MASCOT_SRC),
  ]);
});

test("ToolConversionCard references both versioned shared image URLs", async () => {
  const componentSource = await readFile(
    new URL("../components/ToolConversionCard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(componentSource, /src=\{TOOL_CTA_PROGRESS_PREVIEW_SRC\}/);
  assert.match(componentSource, /mascotSrc = TOOL_CTA_MASCOT_SRC/);
});
