"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import ToolConversionCard from "@/components/ToolConversionCard";
import { track } from "@/lib/analytics";
import { trackToolFunnelStep } from "@/lib/tool-funnel";
import {
  clamp,
  cropRegion,
  dateLabel,
  DEFAULT_MASK,
  photoCountBucket,
  safeRegion,
  selectionRegion,
  type Mask,
  type Framing,
} from "@/lib/photo-studio";
import {
  canvasBlob,
  decodePhoto,
  labelFrame,
  releasePhoto,
  renderPhoto,
  samplePhotos,
  type LocalPhoto,
} from "@/lib/photo-studio-browser";
import styles from "./studio.module.css";

type Mode = "privacy" | "timelapse";
type Output = { url: string; name: string };
function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className={styles.slider}>
      <span>
        {label}
        <output>{Math.round(value * 100) / 100}</output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export default function PhotoStudio({ mode }: { mode: Mode }) {
  const privacy = mode === "privacy",
    limit = privacy ? 10 : 24;
  const tool = privacy
    ? "gym_photo_privacy_editor"
    : "progress_photo_timelapse_maker";
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [selected, setSelected] = useState(0);
  const [selectedMask, setSelectedMask] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [original, setOriginal] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [interval, setIntervalMs] = useState(700);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [drag, setDrag] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const currentPhotos = useRef(photos);
  currentPhotos.current = photos;
  const cancelled = useRef(false),
    mounted = useRef(true),
    eventKeys = useRef(new Set<string>());
  const photo = photos[selected],
    mask = photo?.masks[selectedMask];
  const shownPhoto =
    photos[playing ? frame % Math.max(1, photos.length) : selected];
  const source = photos.some((p) => p.sample)
    ? "sample_photos"
    : "local_images";
  const ready = privacy ? !!photo : photos.length >= 3;

  useEffect(() => {
    mounted.current = true;
    trackToolFunnelStep(tool, "viewed");
    return () => {
      mounted.current = false;
      cancelled.current = true;
      currentPhotos.current.forEach(releasePhoto);
    };
  }, [tool]);
  useEffect(
    () => () => outputs.forEach((o) => URL.revokeObjectURL(o.url)),
    [outputs],
  );
  useEffect(() => {
    setOutputs([]);
    setMessage("");
  }, [photos, interval]);
  useEffect(() => {
    if (!playing || photos.length < 3) return;
    const timer = window.setInterval(
      () => setFrame((f) => (f + 1) % photos.length),
      interval,
    );
    return () => window.clearInterval(timer);
  }, [playing, photos.length, interval]);
  useEffect(() => {
    if (!shownPhoto || !canvas.current) return;
    const rendered = renderPhoto(
      shownPhoto,
      privacy ? undefined : 480,
      privacy ? undefined : 600,
      original,
    );
    if (!privacy)
      labelFrame(rendered, dateLabel(shownPhoto.date), shownPhoto.sample);
    else if (shownPhoto.sample) labelFrame(rendered, "", true);
    const target = canvas.current;
    target.width = rendered.width;
    target.height = rendered.height;
    const ctx = target.getContext("2d")!;
    ctx.drawImage(rendered, 0, 0);
    if (overlay && !privacy && !playing && selected > 0) {
      const reference = renderPhoto(photos[0], 480, 600);
      ctx.globalAlpha = 0.25;
      ctx.drawImage(reference, 0, 0);
      ctx.globalAlpha = 1;
      reference.width = 1;
    }
    if (drag) {
      ctx.strokeStyle = "#e79c6d";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(
        drag.start.x * target.width,
        drag.start.y * target.height,
        (drag.end.x - drag.start.x) * target.width,
        (drag.end.y - drag.start.y) * target.height,
      );
    }
    rendered.width = 1;
  }, [shownPhoto, privacy, original, overlay, playing, selected, photos, drag]);
  useEffect(() => {
    const valid = privacy
      ? photos.some((p) => p.masks.length > 0)
      : photos.length >= 3;
    const key = `result:${source}`;
    if (valid && !eventKeys.current.has(key)) {
      eventKeys.current.add(key);
      if (source === "local_images")
        trackToolFunnelStep(tool, "result_shown", {
          input_mode: source,
          input_count_bucket: photoCountBucket(photos.length),
        });
      else track("photo_studio_demo", { tool, action: "preview" });
    }
  }, [photos, privacy, source, tool]);

  function updatePhoto(patch: Partial<LocalPhoto>) {
    setPhotos((all) =>
      all.map((p, i) => (i === selected ? { ...p, ...patch } : p)),
    );
    setPlaying(false);
    setOriginal(false);
  }
  function updateFraming(patch: Partial<Framing>) {
    if (photo) updatePhoto({ framing: { ...photo.framing, ...patch } });
  }
  function updateMask(patch: Partial<Mask>) {
    if (photo && mask)
      updatePhoto({
        masks: photo.masks.map((m, i) =>
          i === selectedMask
            ? { ...m, ...patch, ...safeRegion({ ...m, ...patch }) }
            : m,
        ),
      });
  }
  function clear() {
    photos.forEach(releasePhoto);
    setPhotos([]);
    setSelected(0);
    setSelectedMask(0);
    setPlaying(false);
    setOriginal(false);
    setError("");
    eventKeys.current.clear();
  }
  async function load(files: File[]) {
    if (busy) return;
    setBusy(true);
    setError("");
    setPlaying(false);
    cancelled.current = false;
    const replaceDemo = photos.some((p) => p.sample),
      retained = replaceDemo ? [] : photos;
    const available = limit - retained.length,
      added: LocalPhoto[] = [];
    const failures: string[] = [];
    if (files.length > available)
      failures.push(
        `Only the first ${Math.max(0, available)} selected photos fit the ${limit}-photo limit.`,
      );
    for (const file of files.slice(0, available)) {
      try {
        const next = await decodePhoto(file, privacy ? 1600 : 960);
        if (!privacy) next.framing.aspect = "portrait";
        added.push(next);
      } catch (e) {
        failures.push(
          e instanceof Error ? e.message : "A photo could not be opened.",
        );
      }
      if (!mounted.current) {
        added.forEach(releasePhoto);
        return;
      }
    }
    if (added.length) {
      if (replaceDemo) photos.forEach(releasePhoto);
      setPhotos([...retained, ...added]);
      setSelected(retained.length);
      setSelectedMask(0);
      const key = "started:personal";
      if (!eventKeys.current.has(key)) {
        eventKeys.current.add(key);
        trackToolFunnelStep(tool, "started", {
          input_mode: "local_images",
          input_count_bucket: photoCountBucket(retained.length + added.length),
        });
      }
    }
    if (failures.length) {
      setError([...new Set(failures)].join(" "));
      track("photo_studio_error", { tool, reason: "input_rejected" });
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }
  async function demo() {
    if (busy) return;
    setBusy(true);
    setError("");
    const examples = await samplePhotos(privacy ? 1 : 3);
    if (!mounted.current) {
      examples.forEach(releasePhoto);
      return;
    }
    clear();
    if (privacy) examples[0].masks = [{ ...DEFAULT_MASK }];
    else examples.forEach((p) => (p.framing.aspect = "portrait"));
    setPhotos(examples);
    setBusy(false);
    track("photo_studio_demo", { tool, action: "loaded" });
  }
  function addMask() {
    if (!photo || photo.masks.length >= 12) return;
    setSelectedMask(photo.masks.length);
    updatePhoto({ masks: [...photo.masks, { ...DEFAULT_MASK }] });
  }
  function point(e: PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: clamp((e.clientX - r.left) / r.width, 0, 1),
      y: clamp((e.clientY - r.top) / r.height, 0, 1),
    };
  }
  function finishSelection(e: PointerEvent<HTMLCanvasElement>) {
    if (!drag || !photo) return;
    const end = point(e);
    if (
      Math.abs(end.x - drag.start.x) > 0.015 &&
      Math.abs(end.y - drag.start.y) > 0.015 &&
      photo.masks.length < 12
    ) {
      const region = selectionRegion(
        drag.start,
        end,
        cropRegion(photo.image.width, photo.image.height, photo.framing),
        photo.image.width,
        photo.image.height,
      );
      setSelectedMask(photo.masks.length);
      updatePhoto({ masks: [...photo.masks, { ...DEFAULT_MASK, ...region }] });
    }
    setDrag(null);
  }
  function move(direction: number) {
    const next = selected + direction;
    if (next < 0 || next >= photos.length) return;
    setPhotos((all) => {
      const copy = [...all];
      [copy[selected], copy[next]] = [copy[next], copy[selected]];
      return copy;
    });
    setSelected(next);
    setPlaying(false);
  }
  function remove() {
    if (!photo) return;
    releasePhoto(photo);
    setPhotos((all) => all.filter((_, i) => i !== selected));
    setSelected(Math.max(0, selected - 1));
    setSelectedMask(0);
    setPlaying(false);
  }
  async function exportFiles(kind: "png" | "gif" | "sheet" | "batch") {
    if (!ready || busy) return;
    setBusy(true);
    setPlaying(false);
    setOriginal(false);
    setError("");
    setOutputs([]);
    cancelled.current = false;
    const generated: Output[] = [];
    try {
      if (kind === "gif") {
        const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
        const gif = GIFEncoder();
        for (let i = 0; i < photos.length; i++) {
          if (cancelled.current) throw new Error("cancelled");
          setMessage(`Creating frame ${i + 1} of ${photos.length}…`);
          await new Promise((resolve) => setTimeout(resolve, 0));
          const rendered = renderPhoto(photos[i], 480, 600);
          labelFrame(rendered, dateLabel(photos[i].date), photos[i].sample);
          const rgba = rendered
            .getContext("2d")!
            .getImageData(0, 0, 480, 600).data;
          const palette = quantize(rgba, 128);
          gif.writeFrame(applyPalette(rgba, palette), 480, 600, {
            palette,
            delay: interval,
            repeat: 0,
          });
          rendered.width = 1;
        }
        gif.finish();
        generated.push({
          url: URL.createObjectURL(
            new Blob([new Uint8Array(gif.bytes())], { type: "image/gif" }),
          ),
          name: "gainframe-progress-timelapse.gif",
        });
      } else if (kind === "sheet") {
        const sheet = document.createElement("canvas"),
          columns = Math.min(4, photos.length);
        sheet.width = columns * 240;
        sheet.height = Math.ceil(photos.length / columns) * 300;
        const ctx = sheet.getContext("2d")!;
        ctx.fillStyle = "#f5f2e9";
        ctx.fillRect(0, 0, sheet.width, sheet.height);
        for (let i = 0; i < photos.length; i++) {
          const rendered = renderPhoto(photos[i], 480, 600);
          labelFrame(
            rendered,
            dateLabel(photos[i].date) || `Frame ${i + 1}`,
            photos[i].sample,
          );
          ctx.drawImage(
            rendered,
            (i % columns) * 240,
            Math.floor(i / columns) * 300,
            240,
            300,
          );
          rendered.width = 1;
        }
        generated.push({
          url: URL.createObjectURL(await canvasBlob(sheet)),
          name: "gainframe-contact-sheet.png",
        });
        sheet.width = 1;
      } else {
        const targets = kind === "batch" ? photos : [photo];
        for (let i = 0; i < targets.length; i++) {
          const rendered = renderPhoto(targets[i]);
          if (targets[i].sample) labelFrame(rendered, "", true);
          generated.push({
            url: URL.createObjectURL(await canvasBlob(rendered)),
            name: `gainframe-private-photo-${kind === "batch" ? i + 1 : selected + 1}.png`,
          });
          rendered.width = 1;
        }
      }
      if (cancelled.current || !mounted.current) {
        generated.forEach((o) => URL.revokeObjectURL(o.url));
        if (mounted.current)
          setMessage("Export cancelled. Your photos are still here.");
        return;
      }
      setOutputs(generated);
      setMessage(
        `${generated.length === 1 ? "Your file is" : "Your files are"} ready. Review the preview, then save below.`,
      );
      track(
        source === "sample_photos"
          ? "photo_studio_demo"
          : "photo_studio_export_ready",
        {
          tool,
          action: "export_ready",
          format: kind,
          input_count_bucket: photoCountBucket(photos.length),
        },
      );
    } catch (e) {
      generated.forEach((o) => URL.revokeObjectURL(o.url));
      if (e instanceof Error && e.message === "cancelled")
        setMessage("Export cancelled. Your photos are still here.");
      else {
        setError(
          "The export could not finish. Try fewer photos, or save a contact sheet.",
        );
        track("photo_studio_error", { tool, reason: "export_failed" });
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <section
      id="photo-workspace"
      className={`${styles.workspace} ph-no-capture ph-block`}
      data-clarity-mask="true"
      aria-label={
        privacy ? "Photo privacy workspace" : "Photo timelapse workspace"
      }
    >
      <div className={styles.topbar}>
        <span>
          <b>01</b> Choose <i /> <b>02</b>{" "}
          {privacy ? "Cover & crop" : "Order & align"} <i /> <b>03</b> Export
        </span>
        <span className={styles.localBadge}>● On your device</span>
      </div>
      <input
        ref={input}
        className={styles.fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        multiple
        aria-label="Choose photos"
        disabled={busy}
        onChange={(e) => void load(Array.from(e.target.files ?? []))}
      />
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {!photos.length ? (
        <div
          className={styles.empty}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void load(Array.from(e.dataTransfer.files));
          }}
        >
          <div className={styles.emptyArt} aria-hidden="true">
            <img
              src={`/blog/${privacy ? "blur-faces-iphone-gym-photos" : "macrofactor-workouts-review"}/assets/cover.webp`}
              alt=""
              width="720"
              height="540"
            />
          </div>
          <div className={styles.emptyCopy}>
            <span className={styles.eyebrow}>Your next photo project</span>
            <h2>
              {privacy
                ? "Share the work. Keep the details private."
                : "Months of effort. One honest loop."}
            </h2>
            <p>
              {privacy
                ? "Cover faces, reflections, badges or anything you would rather keep to yourself."
                : "Put your real check-ins in order. Match the frame and watch the series play."}
            </p>
            <button
              className={styles.primary}
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              {busy ? "Opening photos…" : "Choose photos"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
            <button
              className={styles.textButton}
              disabled={busy}
              onClick={() => void demo()}
            >
              Try an illustrated sample
            </button>
            <small>
              {privacy ? "1–10" : "3–24"} photos · JPEG, PNG, WebP · 12 MB each
              <br />
              Drop photos here, or choose them from your device.
            </small>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div>
              <strong>
                {photos.length} {photos.length === 1 ? "photo" : "photos"}
              </strong>
              <span>
                {source === "sample_photos"
                  ? "Illustrated demo · no real transformation"
                  : "Private session · originals untouched"}
              </span>
            </div>
            <div className={styles.actions}>
              <button
                disabled={busy || photos.length >= limit}
                onClick={() => input.current?.click()}
              >
                Add photos
              </button>
              <button disabled={busy} onClick={clear}>
                Clear all
              </button>
            </div>
          </div>
          <div className={styles.editor}>
            <div className={styles.stageColumn}>
              <div
                className={`${styles.stage} ph-no-capture ph-block`}
                data-clarity-mask="true"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void load(Array.from(e.dataTransfer.files));
                }}
              >
                <canvas
                  ref={canvas}
                  aria-label={
                    privacy
                      ? "Edited photo preview. Drag to add a cover; the Add cover button provides keyboard controls."
                      : "Timelapse frame preview"
                  }
                  className={
                    privacy && !original ? styles.drawCanvas : undefined
                  }
                  onPointerDown={(e) => {
                    if (!privacy || original || busy) return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    const p = point(e);
                    setDrag({ start: p, end: p });
                  }}
                  onPointerMove={(e) => {
                    if (drag) setDrag({ ...drag, end: point(e) });
                  }}
                  onPointerUp={finishSelection}
                  onPointerCancel={() => setDrag(null)}
                />
              </div>
              <div className={styles.previewbar}>
                <span>
                  {playing
                    ? `Frame ${frame + 1} / ${photos.length}`
                    : `Photo ${selected + 1} / ${photos.length}`}
                </span>
                {privacy ? (
                  <button
                    disabled={busy}
                    aria-pressed={original}
                    onClick={() => setOriginal(!original)}
                  >
                    {original ? "Show edited preview" : "Show original"}
                  </button>
                ) : (
                  <button
                    disabled={photos.length < 3 || busy}
                    aria-pressed={playing}
                    onClick={() => {
                      setFrame(selected);
                      setPlaying(!playing);
                    }}
                  >
                    {playing ? "Pause preview" : "Play preview"}
                  </button>
                )}
              </div>
              <div
                className={`${styles.filmstrip} ph-no-capture ph-block`}
                data-clarity-mask="true"
                aria-label="Photo order"
              >
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    disabled={busy}
                    aria-label={`Select photo ${i + 1}`}
                    aria-pressed={selected === i}
                    onClick={() => {
                      setSelected(i);
                      setSelectedMask(0);
                      setPlaying(false);
                      setOriginal(false);
                    }}
                  >
                    <img src={p.url} alt="" />
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
              <p className={styles.hint}>
                {privacy
                  ? "Drag on the photo to cover a detail, or use Add cover and the sliders. Review every face and reflection before sharing."
                  : "Select a frame to adjust its position. Keep the same pose and lighting; alignment cannot correct changes in those conditions."}
              </p>
            </div>
            <fieldset className={styles.controls} disabled={busy}>
              <legend className={styles.srOnly}>Photo controls</legend>
              <div className={styles.controlHeading}>
                <h3>
                  {privacy ? "Edit photo" : "Align frame"} {selected + 1}
                </h3>
                <button className={styles.textButton} onClick={remove}>
                  Remove
                </button>
              </div>
              {!privacy && (
                <>
                  <div className={styles.actions}>
                    <button disabled={selected === 0} onClick={() => move(-1)}>
                      ← Move earlier
                    </button>
                    <button
                      disabled={selected === photos.length - 1}
                      onClick={() => move(1)}
                    >
                      Move later →
                    </button>
                  </div>
                  <label className={styles.field}>
                    Date label (optional)
                    <input
                      type="date"
                      value={photo?.date ?? ""}
                      onChange={(e) => updatePhoto({ date: e.target.value })}
                    />
                  </label>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={overlay}
                      onChange={(e) => setOverlay(e.target.checked)}
                      disabled={selected === 0}
                    />{" "}
                    Show first frame as alignment guide
                  </label>
                </>
              )}
              <details open={privacy} className={styles.details}>
                <summary>
                  {privacy
                    ? "Cover identifying details"
                    : "Cover a face or detail"}
                </summary>
                <p>
                  Opaque cover hides more than blur. Nothing detects faces
                  automatically.
                </p>
                <button
                  className={styles.secondary}
                  onClick={addMask}
                  disabled={(photo?.masks.length ?? 0) >= 12}
                >
                  + Add cover
                </button>
                {!!photo?.masks.length && (
                  <>
                    <label className={styles.field}>
                      Selected region
                      <select
                        value={selectedMask}
                        onChange={(e) =>
                          setSelectedMask(Number(e.target.value))
                        }
                      >
                        {photo.masks.map((_, i) => (
                          <option key={i} value={i}>
                            Region {i + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className={styles.segment}>
                      <button
                        aria-pressed={mask?.mode === "cover"}
                        onClick={() => updateMask({ mode: "cover" })}
                      >
                        Opaque
                      </button>
                      <button
                        aria-pressed={mask?.mode === "blur"}
                        onClick={() => updateMask({ mode: "blur" })}
                      >
                        Blur
                      </button>
                    </div>
                    {mask && (
                      <>
                        <Slider
                          label="Horizontal position"
                          value={mask.x * 100}
                          max={99}
                          onChange={(n) => updateMask({ x: n / 100 })}
                        />
                        <Slider
                          label="Vertical position"
                          value={mask.y * 100}
                          max={99}
                          onChange={(n) => updateMask({ y: n / 100 })}
                        />
                        <Slider
                          label="Cover width"
                          value={mask.width * 100}
                          min={1}
                          onChange={(n) => updateMask({ width: n / 100 })}
                        />
                        <Slider
                          label="Cover height"
                          value={mask.height * 100}
                          min={1}
                          onChange={(n) => updateMask({ height: n / 100 })}
                        />
                        {mask.mode === "blur" && (
                          <Slider
                            label="Blur strength"
                            value={mask.strength}
                            min={4}
                            max={48}
                            onChange={(n) => updateMask({ strength: n })}
                          />
                        )}
                      </>
                    )}
                    <button
                      className={styles.textButton}
                      onClick={() => {
                        updatePhoto({
                          masks: photo.masks.filter(
                            (_, i) => i !== selectedMask,
                          ),
                        });
                        setSelectedMask(0);
                      }}
                    >
                      Delete selected region
                    </button>
                  </>
                )}
              </details>
              <details open={!privacy} className={styles.details}>
                <summary>{privacy ? "Crop & framing" : "Framing"}</summary>
                {privacy && (
                  <label className={styles.field}>
                    Crop
                    <select
                      value={photo?.framing.aspect}
                      onChange={(e) =>
                        updateFraming({
                          aspect: e.target.value as Framing["aspect"],
                        })
                      }
                    >
                      <option value="original">Original ratio</option>
                      <option value="portrait">Portrait · 4:5</option>
                      <option value="square">Square · 1:1</option>
                    </select>
                  </label>
                )}
                <Slider
                  label="Zoom"
                  value={photo?.framing.zoom ?? 1}
                  min={1}
                  max={3}
                  step={0.05}
                  onChange={(n) => {
                    if (privacy) updateFraming({ zoom: n });
                    else
                      setPhotos((all) =>
                        all.map((p) => ({
                          ...p,
                          framing: { ...p.framing, zoom: n },
                        })),
                      );
                  }}
                />
                <Slider
                  label="Frame left / right"
                  value={photo?.framing.x ?? 50}
                  onChange={(n) => updateFraming({ x: n })}
                />
                <Slider
                  label="Frame up / down"
                  value={photo?.framing.y ?? 50}
                  onChange={(n) => updateFraming({ y: n })}
                />
                {!privacy && (
                  <p>
                    Zoom is shared across the series. Position is set for each
                    photo. Exports use a 4:5 frame.
                  </p>
                )}
              </details>
              {!privacy && (
                <label className={styles.field}>
                  Playback speed
                  <select
                    value={interval}
                    onChange={(e) => setIntervalMs(Number(e.target.value))}
                  >
                    <option value={350}>Fast · 0.35 seconds / photo</option>
                    <option value={700}>Balanced · 0.7 seconds / photo</option>
                    <option value={1200}>Slow · 1.2 seconds / photo</option>
                  </select>
                </label>
              )}
            </fieldset>
          </div>
          <div className={styles.exportbar}>
            <div>
              <h3>
                {privacy
                  ? "A clean copy, ready to share."
                  : "Your real photos. In your order."}
              </h3>
              <p>
                {privacy
                  ? "PNG · covers baked in · original photo metadata removed"
                  : "GIF · 480 × 600 · no generated frames or morphing"}
              </p>
              {!ready && (
                <p>Add at least 3 photos to preview and export a timelapse.</p>
              )}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.primary}
                disabled={!ready || busy}
                onClick={() => void exportFiles(privacy ? "png" : "gif")}
              >
                {busy ? "Working…" : privacy ? "Prepare PNG" : "Create GIF"}{" "}
                <span aria-hidden="true">↓</span>
              </button>
              {privacy && photos.length > 1 ? (
                <button
                  disabled={busy}
                  onClick={() => void exportFiles("batch")}
                >
                  Prepare all {photos.length} PNGs
                </button>
              ) : (
                !privacy && (
                  <button
                    disabled={!ready || busy}
                    onClick={() => void exportFiles("sheet")}
                  >
                    Save contact sheet
                  </button>
                )
              )}
              {busy && message.startsWith("Creating frame") && (
                <button
                  onClick={() => {
                    cancelled.current = true;
                  }}
                >
                  Cancel export
                </button>
              )}
            </div>
          </div>
          <p className={styles.status} role="status">
            {message}
          </p>
          {!!outputs.length && (
            <div className={styles.downloads}>
              <strong>Ready to save</strong>
              <img
                className={styles.exportPreview}
                src={outputs[0].url}
                alt="Preview of the prepared export"
              />
              {outputs.map((o) => (
                <a key={o.url} href={o.url} download={o.name}>
                  {o.name} <span aria-hidden="true">↓</span>
                </a>
              ))}
              <small>
                On iPhone, open the downloaded file and use Share → Save Image
                to add it to Photos.
              </small>
            </div>
          )}
          {!!outputs.length && source === "local_images" && (
            <div className={styles.appBridge}>
              <ToolConversionCard
                tool={tool}
                campaign="web-tools"
                placement="result"
                headline="Keep the whole story together."
                body="Organize your original check-ins, compare photos, and revisit your progress in GainFrame for iPhone."
                iosLabel="Explore GainFrame for iPhone"
                proof="Photo history · Side-by-side comparisons"
                sticky={false}
              />
            </div>
          )}
        </>
      )}
      <div className={styles.bottomNote}>
        <span>No signup. No watermark on your photos.</span>
        <span>Nothing is saved here after you close this tab.</span>
      </div>
    </section>
  );
}
