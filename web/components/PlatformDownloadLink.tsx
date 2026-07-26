"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackOncePerDay } from "@/lib/analytics";
import { appStoreUrlWithCampaign } from "@/lib/site";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";

type PlatformDownloadLinkProps = {
  androidLabel?: string;
  campaign: string;
  children: ReactNode;
  className?: string;
  content: string;
  source: string;
};

export default function PlatformDownloadLink({
  androidLabel = "Try the free web tool",
  campaign,
  children,
  className,
  content,
  source,
}: PlatformDownloadLinkProps) {
  const platform = useDownloadPlatform();

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
      href={appStoreUrlWithCampaign(campaign)}
      target="_blank"
      rel="noopener"
      data-cta-source={source}
      data-cta-content={content}
      data-cta-platform={platform === "unknown" ? "apple" : platform}
    >
      {children}
    </a>
  );
}
