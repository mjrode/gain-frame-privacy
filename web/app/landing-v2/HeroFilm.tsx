"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import styles from "./page.module.css";

export default function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const watched75 = useRef(false);
  const [soundOn, setSoundOn] = useState(false);

  const playWithSound = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.currentTime = 0;
    void video.play().catch(() => {
      video.muted = true;
      setSoundOn(false);
    });
    setSoundOn(true);
    track("promo_film_sound_on", { source: "landing_v2" });
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      playWithSound();
      return;
    }

    video.muted = true;
    setSoundOn(false);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) video.pause();

    const onTimeUpdate = () => {
      if (watched75.current || !video.duration) return;
      if (video.currentTime / video.duration >= 0.75) {
        watched75.current = true;
        track("promo_film_watched_75", { source: "landing_v2" });
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        if (video.paused && video.muted && !reducedMotion.matches) {
          void video.play().catch(() => {});
        }
      },
      { threshold: 0.25 },
    );

    const onSoundCta = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest("[data-landing-v2-film-sound]")) return;

      event.preventDefault();
      video.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
      playWithSound();
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    observer.observe(video);
    document.addEventListener("click", onSoundCta);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      observer.disconnect();
      document.removeEventListener("click", onSoundCta);
    };
    // The playback helpers intentionally reference the same mounted video.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.heroFilmShell} id="film">
      <span className={`${styles.corner} ${styles.cornerTl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTr}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBr}`} aria-hidden="true" />

      <div className={styles.filmHeader} aria-hidden="true">
        <span>GainFrame in action</span>
        <span>00:38</span>
      </div>

      <div className={`${styles.filmFrame} ${soundOn ? styles.filmFrameSoundOn : ""}`}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/promo/gainframe-film-poster.jpg"
          aria-label="GainFrame 38-second film showing a progress photo becoming a body composition report and Coach explanation"
          onClick={toggleSound}
        >
          <source src="/assets/promo/gainframe-film-1080.mp4" type="video/mp4" />
        </video>
      </div>

      <div className={styles.filmCaption}>
        <div>
          <span>The 38-second film</span>
          <strong>Photo in. Progress explained.</strong>
        </div>
        <button
          className={styles.filmSoundButton}
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Mute GainFrame film" : "Turn on sound for GainFrame film"}
        >
          <svg className={styles.soundGlyph} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4Z" />
            {soundOn ? (
              <path d="M16 8.2a5 5 0 0 1 0 7.6M18.7 5.6a8.5 8.5 0 0 1 0 12.8" />
            ) : (
              <path d="m17 10 4 4m0-4-4 4" />
            )}
          </svg>
          {soundOn ? "Sound on" : "Play with sound"}
        </button>
      </div>

      <div className={styles.filmReadout} aria-hidden="true">
        <span>01 / photo</span>
        <i />
        <span>02 / report</span>
        <i />
        <span>03 / Coach</span>
      </div>

      <div className={styles.heroMascot} aria-hidden="true">
        <span>Welcome in</span>
        <Image
          src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp"
          width={1198}
          height={1313}
          sizes="140px"
          alt=""
        />
      </div>
    </div>
  );
}
