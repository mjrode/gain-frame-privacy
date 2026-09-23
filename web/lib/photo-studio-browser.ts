import {
  blurPixels,
  cropRegion,
  fileIssue,
  safeRegion,
  type Framing,
  type Mask,
} from "./photo-studio";
export type LocalPhoto = {
  id: string;
  image: HTMLCanvasElement;
  url: string;
  sample: boolean;
  date: string;
  masks: Mask[];
  framing: Framing;
};
export function canvasBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("export_failed"))),
      type,
    ),
  );
}
export async function decodePhoto(
  file: File,
  maxEdge: number,
): Promise<LocalPhoto> {
  const issue = fileIssue(file);
  if (issue) throw new Error(issue);
  // Decode only one source at a time; release its full-resolution bitmap immediately.
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 32_000_000)
      throw new Error(
        "Photos must be 32 megapixels or smaller. Export a smaller copy first.",
      );
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const image = document.createElement("canvas");
    image.width = Math.max(1, Math.round(bitmap.width * scale));
    image.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = image.getContext("2d");
    if (!ctx)
      throw new Error(
        "Your browser could not open the editor. Try a current browser.",
      );
    ctx.fillStyle = "#f5f2e9";
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.drawImage(bitmap, 0, 0, image.width, image.height);
    return {
      id: crypto.randomUUID(),
      image,
      url: URL.createObjectURL(await canvasBlob(image)),
      sample: false,
      date: "",
      masks: [],
      framing: { aspect: "original", zoom: 1, x: 50, y: 50 },
    };
  } finally {
    bitmap.close();
  }
}
export function releasePhoto(photo: LocalPhoto) {
  URL.revokeObjectURL(photo.url);
  photo.image.width = 1;
  photo.image.height = 1;
}
export function renderPhoto(
  photo: LocalPhoto,
  width?: number,
  height?: number,
  original = false,
): HTMLCanvasElement {
  const source = document.createElement("canvas");
  source.width = photo.image.width;
  source.height = photo.image.height;
  const ctx = source.getContext("2d")!;
  ctx.drawImage(photo.image, 0, 0);
  if (!original)
    for (const raw of photo.masks) {
      const m = safeRegion(raw),
        x = Math.floor(m.x * source.width),
        y = Math.floor(m.y * source.height),
        w = Math.min(source.width - x, Math.ceil(m.width * source.width)),
        h = Math.min(source.height - y, Math.ceil(m.height * source.height));
      if (raw.mode === "cover") {
        ctx.fillStyle = "#252a24";
        ctx.fillRect(x, y, w, h);
      } else {
        const data = ctx.getImageData(x, y, w, h);
        data.data.set(blurPixels(data.data, w, h, raw.strength));
        ctx.putImageData(data, x, y);
      }
    }
  const crop = cropRegion(source.width, source.height, photo.framing);
  const out = document.createElement("canvas");
  out.width = Math.max(1, width ?? Math.round(crop.width));
  out.height = Math.max(1, height ?? Math.round(crop.height));
  out
    .getContext("2d")!
    .drawImage(
      source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      out.width,
      out.height,
    );
  source.width = 1;
  source.height = 1;
  return out;
}
export function labelFrame(
  canvas: HTMLCanvasElement,
  text: string,
  sample: boolean,
) {
  const ctx = canvas.getContext("2d")!;
  if (text) {
    ctx.fillStyle = "rgba(26,31,27,.82)";
    ctx.fillRect(0, canvas.height - 44, canvas.width, 44);
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.fillText(text, 16, canvas.height - 16);
  }
  if (sample) {
    ctx.fillStyle = "#f5f2e9";
    ctx.fillRect(12, 12, 150, 26);
    ctx.fillStyle = "#252a24";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("ILLUSTRATED SAMPLE", 20, 29);
  }
}
/** Local demo drawings deliberately depict no physical transformation or real person. */
export async function samplePhotos(count: number): Promise<LocalPhoto[]> {
  const results: LocalPhoto[] = [];
  for (let i = 0; i < count; i++) {
    const image = document.createElement("canvas");
    image.width = 640;
    image.height = 800;
    const c = image.getContext("2d")!;
    c.fillStyle = ["#e6e7dc", "#e3e8e0", "#ebe4db"][i % 3];
    c.fillRect(0, 0, 640, 800);
    c.strokeStyle = "#c9cfbf";
    c.lineWidth = 2;
    for (let x = 40; x < 640; x += 80) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, 800);
      c.stroke();
    }
    c.fillStyle = "#ced5c5";
    c.fillRect(0, 660, 640, 140);
    const shift = ((i % 3) - 1) * 20;
    c.translate(shift, 0);
    c.fillStyle = "#c79c7e";
    c.beginPath();
    c.ellipse(320, 160, 52, 64, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#323d34";
    c.beginPath();
    c.roundRect(238, 230, 164, 245, 28);
    c.fill();
    c.strokeStyle = "#c79c7e";
    c.lineWidth = 34;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(246, 260);
    c.lineTo(205, 450);
    c.moveTo(395, 260);
    c.lineTo(435, 450);
    c.stroke();
    c.strokeStyle = "#606b5d";
    c.lineWidth = 60;
    c.beginPath();
    c.moveTo(280, 485);
    c.lineTo(270, 680);
    c.moveTo(360, 485);
    c.lineTo(370, 680);
    c.stroke();
    c.strokeStyle = "#252a24";
    c.lineWidth = 24;
    c.beginPath();
    c.moveTo(247, 710);
    c.lineTo(285, 710);
    c.moveTo(356, 710);
    c.lineTo(394, 710);
    c.stroke();
    c.setTransform(1, 0, 0, 1, 0, 0);
    results.push({
      id: crypto.randomUUID(),
      image,
      url: URL.createObjectURL(await canvasBlob(image)),
      sample: true,
      date: "",
      masks: [],
      framing: { aspect: "original", zoom: 1, x: 50, y: 50 },
    });
  }
  return results;
}
