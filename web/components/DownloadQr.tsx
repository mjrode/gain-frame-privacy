"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { ANALYTICS_CONSENT_STATE_EVENT } from "@/lib/analytics-consent";
import { SITE } from "@/lib/site";
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
  const [href, setHref] = useState<string>(() => SITE.appStoreUrl);

  useEffect(() => {
    const updateHref = () => {
      setHref(buildWebAttributionLink({ campaign, cta: content }).href);
    };
    updateHref();
    window.addEventListener(ANALYTICS_CONSENT_STATE_EVENT, updateHref);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_STATE_EVENT, updateHref);
    };
  }, [campaign, content]);

  if (platform !== "desktop") return null;

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
          data-cta-campaign={campaign}
        >
          Open App Store
        </a>
      </span>
    </div>
  );
}
