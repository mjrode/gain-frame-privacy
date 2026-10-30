import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/lib/site";
import AppStoreClickTracker from "@/components/AppStoreClickTracker";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import ArticleJourneyTracker from "@/components/ArticleJourneyTracker";
import { GooglePreferredSourceFooter } from "@/components/GooglePreferredSource";

// Vendored fonts keep builds independent of Google Fonts. Explicit family names
// preserve existing CSS references; see fonts/README.md for sources and licenses.
const dmSans = localFont({
  src: [
    { path: "../fonts/dm-sans/normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/dm-sans/normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/dm-sans/normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/dm-sans/normal.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  fallback: ["DM Sans", "sans-serif"],
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "DM Sans" }],
});
const outfit = localFont({
  src: [
    { path: "../fonts/outfit/normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/outfit/normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/outfit/normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/outfit/normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/outfit/normal.woff2", weight: "800", style: "normal" },
    { path: "../fonts/outfit/normal.woff2", weight: "900", style: "normal" },
  ],
  display: "swap",
  fallback: ["Outfit", "sans-serif"],
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "Outfit" }],
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
        <GooglePreferredSourceFooter />
        <AppStoreClickTracker />
        <ArticleJourneyTracker />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
