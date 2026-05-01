import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "GainFrame - The AI Body Composition App for Gym Goers",
    template: "%s | GainFrame",
  },
  description:
    "The AI body composition app. Take one gym selfie, get your physique score, precision body fat, 12 muscle ratings, and your next milestone in 60 seconds.",
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
      "See the body you're building. One gym selfie, full report in 60 seconds: precision BF%, 12 muscle scores, and your next milestone.",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainFrame - The AI Body Composition App",
    description:
      "See the body you're building. One gym selfie, full report in 60 seconds: precision BF%, 12 muscle scores, and your next milestone.",
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
    "The AI body composition app for gym-goers. Take one photo, get your score, body fat, muscle breakdown, and next milestone.",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
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
