export const PROGRESS_PHOTO_COMPARE_MODES = [
  "side_by_side",
  "wipe",
  "ghost",
] as const;

const PROGRESS_PHOTO_IMAGE_EXTENSIONS = /\.(?:jpe?g|png|webp|heic|heif)$/i;
const PROGRESS_PHOTO_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export type ProgressPhotoCompareMode =
  (typeof PROGRESS_PHOTO_COMPARE_MODES)[number];

export type ProgressPhotoOffset = {
  x: number;
  y: number;
};

export type ProgressPhotoPlacement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ProgressPhotoExportFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ProgressPhotoExportLayout = {
  width: number;
  height: number;
  before: ProgressPhotoExportFrame;
  after: ProgressPhotoExportFrame;
};

export function clampProgressPhotoValue(
  value: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

/** Match drag/drop validation to the file picker's explicit safe allow-list. */
export function isSupportedProgressPhotoImage(file: {
  name: string;
  type: string;
}): boolean {
  return PROGRESS_PHOTO_IMAGE_MIMES.has(file.type.toLowerCase()) ||
    (!file.type && PROGRESS_PHOTO_IMAGE_EXTENSIONS.test(file.name));
}

/**
 * Calculate a cover-style image placement shared by the CSS preview and PNG
 * renderer. Offsets use the accessible slider range -100…100 and consume the
 * available pan created by cropping/zoom, so an edge value never exposes the
 * frame background.
 */
export function progressPhotoPlacement(input: {
  imageWidth: number;
  imageHeight: number;
  frameWidth: number;
  frameHeight: number;
  zoom: number;
  offset: ProgressPhotoOffset;
}): ProgressPhotoPlacement {
  const imageWidth = Math.max(1, input.imageWidth);
  const imageHeight = Math.max(1, input.imageHeight);
  const frameWidth = Math.max(1, input.frameWidth);
  const frameHeight = Math.max(1, input.frameHeight);
  const zoom = clampProgressPhotoValue(input.zoom, 1, 3);
  const coverScale = Math.max(
    frameWidth / imageWidth,
    frameHeight / imageHeight,
  );
  const width = imageWidth * coverScale * zoom;
  const height = imageHeight * coverScale * zoom;
  const panX = Math.max(0, (width - frameWidth) / 2);
  const panY = Math.max(0, (height - frameHeight) / 2);
  const offsetX = clampProgressPhotoValue(input.offset.x, -100, 100) / 100;
  const offsetY = clampProgressPhotoValue(input.offset.y, -100, 100) / 100;

  return {
    x: (frameWidth - width) / 2 + offsetX * panX,
    y: (frameHeight - height) / 2 + offsetY * panY,
    width,
    height,
  };
}

/** Export sizes keep each progress-photo frame at a familiar 4:5 ratio. */
export function progressPhotoExportLayout(
  mode: ProgressPhotoCompareMode,
): ProgressPhotoExportLayout {
  if (mode === "side_by_side") {
    return {
      width: 1600,
      height: 1000,
      before: { x: 0, y: 0, width: 800, height: 1000 },
      after: { x: 800, y: 0, width: 800, height: 1000 },
    };
  }

  const frame = { x: 0, y: 0, width: 1200, height: 1500 };
  return {
    width: 1200,
    height: 1500,
    before: { ...frame },
    after: { ...frame },
  };
}

export function progressPhotoExportFilename(now = new Date()): string {
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return `gainframe-progress-compare-${stamp}.png`;
}
