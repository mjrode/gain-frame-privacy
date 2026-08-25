"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { trackOncePerDay } from "@/lib/analytics";
import { ANALYTICS_CONSENT_STATE_EVENT } from "@/lib/analytics-consent";
import {
  buildWebAttributionLink,
  directAppStoreUrl,
} from "@/lib/web-attribution";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";

type PlatformDownloadLinkProps = {
  androidLabel?: string;
  campaign: string;
  children: ReactNode;
  className?: string;
  content: string;
  customProductPageId?: string;
  source: string;
};

export default function PlatformDownloadLink({
  androidLabel = "Try the free web tool",
  campaign,
  children,
  className,
  content,
  customProductPageId,
  source,
}: PlatformDownloadLinkProps) {
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

  if (platform === "android") {
    return (
      <Link
        className={className}
        href="/tools/body-fat-from-photo/"
        data-cta-source={source}
        data-cta-content={`${content}_android_tool`}
        data-cta-platform="android"
        onClick={() =>
          trackOncePerDay(
            "cta_platform_alternative_click",
            {
              source,
              cta_content: `${content}_android_tool`,
              destination: "body_fat_web_tool",
            },
            `${source}:${content}:android_tool`,
          )
        }
      >
        {androidLabel}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener"
      data-cta-source={source}
      data-cta-content={content}
      data-cta-campaign={campaign}
      data-cta-custom-product-page-id={customProductPageId}
      data-cta-platform={platform === "unknown" ? "apple" : platform}
    >
      {children}
    </a>
  );
}
