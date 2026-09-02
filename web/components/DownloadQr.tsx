"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { ANALYTICS_CONSENT_STATE_EVENT } from "@/lib/analytics-consent";
import {
  buildWebAttributionLink,
  directAppStoreUrl,
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
  const [href, setHref] = useState<string>(() =>
    directAppStoreUrl({ campaign, cta: content, customProductPageId })
  );

  useEffect(() => {
    const updateHref = () => {
      setHref(
        buildWebAttributionLink({
          campaign,
          cta: content,
          customProductPageId,
        }).href,
      );
    };
    updateHref();
    window.addEventListener(ANALYTICS_CONSENT_STATE_EVENT, updateHref);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_STATE_EVENT, updateHref);
    };
  }, [campaign, content, customProductPageId]);

  if (platform !== "desktop") return null;

  return (
    <div className={className} data-download-qr>
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
