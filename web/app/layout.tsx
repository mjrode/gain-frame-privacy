import type { Metadata, Viewport } from "next";
import Script from "next/script";
import {
  DM_Sans,
  Outfit,
  Playfair_Display,
  UnifrakturCook,
} from "next/font/google";
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
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});
const unifraktur = UnifrakturCook({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const fontClassName = [
  dmSans.className,
  outfit.className,
  playfair.className,
  unifraktur.className,
].join(" ");

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${SITE.ga4Id}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${SITE.ga4Id}');
          `}
        </Script>
      </body>
    </html>
  );
}
