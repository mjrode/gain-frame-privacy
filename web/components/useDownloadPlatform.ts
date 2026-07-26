"use client";

import { useEffect, useState } from "react";

export type DownloadPlatform = "unknown" | "ios" | "android" | "desktop";

function detectPlatform(): DownloadPlatform {
  const userAgent = window.navigator.userAgent;
  const isTouchMac =
    /Macintosh/i.test(userAgent) && window.navigator.maxTouchPoints > 1;

  if (/iPhone|iPad|iPod/i.test(userAgent) || isTouchMac) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

export function useDownloadPlatform(): DownloadPlatform {
  const [platform, setPlatform] = useState<DownloadPlatform>("unknown");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return platform;
}
