"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { buildWebAttributionLink } from "@/lib/web-attribution";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";

type DownloadQrProps = {
  campaign: string;
  className?: string;
  content: string;
  label?: string;
  source: string;
};

export default function DownloadQr({
  campaign,
  className,
  content,
  label = "Scan with iPhone",
  source,
}: DownloadQrProps) {
  const platform = useDownloadPlatform();
  const hrefRef = useRef<string | null>(null);

  if (platform !== "desktop") return null;

  hrefRef.current ??= buildWebAttributionLink({
    campaign,
    cta: content,
  }).href;
  const href = hrefRef.current;

  return (
    <div className={className} data-download-qr>
      <QRCodeSVG
        value={href}
        size={68}
        level="M"
        bgColor="#fffdf7"
        fgColor="#181a17"
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
        >
          Open App Store
        </a>
      </span>
    </div>
  );
}
