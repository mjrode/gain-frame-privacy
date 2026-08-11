import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import MemberProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Community Profile — GainFrame",
  description: "An opt-in GainFrame community score history.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LeaderboardMemberPage() {
  return (
    <div className="member-profile-page">
      <link rel="stylesheet" href="/styles-clean.css" />
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/leaderboard-profile.css" />
      <Nav />
      <main className="member-profile-main">
        <MemberProfileClient />
      </main>
      <Footer />
    </div>
  );
}
