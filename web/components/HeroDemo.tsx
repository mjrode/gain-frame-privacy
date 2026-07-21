"use client";

import { useEffect, useRef } from "react";

/**
 * Hero auto-playing app demo: the real screen recording inside a phone frame,
 * flanked by floating metric chips. Playback starts only when the phone is on
 * screen and never starts for users who prefer reduced motion (they get the
 * poster and can tap to play).
 */
export default function HeroDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.paused) void video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-demo reveal" aria-label="GainFrame app demo">
      <div className="hd-glow" aria-hidden="true"></div>
      <div className="hd-chip hd-chip-fat" aria-hidden="true">
        <i></i>Body fat 19%
      </div>
      <div className="hd-chip hd-chip-muscle" aria-hidden="true">
        <i></i>+24 upper chest
      </div>
      <div className="hd-chip hd-chip-coach" aria-hidden="true">
        <i></i>Ask Coach why
      </div>
      <div className="hd-phone">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/app-screenshots/1.21/screen-recording-1-21-poster.webp"
          aria-label="Screen recording of GainFrame: a check-in photo becomes a body composition report, then Coach explains what changed"
          onClick={(event) => {
            const video = event.currentTarget;
            if (video.paused) void video.play().catch(() => {});
            else video.pause();
          }}
        >
          <source
            src="/app-screenshots/1.21/screen-recording-1-21-web.mp4"
            type="video/mp4"
          />
        </video>
      </div>
      <div className="hd-caption">
        <span className="hd-live">
          <i></i>Live app demo
        </span>
        <span>Check-in &rarr; report &rarr; Coach</span>
      </div>
    </div>
  );
}
