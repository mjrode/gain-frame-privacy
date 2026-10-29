"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import DownloadQr from "@/components/DownloadQr";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
import { ANALYSIS_APP_STORE_PAGE, SEO_PHYSIQUE_TOOLS_CPP } from "@/lib/site";
import { BODY_FAT_BRIDGE_EXPERIMENT_ID, BODY_FAT_BRIDGE_VERSION, BODY_FAT_CTA_CONTENT, type BodyFatBridgeAnalytics } from "@/lib/body-fat-bridge-analytics";
import styles from "./BodyFatAppBridge.module.css";

const MEDIA = "/preview/body-fat-app-bridge";
const COMPARISON = "/preview/body-visualizer-bridge";

function AnalysisLink({ placement, analytics }: { placement: "result" | "walkthrough"; analytics: BodyFatBridgeAnalytics }) {
  const platform = useDownloadPlatform();
  const element = placement === "result" ? "main_cta" : "result_cta";
  if (platform === "android") return <p className={styles.note}>GainFrame is available on iPhone.</p>;
  return (
    <>
      <div ref={analytics.refs[element]} className={styles.action}>
        <PlatformDownloadLink
          className={styles.button}
          source="bf_from_photo"
          campaign={SEO_PHYSIQUE_TOOLS_CPP.campaign}
          customProductPageId={ANALYSIS_APP_STORE_PAGE.id}
          content={BODY_FAT_CTA_CONTENT[element]}
        >
          Get my physique analysis <span aria-hidden="true">→</span>
        </PlatformDownloadLink>
        <p className={styles.note}>iPhone app · Full analysis requires Pro</p>
      </div>
      {placement === "result" && platform === "desktop" && (
        <div className={styles.desktopHandoff}>
          <DownloadQr
            className={styles.handoffQr}
            source="bf_from_photo"
            campaign={SEO_PHYSIQUE_TOOLS_CPP.campaign}
            customProductPageId={ANALYSIS_APP_STORE_PAGE.id}
            content={`${BODY_FAT_CTA_CONTENT[element]}_qr`}
            label="Continue on your iPhone"
            backgroundColor="#fff"
          />
          <p className={styles.handoffNote}>
            Scan with your iPhone camera, then add your photo in GainFrame.
            Your web photo and result won’t transfer.
          </p>
        </div>
      )}
    </>
  );
}

/** Public result experience; the parent keeps sample results restricted to localhost. */
export default function BodyFatAppBridge({ analytics, previewOnly }: { analytics: BodyFatBridgeAnalytics; previewOnly: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const observeVideo = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    analytics.refs.video(video);
  }, [analytics]);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    // The sample result mounts after hydration, so honor its review deep link here.
    const id = window.location.hash.slice(1);
    if (["body-fat-result", "app-analysis-offer", "app-analysis-walkthrough"].includes(id)) {
      document.getElementById(id)?.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setAutoplay(!preference.matches);
      if (preference.matches) videoRef.current?.pause();
      else void videoRef.current?.play().catch(() => {});
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return (
    <div className={styles.bridge} data-body-fat-app-preview onClick={analytics.onClick}
      data-experiment-id={BODY_FAT_BRIDGE_EXPERIMENT_ID}
      data-experiment-phase={BODY_FAT_BRIDGE_VERSION}
      data-experiment-variant="analysis"
      data-experiment-forced={previewOnly ? "true" : undefined}
      data-cta-angle="analysis"
      data-cta-style="ink">
      {previewOnly && <p className={styles.previewLabel}>Local preview · not published</p>}
      <section className={styles.summary} aria-labelledby="app-analysis-title" id="app-analysis-offer">
        <div className={styles.summaryCopy}>
          <span className={styles.eyebrow}>Your next step · GainFrame for iPhone</span>
          <h2 id="app-analysis-title">Go beyond a<br />single estimate.</h2>
          <p className={styles.description}>
            See body fat, weight, and your physique breakdown together.
            Then compare your photos over time.
          </p>
          <AnalysisLink placement="result" analytics={analytics} />
          <a className={styles.howLink} href="#app-analysis-walkthrough">
            See how it works <span aria-hidden="true">↓</span>
          </a>
        </div>
        <figure className={styles.compactExample}>
          <a className={styles.compactImage} href="#app-analysis-walkthrough" aria-label="See the full app check-in and analysis examples">
            <Image src={`${MEDIA}/deep-dive.png`} width={1290} height={2796} sizes="(max-width: 600px) 230px, 220px"
              alt="Example Deep Dive with a real photo, physique score, coach's explanation, approximate body-fat estimate, and areas to focus on." />
          </a>
          <figcaption>Example Deep Dive analysis</figcaption>
        </figure>
      </section>

      <section className={styles.walkthrough} id="app-analysis-walkthrough" aria-labelledby="analysis-walkthrough-title">
        <header ref={analytics.refs.walkthrough} className={styles.sectionIntro}>
          <div>
            <span className={styles.eyebrow}>Inside the app</span>
            <h2 id="analysis-walkthrough-title">Put your estimate<br />in context.</h2>
          </div>
          <p className={styles.description}>
            Start with photos you choose in GainFrame. Review your check-in,
            then explore a fuller breakdown of your physique with Pro.
          </p>
        </header>
        <p className={styles.exampleNote}>Example app screens from different check-ins.</p>
        <div className={styles.screens}>
          <figure className={styles.screenExample}>
            <figcaption className={styles.screenCaption}>
              <span className={styles.eyebrow}>Your check-in</span>
              <h3>More than one number.</h3>
              <p>Body-fat estimate, weight, and your physique score in one view.</p>
            </figcaption>
            <a className={styles.fullScreen} href={`${MEDIA}/check-in.png`} target="_blank" rel="noopener" aria-label="Enlarge the complete check-in screenshot (opens in a new tab)">
              <Image src={`${MEDIA}/check-in.png`} width={1290} height={2796} sizes="(max-width: 380px) 85vw, 300px"
                alt="Full GainFrame check-in screen for October 16, with four poses, a score of 68, Precision BF estimate of 18%, weight, and the View my physique analysis action." />
            </a>
          </figure>
          <figure className={styles.screenExample}>
            <figcaption className={styles.screenCaption}>
              <span className={styles.eyebrow}>Deep Dive · Pro</span>
              <h3>Understand the bigger picture.</h3>
              <p>See your standout areas and what to focus on next.</p>
            </figcaption>
            <a className={styles.fullScreen} href={`${MEDIA}/deep-dive.png`} target="_blank" rel="noopener" aria-label="Enlarge the complete single-photo analysis screenshot (opens in a new tab)">
              <Image src={`${MEDIA}/deep-dive.png`} width={1290} height={2796} sizes="(max-width: 380px) 85vw, 300px"
                alt="Separate example Deep Dive dated May 28, 2025, with a score of 73, an estimated body fat of about 17%, upper chest as a standout, and abs as the next focus." />
            </a>
            <AnalysisLink placement="walkthrough" analytics={analytics} />
          </figure>
        </div>
        <p className={styles.contextNote}>
          Your web photo and result don’t transfer into the app.
          Photo-based body-fat estimates are approximate; consistent lighting and pose help with comparisons.
        </p>
      </section>

      <section className={styles.progress} aria-labelledby="photo-progress-title">
        <div>
          <span className={styles.eyebrow}>Real photos · Real dates</span>
          <h2 id="photo-progress-title">Give your next<br />check-in a comparison.</h2>
          <p className={styles.description}>
            Add photos from different days. Move between check-ins and compare them
            side by side to see what changed.
          </p>
          <p className={styles.returnReason}>
            <strong>Keep a record you can actually see.</strong>
            Use similar poses and lighting, and look across several check-ins.
          </p>
        </div>
        <figure className={styles.videoExample}>
          <video ref={observeVideo} className={styles.video} autoPlay={autoplay} loop muted playsInline controls preload="metadata"
            poster={`${COMPARISON}/real-check-ins-poster.jpg`}
            aria-label="Silent GainFrame app recording comparing dated progress photos"
            aria-describedby="body-fat-comparison-description">
            <source src={`${COMPARISON}/real-check-ins.mp4`} type="video/mp4" />
            <a href={`${COMPARISON}/real-check-ins.mp4`}>Watch the comparison demo</a>
          </video>
          <figcaption id="body-fat-comparison-description">7-second app demo · Real photo comparisons, from two weeks to two years apart.</figcaption>
        </figure>
      </section>
    </div>
  );
}
