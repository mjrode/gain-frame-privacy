"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./page.module.css";

/** The drawing stays visible without JavaScript; motion runs once on entry. */
export default function DrawnScene({ kind, compact = false }: { kind: "progress" | "nutrition"; compact?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.dataset.animate = "true";
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={`${styles.drawnScene} ${compact ? styles.compactScene : ""}`}>
      <Image className={styles.sceneImage} src={`/assets/features/${kind}-drawing.webp`} width={1536} height={1024} alt="" sizes={compact ? "(max-width: 650px) 40vw, 260px" : "(max-width: 850px) 90vw, 580px"} preload={!compact} />
      {!compact && <>
        <div className={styles.sketchNote}><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path className={styles.drawStroke} pathLength="1" d="M4 12l5 5L20 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Your next check-in</span></div>
        <svg className={styles.sketchTrail} viewBox="0 0 560 90" fill="none" aria-hidden="true">
          <path className={styles.drawStroke} pathLength="1" d="M22 57c63 13 119-21 166-13s99 22 143-1 117-6 188-29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path className={styles.drawStroke} pathLength="1" d="M508 10l16 2-9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <g className={styles.sketchDot}><circle cx="86" cy="55" r="6" fill="white" stroke="currentColor" strokeWidth="2" /></g>
          <g className={styles.sketchDot}><circle cx="270" cy="52" r="6" fill="white" stroke="currentColor" strokeWidth="2" /></g>
          <g className={styles.sketchDot}><circle cx="459" cy="29" r="6" fill="white" stroke="currentColor" strokeWidth="2" /></g>
        </svg>
        <div className={styles.sketchSteps}><span>Capture</span><span>Compare</span><span>Keep going</span></div>
      </>}
      {compact && <svg className={styles.foodScribble} viewBox="0 0 180 35" aria-hidden="true"><path className={styles.drawStroke} pathLength="1" d="M13 18c41-12 82-10 143-7M23 26c40-9 77-9 125-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>}
    </div>
  );
}
