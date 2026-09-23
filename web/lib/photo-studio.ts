export type Region = { x: number; y: number; width: number; height: number };
export type Mask = Region & { mode: "cover" | "blur"; strength: number };
export type Framing = {
  aspect: "original" | "portrait" | "square";
  zoom: number;
  x: number;
  y: number;
};
export const DEFAULT_FRAMING: Framing = {
  aspect: "original",
  zoom: 1,
  x: 50,
  y: 50,
};
export const DEFAULT_MASK: Mask = {
  x: 0.36,
  y: 0.08,
  width: 0.28,
  height: 0.22,
  mode: "cover",
  strength: 18,
};
export const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, Number.isFinite(value) ? value : low));
export function safeRegion(region: Region): Region {
  const x = clamp(region.x, 0, 0.99),
    y = clamp(region.y, 0, 0.99);
  return {
    x,
    y,
    width: clamp(region.width, 0.01, 1 - x),
    height: clamp(region.height, 0.01, 1 - y),
  };
}
export function cropRegion(
  width: number,
  height: number,
  framing: Framing,
): Region {
  const aspect =
    framing.aspect === "square"
      ? 1
      : framing.aspect === "portrait"
        ? 0.8
        : width / height;
  const cropWidth =
    Math.min(width, height * aspect) / clamp(framing.zoom, 1, 3);
  const cropHeight = cropWidth / aspect;
  return {
    x: ((width - cropWidth) * clamp(framing.x, 0, 100)) / 100,
    y: ((height - cropHeight) * clamp(framing.y, 0, 100)) / 100,
    width: cropWidth,
    height: cropHeight,
  };
}
export function selectionRegion(
  start: { x: number; y: number },
  end: { x: number; y: number },
  crop: Region,
  width: number,
  height: number,
): Region {
  return safeRegion({
    x: (crop.x + Math.min(start.x, end.x) * crop.width) / width,
    y: (crop.y + Math.min(start.y, end.y) * crop.height) / height,
    width: (Math.abs(end.x - start.x) * crop.width) / width,
    height: (Math.abs(end.y - start.y) * crop.height) / height,
  });
}
export function fileIssue(file: {
  size: number;
  type: string;
  name: string;
}): string | null {
  const accepted =
    ["image/jpeg", "image/png", "image/webp"].includes(
      file.type.toLowerCase(),
    ) ||
    (!file.type && /\.(jpe?g|png|webp)$/i.test(file.name));
  if (!accepted)
    return "Choose JPEG, PNG or WebP photos. Convert HEIC to JPEG first.";
  return file.size > 12 * 1024 * 1024
    ? "Each photo must be 12 MB or smaller."
    : null;
}
export function photoCountBucket(count: number) {
  return count <= 1 ? "1" : count <= 5 ? "2-5" : count <= 10 ? "6-10" : "11-24";
}
export function dateLabel(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const d = new Date(`${date}T12:00:00Z`);
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== date)
    return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
/** Separable box blur keeps local exports consistent even where canvas.filter is unavailable. */
export function blurPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
): Uint8ClampedArray {
  const r = Math.round(clamp(radius, 1, 64));
  let source = new Uint8ClampedArray(pixels);
  for (let pass = 0; pass < 2; pass++) {
    const dest = new Uint8ClampedArray(source.length);
    const lines = pass === 0 ? height : width,
      length = pass === 0 ? width : height;
    const at = (line: number, pos: number, c: number) =>
      (pass === 0 ? line * width + pos : pos * width + line) * 4 + c;
    for (let line = 0; line < lines; line++)
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let k = -r; k <= r; k++)
          sum += source[at(line, clamp(k, 0, length - 1), c)];
        for (let pos = 0; pos < length; pos++) {
          dest[at(line, pos, c)] = Math.round(sum / (2 * r + 1));
          sum -= source[at(line, clamp(pos - r, 0, length - 1), c)];
          sum += source[at(line, clamp(pos + r + 1, 0, length - 1), c)];
        }
      }
    source = dest;
  }
  return source;
}
