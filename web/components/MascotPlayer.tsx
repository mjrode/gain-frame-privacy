"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "idle" | "think" | "coach" | "lifting";

type Tone = "default" | "soft" | "framed" | "bare";

interface Props {
  variant: Variant;
  size?: number;
  tone?: Tone;
  className?: string;
  tilt?: number;
  bob?: boolean;
  label?: string;
  fill?: boolean;
}

const SRC: Record<Variant, { video: string; poster: string }> = {
  idle: {
    video: "/assets/gainframe-guy/animations/idle.webm",
    poster: "/assets/gainframe-guy/animations/idle-poster.webp",
  },
  think: {
    video: "/assets/gainframe-guy/animations/think.webm",
    poster: "/assets/gainframe-guy/animations/think-poster.webp",
  },
  coach: {
    video: "/assets/gainframe-guy/animations/coach.webm",
    poster: "/assets/gainframe-guy/animations/coach-poster.webp",
  },
  lifting: {
    video: "/assets/gainframe-guy/animations/lifting.webm",
    poster: "/assets/gainframe-guy/animations/lifting-poster.webp",
  },
};

export default function MascotPlayer({
  variant,
  size = 140,
  tone = "default",
  className = "",
  tilt = 0,
  bob = true,
  label,
  fill = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduced) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const { video, poster } = SRC[variant];

  const style: React.CSSProperties = fill
    ? { transform: tilt ? `rotate(${tilt}deg)` : undefined }
    : {
        width: size,
        height: size,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
      };

  const classes = [
    "gfm",
    `gfm--${tone}`,
    bob ? "gfm--bob" : "",
    loaded || reduced ? "gfm--ready" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={style} aria-hidden={!label} role={label ? "img" : undefined} aria-label={label}>
      {reduced ? (
        <img src={poster} alt="" className="gfm__media" />
      ) : (
        <video
          ref={videoRef}
          className="gfm__media"
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
        />
      )}
    </span>
  );
}
