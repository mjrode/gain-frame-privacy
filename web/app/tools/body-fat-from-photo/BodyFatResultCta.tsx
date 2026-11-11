"use client";

import { useEffect, useState } from "react";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { ANALYSIS_APP_STORE_PAGE, SEO_PHYSIQUE_TOOLS_CPP } from "@/lib/site";
import { BODY_FAT_CTA_CONTENT, type BodyFatBridgeAnalytics } from "@/lib/body-fat-bridge-analytics";
import styles from "./BodyFatResultCta.module.css";

/** Every arm keeps the same destination, so only the offer and placement differ. */
function StoreLink({ content, className, children }: {
  content: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <PlatformDownloadLink
      className={className}
      source="bf_from_photo"
      campaign={SEO_PHYSIQUE_TOOLS_CPP.campaign}
      customProductPageId={ANALYSIS_APP_STORE_PAGE.id}
      content={content}
    >
      {children}
    </PlatformDownloadLink>
  );
}

/** The ask inside the result card: arms `analysis` and `goal`. */
export function BodyFatInlineCta({ variant, estimate, photoUrl, analytics }: {
  variant: "analysis" | "goal";
  estimate: string;
  photoUrl: string | null;
  analytics: BodyFatBridgeAnalytics;
}) {
  const rounded = Math.round(Number.parseFloat(estimate));
  const number = Number.isFinite(rounded) ? `~${rounded}%` : `~${estimate}%`;

  if (variant === "analysis") {
    return (
      <div className={styles.inline} data-cta-card-label="body_fat_result_cta_v1_analysis" onClick={analytics.onClick}>
        <h3 className={styles.headline}>{number} today. See what’s behind it.</h3>
        <p className={styles.body}>
          Get a muscle-by-muscle breakdown: your standout areas and what to work on next.
        </p>
        <div ref={analytics.refs.inline_cta}>
          <StoreLink content={BODY_FAT_CTA_CONTENT.inline_cta} className={styles.button}>
            Analyze my physique <span aria-hidden="true">→</span>
          </StoreLink>
          <p className={styles.note}>Free on iPhone · Full analysis with Pro</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inline} data-cta-card-label="body_fat_result_cta_v1_goal" onClick={analytics.onClick}>
      <div className={styles.tiles}>
        <figure className={styles.tile}>
          {photoUrl
            ? <img src={photoUrl} alt="Your photo" className={styles.tilePhoto} />
            : <span className={styles.tileBlank} aria-hidden="true" />}
          <figcaption className={styles.tileChip}>Now · {number}</figcaption>
        </figure>
        <figure className={`${styles.tile} ${styles.tileLocked}`}>
          {photoUrl
            ? <img src={photoUrl} alt="" className={`${styles.tilePhoto} ${styles.tileBlur}`} />
            : <span className={styles.tileBlank} aria-hidden="true" />}
          <span className={styles.lock} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          </span>
          <figcaption className={styles.tileChip}>Your goal · in the app</figcaption>
        </figure>
      </div>
      <h3 className={styles.headline}>See your goal physique.</h3>
      <p className={styles.body}>
        GainFrame turns a photo like this into an AI preview of where consistent training
        could take you, then tracks how close your real check-ins get.
      </p>
      <div ref={analytics.refs.inline_cta}>
        <StoreLink content={BODY_FAT_CTA_CONTENT.inline_cta} className={styles.button}>
          Preview my goal physique <span aria-hidden="true">→</span>
        </StoreLink>
        <p className={styles.note}>AI projection, not a promise · Free to start · iPhone app</p>
      </div>
    </div>
  );
}

const STICKY_DISMISS_KEY = "gainframe:bf_result_cta_v1:sticky_dismissed";

/** Arm `sticky`: today's layout plus a bar that stays on screen until the
 * bridge's own button is visible or the visitor closes it. */
export function BodyFatStickyCta({ estimate, analytics }: {
  estimate: string;
  analytics: BodyFatBridgeAnalytics;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [bridgeVisible, setBridgeVisible] = useState(false);
  const rounded = Math.round(Number.parseFloat(estimate));
  const number = Number.isFinite(rounded) ? `~${rounded}%` : `~${estimate}%`;

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STICKY_DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      // Blocked storage only means the bar can reappear on the next result.
    }
  }, []);

  useEffect(() => {
    // Hide only while the bridge's own button is on screen, so the bar never
    // doubles a visible ask but returns once the visitor scrolls past it.
    const target = document.querySelector(`a[data-cta-content="${BODY_FAT_CTA_CONTENT.main_cta}"]`);
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setBridgeVisible(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(STICKY_DISMISS_KEY, "1");
    } catch {
      // Ignore: the bar is already hidden for this page.
    }
  }

  return (
    <div className={`${styles.sticky} ${bridgeVisible ? styles.stickyHidden : ""}`}
      data-cta-card-label="body_fat_result_cta_v1_sticky" inert={bridgeVisible} onClick={analytics.onClick}>
      <div ref={analytics.refs.sticky_cta} className={styles.stickyCopy}>
        <p className={styles.stickyTitle}>Your {number}, fully analyzed</p>
        <p className={styles.stickySub}>Free on iPhone</p>
      </div>
      <StoreLink content={BODY_FAT_CTA_CONTENT.sticky_cta} className={styles.stickyButton}>
        Analyze
      </StoreLink>
      <button type="button" className={styles.stickyClose} onClick={dismiss} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  );
}
