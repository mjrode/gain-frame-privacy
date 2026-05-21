import type { Metadata } from "next";
import { Geist } from "next/font/google";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    absolute: "You're in — GainFrame for Trainers",
  },
  description:
    "Your founding-member deposit is in. Here's what happens next.",
  alternates: { canonical: "/trainers/thanks/" },
  robots: { index: false, follow: false },
};

export default function TrainersThanksPage() {
  return (
    <div className={`trainers-page ${geist.className}`}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/trainers-page.css" />

      <BlogNav />

      <main className="tr-main">
        <section className="tr-hero">
          <div className="tr-container tr-narrow">
            <span className="tr-eyebrow">
              <span className="tr-dot" />
              Deposit received
            </span>
            <h1 className="tr-h1">You&rsquo;re in.</h1>
            <p className="tr-lede">
              Your founding-member spot is locked at <strong>$5/client/mo
              for 12 months</strong>. Here&rsquo;s exactly what happens next.
            </p>

            <div className="tr-how-grid" style={{ marginTop: "10px" }}>
              <article className="tr-how-card">
                <span className="tr-how-step">01</span>
                <h3>Confirmation email</h3>
                <p>
                  Stripe just emailed your receipt. Save it &mdash; that&rsquo;s
                  proof of your founding rate. I&rsquo;ll reply within 24 hours
                  with a personal note.
                </p>
              </article>
              <article className="tr-how-card">
                <span className="tr-how-step">02</span>
                <h3>21-day window</h3>
                <p>
                  I&rsquo;m collecting founding deposits for ~3 weeks. If 5+
                  trainers commit, V1 starts immediately. If not, every
                  deposit gets refunded in full.
                </p>
              </article>
              <article className="tr-how-card">
                <span className="tr-how-step">03</span>
                <h3>~6 weeks to V1</h3>
                <p>
                  Assuming we hit the threshold: scoped V1 with multi-client
                  roster, weekly check-ins, per-client scoring, and Coach AI
                  using your notes. Founding members get TestFlight early.
                </p>
              </article>
              <article className="tr-how-card">
                <span className="tr-how-step">04</span>
                <h3>You shape the build</h3>
                <p>
                  I&rsquo;ll email each founding member a short survey
                  (current workflow, biggest pain points, must-have features).
                  Your answers directly influence V1 priorities.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="tr-final-cta">
          <div className="tr-container tr-narrow tr-final-inner">
            <h2 className="tr-h2">Help me find more founding members?</h2>
            <p className="tr-final-sub">
              If you know other trainers who&rsquo;d benefit, share the link.
              The faster we hit 5 deposits, the faster V1 ships.
            </p>
            <div className="tr-cta-row" style={{ justifyContent: "center" }}>
              <a
                className="tr-btn tr-btn-primary"
                href={`mailto:?subject=Check%20out%20GainFrame%20for%20Trainers&body=I%20just%20joined%20the%20founding%20cohort%20for%20GainFrame%20for%20Trainers%20%E2%80%94%20AI%20body%20scans%20with%20multi-client%20support%2C%20built%20for%20coaches.%20%24%5/client/mo%20locked%20in%20for%20a%20year%20if%20you%20deposit%20now.%20%0A%0A${SITE.url}/trainers/`}
              >
                Share via email
              </a>
              <a
                className="tr-btn tr-btn-ghost"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "Just locked in founding pricing for @GainFrameApp for Trainers — AI body scans for every client at $5/client/mo. ",
                )}&url=${encodeURIComponent(`${SITE.url}/trainers/`)}`}
                target="_blank"
                rel="noopener"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.18)",
                }}
              >
                Share on X
              </a>
            </div>
            <p className="tr-final-builder">
              Questions? Email me directly at{" "}
              <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
            </p>
          </div>
        </section>
      </main>

      <footer className="tr-foot">
        <div className="tr-container tr-foot-inner">
          <span>&copy; {new Date().getFullYear()} GainFrame</span>
          <div className="tr-foot-links">
            <a href="/trainers/">Back to trainer page</a>
            <a href="/">Consumer app</a>
            <a href="/about/">About</a>
            <a href={`mailto:${SITE.contactEmail}`}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
