"use client";

import { useEffect, useRef, useState } from "react";
import {
  gapToFifth,
  selectedIsInTopFive,
  shareFilename,
  type LeaderboardShareContext,
  type LeaderboardSharePlacement,
  type LeaderboardShareTemplate,
} from "./leaderboard-share";
import {
  reportLeaderboardShareIntent,
  trackLeaderboardSharePreview,
  trackLeaderboardShareTemplate,
} from "./leaderboard-share-observability";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const MASCOT_PATH = "/assets/gainframe-guy/poses/gainframe-guy-wave.png";

const TEMPLATES: Array<{
  value: LeaderboardShareTemplate;
  name: string;
  description: string;
  swatch: string;
}> = [
  {
    value: "standings",
    name: "Leaderboard Snapshot",
    description: "The full top-five scorebook",
    swatch: "cream",
  },
  {
    value: "rank_flex",
    name: "Rank Flex",
    description: "Your rank, turned up loud",
    swatch: "coral",
  },
  {
    value: "chasing_five",
    name: "Chasing Five",
    description: "The gap to the leader group",
    swatch: "sage",
  },
];

let mascotPromise: Promise<HTMLImageElement> | undefined;

function loadMascot(): Promise<HTMLImageElement> {
  if (mascotPromise) return mascotPromise;
  mascotPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Mascot unavailable"));
    image.src = MASCOT_PATH;
  });
  return mascotPromise;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function fillRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke?: string,
  lineWidth = 1,
): void {
  roundedRect(context, x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
  }
}

function font(
  context: CanvasRenderingContext2D,
  size: number,
  weight: number,
  family: "display" | "body" = "body",
): void {
  context.font = `${weight} ${size}px ${family === "display" ? '"Outfit"' : '"DM Sans"'}, sans-serif`;
}

function drawTrackedText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  tracking: number,
): void {
  let position = x;
  for (const character of value) {
    context.fillText(character, position, y);
    position += context.measureText(character).width + tracking;
  }
}

function periodLabel(value: LeaderboardShareContext["period"]): string {
  if (value === "all_time") return "ALL TIME";
  if (value === "year") return "THIS YEAR";
  if (value === "month") return "THIS MONTH";
  return "THIS WEEK";
}

function goalLabel(value: LeaderboardShareContext["goal"]): string {
  if (value === "all") return "ALL GOALS";
  if (value === "Gain Muscle") return "GAIN MUSCLE";
  if (value === "Lose Weight") return "LOSE WEIGHT";
  return "BODY RECOMP";
}

function drawBrand(
  context: CanvasRenderingContext2D,
  color: string,
  subtleColor: string,
): void {
  fillRoundedRect(context, 68, 67, 52, 52, 15, color);
  context.fillStyle = "#fffaf1";
  font(context, 24, 900, "display");
  context.textAlign = "center";
  context.fillText("GF", 94, 102);
  context.textAlign = "left";
  context.fillStyle = color;
  font(context, 31, 900, "display");
  context.fillText("GainFrame", 139, 104);
  context.fillStyle = subtleColor;
  font(context, 15, 800);
  drawTrackedText(context, "COMMUNITY SCOREBOOK", 140, 128, 2.2);
}

function drawMascot(
  context: CanvasRenderingContext2D,
  mascot: HTMLImageElement | null,
  x: number,
  y: number,
  width: number,
  opacity = 1,
): void {
  if (!mascot) return;
  const height = width * (mascot.naturalHeight / mascot.naturalWidth);
  context.save();
  context.globalAlpha = opacity;
  context.drawImage(mascot, x, y, width, height);
  context.restore();
}

function drawScoreRow(
  context: CanvasRenderingContext2D,
  entry: LeaderboardShareContext["selected"],
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    compact?: boolean;
    dark?: boolean;
  },
): void {
  const {
    x,
    y,
    width,
    height,
    selected,
    compact = false,
    dark = false,
  } = options;
  const background = selected
    ? dark ? "#f7f0e5" : "#1d211d"
    : dark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.72)";
  const primary = selected
    ? dark ? "#172018" : "#fffaf2"
    : dark ? "#fffaf2" : "#1c211d";
  const secondary = selected
    ? dark ? "#56705b" : "#bdc9bb"
    : dark ? "rgba(255,250,242,.55)" : "#6f776f";

  fillRoundedRect(
    context,
    x,
    y,
    width,
    height,
    compact ? 20 : 26,
    background,
    selected ? undefined : dark ? "rgba(255,255,255,.11)" : "rgba(24,30,25,.08)",
    2,
  );
  context.fillStyle = primary;
  font(context, compact ? 25 : 31, 900, "display");
  context.textAlign = "left";
  context.fillText(`#${entry.rank}`, x + (compact ? 24 : 31), y + height / 2 + (compact ? 9 : 11));

  context.fillStyle = primary;
  font(context, compact ? 24 : 28, 800);
  const username = compact && entry.username.length > 10
    ? `@${entry.username.slice(0, 9)}…`
    : `@${entry.username}`;
  context.fillText(username, x + (compact ? 105 : 128), y + height / 2 + 9);

  context.fillStyle = primary;
  font(context, compact ? 35 : 43, 900, "display");
  context.textAlign = "right";
  context.fillText(String(entry.score), x + width - (compact ? 24 : 31), y + height / 2 + 13);
  context.textAlign = "left";

  if (!compact && selected) {
    context.fillStyle = secondary;
    font(context, 13, 900);
    drawTrackedText(context, "YOU", x + 31, y + 29, 2.4);
  }
}

function drawSnapshot(
  context: CanvasRenderingContext2D,
  data: LeaderboardShareContext,
  mascot: HTMLImageElement | null,
): void {
  context.fillStyle = "#f5efe4";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.fillStyle = "rgba(90,108,91,.055)";
  for (let y = 0; y < CARD_HEIGHT; y += 42) context.fillRect(0, y, CARD_WIDTH, 1);
  context.fillStyle = "#e25548";
  context.fillRect(0, 0, 18, CARD_HEIGHT);

  drawBrand(context, "#e25548", "#718075");
  context.fillStyle = "#1c211d";
  font(context, 72, 900, "display");
  context.fillText("LEADERBOARD", 68, 238);
  context.fillText("SNAPSHOT", 68, 307);
  context.fillStyle = "#667168";
  font(context, 17, 850);
  drawTrackedText(context, `${goalLabel(data.goal)}  /  ${periodLabel(data.period)}`, 72, 347, 1.5);

  const selectedInTopFive = selectedIsInTopFive(data);
  const startY = 405;
  const rowHeight = 105;
  data.topFive.forEach((entry, index) => {
    drawScoreRow(context, entry, {
      x: 68,
      y: startY + index * 116,
      width: 944,
      height: rowHeight,
      selected: entry.entry_id === data.selected.entry_id,
    });
  });

  if (!selectedInTopFive) {
    context.fillStyle = "#879087";
    font(context, 13, 900);
    drawTrackedText(context, "YOUR POSITION", 72, 1020, 2.7);
    drawScoreRow(context, data.selected, {
      x: 68,
      y: 1044,
      width: 944,
      height: 119,
      selected: true,
    });
  }

  context.fillStyle = "#4f5e52";
  font(context, 22, 750);
  context.fillText(selectedInTopFive ? "You made the five." : "Keep the frame moving.", 72, 1267);
  context.fillStyle = "#879087";
  font(context, 15, 700);
  context.fillText("gainframe.app/leaderboard", 72, 1296);
  drawMascot(context, mascot, 850, 1164, 165);
}

function drawRankFlex(
  context: CanvasRenderingContext2D,
  data: LeaderboardShareContext,
  mascot: HTMLImageElement | null,
): void {
  context.fillStyle = "#e65b4e";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.save();
  context.translate(740, 330);
  context.rotate(-0.22);
  context.fillStyle = "rgba(255,246,235,.11)";
  context.fillRect(-760, -42, 1520, 84);
  context.restore();
  context.strokeStyle = "rgba(255,246,235,.14)";
  context.lineWidth = 2;
  for (let x = -300; x < 1400; x += 110) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + 460, CARD_HEIGHT);
    context.stroke();
  }

  drawBrand(context, "#1d211d", "rgba(255,250,242,.72)");
  context.fillStyle = "#fff8ef";
  font(context, 24, 900);
  drawTrackedText(context, `${goalLabel(data.goal)}  /  ${periodLabel(data.period)}`, 69, 197, 2);
  context.fillStyle = "#1d211d";
  font(context, 84, 900, "display");
  context.fillText("RANK", 65, 305);
  context.fillStyle = "#fff8ef";
  const rankFontSize = data.selected.rank >= 100
    ? 205
    : data.selected.rank >= 10
      ? 250
      : 294;
  font(context, rankFontSize, 900, "display");
  context.fillText(`#${data.selected.rank}`, 48, 568);
  context.fillStyle = "#1d211d";
  font(context, 38, 850);
  context.fillText(`@${data.selected.username}`, 70, 636);
  context.fillStyle = "rgba(29,33,29,.72)";
  font(context, 22, 750);
  context.fillText(`${data.selected.score} GAINFRAME SCORE`, 72, 675);

  fillRoundedRect(context, 548, 220, 464, 642, 38, "#1d211d");
  context.fillStyle = "#9db1a0";
  font(context, 14, 900);
  drawTrackedText(context, "TOP FIVE", 590, 274, 3.3);
  data.topFive.forEach((entry, index) => {
    drawScoreRow(context, entry, {
      x: 582,
      y: 303 + index * 102,
      width: 396,
      height: 88,
      selected: entry.entry_id === data.selected.entry_id,
      compact: true,
      dark: true,
    });
  });

  context.fillStyle = "#fff8ef";
  font(context, 74, 900, "display");
  context.fillText(selectedIsInTopFive(data) ? "FIVE, SECURED." : "STILL CLIMBING.", 68, 1033);
  context.fillStyle = "rgba(255,248,239,.78)";
  font(context, 24, 700);
  context.fillText("Progress over popularity.", 72, 1083);
  context.fillStyle = "rgba(255,248,239,.66)";
  font(context, 17, 750);
  context.fillText("gainframe.app/leaderboard", 72, 1295);
  drawMascot(context, mascot, 710, 914, 315);
}

function drawChasingFive(
  context: CanvasRenderingContext2D,
  data: LeaderboardShareContext,
  mascot: HTMLImageElement | null,
): void {
  context.fillStyle = "#f6f1e7";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.fillStyle = "#dfe9df";
  context.beginPath();
  context.arc(1040, 280, 430, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(103,137,109,.08)";
  context.beginPath();
  context.arc(68, 1180, 330, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#688b6e";
  context.fillRect(0, 0, CARD_WIDTH, 14);

  drawBrand(context, "#e25548", "#718075");
  context.fillStyle = "#1b211c";
  font(context, 80, 900, "display");
  context.fillText("CHASING", 68, 247);
  context.fillText("FIVE", 68, 318);
  context.fillStyle = "#617065";
  font(context, 17, 850);
  drawTrackedText(context, `${goalLabel(data.goal)}  /  ${periodLabel(data.period)}`, 72, 360, 1.5);

  const gap = gapToFifth(data);
  const inTopFive = selectedIsInTopFive(data);
  fillRoundedRect(context, 68, 413, 437, 348, 38, "#1d211d");
  context.fillStyle = "#9db1a0";
  font(context, 14, 900);
  drawTrackedText(context, "YOUR POSITION", 106, 472, 3);
  context.fillStyle = "#fff8ee";
  const positionFontSize = data.selected.rank >= 100
    ? 132
    : data.selected.rank >= 10
      ? 156
      : 178;
  font(context, positionFontSize, 900, "display");
  context.fillText(`#${data.selected.rank}`, 91, 642);
  context.fillStyle = "#c5d3c5";
  font(context, 25, 800);
  context.fillText(`@${data.selected.username}  ·  ${data.selected.score} GF`, 105, 708);

  fillRoundedRect(context, 535, 413, 477, 348, 38, "#dfe9df", "rgba(82,116,87,.15)", 2);
  context.fillStyle = "#5e7d64";
  font(context, 14, 900);
  drawTrackedText(context, inTopFive ? "STATUS" : "GAP TO #5", 574, 472, 3);
  context.fillStyle = "#1b211c";
  font(context, inTopFive ? 67 : 164, 900, "display");
  context.fillText(inTopFive ? "IN THE FIVE" : gap === null ? "—" : String(gap), 568, inTopFive ? 611 : 642);
  context.fillStyle = "#5e6f62";
  font(context, 23, 750);
  context.fillText(
    inTopFive ? "Hold the line." : gap === null ? "Keep moving." : `${gap === 1 ? "POINT" : "POINTS"} TO THE LEADER GROUP`,
    575,
    708,
  );

  context.fillStyle = "#6a786d";
  font(context, 14, 900);
  drawTrackedText(context, "THE FIVE TO CATCH", 71, 836, 3.1);
  data.topFive.forEach((entry, index) => {
    const width = 174;
    const x = 68 + index * 189;
    const selected = entry.entry_id === data.selected.entry_id;
    fillRoundedRect(
      context,
      x,
      868,
      width,
      205,
      29,
      selected ? "#e25548" : "rgba(255,255,255,.78)",
      selected ? undefined : "rgba(30,38,31,.09)",
      2,
    );
    context.fillStyle = selected ? "#fff8ef" : "#65806a";
    font(context, 19, 900, "display");
    context.fillText(`#${entry.rank}`, x + 21, 909);
    context.fillStyle = selected ? "#fff8ef" : "#1c211d";
    font(context, 42, 900, "display");
    context.fillText(String(entry.score), x + 20, 966);
    context.fillStyle = selected ? "rgba(255,248,239,.78)" : "#727b73";
    font(context, 16, 750);
    const displayName = entry.username.length > 12
      ? `@${entry.username.slice(0, 10)}…`
      : `@${entry.username}`;
    context.fillText(displayName, x + 20, 1012);
  });

  context.fillStyle = "#344738";
  font(context, 26, 800);
  context.fillText(inTopFive ? "You caught the five." : "One frame closer.", 72, 1249);
  context.fillStyle = "#7a867c";
  font(context, 16, 700);
  context.fillText("gainframe.app/leaderboard", 72, 1282);
  drawMascot(context, mascot, 826, 1080, 180);
}

async function renderCard(
  canvas: HTMLCanvasElement,
  template: LeaderboardShareTemplate,
  data: LeaderboardShareContext,
): Promise<void> {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  await document.fonts?.ready;
  let mascot: HTMLImageElement | null = null;
  try {
    mascot = await loadMascot();
  } catch {
    // The card remains branded and exportable when the decorative asset fails.
  }

  context.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  if (template === "rank_flex") drawRankFlex(context, data, mascot);
  else if (template === "chasing_five") drawChasingFive(context, data, mascot);
  else drawSnapshot(context, data, mascot);
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG export failed"));
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function shareDescription(data: LeaderboardShareContext): string {
  return `@${data.selected.username} is ranked #${data.selected.rank} with a GainFrame Score of ${data.selected.score}. The card also shows the current top five.`;
}

export default function LeaderboardShareDialog({
  context,
  placement,
  onClose,
}: {
  context: LeaderboardShareContext;
  placement: LeaderboardSharePlacement;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const renderedFileRef = useRef<{ blob: Blob; file: File } | undefined>(undefined);
  const [template, setTemplate] = useState<LeaderboardShareTemplate>("standings");
  const [supportsFileShare, setSupportsFileShare] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const file = new File(["preview"], "gainframe.png", { type: "image/png" });
    setSupportsFileShare(Boolean(
      typeof navigator.share === "function" &&
      navigator.canShare?.({ files: [file] }),
    ));
    trackLeaderboardSharePreview({
      context,
      template: "standings",
      placement,
    });
  }, [context, placement]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let active = true;
    renderedFileRef.current = undefined;
    setPreviewReady(false);
    void renderCard(canvas, template, context)
      .then(() => canvasBlob(canvas))
      .then((blob) => {
        if (!active) return;
        renderedFileRef.current = {
          blob,
          file: new File(
            [blob],
            shareFilename(template, context.selected.rank),
            { type: "image/png" },
          ),
        };
        setPreviewReady(true);
      })
      .catch(() => {
        if (active) setMessage("This preview could not be drawn. Try another browser.");
      });
    return () => {
      active = false;
    };
  }, [context, template]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href]',
      )).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  function chooseTemplate(next: LeaderboardShareTemplate): void {
    setTemplate(next);
    setMessage("");
    trackLeaderboardShareTemplate({ context, template: next, placement });
  }

  async function shareOrDownload(): Promise<void> {
    const rendered = renderedFileRef.current;
    if (!rendered) {
      setMessage("The card is still drawing. Try again in a moment.");
      return;
    }
    void reportLeaderboardShareIntent({ context, template, placement });
    setExporting(true);
    setMessage("");
    try {
      if (supportsFileShare && navigator.share) {
        await navigator.share({
          files: [rendered.file],
          title: `#${context.selected.rank} on GainFrame`,
          text: "My place on the GainFrame leaderboard.",
        });
        setMessage("Share sheet opened.");
      } else {
        downloadBlob(rendered.blob, rendered.file.name);
        setMessage("PNG downloaded.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessage("The card could not be exported. Please try again.");
      }
    } finally {
      setExporting(false);
    }
  }

  function download(): void {
    const rendered = renderedFileRef.current;
    if (!rendered) {
      setMessage("The card is still drawing. Try again in a moment.");
      return;
    }
    void reportLeaderboardShareIntent({
      context,
      template,
      placement,
    });
    setExporting(true);
    setMessage("");
    try {
      downloadBlob(rendered.blob, rendered.file.name);
      setMessage("PNG downloaded.");
    } catch {
      setMessage("The card could not be exported. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div
      className="leaderboard-share-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="leaderboard-share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-share-title"
        aria-describedby="leaderboard-share-description"
      >
        <header className="leaderboard-share-heading">
          <div>
            <span>Share your rank</span>
            <h2 id="leaderboard-share-title">Pick your flex.</h2>
            <p id="leaderboard-share-description">
              Choose a GainFrame card, then share or save a 4:5 PNG.
            </p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close share card picker">×</button>
        </header>

        <div className="leaderboard-share-layout">
          <fieldset className="leaderboard-share-options">
            <legend>Card style</legend>
            {TEMPLATES.map((option, index) => (
              <label
                className={template === option.value ? "is-selected" : undefined}
                key={option.value}
              >
                <input
                  type="radio"
                  name="leaderboard-share-template"
                  value={option.value}
                  checked={template === option.value}
                  onChange={() => chooseTemplate(option.value)}
                />
                <span className={`leaderboard-share-swatch leaderboard-share-swatch--${option.swatch}`} aria-hidden="true">
                  <b>{String(index + 1).padStart(2, "0")}</b>
                </span>
                <span>
                  <strong>{option.name}</strong>
                  <small>{option.description}</small>
                </span>
                <i aria-hidden="true">✓</i>
              </label>
            ))}
            <p className="leaderboard-share-privacy">
              Public handles, ranks, and scores only. No photos, bio, region,
              or private profile data.
            </p>
          </fieldset>

          <figure className="leaderboard-share-preview">
            <canvas
              ref={canvasRef}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              role="img"
              aria-label={shareDescription(context)}
            />
            <figcaption>1080 × 1350 · PNG · optimized for social feeds</figcaption>
          </figure>
        </div>

        <footer className="leaderboard-share-actions">
          <p role="status" aria-live="polite">
            {message || (!previewReady ? "Drawing your card…" : "")}
          </p>
          <div>
            {supportsFileShare && (
              <button type="button" className="leaderboard-share-download" disabled={exporting || !previewReady} onClick={() => void download()}>
                Download PNG
              </button>
            )}
            <button type="button" className="leaderboard-share-primary" disabled={exporting || !previewReady} onClick={() => void shareOrDownload()}>
              {exporting ? "Preparing card…" : supportsFileShare ? "Share image" : "Download PNG"}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
