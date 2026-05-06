import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
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
});
const homeFontClass = `${geist.className} ${geistMono.className}`;

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
  description:
    "The AI body composition app. Take one gym selfie, get your physique score, precision body fat, 12 muscle ratings, and your next milestone in 60 seconds.",
};

export default function Home() {
  return (
    <div className={homeFontClass}>
      <link rel="stylesheet" href="/styles-clean.css?v=trailer-crop" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <ScrollReveal />
      <Nav />
      <main>
        <section className="hero">
        <div className="page-grid" aria-hidden="true"></div>
        <div className="hero-copy reveal">
          <span className="eyebrow">
            <span></span>AI physique tracking
          </span>
          <h1>Track the physique your training is building</h1>
          <p>
            GainFrame turns progress photos into body fat, FFMI, muscle scores,
            macros, and your next milestone in one clean report.
          </p>
          <div className="hero-actions">
            <a
              className="btn btn-dark"
              href={SITE.appStoreUrl}
              target="_blank"
              rel="noopener"
            >
              Download free trial <span aria-hidden="true">-&gt;</span>
            </a>
            <a className="btn btn-light" href="#trailer">
              Watch demo
            </a>
          </div>
        </div>

        <div className="hero-stage reveal" aria-label="GainFrame app preview">
          <div className="radar-glow" aria-hidden="true"></div>
          <div className="radar-orbit" aria-hidden="true"></div>
          <div className="radar-map" aria-hidden="true">
            <span className="map-label label-a">FFMI</span>
            <span className="map-label label-b">BF%</span>
            <span className="map-label label-c">BMI</span>
            <span className="map-label label-d">Weight</span>
            <span className="metric-pin pin-a">
              <strong>BMI</strong>
              <em>28.1</em>
            </span>
            <span className="metric-pin pin-b">
              <strong>FFMI</strong>
              <em>19.4</em>
            </span>
            <span className="metric-pin pin-c">
              <strong>BF%</strong>
              <em>18.0</em>
            </span>
            <span className="metric-pin pin-d">
              <strong>Weight</strong>
              <em>239</em>
            </span>
          </div>
          <div className="phone-shell phone-left" aria-hidden="true">
            <img src="/app-screenshots/misc/IMG_1789.webp" alt="" />
          </div>
          <div className="phone-shell phone-main">
            <img
              src="/app-screenshots/1.21/day-checkin-score.webp"
              alt="GainFrame check-in score screen showing physique score and precision body fat."
            />
          </div>
          <div className="visit-card">
            <div className="visit-copy">
              <strong>Scan complete</strong>
              <span>Updated from today&apos;s photo</span>
            </div>
            <div className="visit-metrics">
              <span className="visit-metric">
                <span className="status-dot"></span>
                <strong>68 Score</strong>
              </span>
              <span className="visit-metric">
                <span className="status-dot"></span>
                <strong>BF 19%</strong>
              </span>
            </div>
            <a href="#features">See report</a>
          </div>
          <div className="float-chip chip-top">+12 score</div>
          <div className="float-chip chip-right">High confidence</div>
        </div>
      </section>

      <section className="trailer reveal" id="trailer">
        <div className="section-head">
          <h2>
            The most complete progress photo app, designed for people who lift.
          </h2>
          <p>
            GainFrame goes beyond photo storage by connecting what you see, what
            changed, and what to do next.
          </p>
        </div>
        <div className="video-shell demo-board recording-board">
          <div className="demo-phone demo-phone-left" aria-hidden="true">
            <img
              src="/app-screenshots/1.21/muscle-compare.webp"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="demo-video-crop">
            <video
              className="demo-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/app-screenshots/1.21/screen-recording-1-21-poster.jpg"
              aria-label="GainFrame product walkthrough recording"
            >
              <source
                src="/app-screenshots/1.21/screen-recording-1-21-web.mp4"
                type="video/mp4"
              />
            </video>
          </div>
          <div className="demo-phone demo-phone-right" aria-hidden="true">
            <img
              src="/app-screenshots/1.21/macros.webp"
              alt=""
              loading="lazy"
            />
          </div>
          <div className="demo-caption">Product walkthrough</div>
          <svg className="caption-arrow" viewBox="0 0 140 120" aria-hidden="true">
            <path
              d="M112 10c7 38-12 70-68 88"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M42 99l18-2M42 99l12-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </section>

      <section className="answers" id="features">
        <div className="section-head reveal">
          <h2>Finally answer the questions that matter.</h2>
        </div>

        <div className="answer-grid">
          <article className="answer-copy reveal">
            <h3>Which muscles actually grew?</h3>
            <p>
              See muscle changes, body-fat movement, and measurement trends from
              one check-in to the next.
            </p>
            <strong>
              Know what is working before the mirror makes it obvious.
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
            <h3>What changed since the last check-in?</h3>
            <p>
              Connect photos, body-fat deltas, macros, and muscle ratings so
              each scan gives you the next adjustment.
            </p>
            <strong>Turn a weekly photo into a specific plan.</strong>
          </article>
        </div>
      </section>

      <section className="precision" id="precision">
        <div className="section-head reveal">
          <span className="eyebrow">
            <span></span>Precision body composition
          </span>
          <h2>One scan creates a report you can act on.</h2>
          <p>
            Each screen is purpose-built for repeat check-ins, not vanity
            metrics.
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
              Before and after scores, body metrics, and a plain-English summary
              of what changed.
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
              Track body-fat movement, weight changes, and muscle momentum
              across every check-in.
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
              Cut, maintain, and bulk targets update from your actual body
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
            Use your check-ins and current trend to preview where your body
            could be headed in the next 6 to 12 months.
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
            Start from home, capture a new photo, then review the score and
            body-composition readout without losing context.
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
            <h2>Snap. Analyze. Adjust.</h2>
            <p>
              Use the same loop every week and GainFrame keeps the trend clean.
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
              <p>Score, body fat, FFMI, muscles, and executive summary.</p>
            </div>
            <div className="step">
              <span>03</span>
              <strong>Follow the next move</strong>
              <p>Training focus and macros adapt as your scan changes.</p>
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
              <summary>How accurate is the AI body fat estimate?</summary>
              <p>
                Within 2-4% of DEXA for most users. The trend across consistent
                weekly photos is the most useful signal.
              </p>
            </details>
            <details>
              <summary>Are my photos private?</summary>
              <p>
                Your photos are sent securely for AI analysis and are never
                stored outside your device by GainFrame.
              </p>
            </details>
            <details>
              <summary>Can I import old gym selfies?</summary>
              <p>
                Yes. Smart Import classifies old photos by pose and builds your
                transformation timeline automatically.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="final-cta reveal">
        <h2>Make your next check-in measurable.</h2>
        <p>
          Free 30-day trial. No credit card. Then $4.99/month or $29.99/year.
        </p>
        <a
          className="btn btn-dark"
          href={SITE.appStoreUrl}
          target="_blank"
          rel="noopener"
        >
          Download on App Store <span aria-hidden="true">-&gt;</span>
        </a>
      </section>
      </main>
      <Footer />
    </div>
  );
}
