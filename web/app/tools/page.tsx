import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import ToolsInteractions from "@/components/ToolsInteractions";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Free Fitness Calculators — Body Fat, TDEE & Macros | GainFrame",
  },
  description:
    "Free fitness calculators from GainFrame. Estimate body fat with the Navy method, calculate your TDEE, and get personalized macro targets — no signup required.",
  alternates: { canonical: "/tools/" },
  openGraph: {
    title: "Free Fitness Calculators — GainFrame",
    description:
      "Body fat calculator, TDEE calculator, and macro calculator — all free, instant, no signup.",
    type: "website",
    url: `${SITE.url}/tools/`,
    siteName: "GainFrame",
    images: [{ url: "https://gainframe.app/assets/og-images/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Fitness Calculators — GainFrame",
    description:
      "Body fat calculator, TDEE calculator, and macro calculator — all free, instant, no signup.",
  },
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "GainFrame Free Fitness Calculators",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Body Fat Calculator", url: "https://gainframe.app/tools/body-fat-estimator/" },
    { "@type": "ListItem", position: 2, name: "Body Fat Percentage at Each Age", url: "https://gainframe.app/tools/body-fat-visualizer/" },
    { "@type": "ListItem", position: 3, name: "TDEE Calculator", url: "https://gainframe.app/tools/tdee-calculator/" },
    { "@type": "ListItem", position: 4, name: "Macro Calculator", url: "https://gainframe.app/tools/macro-calculator/" },
    { "@type": "ListItem", position: 5, name: "FFMI Calculator", url: "https://gainframe.app/tools/ffmi-calculator/" },
    { "@type": "ListItem", position: 6, name: "1RM Calculator", url: "https://gainframe.app/tools/one-rep-max-calculator/" },
    { "@type": "ListItem", position: 7, name: "Calories Burned Calculator", url: "https://gainframe.app/tools/calories-burned-calculator/" },
    { "@type": "ListItem", position: 8, name: "Strength Standards Calculator", url: "https://gainframe.app/tools/strength-standards-calculator/" },
    { "@type": "ListItem", position: 9, name: "Calorie Deficit Calculator", url: "https://gainframe.app/tools/calorie-deficit-calculator/" },
    { "@type": "ListItem", position: 10, name: "Progress Photo Setup Tool", url: "https://gainframe.app/tools/progress-photo-setup/" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Are these fitness calculators really free?", acceptedAnswer: { "@type": "Answer", text: "Yes — all GainFrame fitness calculators are 100% free. No account, email, or signup is required." } },
    { "@type": "Question", name: "How accurate are online body fat calculators?", acceptedAnswer: { "@type": "Answer", text: "The U.S. Navy tape-measure method has been validated to within ±3–4% of DEXA for most people." } },
    { "@type": "Question", name: "What is TDEE and why does it matter?", acceptedAnswer: { "@type": "Answer", text: "TDEE is the total calories you burn per day. It's the foundation of every diet plan." } },
    { "@type": "Question", name: "How do I use a macro calculator to build muscle?", acceptedAnswer: { "@type": "Answer", text: "Set your goal to lean bulk — roughly 300 calories above TDEE — and the calculator sets your protein, fat, and carb targets." } },
    { "@type": "Question", name: "Can GainFrame track my progress beyond these calculators?", acceptedAnswer: { "@type": "Answer", text: "Yes. GainFrame is an iOS app that uses AI to analyze your progress photos and return body fat %, FFMI, muscle scores, and macros." } },
  ],
};

export default function ToolsPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
      />
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/tools-page.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="cl-body">
        <BlogNav />
        <ToolsInteractions />

        <section className="cl-hero">
          <div className="cl-hero-inner">
            <span className="cl-pill">
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" />
              </svg>
              Free · No signup required
            </span>
            <h1>
              Free Fitness
              <br />
              Calculators
            </h1>
            <p className="cl-hero-sub">
              Ten evidence-based tools for body composition, nutrition, and
              performance.
            </p>

            <div className="cl-search-wrap" id="cl-search-wrap">
              <span className="cl-search-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input
                type="text"
                id="cl-search"
                className="cl-search-input"
                placeholder="Find a calculator — try 'body fat' or 'macros'…"
                autoComplete="off"
                aria-label="Search calculators"
              />
              <span className="cl-search-kbd" id="cl-search-kbd">
                ⌘ K
              </span>
              <button
                type="button"
                className="cl-search-clear"
                id="cl-search-clear"
                aria-label="Clear search"
              >
                ×
              </button>
            </div>

            <div className="cl-search-meta">
              <span>
                <strong id="cl-count">10</strong>&nbsp;tools
              </span>
              <span className="dot">·</span>
              <span>Instant results</span>
              <span className="dot">·</span>
              <span>No signup</span>
            </div>
          </div>
        </section>

        <div className="cl-layout" id="tools">
          <nav className="cl-sidebar" aria-label="Tool categories">
            <p className="cl-sidebar-label">Categories</p>
            <a href="#body-composition" className="cl-nav-link cl-active">
              Body Composition <span className="cl-nav-count">3</span>
            </a>
            <a href="#nutrition" className="cl-nav-link">
              Nutrition &amp; Energy <span className="cl-nav-count">3</span>
            </a>
            <a href="#performance" className="cl-nav-link">
              Performance <span className="cl-nav-count">3</span>
            </a>
            <a href="#documentation" className="cl-nav-link">
              Documentation <span className="cl-nav-count">1</span>
            </a>
          </nav>

          <div>
            <section className="cl-section" id="body-composition">
              <div className="cl-section-header">
                <h2>Body Composition</h2>
                <span className="cl-count-badge">3 tools</span>
              </div>
              <div className="cl-grid cl-grid-2">
                <a
                  href="/tools/body-fat-visualizer/"
                  className="cl-card cl-card-featured"
                  data-search="body fat percentage each age visualizer atlas"
                >
                  <div className="cl-card-icon ic-viz">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="5" />
                      <path d="M3 21a9 9 0 0 1 18 0" />
                    </svg>
                  </div>
                  <div className="cl-featured-content">
                    <span className="cl-featured-tag">★ Featured</span>
                    <h3>Body Fat % at Each Age</h3>
                    <p className="cl-card-desc">
                      Drag two sliders to explore body fat percentages at every
                      age — male and female, 20s through 60s. A photorealistic
                      visual reference atlas, no guesswork.
                    </p>
                    <span className="cl-card-link">Open tool →</span>
                  </div>
                </a>

                <a
                  href="/tools/body-fat-estimator/"
                  className="cl-card"
                  data-search="body fat calculator navy tape measure"
                >
                  <div className="cl-card-icon ic-bf">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
                      <line x1="7" y1="7" x2="10" y2="7" />
                      <line x1="9" y1="10" x2="12" y2="10" />
                      <line x1="11" y1="13" x2="14" y2="13" />
                    </svg>
                  </div>
                  <h3>Body Fat Calculator</h3>
                  <p className="cl-card-desc">
                    U.S. Navy tape-measure method. Enter neck, waist, and hip
                    circumferences to get your body fat percentage and category.
                  </p>
                  <span className="cl-card-link">Open →</span>
                </a>

                <a
                  href="/tools/ffmi-calculator/"
                  className="cl-card"
                  data-search="ffmi fat free mass index lean physique kouri"
                >
                  <div className="cl-card-icon ic-ffmi">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6.5 6.5l11 11" />
                      <path d="M21 21l-1-1" />
                      <path d="M3 3l1 1" />
                      <path d="M18 22l4-4" />
                      <path d="M2 6l4-4" />
                    </svg>
                  </div>
                  <h3>FFMI Calculator</h3>
                  <p className="cl-card-desc">
                    Fat-Free Mass Index — how close your lean mass sits to the
                    natural ceiling (~25). Weight, height, body fat in;
                    physique tier out.
                  </p>
                  <span className="cl-card-link">Open →</span>
                </a>
              </div>
            </section>

            <section className="cl-section" id="nutrition">
              <div className="cl-section-header">
                <h2>Nutrition &amp; Energy</h2>
                <span className="cl-count-badge">3 tools</span>
              </div>
              <div className="cl-grid cl-grid-3">
                <a
                  href="/tools/tdee-calculator/"
                  className="cl-card"
                  data-search="tdee total daily energy expenditure calories maintenance mifflin"
                >
                  <div className="cl-card-icon ic-tdee">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22c-4.97 0-7-3.58-7-7 0-4 3.5-7.5 3.5-7.5S10 9 10 6c0-1.5-.5-3-2-4 2.5 0 5 2.04 5 5 0 1.5-.5 3-1.5 4 1.5-1 2.5-3 2.5-5 3.5 2 5 4.5 5 7 0 3.42-2.03 7-7 7z" />
                    </svg>
                  </div>
                  <h3>TDEE Calculator</h3>
                  <p className="cl-card-desc">
                    Total daily energy expenditure — the calorie foundation of
                    any diet. Mifflin-St Jeor formula with activity multiplier.
                  </p>
                  <span className="cl-card-link">Open →</span>
                </a>

                <a
                  href="/tools/macro-calculator/"
                  className="cl-card"
                  data-search="macro protein carbs fat nutrition cut bulk maintain"
                >
                  <div className="cl-card-icon ic-macro">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  </div>
                  <h3>Macro Calculator</h3>
                  <p className="cl-card-desc">
                    Protein, carb, and fat targets calibrated to your TDEE and
                    goal — cut, maintain, or bulk. Grams per day and per meal.
                  </p>
                  <span className="cl-card-link">Open →</span>
                </a>

                <a
                  href="/tools/calorie-deficit-calculator/"
                  className="cl-card"
                  data-search="calorie deficit cut weight loss timeline milestone"
                >
                  <div className="cl-card-icon ic-cdc">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  <h3>Calorie Deficit Calculator</h3>
                  <p className="cl-card-desc">
                    Daily calorie target, projected timeline, and milestone
                    dates. Works for cuts and lean bulks alike.
                  </p>
                  <span className="cl-card-link">Open →</span>
                </a>
              </div>
            </section>

            <section className="cl-section" id="performance">
              <div className="cl-section-header">
                <h2>Performance &amp; Output</h2>
                <span className="cl-count-badge">3 tools</span>
              </div>
              <div className="cl-grid cl-grid-3">
                <a
                  href="/tools/one-rep-max-calculator/"
                  className="cl-card"
                  data-search="1rm one rep max strength lifting epley brzycki"
                >
                  <div className="cl-card-icon ic-orm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="5.5" r="2.5" />
                      <path d="M6.5 6.5l11 11" />
                    </svg>
                  </div>
                  <h3>1RM Calculator</h3>
                  <p className="cl-card-desc">
                    One-rep max from six classical formulas, plus training
                    percentages for every rep range. Untrained to Elite tier.
                  </p>
                  <span className="cl-card-link">Open →</span>
                </a>

                <a
                  href="/tools/strength-standards-calculator/"
                  className="cl-card"
                  data-search="strength standards percentile compound lifts bench squat deadlift untrained elite"
                >
                  <div className="cl-card-icon ic-ssc">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21V10M10 21V4M17 21v-8M2 21h20" />
                    </svg>
                  </div>
                  <h3>Strength Standards</h3>
                  <p className="cl-card-desc">
                    Eight compound lifts benchmarked Untrained → Elite. Get
                    your percentile rank and the weight that unlocks the next
                    tier.
                  </p>
                  <span className="cl-card-link">Open →</span>
                </a>

                <a
                  href="/tools/calories-burned-calculator/"
                  className="cl-card"
                  data-search="calories burned activity exercise met walking running cycling"
                >
                  <div className="cl-card-icon ic-cbc">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                  </div>
                  <h3>Calories Burned</h3>
                  <p className="cl-card-desc">
                    Search 240+ activities. Enter weight and duration; get
                    calories burned with food-equivalent comparisons.
                  </p>
                  <span className="cl-card-link">Open →</span>
                </a>
              </div>
            </section>

            <section className="cl-section" id="documentation">
              <div className="cl-section-header">
                <h2>Documentation</h2>
                <span className="cl-count-badge">1 tool</span>
              </div>
              <div className="cl-grid cl-grid-1">
                <a
                  href="/tools/progress-photo-setup/"
                  className="cl-card cl-card-wide"
                  data-search="progress photo setup lighting framing pose documentation"
                >
                  <div className="cl-card-icon ic-pp">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>
                  <div className="cl-card-wide-content">
                    <h3>Progress Photo Setup Tool</h3>
                    <p className="cl-card-desc">
                      Build your perfect progress photo routine in five steps —
                      personalized lighting, framing, and pose guidance with a
                      score for your current setup.
                    </p>
                    <span className="cl-card-link">Open →</span>
                  </div>
                </a>
              </div>
            </section>
          </div>
        </div>

        <section className="cl-faq">
          <div className="cl-faq-inner">
            <div className="cl-faq-head">
              <h2>
                Frequently
                <br />
                asked
                <br />
                questions
              </h2>
              <p className="cl-faq-sub">
                Common questions about the math, the methods, and what lies
                beyond the calculator.
              </p>
            </div>
            <div className="cl-faq-list">
              {[
                {
                  q: "Are these fitness calculators really free?",
                  a: "Yes — every calculator is 100% free. No account, no email, no signup. Enter your measurements, get your result instantly. The GainFrame iOS app extends this with AI-powered photo analysis and ongoing tracking.",
                  open: true,
                },
                {
                  q: "How accurate are online body fat calculators?",
                  a: "The U.S. Navy tape-measure method has been validated to within ±3–4% of DEXA for most people — one of the most reliable self-assessment tools available. GainFrame's AI photo analysis can provide a more precise estimate from a single image.",
                },
                {
                  q: "What is TDEE and why does it matter?",
                  a: "TDEE — Total Daily Energy Expenditure — is the total calories you burn per day, rest plus activity. It's the foundation of every diet: eat under it to lose fat, at it to maintain, above it to build muscle.",
                },
                {
                  q: "How do I use a macro calculator to build muscle?",
                  a: "Set the goal to lean bulk — roughly 300 calories above TDEE. The calculator prioritizes protein (~0.8g per lb of bodyweight), caps fat at ~25% of calories, and fills the remainder with carbs. Pair with progressive resistance training.",
                },
                {
                  q: "Can GainFrame track progress beyond these calculators?",
                  a: "Yes. GainFrame is an iOS app that analyzes your progress photos with AI and returns body fat %, FFMI, twelve muscle scores, and macro recommendations — from a single photo, in under a minute.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`cl-faq-item${item.open ? " open" : ""}`}
                >
                  <button className="cl-faq-q">
                    {item.q}
                    <span className="cl-faq-toggle">+</span>
                  </button>
                  <div className="cl-faq-a">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cl-cta">
          <div className="cl-cta-inner">
            <div>
              <div className="cl-cta-eyebrow">Beyond the calculator</div>
              <h2>
                One photo.
                <br />A complete body
                <br />
                composition report.
              </h2>
              <p className="cl-cta-sub">
                GainFrame&rsquo;s AI analyzes your progress photos and returns
                body fat %, FFMI, twelve muscle scores, and custom macros — in
                under 60 seconds.
              </p>
            </div>
            <div className="cl-cta-aside">
              <div className="cl-cta-data">
                iOS · iPhone
                <br />
                ~60 sec to result
                <br />
                ±2–4% vs DEXA
                <br />
                Free to start
              </div>
              <a
                href={SITE.appStoreUrl}
                target="_blank"
                rel="noopener"
                className="cl-cta-badge"
              >
                <img
                  src="https://developer.apple.com/news/images/download-on-the-app-store-badge.png"
                  alt="Download on the App Store"
                />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
