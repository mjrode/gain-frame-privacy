import type { Metadata } from "next";
import Homepage from "@/components/homepage/Homepage";
import { SITE } from "@/lib/site";

const title = "Track your physique. See what’s changing. | GainFrame";
const description =
  "Organize your progress photos, understand physique changes with AI Deep Dive, and ask Coach what to focus on next. Made for iPhone.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "GainFrame — progress photo tracking" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [SITE.ogImage],
  },
};

export default Homepage;
