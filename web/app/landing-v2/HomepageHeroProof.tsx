"use client";

import { useEffect, useState } from "react";
import DownloadQr from "@/components/DownloadQr";
import styles from "./page.module.css";

type LiveStats = {
  lifters: number;
  rating: number;
  ratingCount: number;
};

const FALLBACK_STATS: LiveStats = {
  lifters: 5000,
  rating: 4.9,
  ratingCount: 35,
};

export default function HomepageHeroProof() {
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/stats", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Stats unavailable");
        return response.json() as Promise<LiveStats>;
      })
      .then((nextStats) => setStats(nextStats))
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return (
    <div className={styles.heroTrust}>
      <p>
        <strong>{stats.rating.toFixed(1)} ★</strong>
        <span>from {stats.ratingCount} ratings</span>
        <span>{stats.lifters.toLocaleString("en-US")} lifters</span>
        <span>No account required</span>
      </p>
      <DownloadQr
        className={styles.heroQr}
        source="landing_v2"
        content="hero_download"
        campaign="web-home-qr"
      />
    </div>
  );
}
