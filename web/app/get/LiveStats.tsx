"use client";

import { useEffect, useState } from "react";

// Trust laurels for the /get landing. Numbers are pulled live from
// /api/stats (App Store rating via Apple's lookup API, lifters via PostHog).
// The fallbacks below are the real figures at build time, so the page never
// shows a spinner or an empty badge if the fetch fails or is slow.
const RATING_FALLBACK = 4.9;
const LIFTERS_FALLBACK = 5000;

interface StatsResponse {
  rating?: number;
  lifters?: number;
}

function formatLifters(n: number): string {
  const step = n >= 1000 ? 1000 : 100;
  const rounded = Math.floor(n / step) * step;
  return `${rounded.toLocaleString("en-US")}+`;
}

// Laurel half-wreath, opens to the right. Mirror with the `.r` class.
function Laurel({ side }: { side: "l" | "r" }) {
  return (
    <svg
      className={`get-wreath ${side}`}
      viewBox="0 0 20 46"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 6 Q5 23 15 40"
        stroke="var(--gf-sage-dk)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g fill="var(--gf-sage)">
        <ellipse cx="14" cy="10" rx="4" ry="1.8" transform="rotate(44 14 10)" />
        <ellipse cx="10.4" cy="15.6" rx="4.3" ry="1.9" transform="rotate(22 10.4 15.6)" />
        <ellipse cx="8.6" cy="23" rx="4.5" ry="1.9" transform="rotate(2 8.6 23)" />
        <ellipse cx="10.4" cy="30.4" rx="4.3" ry="1.9" transform="rotate(-20 10.4 30.4)" />
        <ellipse cx="14" cy="36" rx="4" ry="1.8" transform="rotate(-44 14 36)" />
      </g>
    </svg>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="get-stat">
      <Laurel side="l" />
      <div className="get-stat-val">
        <b>{value}</b>
        <small>
          {label}
          <span className="get-livedot" title="Updated live" />
        </small>
      </div>
      <Laurel side="r" />
    </div>
  );
}

export default function LiveStats() {
  const [rating, setRating] = useState(RATING_FALLBACK);
  const [lifters, setLifters] = useState(LIFTERS_FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((res) => (res.ok ? (res.json() as Promise<StatsResponse>) : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (typeof data.rating === "number" && data.rating > 0) {
          setRating(data.rating);
        }
        if (typeof data.lifters === "number" && data.lifters > 0) {
          setLifters(data.lifters);
        }
      })
      .catch(() => {
        /* keep the baked-in fallbacks */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="get-stats">
      <Stat value={`${rating.toFixed(1)}★`} label="App Store" />
      <Stat value={formatLifters(lifters)} label="lifters" />
    </div>
  );
}
