"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type DragEvent,
  type RefObject,
} from "react";
import { track } from "@/lib/analytics";
import { trackProgressPhotoCompareResult, trackProgressPhotoCompareExport } from "@/lib/progress-photo-compare-tracking";
import ToolConversionCard from "@/components/ToolConversionCard";
import { buildToolResultCtaExperiment } from "@/lib/tool-cta-experiment";
import { trackToolFunnelStep } from "@/lib/tool-funnel";
import {
  isSupportedProgressPhotoImage,
  progressPhotoExportFilename,
  progressPhotoExportLabel,
  progressPhotoInputMode,
  progressPhotoLabelOrder,
  type ProgressPhotoSource,
  type ProgressPhotoInputMode,
  progressPhotoExportLayout,
  progressPhotoPlacement,
  type ProgressPhotoCompareMode,
  type ProgressPhotoExportFrame,
  type ProgressPhotoOffset,
} from "@/lib/progress-photo-compare";
import styles from "./page.module.css";

const TOOL_ID = "progress_photo_compare" as const;
const MAX_FILE_BYTES = 30 * 1024 * 1024;

type PhotoSlot = "before" | "after";

type LocalPhoto = {
  source: ProgressPhotoSource;
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
};

type PhotoPair = Record<PhotoSlot, LocalPhoto | null>;

type MaskPosition = {
  x: number;
  y: number;
};

type FrameSize = {
  width: number;
  height: number;
};

const DEFAULT_OFFSETS: Record<PhotoSlot, ProgressPhotoOffset> = {
  before: { x: 0, y: 0 },
  after: { x: 0, y: 0 },
};

const DEFAULT_MASK_POSITIONS: Record<PhotoSlot, MaskPosition> = {
  before: { x: 50, y: 18 },
  after: { x: 50, y: 18 },
};

const MODE_COPY: Array<{
  value: ProgressPhotoCompareMode;
  label: string;
  note: string;
}> = [
  { value: "side_by_side", label: "Side by side", note: "Share-ready" },
  { value: "wipe", label: "Wipe", note: "Scan the change" },
  { value: "ghost", label: "Ghost", note: "Check alignment" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function decodeLocalImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This browser could not read the image."));
    image.src = url;
  });
}

function useFrameSize(): {
  ref: RefObject<HTMLDivElement | null>;
  size: FrameSize | null;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<FrameSize | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0) {
        setSize({ width: bounds.width, height: bounds.height });
      }
    };
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

function imagePlacementStyle(
  photo: LocalPhoto,
  size: FrameSize | null,
  zoom: number,
  offset: ProgressPhotoOffset,
): CSSProperties {
  if (!size) {
    return {
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    };
  }
  const placement = progressPhotoPlacement({
    imageWidth: photo.width,
    imageHeight: photo.height,
    frameWidth: size.width,
    frameHeight: size.height,
    zoom,
    offset,
  });
  return {
    left: placement.x,
    top: placement.y,
    width: placement.width,
    height: placement.height,
  };
}

function PhotoFrame({
  photo,
  label,
  zoom,
  offset,
  privacyBlur,
  maskPosition,
  maskSize,
  showLabel = true,
  maskTone,
}: {
  photo: LocalPhoto;
  label: string;
  zoom: number;
  offset: ProgressPhotoOffset;
  privacyBlur: boolean;
  maskPosition: MaskPosition;
  maskSize: number;
  showLabel?: boolean;
  maskTone: "before" | "after";
}) {
  const { ref, size } = useFrameSize();
  const placementStyle = imagePlacementStyle(photo, size, zoom, offset);
  const maskClip = `ellipse(${maskSize * 0.72}% ${maskSize}% at ${maskPosition.x}% ${maskPosition.y}%)`;
  const guideStyle = {
    "--mask-x": `${maskPosition.x}%`,
    "--mask-y": `${maskPosition.y}%`,
    "--mask-width": `${maskSize * 1.44}%`,
    "--mask-height": `${maskSize * 2}%`,
  } as CSSProperties;

  return (
    <div className={styles.photoFrame} ref={ref}>
      <img
        className={styles.alignedPhoto}
        src={photo.url}
        alt={`${label} progress photo loaded locally for comparison`}
        style={placementStyle}
        draggable={false}
      />
      {privacyBlur && (
        <>
          <div
            className={styles.blurWindow}
            style={{ clipPath: maskClip }}
            aria-hidden="true"
          >
            <img
              className={`${styles.alignedPhoto} ${styles.blurredPhoto}`}
              src={photo.url}
              alt=""
              style={placementStyle}
              draggable={false}
            />
          </div>
          <span
            className={`${styles.maskGuide} ${styles[`maskGuide${maskTone}`]}`}
            style={guideStyle}
            aria-hidden="true"
          />
        </>
      )}
      {showLabel && <span className={styles.photoLabel}>{label}</span>}
    </div>
  );
}

function UploadCard({
  slot,
  photo,
  busy,
  error,
  onFile,
  onClear,
}: {
  slot: PhotoSlot;
  photo: LocalPhoto | null;
  busy: boolean;
  error: string | null;
  onFile: (slot: PhotoSlot, file: File) => void;
  onClear: (slot: PhotoSlot) => void;
}) {
  const inputId = `progress-photo-${slot}`;
  const label = slot === "before" ? "Before" : "After";

  function acceptFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(slot, file);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    acceptFiles(event.dataTransfer.files);
  }

  return (
    <article className={`${styles.uploadCard} ${photo ? styles.uploadCardReady : ""}`}>
      <div className={styles.uploadCardHead}>
        <span>{slot === "before" ? "01" : "02"}</span>
        <strong>{label} photo</strong>
        <i aria-hidden="true" />
      </div>

      <div
        className={styles.dropZone}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        {photo ? (
          <>
            <img src={photo.url} alt={`${label} photo thumbnail`} />
            <div className={styles.fileReadout}>
              <strong title={photo.name}>{photo.name}</strong>
              <span>
                {photo.width} × {photo.height} · {photo.source === "sample" ? "Public sample" : formatFileSize(photo.size)}
              </span>
            </div>
          </>
        ) : (
          <div className={styles.dropPrompt}>
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M6 22.5V25a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.5" />
              <path d="M16 21V5m0 0-5 5m5-5 5 5" />
            </svg>
            <strong>{busy ? "Reading image…" : `Choose ${label.toLowerCase()} photo`}</strong>
            <span>or drop it here · up to 30 MB</span>
          </div>
        )}
      </div>

      <div className={styles.uploadActions}>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
          disabled={busy}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            acceptFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <label htmlFor={inputId}>
          {photo ? `Replace ${label.toLowerCase()}` : "Browse photos"}
        </label>
        {photo && (
          <button type="button" onClick={() => onClear(slot)}>
            Remove
          </button>
        )}
      </div>
      {error && <p className={styles.uploadError} role="alert">{error}</p>}
    </article>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  output,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  output: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <label className={styles.rangeControl}>
      <span>
        <strong>{label}</strong>
        <output>{output}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={output}
        style={{ "--range-progress": `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function drawImageFrame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frame: ProgressPhotoExportFrame,
  zoom: number,
  offset: ProgressPhotoOffset,
  mask: { enabled: boolean; position: MaskPosition; size: number },
  opacity = 1,
) {
  const placement = progressPhotoPlacement({
    imageWidth: image.naturalWidth,
    imageHeight: image.naturalHeight,
    frameWidth: frame.width,
    frameHeight: frame.height,
    zoom,
    offset,
  });
  const draw = () => {
    context.drawImage(
      image,
      frame.x + placement.x,
      frame.y + placement.y,
      placement.width,
      placement.height,
    );
  };

  context.save();
  context.beginPath();
  context.rect(frame.x, frame.y, frame.width, frame.height);
  context.clip();
  context.globalAlpha = opacity;
  draw();

  if (mask.enabled) {
    context.save();
    context.beginPath();
    context.ellipse(
      frame.x + (mask.position.x / 100) * frame.width,
      frame.y + (mask.position.y / 100) * frame.height,
      (mask.size / 100) * frame.width * 0.72,
      (mask.size / 100) * frame.height,
      0,
      0,
      Math.PI * 2,
    );
    context.clip();
    context.filter = `blur(${Math.max(28, Math.round(frame.width * 0.035))}px)`;
    draw();
    context.restore();
  }
  context.restore();
}

function drawExportLabel(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: "left" | "right" = "left",
  maxWidth = 748,
) {
  context.save();
  context.font = "800 25px Arial, sans-serif";
  context.textBaseline = "middle";
  const width = Math.min(maxWidth, context.measureText(text).width + 34);
  const left = align === "right" ? x - width : x;
  context.fillStyle = "rgba(17, 18, 16, 0.84)";
  context.fillRect(left, y, width, 48);
  context.fillStyle = "#f7f6ef";
  context.textAlign = "left";
  context.fillText(text, left + 17, y + 25, width - 34);
  context.restore();
}

export default function ProgressPhotoCompareClient() {
  const [photos, setPhotos] = useState<PhotoPair>({ before: null, after: null });
  const [busy, setBusy] = useState<Record<PhotoSlot, boolean>>({
    before: false,
    after: false,
  });
  const [errors, setErrors] = useState<Record<PhotoSlot, string | null>>({
    before: null,
    after: null,
  });
  const [mode, setMode] = useState<ProgressPhotoCompareMode>("side_by_side");
  const [zoom, setZoom] = useState(1);
  const [offsets, setOffsets] =
    useState<Record<PhotoSlot, ProgressPhotoOffset>>(DEFAULT_OFFSETS);
  const [wipePosition, setWipePosition] = useState(50);
  const [ghostOpacity, setGhostOpacity] = useState(0.48);
  const [privacyBlur, setPrivacyBlur] = useState(false);
  const [maskSize, setMaskSize] = useState(16);
  const [maskPositions, setMaskPositions] =
    useState<Record<PhotoSlot, MaskPosition>>(DEFAULT_MASK_POSITIONS);
  const [exportState, setExportState] = useState<
    "idle" | "exporting" | "error"
  >("idle");
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [includeLabels, setIncludeLabels] = useState(true);
  const [labels, setLabels] = useState({ before: "", after: "" });
  const [dates, setDates] = useState({ before: "", after: "" });
  const urlsRef = useRef(new Set<string>());
  const requestsRef = useRef<Record<PhotoSlot, number>>({ before: 0, after: 0 });
  const startedRef = useRef(false);
  const resultsShownRef = useRef(new Set<ProgressPhotoInputMode>());
  const viewedRef = useRef(false);

  const ready = Boolean(photos.before && photos.after);
  const inputMode = progressPhotoInputMode(photos.before?.source, photos.after?.source);
  const personalResult = inputMode === "local_images";
  const hasSample = photos.before?.source === "sample" || photos.after?.source === "sample";
  const exportLabels = {
    before: progressPhotoExportLabel("Before", labels.before, dates.before),
    after: progressPhotoExportLabel("After", labels.after, dates.after),
  };
  const [leftLabelSlot, rightLabelSlot] = progressPhotoLabelOrder(mode);
  const previewClass = mode === "side_by_side"
    ? styles.previewSideBySide
    : styles.previewOverlay;

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackToolFunnelStep(TOOL_ID, "viewed", { input_mode: "local_images" });
  }, []);

  useEffect(() => {
    if (!inputMode || resultsShownRef.current.has(inputMode)) return;
    resultsShownRef.current.add(inputMode);
    trackProgressPhotoCompareResult(inputMode, mode);
  }, [inputMode, mode]);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  async function loadPhoto(slot: PhotoSlot, file: File) {
    const requestId = requestsRef.current[slot] + 1;
    requestsRef.current[slot] = requestId;
    setErrors((current) => ({ ...current, [slot]: null }));
    setBusy((current) => ({ ...current, [slot]: false }));

    if (!isSupportedProgressPhotoImage(file)) {
      setErrors((current) => ({
        ...current,
        [slot]: "Choose a JPEG, PNG, WebP, HEIC, or HEIF image.",
      }));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrors((current) => ({
        ...current,
        [slot]: "That image is over 30 MB. Choose a smaller copy.",
      }));
      return;
    }

    setBusy((current) => ({ ...current, [slot]: true }));
    const url = URL.createObjectURL(file);
    urlsRef.current.add(url);
    try {
      const image = await decodeLocalImage(url);
      if (requestsRef.current[slot] !== requestId) {
        URL.revokeObjectURL(url);
        urlsRef.current.delete(url);
        return;
      }
      const nextPhoto: LocalPhoto = {
        source: "personal",
        url,
        name: file.name,
        size: file.size,
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      setPhotos((current) => {
        const previous = current[slot];
        if (previous) {
          URL.revokeObjectURL(previous.url);
          urlsRef.current.delete(previous.url);
        }
        return { ...current, [slot]: nextPhoto };
      });
      if (!startedRef.current) {
        startedRef.current = true;
        trackToolFunnelStep(TOOL_ID, "started", {
          input_mode: "local_images",
          start_trigger: `${slot}_selected`,
        });
      }
    } catch {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
      if (requestsRef.current[slot] !== requestId) return;
      setErrors((current) => ({
        ...current,
        [slot]:
          "This browser could not read that image. Try a JPEG, PNG, or WebP copy.",
      }));
    } finally {
      if (requestsRef.current[slot] === requestId) {
        setBusy((current) => ({ ...current, [slot]: false }));
      }
    }
  }

  async function loadSamples() {
    const requestIds = {
      before: ++requestsRef.current.before,
      after: ++requestsRef.current.after,
    };
    setSampleError(null);
    setErrors({ before: null, after: null });
    setBusy({ before: true, after: true });
    try {
      const [before, after] = await Promise.all(
        (["before", "after"] as PhotoSlot[]).map(async (slot): Promise<LocalPhoto> => {
          const url = `/assets/before-after/${slot}.webp`;
          const image = await decodeLocalImage(url);
          return { source: "sample", url, name: `Public sample: ${slot}`, size: 0,
            width: image.naturalWidth, height: image.naturalHeight };
        }),
      );
      if (requestsRef.current.before !== requestIds.before || requestsRef.current.after !== requestIds.after) return;
      setPhotos({ before, after });
      setDates({ before: "", after: "" });
      setLabels({ before: "", after: "" });
      setIncludeLabels(true);
      setMode("side_by_side");
      resetAlignment();
      setPrivacyBlur(false);
      setExportState("idle");
      track("progress_photo_compare_sample_loaded", { tool: TOOL_ID, input_mode: "sample_photos" });
    } catch {
      if (requestsRef.current.before === requestIds.before && requestsRef.current.after === requestIds.after) {
        setSampleError("The samples could not load. Try again, or choose your own photos.");
      }
    } finally {
      for (const slot of ["before", "after"] as PhotoSlot[]) {
        if (requestsRef.current[slot] === requestIds[slot]) {
          setBusy((current) => ({ ...current, [slot]: false }));
        }
      }
    }
  }

  function useMyPhotos() {
    clearPhoto("before");
    clearPhoto("after");
    setSampleError(null);
    setDates({ before: "", after: "" });
    setLabels({ before: "", after: "" });
    setMode("side_by_side");
    resetAlignment();
    setPrivacyBlur(false);
    setExportState("idle");
  }

  function clearPhoto(slot: PhotoSlot) {
    requestsRef.current[slot] += 1;
    setBusy((current) => ({ ...current, [slot]: false }));
    setErrors((current) => ({ ...current, [slot]: null }));
    setPhotos((current) => {
      const photo = current[slot];
      if (photo) {
        URL.revokeObjectURL(photo.url);
        urlsRef.current.delete(photo.url);
      }
      return { ...current, [slot]: null };
    });
  }

  function updateOffset(
    slot: PhotoSlot,
    axis: keyof ProgressPhotoOffset,
    value: number,
  ) {
    setOffsets((current) => ({
      ...current,
      [slot]: { ...current[slot], [axis]: value },
    }));
  }

  function updateMask(slot: PhotoSlot, axis: keyof MaskPosition, value: number) {
    setMaskPositions((current) => ({
      ...current,
      [slot]: { ...current[slot], [axis]: value },
    }));
  }

  function resetAlignment() {
    setZoom(1);
    setOffsets({
      before: { ...DEFAULT_OFFSETS.before },
      after: { ...DEFAULT_OFFSETS.after },
    });
    setWipePosition(50);
    setGhostOpacity(0.48);
  }

  async function exportPng() {
    if (!photos.before || !photos.after || !inputMode || exportState === "exporting") return;
    setExportState("exporting");

    try {
      const [beforeImage, afterImage] = await Promise.all([
        decodeLocalImage(photos.before.url),
        decodeLocalImage(photos.after.url),
      ]);
      const layout = progressPhotoExportLayout(mode);
      const canvas = document.createElement("canvas");
      canvas.width = layout.width;
      canvas.height = layout.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.fillStyle = "#111210";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const beforeMask = {
        enabled: privacyBlur,
        position: maskPositions.before,
        size: maskSize,
      };
      const afterMask = {
        enabled: privacyBlur,
        position: maskPositions.after,
        size: maskSize,
      };

      if (mode === "side_by_side") {
        drawImageFrame(
          context,
          beforeImage,
          layout.before,
          zoom,
          offsets.before,
          beforeMask,
        );
        drawImageFrame(
          context,
          afterImage,
          layout.after,
          zoom,
          offsets.after,
          afterMask,
        );
        context.fillStyle = "rgba(247, 246, 239, 0.9)";
        context.fillRect(layout.before.width - 2, 0, 4, canvas.height);
      } else {
        drawImageFrame(
          context,
          beforeImage,
          layout.before,
          zoom,
          offsets.before,
          beforeMask,
        );
        if (mode === "wipe") {
          context.save();
          context.beginPath();
          context.rect(0, 0, (wipePosition / 100) * canvas.width, canvas.height);
          context.clip();
          drawImageFrame(
            context,
            afterImage,
            layout.after,
            zoom,
            offsets.after,
            afterMask,
          );
          context.restore();
          context.fillStyle = "#dcff45";
          context.fillRect((wipePosition / 100) * canvas.width - 2, 0, 4, canvas.height);
        } else {
          drawImageFrame(
            context,
            afterImage,
            layout.after,
            zoom,
            offsets.after,
            afterMask,
            ghostOpacity,
          );
        }
      }

      if (includeLabels) {
        const maxLabelWidth = canvas.width / 2 - 52;
        drawExportLabel(context, exportLabels[leftLabelSlot], 26, 26, "left", maxLabelWidth);
        drawExportLabel(context, exportLabels[rightLabelSlot], canvas.width - 26, 26, "right", maxLabelWidth);
      }
      if (hasSample) drawExportLabel(context, "SAMPLE PHOTOS", 26, canvas.height - 74);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => value ? resolve(value) : reject(new Error("PNG unavailable")),
          "image/png",
        );
      });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = progressPhotoExportFilename();
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      trackProgressPhotoCompareExport(inputMode, mode, includeLabels, privacyBlur);
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1_000);
      setExportState("idle");
    } catch {
      setExportState("error");
    }
  }

  const beforePhoto = photos.before;
  const afterPhoto = photos.after;
  const previewDescription = useMemo(() => {
    if (!ready) return "Add a before and after image to begin comparing.";
    if (mode === "side_by_side") return "Before and after photos shown side by side.";
    if (mode === "wipe") return `After photo revealed across ${wipePosition}% of the frame.`;
    return `After photo overlaid at ${Math.round(ghostOpacity * 100)}% opacity.`;
  }, [ghostOpacity, mode, ready, wipePosition]);

  return (
    <section className={styles.workspaceWrap} id="compare-workspace">
      <div className={styles.workspace}>
        <div className={styles.instrumentBar}>
          <span className={styles.instrumentLive}>
            <i aria-hidden="true" /> Local darkroom
          </span>
          <span>GF-CMP · Browser memory only</span>
        </div>

        <div className={styles.privacyStrip} id="local-photo-privacy">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <p>
            <strong>Your photos stay on this device.</strong> They are opened
            with temporary browser URLs, never uploaded, and removed from the
            page when you close or clear them.
          </p>
        </div>

        {(!photos.before && !photos.after || hasSample) && <div className={styles.sampleBar}>
          <div>
            <strong>{hasSample ? "You are viewing sample photos" : "Try the controls before choosing your photos"}</strong>
            <p>{hasSample
              ? "Public examples. Replace both photos for your own comparison, or start fresh below."
              : "Load two public examples to explore alignment, overlay and export."}</p>
          </div>
          {hasSample ? (
            <button type="button" onClick={useMyPhotos}>Use my photos</button>
          ) : !photos.before && !photos.after ? (
            <button type="button" onClick={loadSamples} disabled={busy.before || busy.after}>
              {busy.before || busy.after ? "Loading photos…" : "Try sample photos"}
            </button>
          ) : null}
        </div>}
        {sampleError && <p className={styles.uploadError} role="alert">{sampleError}</p>}

        <div className={styles.uploadGrid} aria-describedby="local-photo-privacy">
          <UploadCard
            slot="before"
            photo={beforePhoto}
            busy={busy.before}
            error={errors.before}
            onFile={loadPhoto}
            onClear={clearPhoto}
          />
          <UploadCard
            slot="after"
            photo={afterPhoto}
            busy={busy.after}
            error={errors.after}
            onFile={loadPhoto}
            onClear={clearPhoto}
          />
        </div>

        <div className={styles.compareGrid}>
          <div className={styles.previewColumn}>
            <div className={styles.previewHeader}>
              <div>
                <span>Comparison output</span>
                <h2>Alignment table</h2>
              </div>
              <span className={styles.localBadge}>Local preview</span>
            </div>

            <figure
              className={`${styles.previewStage} ${previewClass}`}
              aria-label={previewDescription}
            >
              {beforePhoto && afterPhoto ? (
                mode === "side_by_side" ? (
                  <>
                    <PhotoFrame
                      photo={beforePhoto}
                      label={exportLabels.before}
                      showLabel={includeLabels}
                      zoom={zoom}
                      offset={offsets.before}
                      privacyBlur={privacyBlur}
                      maskPosition={maskPositions.before}
                      maskSize={maskSize}
                      maskTone="before"
                    />
                    <PhotoFrame
                      photo={afterPhoto}
                      label={exportLabels.after}
                      showLabel={includeLabels}
                      zoom={zoom}
                      offset={offsets.after}
                      privacyBlur={privacyBlur}
                      maskPosition={maskPositions.after}
                      maskSize={maskSize}
                      maskTone="after"
                    />
                  </>
                ) : (
                  <>
                    <PhotoFrame
                      photo={beforePhoto}
                      label="Before"
                      zoom={zoom}
                      offset={offsets.before}
                      privacyBlur={privacyBlur}
                      maskPosition={maskPositions.before}
                      maskSize={maskSize}
                      showLabel={false}
                      maskTone="before"
                    />
                    <div
                      className={styles.overlayLayer}
                      style={mode === "wipe"
                        ? { clipPath: `inset(0 ${100 - wipePosition}% 0 0)` }
                        : { opacity: ghostOpacity }}
                    >
                      <PhotoFrame
                        photo={afterPhoto}
                        label="After"
                        zoom={zoom}
                        offset={offsets.after}
                        privacyBlur={privacyBlur}
                        maskPosition={maskPositions.after}
                        maskSize={maskSize}
                        showLabel={false}
                        maskTone="after"
                      />
                    </div>
                    {mode === "wipe" && (
                      <span
                        className={styles.wipeLine}
                        style={{ left: `${wipePosition}%` }}
                        aria-hidden="true"
                      >
                        <i />
                      </span>
                    )}
                    {includeLabels && <>
                      <span className={`${styles.photoLabel} ${styles.overlayBeforeLabel}`}>
                        {exportLabels[leftLabelSlot]}
                      </span>
                      <span className={`${styles.photoLabel} ${styles.overlayAfterLabel}`}>
                        {exportLabels[rightLabelSlot]}
                      </span>
                    </>}
                  </>
                )
              ) : (
                <div className={styles.waitingStage}>
                  <span className={styles.crosshair} aria-hidden="true" />
                  <div>
                    <strong>{beforePhoto || afterPhoto ? "One frame loaded" : "The table is empty"}</strong>
                    <p>
                      {beforePhoto || afterPhoto
                        ? `Add the ${beforePhoto ? "after" : "before"} photo to unlock alignment.`
                        : "Choose two photos above. Nothing will be uploaded."}
                    </p>
                  </div>
                </div>
              )}
              {hasSample && ready && <span className={styles.sampleWatermark}>Sample photos</span>}
            </figure>
            <p className={styles.previewStatus} aria-live="polite">
              {previewDescription}
              {privacyBlur ? " Manual privacy masks are visible and included in export." : ""}
            </p>
          </div>

          <aside className={styles.controlsPanel} aria-label="Comparison controls">
            <div className={styles.controlsHeading}>
              <span>03 · Calibrate</span>
              <h2>Line up the frame</h2>
              <p>Match body scale first. Then center each image independently.</p>
            </div>

            <fieldset className={styles.modePicker} disabled={!ready}>
              <legend>Comparison mode</legend>
              <div role="radiogroup" aria-label="Comparison mode">
                {MODE_COPY.map((item) => (
                  <button
                    type="button"
                    role="radio"
                    key={item.value}
                    aria-checked={mode === item.value}
                    className={mode === item.value ? styles.modeActive : undefined}
                    onClick={() => setMode(item.value)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.note}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className={styles.controlSection} aria-disabled={!ready}>
              <RangeControl
                label="Shared zoom"
                value={Math.round(zoom * 100)}
                min={100}
                max={260}
                output={`${Math.round(zoom * 100)}%`}
                disabled={!ready}
                onChange={(value) => ready && setZoom(value / 100)}
              />

              <div className={styles.alignmentGrid}>
                {(["before", "after"] as PhotoSlot[]).map((slot) => (
                  <fieldset key={slot} disabled={!ready}>
                    <legend>{slot === "before" ? "Before" : "After"} position</legend>
                    <RangeControl
                      label="Horizontal"
                      value={offsets[slot].x}
                      min={-100}
                      max={100}
                      output={offsets[slot].x === 0 ? "Centered" : `${offsets[slot].x > 0 ? "+" : ""}${offsets[slot].x}`}
                      onChange={(value) => updateOffset(slot, "x", value)}
                    />
                    <RangeControl
                      label="Vertical"
                      value={offsets[slot].y}
                      min={-100}
                      max={100}
                      output={offsets[slot].y === 0 ? "Centered" : `${offsets[slot].y > 0 ? "+" : ""}${offsets[slot].y}`}
                      onChange={(value) => updateOffset(slot, "y", value)}
                    />
                  </fieldset>
                ))}
              </div>

              {mode === "wipe" && (
                <RangeControl
                  label="Wipe position"
                  value={wipePosition}
                  min={5}
                  max={95}
                  output={`${wipePosition}% after`}
                  disabled={!ready}
                  onChange={setWipePosition}
                />
              )}
              {mode === "ghost" && (
                <RangeControl
                  label="After-photo strength"
                  value={Math.round(ghostOpacity * 100)}
                  min={15}
                  max={85}
                  output={`${Math.round(ghostOpacity * 100)}%`}
                  disabled={!ready}
                  onChange={(value) => setGhostOpacity(value / 100)}
                />
              )}
            </div>

            <div className={styles.privacyControl}>
              <label>
                <span>
                  <strong>Privacy blur</strong>
                  <small>Manually mask both faces</small>
                </span>
                <input
                  type="checkbox"
                  checked={privacyBlur}
                  disabled={!ready}
                  onChange={(event) => setPrivacyBlur(event.target.checked)}
                />
                <i aria-hidden="true" />
              </label>

              {privacyBlur && ready && (
                <div className={styles.maskControls}>
                  <RangeControl
                    label="Mask size"
                    value={maskSize}
                    min={10}
                    max={30}
                    output={`${maskSize}%`}
                    onChange={setMaskSize}
                  />
                  {(["before", "after"] as PhotoSlot[]).map((slot) => (
                    <fieldset key={slot}>
                      <legend>{slot === "before" ? "Before" : "After"} mask</legend>
                      <RangeControl
                        label="Left / right"
                        value={maskPositions[slot].x}
                        min={8}
                        max={92}
                        output={`${maskPositions[slot].x}%`}
                        onChange={(value) => updateMask(slot, "x", value)}
                      />
                      <RangeControl
                        label="Up / down"
                        value={maskPositions[slot].y}
                        min={6}
                        max={60}
                        output={`${maskPositions[slot].y}%`}
                        onChange={(value) => updateMask(slot, "y", value)}
                      />
                    </fieldset>
                  ))}
                  <p>
                    Blur reduces recognizability but is not guaranteed
                    anonymization. Check the downloaded file before sharing.
                  </p>
                </div>
              )}
            </div>

            <details className={styles.exportLabels}>
              <summary>Dates and labels (optional)</summary>
              <fieldset disabled={!ready}>
                <label className={styles.labelsToggle}>
                  <input type="checkbox" checked={includeLabels} onChange={(event) => setIncludeLabels(event.target.checked)} />
                  Include labels in PNG
                </label>
                {(["before", "after"] as PhotoSlot[]).map((slot) => (
                  <div key={slot} className={styles.labelFields}>
                    <label>
                      {slot === "before" ? "Before" : "After"} label
                      <input type="text" maxLength={24} value={labels[slot]} placeholder={slot === "before" ? "Before" : "After"} disabled={!includeLabels}
                        onChange={(event) => setLabels((current) => ({ ...current, [slot]: event.target.value }))} />
                    </label>
                    <label>
                      {slot === "before" ? "Before" : "After"} date
                      <input type="date" value={dates[slot]} disabled={!includeLabels}
                        onInput={(event) => {
                          const value = event.currentTarget.value;
                          setDates((current) => ({ ...current, [slot]: value }));
                        }} />
                    </label>
                  </div>
                ))}
                <p>Dates are optional and stay in this tab. No date is inferred from the photo.</p>
              </fieldset>
            </details>

            <div className={styles.actionRow}>
              <button type="button" onClick={resetAlignment} disabled={!ready}>
                Reset alignment
              </button>
              <button
                type="button"
                className={styles.exportButton}
                onClick={exportPng}
                disabled={!ready || exportState === "exporting"}
              >
                {exportState === "exporting" ? "Building PNG…" : "Export PNG"}
                <span aria-hidden="true">↓</span>
              </button>
            </div>
            {exportState === "error" && (
              <p className={styles.exportError} role="alert">
                The PNG could not be created. Try a JPEG or PNG copy of each image.
              </p>
            )}
          </aside>
        </div>

        <div className={styles.disclaimer}>
          <span>Read the image honestly</span>
          <p>
            This tool aligns pictures; it does not measure muscle, fat, or
            health. Lighting, pose, lens, pump, clothing, hydration, and camera
            distance can create apparent changes. Use repeatable conditions.
          </p>
        </div>
      </div>

      {personalResult && (
        <div className={styles.conversionWrap}>
          <ToolConversionCard
            tool={TOOL_ID}
            campaign="web-progress-compare"
            placement="result"
            sticky={false}
            headline="Keep every comparison in one private timeline."
            body="GainFrame aligns your check-ins, tracks body composition and surfaces what actually changed—free to start on iPhone."
            desktopBody="Scan with your iPhone to keep aligned check-ins, body-composition trends and progress notes together."
            experiment={buildToolResultCtaExperiment({
              tool: TOOL_ID,
            })}
          />
        </div>
      )}
    </section>
  );
}
