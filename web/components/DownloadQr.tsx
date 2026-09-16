"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  buildWebAttributionLink,
  directAppStoreUrl,
  type WebAttributionLink,
} from "@/lib/web-attribution";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";

type DownloadQrProps = {
  backgroundColor?: string;
  campaign: string;
  className?: string;
  content: string;
  customProductPageId?: string;
  foregroundColor?: string;
  label?: string;
  source: string;
};

export default function DownloadQr({
  backgroundColor = "#fffdf7",
  campaign,
  className,
  content,
  customProductPageId,
  foregroundColor = "#181a17",
  label = "Scan with iPhone",
  source,
}: DownloadQrProps) {
  const platform = useDownloadPlatform();
  const containerRef = useRef<HTMLDivElement>(null);
  const recordedKey = useRef<string | null>(null);
  const [link, setLink] = useState<WebAttributionLink | null>(null);
  const href =
    link?.href ??
    directAppStoreUrl({ campaign, cta: content, customProductPageId });

  useEffect(() => {
    if (platform !== "desktop") return;
    setLink(
      buildWebAttributionLink({ campaign, cta: content, customProductPageId }),
    );
  }, [campaign, content, customProductPageId, platform]);

  useEffect(() => {
    const container = containerRef.current;
    const payload = link?.payload;
    if (!container || !payload || platform !== "desktop") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        if (recordedKey.current === payload.web_click_id) return;
        const experiment = container.closest<HTMLElement>(
          "[data-experiment-id]",
        )?.dataset;
        const recorded = track("web_download_qr_shown", {
          ...payload,
          source,
          cta_content: content,
          ct: campaign,
          destination: "app_store",
          ...(experiment?.experimentId
            ? {
                experiment_id: experiment.experimentId,
                experiment_phase: experiment.experimentPhase,
                experiment_variant: experiment.experimentVariant,
                experiment_forced: experiment.experimentForced === "true",
              }
            : {}),
        });
        // This records visibility, never a scan or a click. A later app event
        // can join the exact ID already encoded in the displayed QR.
        if (recorded) {
          recordedKey.current = payload.web_click_id;
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [link, platform, source, content, campaign]);

  if (platform !== "desktop") return null;

  return (
    <div ref={containerRef} className={className} data-download-qr>
      <QRCodeSVG
        value={href}
        size={68}
        level="M"
        bgColor={backgroundColor}
        fgColor={foregroundColor}
        title={`${label} to download GainFrame`}
      />
      <span>
        <strong>{label}</strong>
        <a
          href={href}
          target="_blank"
          rel="noopener"
          data-cta-source={source}
          data-cta-content={`${content}_desktop_link`}
          data-cta-campaign={campaign}
          data-cta-custom-product-page-id={customProductPageId}
        >
          Open App Store
        </a>
      </span>
    </div>
  );
}
