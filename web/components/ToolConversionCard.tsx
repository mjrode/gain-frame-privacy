"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import DownloadQr from "@/components/DownloadQr";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import {
  useDownloadPlatform,
  type DownloadPlatform,
} from "@/components/useDownloadPlatform";
import { track } from "@/lib/analytics";
import {
  getToolCtaAssignment,
  type ToolCtaAssignment,
  type ToolCtaVariant,
} from "@/lib/tool-cta-experiment";
import { WEB_TOOL_COMPLETED_DOM_EVENT } from "@/lib/web-tool-usage";

/**
 * Shared result-to-app bridge for the free tools. Extracted from the
 * physique rater's conversion card after it out-converted every generic
 * "Download GainFrame" block 2–3×. Pages that render it must load
 * /styles/tool-conversion-card.css alongside their own stylesheet.
 *
 * Platform behavior: iOS gets a single App Store button, desktop pairs a
 * compact QR with the primary App Store action, Android gets an email form posting to
 * /api/android-waitlist (never a link to another free web tool).
 *
 * Events: `tool_cta_viewed` once per mount when the card scrolls into
 * view, `tool_cta_clicked` on any App Store anchor click,
 * `tool_cta_dismissed` when the sticky card is closed, and
 * `tool_android_email_submitted` on the Android form. Tools keep their
 * historical per-tool click events via `onCtaClick`.
 */

const DEFAULT_ANDROID_BODY =
  "No Android app yet. Leave your email and we'll send you the App Store link for later — and you'll be first to know if Android ships.";

const PROGRESS_PREVIEW_SRC = "/assets/bf-precision/body-fat-trend.webp";
const STICKY_CTA_DISMISSED_STORAGE_KEY =
  "gainframe_tool_sticky_cta_dismissed_v1";

export type ToolConversionExperimentCopy = {
  eyebrow: string;
  headline: string;
  body: string;
  desktopBody?: string;
  iosLabel: string;
  proof?: string;
};

export type ToolConversionExperiment = {
  id: string;
  variants: Record<ToolCtaVariant, ToolConversionExperimentCopy>;
};

type ToolConversionCardProps = {
  /** Analytics id + data-cta-source, e.g. "physique_rater". */
  tool: string;
  /** Attribution campaign token (ct=), e.g. "web-rater". */
  campaign: string;
  /** Optional App Store Connect Custom Product Page identifier. */
  customProductPageId?: string;
  /** Where the card sits: "result", "daily_limit", "lifetime_limit", … */
  placement: string;
  /** The hook. Personalize with the user's actual number when there is one. */
  headline: string;
  /** Supporting copy for iOS/unknown platforms. */
  body: string;
  /** Desktop override; falls back to `body`. */
  desktopBody?: string;
  androidBody?: string;
  eyebrow?: string;
  androidEyebrow?: string;
  /** Primary button label on iOS/unknown. */
  iosLabel?: string;
  proof?: string;
  androidProof?: string;
  /** Optional A/B/n copy test. Assignment is stable across tools and visits. */
  experiment?: ToolConversionExperiment;
  /** Keep result CTAs visible after completion. Defaults to true for result. */
  sticky?: boolean;
  /** For tools whose CTA exists before interaction, wait for completion. */
  activation?: "immediate" | "tool_completed";
  /** Real GainFrame mascot asset shown on experiment variants. */
  mascotSrc?: string;
  /** The tool renders its own Android capture (e.g. BF email report). */
  hideOnAndroid?: boolean;
  /** Fire the tool's historical click event alongside tool_cta_clicked. */
  onCtaClick?: (platform: DownloadPlatform) => void;
};

function AndroidLinkForm({
  tool,
  placement,
  experimentProperties,
}: {
  tool: string;
  placement: string;
  experimentProperties: Record<string, unknown>;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");
    track("tool_android_email_submitted", {
      tool,
      placement,
      ...experimentProperties,
    });
    try {
      const res = await fetch("/api/android-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: `${tool}_${placement}` }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="tcc-android-sent" role="status">
        Sent — the App Store link is in your inbox.
      </p>
    );
  }

  return (
    <form className="tcc-android-form" onSubmit={submit}>
      <input
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        placeholder="you@email.com"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Email me the link"}
      </button>
      {status === "error" && (
        <p className="tcc-android-error" role="alert">
          Couldn&apos;t send that. Search &ldquo;GainFrame&rdquo; on the App
          Store from an iPhone instead.
        </p>
      )}
    </form>
  );
}

export default function ToolConversionCard({
  tool,
  campaign,
  customProductPageId,
  placement,
  headline,
  body,
  desktopBody,
  androidBody = DEFAULT_ANDROID_BODY,
  eyebrow,
  androidEyebrow = "iPhone-only for now",
  iosLabel = "Get GainFrame free",
  proof = "iPhone app · Free to start · Built for progress photos",
  androidProof = "One email, just the link · No spam",
  experiment,
  sticky,
  activation = "immediate",
  mascotSrc = "/assets/gainframe-guy/poses/gainframe-coach.webp",
  hideOnAndroid = false,
  onCtaClick,
}: ToolConversionCardProps) {
  const platform = useDownloadPlatform();
  const [assignment, setAssignment] = useState<ToolCtaAssignment | null>(null);
  const [activated, setActivated] = useState(activation === "immediate");
  const [stickyVisibility, setStickyVisibility] =
    useState<"pending" | "visible" | "dismissed">("pending");
  const isAndroid = platform === "android";
  const isDesktop = platform === "desktop";
  const isSticky = sticky ?? placement.endsWith("result");
  const cardRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);
  const titleId = `tcc-title-${tool}-${placement}`;
  const experimentPending = Boolean(experiment && !assignment);
  const hidden =
    (hideOnAndroid && isAndroid) ||
    experimentPending ||
    !activated ||
    (isSticky && stickyVisibility !== "visible");
  const variantCopy =
    experiment && assignment ? experiment.variants[assignment.variant] : null;
  const displayedEyebrow = variantCopy?.eyebrow ?? eyebrow;
  const displayedHeadline = variantCopy?.headline ?? headline;
  const displayedBody = variantCopy?.body ?? body;
  const displayedDesktopBody =
    variantCopy?.desktopBody ?? desktopBody ?? displayedBody;
  const displayedIosLabel = variantCopy?.iosLabel ?? iosLabel;
  const displayedProof = variantCopy?.proof ?? proof;
  const experimentProperties: Record<string, unknown> =
    experiment && assignment
      ? {
          experiment_id: experiment.id,
          experiment_variant: assignment.variant,
          experiment_forced: assignment.forced,
          cta_angle: assignment.variant,
        }
      : {};

  useEffect(() => {
    if (!experiment) return;
    setAssignment(getToolCtaAssignment());
  }, [experiment?.id]);

  useEffect(() => {
    if (activation === "immediate") {
      setActivated(true);
      return;
    }
    const activate = () => setActivated(true);
    window.addEventListener(WEB_TOOL_COMPLETED_DOM_EVENT, activate);
    return () =>
      window.removeEventListener(WEB_TOOL_COMPLETED_DOM_EVENT, activate);
  }, [activation]);

  useEffect(() => {
    if (!isSticky) return;
    let dismissed = false;
    try {
      dismissed =
        window.sessionStorage.getItem(STICKY_CTA_DISMISSED_STORAGE_KEY) ===
        "true";
    } catch {
      // Storage can be unavailable in privacy modes. The card should still work.
    }
    setStickyVisibility(dismissed ? "dismissed" : "visible");
  }, [isSticky]);

  useEffect(() => {
    if (!isSticky || hidden) return;
    document.body.classList.add("has-tool-sticky-cta");
    return () => document.body.classList.remove("has-tool-sticky-cta");
  }, [hidden, isSticky]);

  useEffect(() => {
    // Impression tracking waits for a real platform so the event is
    // segmentable; the first paint always reports platform "unknown".
    if (hidden || platform === "unknown" || viewedRef.current) return;
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (viewedRef.current) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          viewedRef.current = true;
          track("tool_cta_viewed", {
            tool,
            placement,
            platform,
            ...experimentProperties,
          });
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [
    assignment?.forced,
    assignment?.variant,
    experiment?.id,
    hidden,
    platform,
    placement,
    tool,
  ]);

  function dismissStickyCta() {
    setStickyVisibility("dismissed");
    try {
      window.sessionStorage.setItem(
        STICKY_CTA_DISMISSED_STORAGE_KEY,
        "true",
      );
    } catch {
      // Dismissal remains effective for this mount when storage is unavailable.
    }
    track("tool_cta_dismissed", {
      tool,
      placement,
      platform,
      ...experimentProperties,
    });
  }

  if (hidden) return null;

  const defaultEyebrow = placement.endsWith("result")
    ? "From estimate to progress"
    : "Keep going in the app";

  return (
    <aside
      ref={cardRef}
      className={`tcc-card${isSticky ? " tcc-card--sticky" : ""}`}
      data-platform={platform}
      data-experiment-id={experiment?.id}
      data-experiment-variant={assignment?.variant}
      data-experiment-forced={assignment?.forced ? "true" : undefined}
      data-cta-angle={assignment?.variant}
      aria-labelledby={titleId}
      onClick={(event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!isAndroid && target?.closest("a")) {
          // AppStoreClickTracker owns download/outbound events. These keep
          // the tool-level intent events without double-counting the click.
          track("tool_cta_clicked", {
            tool,
            placement,
            platform,
            ...experimentProperties,
          });
          onCtaClick?.(platform);
        }
      }}
    >
      {isSticky ? (
        <button
          className="tcc-dismiss"
          type="button"
          aria-label="Dismiss app promotion"
          title="Dismiss app promotion"
          onClick={dismissStickyCta}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}

      <div className="tcc-copy">
        <span className="tcc-eyebrow">
          {isAndroid
            ? androidEyebrow
            : (displayedEyebrow ?? defaultEyebrow)}
        </span>
        <h3 id={titleId}>{displayedHeadline}</h3>
        <p>
          {isAndroid
            ? androidBody
            : isDesktop
              ? displayedDesktopBody
              : displayedBody}
        </p>
        {!isAndroid && (
          <p className="tcc-progress-steps" aria-label="Scan, compare, improve">
            <span>Scan</span>
            <span aria-hidden>•</span>
            <span>Compare</span>
            <span aria-hidden>•</span>
            <span>Improve</span>
          </p>
        )}
      </div>

      <div className="tcc-preview" aria-hidden>
        <span className="tcc-phone-preview">
          <img src={PROGRESS_PREVIEW_SRC} alt="" width={1290} height={2796} />
        </span>
        <img
          className="tcc-mascot"
          src={mascotSrc}
          alt=""
          aria-hidden
          width={88}
          height={88}
        />
      </div>

      {isAndroid ? (
        <AndroidLinkForm
          tool={tool}
          placement={placement}
          experimentProperties={experimentProperties}
        />
      ) : (
        <div className="tcc-actions">
          <PlatformDownloadLink
            className="tcc-primary"
            source={tool}
            content={placement}
            campaign={campaign}
            customProductPageId={customProductPageId}
          >
            {displayedIosLabel}
            <span aria-hidden>→</span>
          </PlatformDownloadLink>
          <DownloadQr
            className="tcc-qr"
            source={tool}
            content={placement}
            campaign={campaign}
            customProductPageId={customProductPageId}
            label="Scan with iPhone"
          />
        </div>
      )}

      <p className="tcc-proof">
        {isAndroid ? androidProof : displayedProof}
      </p>
    </aside>
  );
}
