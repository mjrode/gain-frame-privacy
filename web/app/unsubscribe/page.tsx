import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import UnsubscribeClient from "./UnsubscribeClient";

export const metadata: Metadata = {
  title: { absolute: "Unsubscribe · GainFrame" },
  description: "Stop receiving lifecycle emails from GainFrame.",
  alternates: { canonical: "/unsubscribe/" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Unsubscribe · GainFrame",
    description: "Stop receiving lifecycle emails from GainFrame.",
    url: `${SITE.url}/unsubscribe/`,
    type: "website",
    siteName: "GainFrame",
  },
};

// Static export friendly — the page itself is fully prerendered; the actual
// unsubscribe POST happens client-side in <UnsubscribeClient />.
export default function UnsubscribePage() {
  return (
    <main
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        padding: "64px 24px",
        color: "#1a1a1a",
        lineHeight: 1.5,
        textAlign: "center",
      }}
    >
      <UnsubscribeClient />
    </main>
  );
}
