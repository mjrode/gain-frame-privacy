import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { SITE } from "@/lib/site";
import LeaderboardClient from "./LeaderboardClient";

const PAGE_PATH = "/leaderboard/";

export const metadata: Metadata = {
  title: "GainFrame Leaderboard",
  description:
    "See opt-in GainFrame Scores from the community. Only usernames, scores, goals, and chosen check-in dates are shown.",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "GainFrame Leaderboard",
    description:
      "See opt-in GainFrame Scores from the community while progress photos stay private.",
    url: `${SITE.url}${PAGE_PATH}`,
    type: "website",
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainFrame Leaderboard",
    description:
      "See opt-in GainFrame Scores from the community while progress photos stay private.",
    images: [SITE.ogImage],
  },
};

export default function LeaderboardPage() {
  return (
    <div className="leaderboard-page">
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/leaderboard.css" />
      <Nav />
      <main className="leaderboard-main">
        <LeaderboardClient />
      </main>
      <Footer />
    </div>
  );
}
