import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import LiveStats from "./LiveStats";

export const metadata: Metadata = {
  title: {
    absolute: "GainFrame — Stop Guessing Your Body Fat",
  },
  description:
    "It's Face ID for your gains. Point your camera, hold still, and get your body-fat number in seconds. Free to start on the App Store.",
  alternates: { canonical: "/get/" },
  // Focused paid-traffic / link-in-bio landing — kept out of the index so it
  // doesn't cannibalize the homepage for organic search.
  robots: { index: false, follow: true },
  openGraph: {
    title: "GainFrame — Stop Guessing Your Body Fat",
    description:
      "It's Face ID for your gains. Get your body-fat number from a photo in seconds.",
    url: `${SITE.url}/get/`,
    type: "website",
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainFrame — Stop Guessing Your Body Fat",
    description: "It's Face ID for your gains. Body fat from a photo in seconds.",
    images: [SITE.ogImage],
  },
};

export default function GetPage() {
  return (
    <div className="get-page">
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/get-page.css?v=hero-order" />

      <header className="get-topbar">
        <img
          className="get-mark"
          src="/assets/favicons/favicon.webp"
          alt="GainFrame"
          width={30}
          height={30}
        />
        <span className="get-wordmark">GainFrame</span>
      </header>

      <main className="get-hero">
        <div className="get-inner">
          <div className="get-head">
            <h1 className="get-h1">
              Stop <span className="get-strike">guessing</span> your body fat.
            </h1>
            <p className="get-sub">
              It&rsquo;s Face ID for your gains. Point your camera, hold still,
              and get your body-fat number in seconds &mdash; no calipers, no
              squinting at the mirror.
            </p>
          </div>

          <div className="get-visual">
            <div className="get-redpanel">
              <div className="get-photo">
                <img
                  src="/assets/gainframe-guy/illustrations/mirror-mascot.webp"
                  alt="GainFrame Guy sizing himself up in the mirror, wondering if he looks different"
                  width={1728}
                  height={2478}
                />
              </div>
              <div className="get-numchip">
                <b>18.4%</b>
                <small>body fat &middot; sample</small>
              </div>
              <span className="get-scanline" aria-hidden="true" />
            </div>
          </div>

          <div className="get-actions">
            <LiveStats />

            <div className="get-cta-row">
              <a
                className="get-cta"
                href={SITE.appStoreUrl}
                target="_blank"
                rel="noopener"
                data-cta-source="get_landing"
                data-cta-content="hero_primary"
              >
                Scan me free
                <span className="get-arr" aria-hidden="true">
                  &nbsp;&rarr;
                </span>
              </a>
              <span className="get-cta-hint">Free to start &middot; iPhone</span>
            </div>

            <p className="get-legal">
              <a
                href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                target="_blank"
                rel="noopener"
              >
                Terms
              </a>{" "}
              &nbsp;&middot;&nbsp; <a href="/privacy">Privacy Policy</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
