import assert from "node:assert/strict";
import test from "node:test";

import {
  clampProgressPhotoValue,
  isSupportedProgressPhotoImage,
  progressPhotoExportFilename,
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
