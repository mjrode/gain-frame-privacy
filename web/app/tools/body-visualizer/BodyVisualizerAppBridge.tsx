"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
import { BRIDGE_RESULT_CTA_CONTENT, type BodyVisualizerBridgeAnalytics } from "@/lib/body-visualizer-bridge-analytics";
import { bodyVisualizerBridgeExperiment, getBodyVisualizerBridgeRollout } from "@/lib/body-visualizer-bridge-rollout";
import styles from "./BodyVisualizerAppBridge.module.css";

const MEDIA = "/preview/body-visualizer-bridge";

function FutureYouBridge({ analytics }: { analytics: BodyVisualizerBridgeAnalytics }) {
  const platform = useDownloadPlatform();

  return (
    <section className={`${styles.bridge} ${styles.futureBridge}`} aria-labelledby="app-bridge-title" id="photo-history">
      <div ref={analytics.refs.walkthrough} className={`${styles.copy} ${styles.futureIntro}`}>
        <div>
          <span className={styles.eyebrow}>Future You · In GainFrame Pro</span>
          <h2 id="app-bridge-title">Preview a future<br />version of you.</h2>
        </div>
        <div>
          <p className={styles.description}>
            Start with your own photo in GainFrame. Use Future You to explore
            an AI preview of a leaner or more muscular look. Here’s how it works in the app.
          </p>
          <div className={styles.journey} aria-label="How Future You works">
            <span>Your photo</span><span aria-hidden="true">→</span>
            <span>Your goal</span><span aria-hidden="true">→</span>
            <span>AI preview</span>
          </div>
        </div>
      </div>
      <div className={styles.appFlow}>
        <figure className={`${styles.example} ${styles.flowStep}`}>
          <figcaption className={styles.stepCaption}>
            <span className={styles.stepNumber}>1</span>
            <div>
              <h3>Tune your preview</h3>
              <p>Choose the intensity and areas you want to focus on.</p>
            </div>
          </figcaption>
          <a
            className={styles.futureScreenshot}
            href={`${MEDIA}/future-you-setup.png`}
            target="_blank"
            rel="noopener"
            aria-label="Enlarge the Future You setup screenshot (opens in a new tab)"
          >
            <Image
              src={`${MEDIA}/future-you-setup-600.webp`}
              width={600}
              height={1300}
              sizes="(max-width: 360px) 90vw, 300px"
              alt="Full Future You setup screen with an intensity slider, target body areas, and Generate Preview button."
            />
          </a>
        </figure>
        <div className={styles.flowConnector} aria-hidden="true">
          <span className={styles.flowArrow}>→</span>
          <span>Generate<br />preview</span>
        </div>
        <figure className={`${styles.example} ${styles.flowStep}`}>
          <figcaption className={styles.stepCaption}>
            <span className={styles.stepNumber}>2</span>
            <div>
              <h3>Explore your AI preview</h3>
              <p>Compare with your starting photo, then refine the result.</p>
            </div>
          </figcaption>
          <a
            className={styles.futureScreenshot}
            href={`${MEDIA}/future-you-split.png`}
            target="_blank"
            rel="noopener"
            aria-label="View full Future You app screenshot (opens in a new tab)"
          >
            <Image
              src={`${MEDIA}/future-you-split-600.webp`}
              width={600}
              height={1300}
              sizes="(max-width: 360px) 90vw, 300px"
              alt="Full Future You result screen: the starting photo and an illustrative six-month AI preview, comparison modes, and refinement options. Not a prediction."
            />
          </a>
          <div ref={analytics.refs.result_cta} onClick={analytics.onClick} className={styles.resultAction}>
            {(platform === "ios" || platform === "desktop") && (
              <PlatformDownloadLink
                className={styles.resultButton}
                source="body_visualizer"
                campaign="web-body-visualizer"
                content={BRIDGE_RESULT_CTA_CONTENT}
              >
                Try Future You <span aria-hidden="true">→</span>
              </PlatformDownloadLink>
            )}
            <p>iPhone app · Future You requires Pro</p>
          </div>
        </figure>
      </div>
      <p className={styles.boundary}>
        AI illustration, not a prediction. Future You requires Pro.
        Start with a photo you choose in the app. Your web measurements and result don’t transfer,
        and this slider’s weight or BMI doesn’t set the AI preview.
      </p>
    </section>
  );
}

function PhotoProgressBridge({ analytics }: { analytics: BodyVisualizerBridgeAnalytics }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const observeVideo = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    analytics.refs.video(video);
  }, [analytics]);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updatePlayback() {
      const enabled = !motionPreference.matches;
      setAutoplay(enabled);
      if (enabled) {
        // Native controls remain available if the browser blocks autoplay.
        void videoRef.current?.play().catch(() => {});
      } else {
        videoRef.current?.pause();
      }
    }
    updatePlayback();
    motionPreference.addEventListener("change", updatePlayback);
    return () => motionPreference.removeEventListener("change", updatePlayback);
  }, []);

  return (
    <section className={`${styles.bridge} ${styles.progressBridge}`} aria-labelledby="real-progress-title" id="real-photo-progress">
      <div className={styles.copy}>
        <span className={styles.eyebrow}>Real check-ins · In GainFrame</span>
        <h2 id="real-progress-title">Then track<br />your real progress.</h2>
        <p className={styles.description}>
          Add photos from different days and compare them side by side.
          Move between dated check-ins to see what changed over time.
        </p>
        <div className={styles.journey} aria-label="How photo comparisons work">
          <span>Import photos</span><span aria-hidden="true">→</span>
          <span>Pick dates</span><span aria-hidden="true">→</span>
          <span>Compare</span>
        </div>
        <div className={styles.returnReason}>
          <h3>Next week, add another check-in.</h3>
          <p>Keep the pose and lighting consistent. You’re building a record, even when changes aren’t visible.</p>
        </div>
      </div>
      <figure className={`${styles.example} ${styles.videoExample}`}>
        <div className={styles.exampleLabel}>
          <span>Real photo comparisons</span><span>7-second app demo</span>
        </div>
        <video
          ref={observeVideo}
          className={styles.video}
          controls
          autoPlay={autoplay}
          loop
          playsInline
          muted
          preload="metadata"
          poster={`${MEDIA}/real-check-ins-poster.jpg`}
          aria-label="Silent GainFrame demo comparing real dated check-ins from two weeks to two years apart"
          aria-describedby="comparison-video-description"
        >
          <source src={`${MEDIA}/real-check-ins.mp4`} type="video/mp4" />
          <a href={`${MEDIA}/real-check-ins.mp4`}>Watch the photo comparison demo</a>
        </video>
        <figcaption id="comparison-video-description">
          Real app recording. Switch between dated check-ins from two weeks to two years apart.
        </figcaption>
      </figure>
      <p className={styles.boundary}>
        These are real photo comparisons, separate from the AI goal preview above.
        Full AI analysis requires Pro.
      </p>
    </section>
  );
}

/** Approved public rollout, with the previous version available for local QA. */
export default function BodyVisualizerAppBridgePreview({ analytics }: { analytics: BodyVisualizerBridgeAnalytics }) {
  const [rollout, setRollout] = useState({ enabled: false, local: false });

  useEffect(() => {
    setRollout(getBodyVisualizerBridgeRollout(window.location.hostname, window.location.search));
  }, []);

  if (!rollout.enabled) return null;
  const experiment = bodyVisualizerBridgeExperiment(rollout.local, "future");

  return (
    <div
      className={styles.preview}
      data-experiment-id={experiment.id}
      data-experiment-phase={experiment.phase}
      data-experiment-variant={experiment.variant}
      data-experiment-forced={experiment.forced ? "true" : undefined}
      data-cta-angle={experiment.angle}
      data-cta-style={experiment.style}
    >
      {rollout.local && <p className={styles.previewLabel}>Local preview · not published</p>}
      <FutureYouBridge analytics={analytics} />
      <PhotoProgressBridge analytics={analytics} />
    </div>
  );
}
