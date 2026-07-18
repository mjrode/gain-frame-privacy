import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import PromoFilm from "@/components/PromoFilm";
import { SITE } from "@/lib/site";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-geist-mono",
});
// Geist is the page face; Geist Mono is exposed only as a CSS variable so
// label styles using var(--mono) pick it up without the whole page going mono.
const homeFontClass = `${geist.className} ${geistMono.variable}`;
const homeFontStyle = {
  "--mono": "var(--font-geist-mono), ui-monospace, Menlo, monospace",
} as CSSProperties;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GainFrame",
  alternateName: ["Gain Frame", "GainFrame App"],
  url: SITE.url,
  sameAs: [
    "https://x.com/GainFrameApp",
    "https://www.tiktok.com/@gainframeapp",
    "https://www.instagram.com/gainframe.app/",
  ],
  description:
    "GainFrame is an AI body composition app that estimates body fat from photos, scores 12 muscle groups, and pairs the analysis with a private AI Coach. In a published head-to-head against a clinical DEXA scan, GainFrame's estimate agreed within 0.4 percentage points.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How accurate is GainFrame's AI body fat estimation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In one head-to-head comparison against a clinical DEXA scan, GainFrame's body fat estimate agreed within 0.4 percentage points — the DEXA measured 18.6% and GainFrame estimated 19%. That is one user's documented test, not a peer-reviewed validation. Separately, a 2025 peer-reviewed study in npj Digital Medicine found AI photo-based body fat estimation in general achieved 0.98 Concordance Correlation Coefficient with DEXA across 1,273 adults — higher than smart scales at 0.91-0.92. The honest read: AI photo analysis under consistent conditions is the most accurate widely-available consumer method, with the trend across weekly check-ins doing the real work over time.",
      },
    },
    {
      "@type": "Question",
      name: "How does GainFrame compare to a DEXA scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DEXA scans cost $75-150 per visit and require an in-person appointment. GainFrame runs on your phone and is free at the base tier. In a documented head-to-head, the two methods agreed within 0.4 percentage points on body fat (DEXA: 18.6%, GainFrame: 19%) — one comparison, not a multi-person validation study. DEXA still wins for bone density and absolute visceral fat measurement. For the weekly body fat tracking most lifters actually do, GainFrame is a credible at-home alternative at $0 versus $100+ per scan.",
      },
    },
    {
      "@type": "Question",
      name: "Is GainFrame more accurate than smart scales?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI photo-based body fat estimation scored 0.98 Concordance Correlation Coefficient with DEXA in a 2025 peer-reviewed study (npj Digital Medicine, 1,273 adults), while smart scales using bioelectrical impedance analysis (BIA) scored 0.91-0.92. Smart scales are also heavily affected by hydration — readings can swing 3-5% based on a glass of water. AI photo analysis of standardized progress photos does not have that vulnerability. GainFrame uses the AI photo approach.",
      },
    },
    {
      "@type": "Question",
      name: "What does Coach know about me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GainFrame Coach can use your check-ins, GainFrame Score, body metrics (body fat, FFMI, lean mass, 12 muscle group scores), Apple Health data (sleep, HRV, steps, exercise), workout history from Hevy, Strava cardio activity, nutrition logs, and selected photo comparisons when those sources are available. All context loads automatically — you do not paste any data into the chat.",
      },
    },
    {
      "@type": "Question",
      name: "Are my photos private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your photos are sent securely for AI analysis and are never stored outside your device by GainFrame. There is no cloud account required to use the app, and your conversation history with Coach is stored on-device only.",
      },
    },
    {
      "@type": "Question",
      name: "Can I import old gym selfies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Smart Import classifies old photos by pose and builds your transformation timeline automatically, so a year of gym selfies on your camera roll becomes a continuous body composition history without manual sorting.",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className={homeFontClass} style={homeFontStyle}>
      <link rel="stylesheet" href="/styles-clean.css?v=seo-badge" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ScrollReveal />
      <Nav />
      <main>
        <section className="hero">
        <div className="page-grid" aria-hidden="true"></div>
        <div className="hero-copy reveal">
          <span className="eyebrow">
            <span></span>AI body analysis + Coach
          </span>
          <h1>Progress photos that explain what changed</h1>
          <p>
            Take or import a gym selfie and GainFrame pairs it with your
            weight, estimated body fat, and training — so you can see whether
            you&apos;re actually gaining muscle and losing fat, not just moving
            the scale.
          </p>
          <div className="hero-proof" aria-label="GainFrame report highlights">
            <span>Body fat %</span>
            <span>Muscle breakdowns</span>
            <span>Ask Coach why</span>
          </div>
          <div className="hero-actions">
            <a
              className="btn btn-dark"
              href={SITE.appStoreUrl}
              target="_blank"
              rel="noopener"
              data-cta-source="home"
              data-cta-content="hero_download"
            >
              Download free <span aria-hidden="true">&rarr;</span>
            </a>
            <a className="btn btn-light" href="#film" data-film-sound>
              Watch with sound
            </a>
          </div>
        </div>

        <PromoFilm />
      </section>

      <section className="showcase reverse coach-section" id="coach">
        <div className="showcase-copy reveal">
          <span className="eyebrow">
            <span></span>Coach
          </span>
          <h2>Ask Coach what changed and what to do next.</h2>
          <p>
            Coach reads your photos, body metrics, Health data, lifts, and
            nutrition logs, then turns the trend into a concrete explanation or
            training adjustment.
          </p>
          <div className="coach-points" aria-label="Coach capabilities">
            <span>Compare photos</span>
            <span>Open data sources</span>
            <span>Get lift advice</span>
          </div>
        </div>
        <div className="coach-panel reveal" aria-label="GainFrame Coach preview">
          <div className="coach-screen coach-screen-primary">
            <img
              src="/assets/shared/coach-goal-progress.webp"
              alt="GainFrame Coach explaining body fat and goal progress with body fat, score, weight, and a projected weight trend."
              loading="lazy"
            />
          </div>
          <div className="coach-screen coach-screen-secondary">
            <img
              src="/assets/shared/coach-targeted-advice.webp"
              alt="GainFrame Coach recommending incline dumbbell presses to improve upper chest development based on muscle analysis."
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="answers" id="features">
        <div className="section-head reveal">
          <h2>What GainFrame helps you answer.</h2>
        </div>

        <div className="answer-grid">
          <article className="answer-copy reveal">
            <h3>Am I gaining muscle or just weight?</h3>
            <p>
              Each check-in estimates body fat, FFMI, lean mass, and
              muscle-group scores from your photo history.
            </p>
            <strong>
              See the signal behind the selfie.
            </strong>
          </article>

          <article className="product-panel panel-wide reveal">
            <span className="panel-tag">
              <i></i> Muscle tracking
            </span>
            <div className="mini-window sources-window">
              <div className="window-top">
                <strong>Top movers</strong>
                <span>Change</span>
              </div>
              <div className="metric-row active">
                <span>Upper chest development</span>
                <strong>+24</strong>
              </div>
              <div className="metric-row">
                <span>Side delt roundness</span>
                <strong>+18</strong>
              </div>
              <div className="tooltip-card">Weekly scans found the trend</div>
            </div>
            <img
              src="/app-screenshots/1.21/muscle-compare.webp"
              alt="Muscle comparison and body map in GainFrame"
              loading="lazy"
            />
          </article>

          <article className="product-panel metrics-panel reveal">
            <span className="panel-tag">
              <i></i> Body Metrics
            </span>
            <div className="score-widget">
              <div>
                <span>Score</span>
                <strong>71</strong>
              </div>
              <div>
                <span>Body fat</span>
                <strong>19%</strong>
              </div>
              <div>
                <span>FFMI</span>
                <strong>23.2</strong>
              </div>
            </div>
            <img
              src="/app-screenshots/misc/IMG_1788.webp"
              alt="Body metrics report in GainFrame"
              loading="lazy"
            />
          </article>

          <article className="answer-copy reveal">
            <h3>What should I change next?</h3>
            <p>
              Deep Dive reports explain what changed, which muscles moved, and
              how your macro targets should shift for a bulk, cut, or recomp.
            </p>
            <strong>Turn a weekly photo into a training decision.</strong>
          </article>
        </div>
      </section>

      <section className="precision" id="precision">
        <div className="section-head reveal">
          <span className="eyebrow">
            <span></span>Precision body composition
          </span>
          <h2>Every check-in becomes a measurable report.</h2>
          <p>
            Snap one photo for a quick scan, or add multiple angles for a more
            precise body-fat estimate.
          </p>
        </div>
        <div className="feature-row">
          <article className="feature-card reveal">
            <div className="feature-stack deep-dive-stack">
              <img
                src="/app-screenshots/misc/IMG_1787.webp"
                alt="Deep dive report before and after comparison"
                loading="lazy"
              />
              <img
                src="/app-screenshots/1.21/compare.webp"
                alt="GainFrame comparison screen with before and after photos"
                loading="lazy"
              />
            </div>
            <h3>Deep dive reports</h3>
            <p>
              Before and after photos, body fat, FFMI, lean mass, and a
              plain-English summary of what changed.
            </p>
          </article>
          <article className="feature-card reveal">
            <img
              src="/app-screenshots/misc/IMG_1795.webp"
              alt="Next milestone screen with body fat goal"
              loading="lazy"
            />
            <h3>Trends over time</h3>
            <p>
              Track body fat, weight, FFMI, and muscle momentum across every
              check-in.
            </p>
          </article>
          <article className="feature-card reveal">
            <img
              src="/app-screenshots/1.21/macros.webp"
              alt="GainFrame nutrition and macro targets screen"
              loading="lazy"
            />
            <h3>Adaptive macros</h3>
            <p>
              Get calorie and macro targets that update from your actual body
              composition.
            </p>
          </article>
        </div>
      </section>

      <section className="showcase future-section">
        <div className="showcase-copy reveal">
          <span className="eyebrow">
            <span></span>Future You
          </span>
          <h2>See your future physique.</h2>
          <p>
            Choose 3, 6, or 12 months and preview where your current trend
            could take your body.
          </p>
        </div>
        <div className="showcase-phone reveal">
          <img
            src="/app-screenshots/1.21/future-you.webp"
            alt="Future You projection comparing now and 6 months"
            loading="lazy"
          />
        </div>
      </section>

      <section className="checkins-section">
        <div className="section-head reveal">
          <span className="eyebrow">
            <span></span>Check-ins
          </span>
          <h2>A weekly loop that keeps the trend clean.</h2>
          <p>
            Use guided photos so each scan is comparable, then review your
            score and body-composition readout without losing context.
          </p>
        </div>
        <div className="checkin-gallery reveal">
          <img
            src="/app-screenshots/1.21/home.webp"
            alt="GainFrame home screen with last check-in"
            loading="lazy"
          />
          <img
            src="/app-screenshots/1.21/post-check-in-photo-score.webp"
            alt="GainFrame post check-in score screen"
            loading="lazy"
          />
          <img
            src="/app-screenshots/1.21/check-ins.webp"
            alt="GainFrame check-in history screen"
            loading="lazy"
          />
        </div>
      </section>

      <section className="showcase reverse throwback-section">
        <div className="showcase-copy reveal">
          <span className="eyebrow">
            <span></span>Throwbacks
          </span>
          <h2>See progress you would have missed.</h2>
          <p>
            Automatic throwbacks compare older photos with today so small weekly
            improvements turn into a visible transformation.
          </p>
        </div>
        <div className="showcase-phone reveal">
          <img
            src="/app-screenshots/1.21/throwback.webp"
            alt="GainFrame throwback comparison screen"
            loading="lazy"
          />
        </div>
      </section>

      <section className="showcase weight-section">
        <div className="showcase-copy reveal">
          <span className="eyebrow">
            <span></span>Weight trend
          </span>
          <h2>Connect the scale to what your photos show.</h2>
          <p>
            Track weight, milestones, and rate of change next to physique
            updates so a bulk, cut, or recomp has a clearer signal.
          </p>
        </div>
        <div className="showcase-phone reveal">
          <img
            src="/app-screenshots/1.21/weight-chart.webp"
            alt="GainFrame weight tracker and trajectory chart"
            loading="lazy"
          />
        </div>
      </section>

      <section className="workflow" id="workflow">
        <div className="workflow-inner reveal">
          <div>
            <span className="eyebrow">
              <span></span>60 second workflow
            </span>
            <h2>Snap. Analyze. Ask Coach.</h2>
            <p>
              Use the same loop every week and GainFrame keeps the trend clean
              enough for Coach to explain.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <span>01</span>
              <strong>Take the photo</strong>
              <p>Front, side, and back poses with consistent framing.</p>
            </div>
            <div className="step">
              <span>02</span>
              <strong>Get the report</strong>
              <p>
                Body fat, FFMI, lean mass, 12 muscle scores, and a clear
                summary.
              </p>
            </div>
            <div className="step">
              <span>03</span>
              <strong>Ask Coach what changed</strong>
              <p>
                Coach explains data sources, photo comparisons, lift trends,
                and next moves.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="faq-inner">
          <div className="reveal">
            <span className="eyebrow">
              <span></span>FAQ
            </span>
            <h2>Common questions.</h2>
          </div>
          <div className="faq-list reveal">
            <details open>
              <summary>How accurate is GainFrame's AI body fat estimation?</summary>
              <p>
                In one{" "}
                <a href="/blog/dexa-scan-vs-ai-body-composition/">
                  head-to-head comparison against a clinical DEXA scan
                </a>
                , GainFrame&rsquo;s body fat estimate agreed within 0.4
                percentage points — the DEXA measured 18.6% and GainFrame
                estimated 19%. That is one user&rsquo;s documented test, not a
                peer-reviewed validation. Separately, a{" "}
                <a href="/blog/ai-body-fat-photo-accuracy-study/">
                  2025 peer-reviewed study in npj Digital Medicine
                </a>{" "}
                found AI photo-based body fat estimation in general achieved
                0.98 Concordance Correlation Coefficient with DEXA across
                1,273 adults — higher than smart scales at 0.91&ndash;0.92.
                The honest read: AI photo analysis under consistent conditions
                is the most accurate widely-available consumer method, with
                the trend across weekly check-ins doing the real work over
                time.
              </p>
            </details>
            <details>
              <summary>How does GainFrame compare to a DEXA scan?</summary>
              <p>
                DEXA scans cost $75&ndash;150 per visit and require an
                in-person appointment. GainFrame runs on your phone and is
                free at the base tier. In a documented head-to-head, the two
                methods agreed within 0.4 percentage points on body fat (DEXA:
                18.6%, GainFrame: 19%) — one comparison, not a multi-person
                validation study. DEXA still wins for bone density and
                absolute visceral fat measurement. For the weekly body fat
                tracking most lifters actually do, GainFrame is a credible
                at-home alternative at $0 versus $100+ per scan.
              </p>
            </details>
            <details>
              <summary>Is GainFrame more accurate than smart scales?</summary>
              <p>
                AI photo-based body fat estimation scored 0.98 Concordance
                Correlation Coefficient with DEXA in a 2025 peer-reviewed
                study (npj Digital Medicine, 1,273 adults), while smart scales
                using bioelectrical impedance analysis (BIA) scored
                0.91&ndash;0.92. Smart scales are also heavily affected by
                hydration — readings can swing 3&ndash;5% based on a glass of
                water. AI photo analysis of standardized progress photos does
                not have that vulnerability. GainFrame uses the AI photo
                approach.
              </p>
            </details>
            <details>
              <summary>What does Coach know about me?</summary>
              <p>
                Coach can use your check-ins, GainFrame Score, body metrics
                (body fat, FFMI, lean mass, 12 muscle group scores), Apple
                Health data (sleep, HRV, steps, exercise), workout history
                from Hevy, Strava cardio activity, nutrition logs, and
                selected photo comparisons when those sources are available.
                All context loads automatically — you do not paste any data
                into the chat.
              </p>
            </details>
            <details>
              <summary>Are my photos private?</summary>
              <p>
                Your photos are sent securely for AI analysis and are never
                stored outside your device by GainFrame. There is no cloud
                account required to use the app, and your conversation history
                with Coach is stored on-device only.
              </p>
            </details>
            <details>
              <summary>Can I import old gym selfies?</summary>
              <p>
                Yes. Smart Import classifies old photos by pose and builds
                your transformation timeline automatically, so a year of gym
                selfies on your camera roll becomes a continuous body
                composition history without manual sorting.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="final-cta reveal">
        <h2>Take a photo. Ask Coach what changed.</h2>
        <p>
          Download free. Start with one progress photo, get your AI analysis,
          and chat with Coach when you want the story behind the numbers.
        </p>
        <a
          className="btn btn-dark"
          href={SITE.appStoreUrl}
          target="_blank"
          rel="noopener"
          data-cta-source="home"
          data-cta-content="closing_download"
        >
          Download on App Store <span aria-hidden="true">&rarr;</span>
        </a>
      </section>
      </main>
      <div className="seo-receipt">
        <a
          href="https://seoreceipts.com/site/gainframe/?ref=badge&utm_source=embed&utm_medium=badge&utm_campaign=status-auto"
          title="View the live SEO Receipt for gainframe.app"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://seoreceipts.com/api/badge?slug=gainframe&mode=auto"
            alt="Live verified SEO status for gainframe.app"
            height={68}
          />
        </a>
      </div>
      <Footer />
    </div>
  );
}
