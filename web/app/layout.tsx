import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { DM_Sans, Outfit } from "next/font/google";
import { SITE } from "@/lib/site";
import AppStoreClickTracker from "@/components/AppStoreClickTracker";

// Self-hosted fonts via next/font — emits @font-face declarations using these
// family names so existing CSS that references 'DM Sans' / 'Outfit' / etc.
// resolves to locally-hosted woff2. No fonts.googleapis.com requests.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});
// Playfair Display and UnifrakturCook are loaded per-route via
// components/EditorialFonts — only /comics and /alien use them.

const fontClassName = [dmSans.className, outfit.className].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "GainFrame - The AI Body Composition App for Gym Goers",
    template: "%s | GainFrame",
  },
  description:
    "The AI progress photo app with body analysis and a private Coach. Estimate body fat, physique scores, and muscle groups, then ask what changed.",
  keywords: [
    "progress photo app",
    "body transformation app",
    "ai fitness app",
    "gym tracker",
    "AI physique",
    "body composition",
    "workout photos",
    "precision body fat",
    "muscle score",
    "fitness streaks",
  ],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/assets/favicons/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/assets/favicons/favicon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/assets/favicons/favicon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/assets/favicons/favicon-192.png", sizes: "192x192" },
    ],
  },
  appleWebApp: {
    title: "GainFrame",
  },
  openGraph: {
    type: "website",
    siteName: "GainFrame",
    url: SITE.url,
    title: "GainFrame - The AI Body Composition App",
    description:
      "Take a gym progress photo, get AI body analysis, then ask Coach what changed and why.",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainFrame - The AI Body Composition App",
    description:
      "Take a gym progress photo, get AI body analysis, then ask Coach what changed and why.",
    images: [SITE.ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GainFrame",
  url: SITE.url,
  logo: SITE.logo,
  sameAs: [
    "https://www.tiktok.com/@gainframeapp",
    "https://www.instagram.com/gainframe.app/",
  ],
  description:
    "The AI body composition app for gym-goers. Turn progress photos into body fat, muscle scores, and private Coach conversations about what changed.",
  contactPoint: {
    "@type": "ContactPoint",
    email: SITE.contactEmail,
    contactType: "customer support",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontClassName}>
      <head>
        <link rel="api-catalog" href="/.well-known/api-catalog.json" />
        <link
          rel="service-doc"
          href="/blog/"
          title="GainFrame Blog & Documentation"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body>
        {children}
        <AppStoreClickTracker />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            // Analytics only run on the production domain. localhost dev
            // servers and *.pages.dev previews must not send events to the
            // production GA4/PostHog projects (PostHog's internal-user filter
            // does not apply to realtime destinations like Slack alerts).
            if (/(^|\\.)gainframe\\.app$/.test(location.hostname)) {
              var gaScript = document.createElement('script');
              gaScript.async = true;
              gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=${SITE.ga4Id}';
              document.head.appendChild(gaScript);
              window.dataLayer = window.dataLayer || [];
              window.gtag = function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${SITE.ga4Id}');
            }
          `}
        </Script>
        <Script id="posthog-init" strategy="afterInteractive">
          {`
            if (/(^|\\.)gainframe\\.app$/.test(location.hostname)) {
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_distinct_id get_property getSessionProperty getSurveysLoaded onSurveysLoaded alias reset get_session_id get_session_replay_url createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${SITE.posthogKey}', {api_host: '${SITE.posthogHost}', defaults: '2025-05-24'});
            }
          `}
        </Script>
      </body>
    </html>
  );
}
