import type { Metadata } from "next";
import { Geist } from "next/font/google";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import TrainerWaitlistForm from "./TrainerWaitlistForm";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const fontClass = geist.className;

export const metadata: Metadata = {
  title: {
    absolute:
      "GainFrame for Trainers — AI Body Scans Your Clients Will Trust",
  },
  description:
    "Track every client's progress with the most accurate body composition AI on the App Store. Built for personal trainers. Reserve your founding-member spot.",
  alternates: { canonical: "/trainers/" },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "GainFrame for Trainers — AI Body Scans Your Clients Will Trust",
    description:
      "Track every client with AI body composition scans, weekly check-ins, and future projections. Built for trainers. Founding members locked in at $5/client/mo.",
    url: `${SITE.url}/trainers/`,
    type: "website",
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainFrame for Trainers",
    description:
      "AI body scans for personal trainers. Founding members $5/client/mo.",
    images: [SITE.ogImage],
  },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "GainFrame for Trainers",
  description:
    "AI body composition tracking software for personal trainers. Manage a roster of clients, run weekly check-ins, and deliver precision body fat + physique scores from a single photo.",
  brand: { "@type": "Brand", name: "GainFrame" },
  category: "Fitness software",
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "5",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "5",
      priceCurrency: "USD",
      unitText: "per client per month",
    },
    availability: "https://schema.org/PreOrder",
    url: `${SITE.url}/trainers/`,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE.url}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "For Trainers",
      item: `${SITE.url}/trainers/`,
    },
  ],
};

export default function TrainersPage() {
  return (
    <div className={`trainers-page ${fontClass}`}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/trainers-page.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <BlogNav />

      <main className="tr-main">
        <section className="tr-hero">
          <div className="tr-container">
            <span className="tr-eyebrow">
              <span className="tr-dot" />
              Founding members opening now
            </span>
            <h1 className="tr-h1">
              AI body scans your clients will{" "}
              <span className="tr-accent">actually trust</span>.
            </h1>
            <p className="tr-lede">
              Track every client&rsquo;s body composition, weekly progress, and
              future trajectory in one app. Built for trainers by an indie
              developer behind the most accurate body-fat estimator on the App
              Store.
            </p>
            <div className="tr-cta-row">
              <a
                className="tr-btn tr-btn-primary"
                href={SITE.trainerDepositUrl}
                target="_blank"
                rel="noopener"
                data-analytics="trainer-deposit-cta-hero"
              >
                Reserve founding-member spot
                <span aria-hidden="true"> -&gt;</span>
              </a>
              <a className="tr-btn tr-btn-ghost" href="#how-it-works">
                See how it works
              </a>
            </div>
            <p className="tr-cta-sub">
              $50 deposit applied to first month &middot; refundable for 30
              days &middot; locks in $5/client/mo for 12 months
            </p>
          </div>
        </section>

        <section className="tr-problem">
          <div className="tr-container tr-narrow">
            <span className="tr-section-tag">The problem</span>
            <h2 className="tr-h2">
              Spreadsheets, screenshots, and apps built for clients, not coaches.
            </h2>
            <div className="tr-problem-grid">
              <div className="tr-problem-card">
                <h3>Apps are built for the client</h3>
                <p>
                  Every body-comp app assumes one user, one history. You end up
                  juggling logins or watching screenshots roll in.
                </p>
              </div>
              <div className="tr-problem-card">
                <h3>Photos lose context the moment they&rsquo;re sent</h3>
                <p>
                  A check-in photo in a DM tells you almost nothing. No score,
                  no comparison, no notes attached when you look back in 3
                  months.
                </p>
              </div>
              <div className="tr-problem-card">
                <h3>You&rsquo;re the proof of progress</h3>
                <p>
                  Clients re-up because they can see what&rsquo;s changing.
                  Without measurable data, retention is a vibe, not a graph.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="tr-how" id="how-it-works">
          <div className="tr-container">
            <span className="tr-section-tag">What it does</span>
            <h2 className="tr-h2">A coaching back-office for every client.</h2>
            <div className="tr-how-grid">
              <article className="tr-how-card">
                <span className="tr-how-step">01</span>
                <h3>Build your roster</h3>
                <p>
                  Add each client with age, weight, sex, height, and goal. One
                  tap to switch between profiles. Notes attached to every
                  check-in.
                </p>
              </article>
              <article className="tr-how-card">
                <span className="tr-how-step">02</span>
                <h3>Weekly photo check-ins</h3>
                <p>
                  Same guided poses every time so scans are comparable. Body
                  fat %, physique score, FFMI, and 12 muscle group scores from
                  one photo.
                </p>
              </article>
              <article className="tr-how-card">
                <span className="tr-how-step">03</span>
                <h3>Trends per client</h3>
                <p>
                  Score history, body-comp trajectory, before/after compare.
                  Every data point you need for the &ldquo;here&rsquo;s what
                  changed&rdquo; conversation.
                </p>
              </article>
              <article className="tr-how-card">
                <span className="tr-how-step">04</span>
                <h3>Coach AI for clients</h3>
                <p>
                  Drop in a note (&ldquo;cutting at 1700kcal, lifting 4 days&rdquo;)
                  and Coach generates client-facing summaries you can share.
                  Photos + your notes only.
                </p>
              </article>
              <article className="tr-how-card">
                <span className="tr-how-step">05</span>
                <h3>Future-physique preview</h3>
                <p>
                  3, 6, and 12-month projections from current trajectory. The
                  sales tool your discovery calls have been missing.
                </p>
              </article>
              <article className="tr-how-card">
                <span className="tr-how-step">06</span>
                <h3>Built on the same engine</h3>
                <p>
                  Same scoring model trainers already told us is &ldquo;the
                  most accurate they tested.&rdquo; You get it scoped to a
                  roster.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="tr-proof">
          <div className="tr-container tr-narrow">
            <span className="tr-section-tag">What trainers are saying</span>
            <blockquote className="tr-quote">
              <p>
                &ldquo;After testing a few of them, yours is the most accurate.
                I&rsquo;ve been looking for something like this for trainers
                but none of the apps combine the future projections with the
                body scan.&rdquo;
              </p>
              <footer>
                <span className="tr-quote-attr">
                  &mdash; Personal trainer, App Store user
                </span>
                <span className="tr-quote-sub">
                  Shared in chat after testing GainFrame against competitors
                </span>
              </footer>
            </blockquote>
          </div>
        </section>

        <section className="tr-pricing" id="pricing">
          <div className="tr-container">
            <span className="tr-section-tag">Founding-member pricing</span>
            <h2 className="tr-h2">
              Lock in $5/client/mo. Forever-low rate for the first 12 months.
            </h2>
            <div className="tr-pricing-card">
              <div className="tr-pricing-head">
                <div className="tr-price">
                  <span className="tr-price-amount">$5</span>
                  <span className="tr-price-unit">/client/mo</span>
                </div>
                <div className="tr-price-meta">
                  <span className="tr-price-flag">Founding rate</span>
                  <span className="tr-price-strike">
                    Standard: $8/client/mo
                  </span>
                </div>
              </div>
              <ul className="tr-pricing-list">
                <li>
                  <strong>$50 deposit</strong> applied to your first month (10
                  clients &times; founding rate)
                </li>
                <li>
                  <strong>Refundable</strong> within 30 days of launch if it
                  doesn&rsquo;t fit your workflow
                </li>
                <li>
                  <strong>Locked in</strong> at $5/client/mo for the first 12
                  months &mdash; even when standard pricing goes live
                </li>
                <li>
                  <strong>Direct line</strong> to the builder during the V1
                  build &mdash; founding members shape the roadmap
                </li>
              </ul>
              <a
                className="tr-btn tr-btn-primary tr-btn-block"
                href={SITE.trainerDepositUrl}
                target="_blank"
                rel="noopener"
                data-analytics="trainer-deposit-cta-pricing"
              >
                Reserve founding-member spot
                <span aria-hidden="true"> -&gt;</span>
              </a>
              <p className="tr-pricing-fineprint">
                Deposit secures your founding rate but does not guarantee
                product delivery. If 5+ trainers commit during the validation
                window, V1 ships. If not, deposits are refunded in full and
                you&rsquo;re unsubscribed cleanly.
              </p>
            </div>
          </div>
        </section>

        <section className="tr-waitlist">
          <div className="tr-container tr-narrow">
            <span className="tr-section-tag">Not ready to deposit?</span>
            <h2 className="tr-h2">Join the waitlist instead.</h2>
            <p className="tr-waitlist-sub">
              Get a heads-up when trainer mode opens up. No spam. One email
              when V1 ships, one if it doesn&rsquo;t.
            </p>
            <TrainerWaitlistForm />
          </div>
        </section>

        <section className="tr-faq">
          <div className="tr-container tr-narrow">
            <span className="tr-section-tag">FAQ</span>
            <h2 className="tr-h2">Honest answers.</h2>
            <div className="tr-faq-list">
              <details open>
                <summary>What am I actually paying for right now?</summary>
                <p>
                  A founding-member spot. Trainer mode is a planned addition to
                  the GainFrame app. The deposit shows me you&rsquo;d use it,
                  locks you in at the low rate, and tells me to commit
                  engineering time. If 5+ trainers deposit during the 21-day
                  validation window, V1 ships in ~6 weeks. If not, every
                  deposit is refunded in full.
                </p>
              </details>
              <details>
                <summary>How will Coach AI work for my clients?</summary>
                <p>
                  Coach analyzes the client&rsquo;s photos and trainer-entered
                  context (training cadence, calorie targets, sleep, anything
                  you&rsquo;d type into a check-in note). No HealthKit
                  integration for clients in V1 &mdash; that&rsquo;s a
                  later-version question once V1 is in your hands.
                </p>
              </details>
              <details>
                <summary>How accurate is the body-fat estimate?</summary>
                <p>
                  AI estimates are approximations, not medical-grade. The
                  strongest signal is the trend across consistent weekly
                  photos. Trainers using the consumer app report it as
                  &ldquo;the most accurate&rdquo; vs. apps they&rsquo;ve
                  tested &mdash; but read it as a trend tool, not a clinical
                  reading.
                </p>
              </details>
              <details>
                <summary>What happens to client photos and data?</summary>
                <p>
                  Photos are sent securely to Google&rsquo;s Gemini model for
                  AI analysis and are not stored outside your device by
                  GainFrame. Client profiles, notes, and scores are stored in
                  your account. You can delete a client&rsquo;s profile any
                  time and their data is removed.
                </p>
              </details>
              <details>
                <summary>Can I share results directly with clients?</summary>
                <p>
                  V1 is trainer-only &mdash; you generate and share results.
                  Built-in client-side sharing (a login or share link) is the
                  most-asked V2 feature, and founding members vote on the
                  roadmap.
                </p>
              </details>
              <details>
                <summary>Why per-client pricing instead of a flat rate?</summary>
                <p>
                  AI scans aren&rsquo;t free for me &mdash; each check-in
                  costs real compute &mdash; so per-client pricing keeps the
                  unit economics honest. It also means a trainer with 5
                  clients pays $25/mo, not $50. Caps and seat tiers are
                  options we can revisit if founding members want them.
                </p>
              </details>
              <details>
                <summary>What if I&rsquo;m a 1:1 trainer with just a couple of clients?</summary>
                <p>
                  Per-client pricing scales down too &mdash; 3 clients is
                  $15/mo at the founding rate. The deposit still applies; if
                  you only use 4 clients on month one, the unused $30 carries
                  over to month two.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="tr-final-cta">
          <div className="tr-container tr-narrow tr-final-inner">
            <h2 className="tr-h2">Reserve your founding-member spot.</h2>
            <p className="tr-final-sub">
              $50 today. $5/client/mo locked for 12 months. Refundable for 30
              days.
            </p>
            <a
              className="tr-btn tr-btn-primary tr-btn-lg"
              href={SITE.trainerDepositUrl}
              target="_blank"
              rel="noopener"
              data-analytics="trainer-deposit-cta-final"
            >
              Reserve founding-member spot
              <span aria-hidden="true"> -&gt;</span>
            </a>
            <p className="tr-final-builder">
              Built by{" "}
              <a href="/about/">Michael Rode</a>
              {" "}&middot; one-person company in Wilmington, NC.
            </p>
          </div>
        </section>
      </main>

      <footer className="tr-foot">
        <div className="tr-container tr-foot-inner">
          <span>&copy; {new Date().getFullYear()} GainFrame</span>
          <div className="tr-foot-links">
            <a href="/">Consumer app</a>
            <a href="/about/">About</a>
            <a href="/privacy">Privacy</a>
            <a href={`mailto:${SITE.contactEmail}`}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
