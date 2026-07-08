"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Homepage hero film. Autoplays muted and looping; tapping the video (or any
 * element with [data-film-sound], e.g. the hero's "Watch with sound" button)
 * restarts it from the top with audio. Pauses when scrolled off-screen so a
 * sound-on viewing never keeps playing out of view.
 */
export default function PromoFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const watched75 = useRef(false);
  const [soundOn, setSoundOn] = useState(false);

  const playWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.currentTime = 0;
    void video.play();
    setSoundOn(true);
    track("promo_film_sound_on", { source: "home" });
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      playWithSound();
    } else {
      video.muted = true;
      setSoundOn(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (watched75.current || !video.duration) return;
      if (video.currentTime / video.duration >= 0.75) {
        watched75.current = true;
        track("promo_film_watched_75", { source: "home" });
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.paused && video.muted) void video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);

    const onSoundCta = (event: MouseEvent) => {
      const cta = (event.target as Element | null)?.closest?.(
        "[data-film-sound]",
      );
      if (!cta) return;
      event.preventDefault();
      video.scrollIntoView({ behavior: "smooth", block: "center" });
      playWithSound();
    };
    document.addEventListener("click", onSoundCta);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      observer.disconnect();
      document.removeEventListener("click", onSoundCta);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="film-stage reveal" id="film">
      <div className={`film-card${soundOn ? " sound-on" : ""}`}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/promo/gainframe-film-poster.jpg"
          aria-label="GainFrame promo film: photo in, full body composition report out, Coach explains the rest"
          onClick={toggleSound}
        >
          <source src="/assets/promo/gainframe-film-1080.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="film-caption">
        <span>GAINFRAME — THE 38-SECOND FILM</span>
        <button type="button" className="film-sound" onClick={toggleSound}>
          {soundOn ? "SOUND ON — TAP TO MUTE" : "TAP FOR SOUND"}
        </button>
      </div>
    </div>
  );
}
