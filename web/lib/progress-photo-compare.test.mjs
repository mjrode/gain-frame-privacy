import assert from "node:assert/strict";
import test from "node:test";
import { trackProgressPhotoCompareResult, trackProgressPhotoCompareExport } from "./progress-photo-compare-tracking.ts";

import {
  clampProgressPhotoValue,
  isSupportedProgressPhotoImage,
  progressPhotoExportFilename,
  progressPhotoInputMode,
  progressPhotoExportLabel,
  progressPhotoLabelOrder,
  progressPhotoExportLayout,
  progressPhotoPlacement,
} from "./progress-photo-compare.ts";

test("accepts declared photo formats and rejects other image MIME types", () => {
  assert.equal(
    isSupportedProgressPhotoImage({ name: "check-in.jpg", type: "image/jpeg" }),
    true,
  );
  assert.equal(
    isSupportedProgressPhotoImage({ name: "check-in.heic", type: "" }),
    true,
  );
  assert.equal(
    isSupportedProgressPhotoImage({ name: "animation.gif", type: "image/gif" }),
    false,
  );
  assert.equal(
    isSupportedProgressPhotoImage({ name: "vector.svg", type: "image/svg+xml" }),
    false,
  );
  assert.equal(
    isSupportedProgressPhotoImage({ name: "renamed.jpg", type: "text/plain" }),
    false,
  );
});

test("clamps invalid and out-of-range alignment controls", () => {
  assert.equal(clampProgressPhotoValue(-140, -100, 100), -100);
  assert.equal(clampProgressPhotoValue(32, -100, 100), 32);
  assert.equal(clampProgressPhotoValue(140, -100, 100), 100);
  assert.equal(clampProgressPhotoValue(Number.NaN, 1, 3), 1);
});

test("cover placement keeps portrait images inside the frame while panning", () => {
  const centered = progressPhotoPlacement({
    imageWidth: 800,
    imageHeight: 1200,
    frameWidth: 800,
    frameHeight: 1000,
    zoom: 1,
    offset: { x: 0, y: 0 },
  });
  assert.deepEqual(centered, {
    x: 0,
    y: -100,
    width: 800,
    height: 1200,
  });

  const bottom = progressPhotoPlacement({
    imageWidth: 800,
    imageHeight: 1200,
    frameWidth: 800,
    frameHeight: 1000,
    zoom: 1,
    offset: { x: 0, y: -100 },
  });
  assert.equal(bottom.y, -200);
});

test("shared zoom creates predictable pan room in both directions", () => {
  const placement = progressPhotoPlacement({
    imageWidth: 1000,
    imageHeight: 1000,
    frameWidth: 800,
    frameHeight: 1000,
    zoom: 2,
    offset: { x: 100, y: -100 },
  });
  assert.deepEqual(placement, {
    x: 0,
    y: -1000,
    width: 2000,
    height: 2000,
  });
});

test("export layouts preserve a 4:5 frame in every comparison mode", () => {
  assert.deepEqual(progressPhotoExportLayout("side_by_side"), {
    width: 1600,
    height: 1000,
    before: { x: 0, y: 0, width: 800, height: 1000 },
    after: { x: 800, y: 0, width: 800, height: 1000 },
  });
  assert.deepEqual(progressPhotoExportLayout("wipe"), {
    width: 1200,
    height: 1500,
    before: { x: 0, y: 0, width: 1200, height: 1500 },
    after: { x: 0, y: 0, width: 1200, height: 1500 },
  });
  assert.deepEqual(
    progressPhotoExportLayout("ghost"),
    progressPhotoExportLayout("wipe"),
  );
});

test("export filenames are deterministic and date-safe", () => {
  assert.equal(
    progressPhotoExportFilename(new Date(2026, 7, 30)),
    "gainframe-progress-compare-2026-08-30.png",
  );
});

// These paths share the same guard used by the result event and conversion card.

test("only two personal images qualify as a personal result", () => {
  assert.equal(progressPhotoInputMode(), null);
  assert.equal(progressPhotoInputMode("personal"), null);
  assert.equal(progressPhotoInputMode("sample", "sample"), "sample_photos");
  assert.equal(progressPhotoInputMode("sample", "personal"), "mixed_images");
  assert.equal(progressPhotoInputMode("personal", "sample"), "mixed_images");
  assert.equal(progressPhotoInputMode("personal", "personal"), "local_images");
});

test("sample and mixed comparisons never emit a personal result event", () => {
  const captured = [];
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    gtag() {}, posthog: { capture: (event, properties) => captured.push({ event, properties }) },
  } });
  try {
    trackProgressPhotoCompareResult(null, "wipe");
    trackProgressPhotoCompareResult("sample_photos", "side_by_side");
    trackProgressPhotoCompareResult("mixed_images", "ghost");
    assert.deepEqual(captured.map(x => x.event), [
      "progress_photo_compare_demo_result_shown", "progress_photo_compare_demo_result_shown",
    ]);
    trackProgressPhotoCompareResult("local_images", "wipe");
    assert.equal(captured[2].event, "tool_funnel_result_shown");
    assert.equal(captured[2].properties.input_mode, "local_images");
    assert.equal(captured[2].properties.tool, "progress_photo_compare");
  } finally { delete globalThis.window; }
});

test("exports distinguish demo usage without sending filenames, labels or dates", () => {
  const captured = [];
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    gtag() {}, posthog: { capture: (event, properties) => captured.push({ event, properties }) },
  } });
  try {
    for (const mode of ["sample_photos", "mixed_images", "local_images"]) {
      trackProgressPhotoCompareExport(mode, "ghost", true, false);
    }
    assert.deepEqual(captured.map(x => x.event), [
      "progress_photo_compare_demo_exported", "progress_photo_compare_demo_exported", "progress_photo_compare_exported",
    ]);
    for (const x of captured) assert.deepEqual(Object.keys(x.properties).sort(),
      ["tool", "input_mode", "comparison_mode", "has_labels", "privacy_blur"].sort());
  } finally { delete globalThis.window; }
});

test("optional export labels validate dates, preserve calendar days and bound text", () => {
  assert.equal(progressPhotoExportLabel("Before", "", ""), "Before");
  assert.equal(progressPhotoExportLabel("After", "  Week 12  ", "2026-09-21"), "Week 12 · Sep 21, 2026");
  assert.equal(progressPhotoExportLabel("Before", "", "2026-02-30"), "Before");
  assert.equal(progressPhotoExportLabel("Before", "", "2024-02-29"), "Before · Feb 29, 2024");
  assert.equal(progressPhotoExportLabel("After", "", "not-a-date"), "After");
  assert.equal(progressPhotoExportLabel("After", "a".repeat(40), ""), "a".repeat(24));
  assert.equal(progressPhotoExportLabel("Before", "Week\n1", ""), "Week 1");
});

test("wipe captions follow the after image on the left", () => {
  assert.deepEqual(progressPhotoLabelOrder("wipe"), ["after", "before"]);
  assert.deepEqual(progressPhotoLabelOrder("side_by_side"), ["before", "after"]);
  assert.deepEqual(progressPhotoLabelOrder("ghost"), ["before", "after"]);
});
