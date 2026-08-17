"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import DownloadQr from "@/components/DownloadQr";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import {
  useDownloadPlatform,
  type DownloadPlatform,
} from "@/components/useDownloadPlatform";
import { track } from "@/lib/analytics";

/**
 * Shared result-to-app bridge for the free tools. Extracted from the
 * physique rater's conversion card after it out-converted every generic
 * "Download GainFrame" block 2–3×. Pages that render it must load
 * /styles/tool-conversion-card.css alongside their own stylesheet.
 *
 * Platform behavior: iOS gets a single App Store button, desktop leads
 * with a large QR code, Android gets an email form posting to
 * /api/android-waitlist (never a link to another free web tool).
 *
 * Events: `tool_cta_viewed` once per mount when the card scrolls into
 * view, `tool_cta_clicked` on any App Store anchor click, and
 * `tool_android_email_submitted` on the Android form. Tools keep their
 * historical per-tool click events via `onCtaClick`.
 */

const DEFAULT_ANDROID_BODY =
  "No Android app yet. Leave your email and we'll send you the App Store link for later — and you'll be first to know if Android ships.";

type ToolConversionCardProps = {
  /** Analytics id + data-cta-source, e.g. "physique_rater". */
  tool: string;
  /** Attribution campaign token (ct=), e.g. "web-rater". */
  campaign: string;
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
  /** The tool renders its own Android capture (e.g. BF email report). */
  hideOnAndroid?: boolean;
  /** Fire the tool's historical click event alongside tool_cta_clicked. */
  onCtaClick?: (platform: DownloadPlatform) => void;
};

function AndroidLinkForm({
  tool,
  placement,
}: {
  tool: string;
  placement: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");
    track("tool_android_email_submitted", { tool, placement });
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
  hideOnAndroid = false,
  onCtaClick,
}: ToolConversionCardProps) {
  const platform = useDownloadPlatform();
  const isAndroid = platform === "android";
  const isDesktop = platform === "desktop";
  const cardRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);
  const titleId = `tcc-title-${tool}-${placement}`;
  const hidden = hideOnAndroid && isAndroid;

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
          track("tool_cta_viewed", { tool, placement, platform });
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hidden, platform, placement, tool]);

  if (hidden) return null;

  const defaultEyebrow =
    placement === "result" ? "Unlimited in the app" : "Keep going in the app";

  return (
    <aside
      ref={cardRef}
      className="tcc-card"
      data-platform={platform}
      aria-labelledby={titleId}
      onClick={(event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!isAndroid && target?.closest("a")) {
          // AppStoreClickTracker owns download/outbound events. These keep
          // the tool-level intent events without double-counting the click.
          track("tool_cta_clicked", { tool, placement, platform });
          onCtaClick?.(platform);
        }
      }}
    >
      <div className="tcc-copy">
        <span className="tcc-eyebrow">
          {isAndroid ? androidEyebrow : (eyebrow ?? defaultEyebrow)}
        </span>
        <h3 id={titleId}>{headline}</h3>
        <p>{isAndroid ? androidBody : isDesktop ? (desktopBody ?? body) : body}</p>
      </div>

      {isAndroid ? (
        <AndroidLinkForm tool={tool} placement={placement} />
      ) : (
        <div className="tcc-actions">
          <PlatformDownloadLink
            className="tcc-primary"
            source={tool}
            content={placement}
            campaign={campaign}
          >
            {isDesktop ? "Or open the App Store" : iosLabel}
            <span aria-hidden>→</span>
          </PlatformDownloadLink>
          <DownloadQr
            className="tcc-qr"
            source={tool}
            content={placement}
            campaign={campaign}
            label="Scan with iPhone"
          />
        </div>
      )}

      <p className="tcc-proof">{isAndroid ? androidProof : proof}</p>
    </aside>
  );
}
