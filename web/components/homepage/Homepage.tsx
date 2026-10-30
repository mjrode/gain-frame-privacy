import type { ImgHTMLAttributes } from "react";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import DownloadQr from "@/components/DownloadQr";
import { ANALYSIS_APP_STORE_PAGE } from "@/lib/site";
import HomepageMotion from "./HomepageMotion";
import styles from "./Homepage.module.css";

const cx = (...names: string[]) => names.map((name) => styles[name]).join(" ");

// Optimized, unretouched assets selected for the approved A1 page.
const imageDimensions = {
  "compare": [800, 1734],
  "photo-library": [800, 1734],
  "deep-dive": [800, 1734],
  "coach": [800, 1734],
  "nutrition": [800, 1734],
  "precision": [800, 1734],
  "future-you": [800, 1734],
  "rewind": [800, 1734],
  "leaderboard": [800, 1734],
  "gary-progress": [400, 449],
  "gary-coach": [400, 486],
  "guide-photos": [640, 640],
  "guide-progress": [640, 640],
  "guide-phase": [800, 597],
  "michael-rode": [388, 388],
  "logo": [192, 191]
} as const;

type ImageAssetProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  name: keyof typeof imageDimensions;
  eager?: boolean;
};

function ImageAsset({ name, eager = false, alt, ...props }: ImageAssetProps) {
  const [width, height] = imageDimensions[name];
  return (
    <img
      {...props}
      src={`/assets/homepage-a1/${name}.webp`}
      width={width}
      height={height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

export default function Homepage() {
  return (
    <div className={cx("homepage")} id="gainframe-homepage">
      <a className={cx("skip-link")} href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content">
        <Hero />
        <Reviews />
        <Photos />
        <DeepDive />
        <Coach />
        <DownloadBridge />
        <Nutrition />
        <MoreFeatures />
        <Tools />
        <Guides />
        <Founder />
        <Questions />
        <Closing />
      </main>
      <Footer />
      <HomepageMotion />
    </div>
  );
}

function Header() {
  return (
    <header className={cx("site-header")}>
      <a className={cx("brand")} href="#start">
        <ImageAsset eager name="logo" alt="" />
        GainFrame
      </a>
      <nav aria-label="Main">
        <a href="#photos">The app</a>
        <a href="#nutrition">Nutrition</a>
        <a href="#more">More to explore</a>
      </nav>
      <PlatformDownloadLink className={cx("button", "small")} source="landing_v2" campaign="web-home-nav" content="floating_nav_download" androidLabel="Try web tools">
        Get GainFrame
        <span aria-hidden="true">↗</span>
      </PlatformDownloadLink>
      <details className={cx("mobile-menu")}>
        <summary>Menu</summary>
        <nav className={cx("mobile-nav")} aria-label="Mobile">
          <a href="#photos">The app</a>
          <a href="#nutrition">Nutrition</a>
          <a href="#more">More to explore</a>
          <a href="#tools">Tools &amp; guides</a>
          <a href="#about">Our story</a>
        </nav>
      </details>
    </header>
  );
}

function Hero() {
  return (
    <section className={cx("hero")} id="start">
      <div className={cx("intro")} data-intro="copy">
        <h1>
          Track your physique.
          <br />{" "}
          See what’s changing.
        </h1>
        <p>Organize your progress photos, understand changes with AI, and ask Coach what to focus on next.</p>
        <PlatformDownloadLink className={cx("button")} customProductPageId={ANALYSIS_APP_STORE_PAGE.id} source="landing_v2" campaign="web-home-hero" content="hero_download">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M17.05 12.54c.02 3.06 2.69 4.08 2.72 4.1-.02.07-.43 1.46-1.41 2.89-.85 1.24-1.73 2.48-3.12 2.51-1.37.03-1.81-.81-3.38-.81-1.56 0-2.05.78-3.35.84-1.34.05-2.36-1.34-3.21-2.57-1.74-2.51-3.07-7.1-1.28-10.2a4.98 4.98 0 0 1 4.21-2.55c1.32-.02 2.56.89 3.36.89.8 0 2.3-1.1 3.87-.94.66.03 2.51.27 3.7 2.02-.1.06-2.2 1.28-2.11 3.82ZM14.5 5.02c.7-.85 1.17-2.03 1.04-3.2-1.01.04-2.23.67-2.95 1.51-.65.75-1.22 1.96-1.07 3.11 1.13.09 2.28-.57 2.98-1.42Z"></path>
          </svg>
          Download for iPhone
        </PlatformDownloadLink>
        <span className={cx("caption")}>Start with the photos you already have.</span>
        <a className={cx("hero-rating")} href="#reviews">
          <span aria-hidden="true">★</span>
          4.9 on the US App Store
          <span aria-hidden="true">·</span>
          71 ratings
        </a>
      </div>
      <div className={cx("product-scene")} aria-label="GainFrame app screenshots">
        <div className={cx("phone", "wing", "wing-left")} data-intro="left">
          <ImageAsset eager name="deep-dive" alt="Deep Dive compares two check-ins and explains the changes in physique" />
        </div>
        <div className={cx("phone", "wing", "wing-right")} data-intro="right">
          <ImageAsset eager name="coach" alt="Coach answers a question about workout and photo check-in consistency" />
        </div>
        <div className={cx("phone", "lead")} data-intro="lead">
          <ImageAsset eager name="compare" alt="GainFrame comparing two progress photos" fetchPriority="high" />
        </div>
      </div>
      <nav className={cx("story-path")} aria-label="Follow one progress story">
        <a href="#photos">
          <span>01</span>
          See the change
        </a>
        <span aria-hidden="true">→</span>
        <a href="#deep-dive">
          <span>02</span>
          Understand it
        </a>
        <span aria-hidden="true">→</span>
        <a href="#coach">
          <span>03</span>
          Find your next step
        </a>
      </nav>
    </section>
  );
}

// US App Store rating and verbatim reviews verified October 29, 2026.
// Source and review IDs: docs/homepage-a1-assets.md.

function Reviews() {
  return (
    <section className={cx("reviews-strip", "wrap")} id="reviews" aria-labelledby="reviews-heading">
      <div className={cx("reviews-summary")}>
        <h2 id="reviews-heading">Selected App Store reviews</h2>
        <a className={cx("rating-value")} href="https://apps.apple.com/us/app/gainframe-gym-progress-photos/id6759252082?uo=4" aria-label="4.9 out of 5 from 71 US App Store ratings" data-app-store-intent="reviews" target="_blank" rel="noopener noreferrer">
          <strong>4.9</strong>
          <span>
            <span className={cx("review-stars")} aria-hidden="true">★★★★★</span>
            <span>71 ratings · US App Store</span>
          </span>
        </a>
      </div>
      <figure className={cx("review-quote")}>
        <blockquote>“it really makes u see change.”</blockquote>
        <figcaption>
          <span>@joe0liva</span>
          <span>October 1, 2026 · 5 stars</span>
        </figcaption>
      </figure>
      <figure className={cx("review-quote")}>
        <blockquote>“Keeping me accountable and great for seeing progress in real time”</blockquote>
        <figcaption>
          <span>Hav9785</span>
          <span>September 6, 2026 · 5 stars</span>
        </figcaption>
      </figure>
      <a className={cx("review-source")} href="https://apps.apple.com/us/app/gainframe-gym-progress-photos/id6759252082?uo=4" data-app-store-intent="reviews" target="_blank" rel="noopener noreferrer">
        Read reviews on the App Store
        <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}

function Photos() {
  return (
    <section className={cx("chapter", "chapter-photos", "wrap")} id="photos">
      <div className={cx("chapter-copy")} data-reveal="">
        <p className={cx("chapter-label")}>01 / See the change</p>
        <h2>
          Compare your photos.
          <br />{" "}
          See your progress.
        </h2>
        <p>Start with the photos you already have. Here, two front-pose check-ins reveal a change that’s easier to see side by side. Next, Deep Dive helps explain it.</p>
        <div className={cx("story-moment")}>
          <span>The comparison shown</span>
          <strong>
            November 2023
            <span aria-hidden="true">→</span>
            June 2025
          </strong>
          <p>Same pose. Two moments in one photo history.</p>
        </div>
        <div className={cx("chapter-facts")}>
          <span>Smart Import</span>
          <span>Same-pose comparisons</span>
          <span>Your photo timeline</span>
        </div>
        <a className={cx("text-link")} href="#deep-dive">
          See what Deep Dive finds
          <span aria-hidden="true">↓</span>
        </a>
        <ImageAsset className={cx("gary-accent", "gary-progress")} name="gary-progress" alt="" aria-hidden="true" data-gary="" />
      </div>
      <div className={cx("photo-story-visual")} data-reveal="">
        <div className={cx("history-mini")}>
          <ImageAsset name="photo-library" alt="GainFrame photo library with pose timelines and monthly albums" />
        </div>
        <div className={cx("phone", "photo-story-phone")}>
          <ImageAsset name="compare" alt="Two same-pose check-ins compared side by side in GainFrame" />
        </div>
      </div>
    </section>
  );
}

function DeepDive() {
  return (
    <section className={cx("chapter-group", "wrap")} id="deep-dive">
      <div className={cx("chapter", "chapter-reverse")}>
        <div className={cx("product-visual")} data-reveal="">
          <div className={cx("phone", "chapter-phone")}>
            <ImageAsset name="deep-dive" alt="A Deep Dive report showing an observation, estimated body composition, and an area to focus on" />
          </div>
        </div>
        <div className={cx("chapter-copy")} data-reveal="">
          <p className={cx("chapter-label")}>02 / Understand it · Deep Dive</p>
          <h2>
            AI analysis of
            <br />{" "}
            your physique changes.
          </h2>
          <p>Deep Dive analyzes the same two check-ins, highlighting visible changes, estimated body composition, and areas to focus on.</p>
          <figure className={cx("story-insight")}>
            <figcaption>From this Deep Dive</figcaption>
            <blockquote>“You’re leaning out without giving up your shape.”</blockquote>
            <p>The report identifies abs as the clearest change.</p>
            <span className={cx("evidence-note")}>AI observation from the comparison shown.</span>
          </figure>
          <a className={cx("text-link")} href="#coach">
            Bring your next question to Coach
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <div className={cx("precision-note")} data-reveal="">
        <div className={cx("phone", "precision-phone")}>
          <ImageAsset name="precision" alt="Precision Body Fat result with front and side photos and an estimated body-fat percentage" />
        </div>
        <div>
          <p className={cx("chapter-label")}>Precision Body Fat</p>
          <h3>Estimate body fat from two angles.</h3>
          <p>Combine front and side photos for a body-fat estimate, then follow the trend alongside your check-ins.</p>
          <span className={cx("small-print")}>AI estimates are not medical measurements.</span>
        </div>
      </div>
    </section>
  );
}

function Coach() {
  return (
    <section className={cx("chapter-group", "wrap")} id="coach">
      <div className={cx("chapter")}>
        <div className={cx("chapter-copy")} data-reveal="">
          <p className={cx("chapter-label")}>03 / Find your next step · Coach</p>
          <h2>
            Get coaching based
            <br />{" "}
            on your progress.
          </h2>
          <p>Seeing a change is the start. Ask Coach about the habits behind your progress, using your check-ins and available connected data.</p>
          <div className={cx("coach-examples", "connected-coach")}>
            <span>A recent question from the same photo history</span>
            <p className={cx("story-question")}>“Have I been consistent recently?”</p>
            <div className={cx("coach-finding")}>
              <strong>Training is consistent.</strong>
              <p>Coach found workouts on 13 of the last 14 days, with photo check-ins less regular.</p>
            </div>
            <p className={cx("story-followup")}>A useful follow-up: “How can I make my check-ins more consistent?”</p>
            <span className={cx("evidence-note")}>The answer shown uses recent activity. The follow-up is a suggested question.</span>
          </div>
          <a className={cx("text-link")} href="#get-app">
            Start your own progress story
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className={cx("product-visual", "coach-visual")} data-reveal="">
          <div className={cx("phone", "chapter-phone")}>
            <ImageAsset name="coach" alt="Coach answers “Have I been consistent recently?” using recorded workouts and check-ins" />
          </div>
          <ImageAsset className={cx("gary-accent", "gary-coach")} name="gary-coach" alt="" aria-hidden="true" data-gary="" />
        </div>
      </div>
      <div className={cx("next-step-grid")} data-reveal="">
        <article>
          <p className={cx("chapter-label")}>Goal Plans</p>
          <h3>Set a goal. Track your next 12 weeks.</h3>
          <p>Choose a goal and a 12-week checkpoint. Use comparable check-ins to follow how your physique changes along the way.</p>
        </article>
        <article>
          <p className={cx("chapter-label")}>Weekly review</p>
          <h3>Review your week. Choose your next focus.</h3>
          <p>Review your recorded progress, reflect on the week, and choose what to focus on next.</p>
        </article>
      </div>
    </section>
  );
}

function DownloadBridge() {
  return (
    <section className={cx("download-bridge", "wrap")} id="get-app" aria-labelledby="bridge-heading">
      <div className={cx("download-copy")} data-reveal="">
        <p className={cx("chapter-label")}>Your turn</p>
        <h2 id="bridge-heading">
          Start with the photos
          <br />{" "}
          you already have.
        </h2>
        <p>Bring in a check-in, compare your progress, and ask Coach what to focus on next.</p>
        <PlatformDownloadLink className={cx("button")} source="landing_v2" campaign="web-home-story" content="story_download">
          Download for iPhone
          <span aria-hidden="true">↗</span>
        </PlatformDownloadLink>
        <a className={cx("bridge-privacy")} href="#questions">
          Your photo history stays on your device.
          <span>How AI analysis works ↗</span>
        </a>
      </div>
      <div className={cx("download-qr-slot")}>
        <DownloadQr
          className={cx("download-qr")}
          source="landing_v2"
          content="story_download_qr"
          campaign="web-home-story-qr"
          label="Scan with your iPhone camera"
          backgroundColor="#ffffff"
          foregroundColor="#202124"
        />
      </div>
    </section>
  );
}

function Nutrition() {
  return (
    <section className={cx("nutrition-story")} id="nutrition">
      <div className={cx("wrap", "chapter", "chapter-reverse")}>
        <div className={cx("nutrition-visual")} data-reveal="">
          <div className={cx("phone", "chapter-phone")}>
            <ImageAsset name="nutrition" alt="GainFrame nutrition diary with calories, macros, and logged food" />
          </div>
        </div>
        <div className={cx("chapter-copy")} data-reveal="">
          <p className={cx("chapter-label")}>Your nutrition tracker</p>
          <h2>
            Log your meals.
            <br />{" "}
            Track calories and macros.
          </h2>
          <p>Keep a food diary and follow calories, protein, carbs, and fat against your targets. Search foods, scan a barcode, or log with a photo.</p>
          <div className={cx("nutrition-methods")}>
            <span>Food search</span>
            <span>Barcode scan</span>
            <span>Photo logging</span>
            <span>Saved meals</span>
          </div>
          <p className={cx("context-caption")}>Keep weight, workouts, and available recovery data in the picture, too.</p>
          <div className={cx("connection-names")}>
            Apple Health
            <span>·</span>
            Hevy
            <span>·</span>
            Strava
          </div>
          <a className={cx("text-link")} href="/features/#daily">
            Explore daily tracking
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function MoreFeatures() {
  return (
    <section className={cx("more-features")} id="more" aria-labelledby="more-heading">
      <div className={cx("wrap")}>
        <header className={cx("more-intro")}>
          <h2 id="more-heading">
            More ways to track
            <br />{" "}
            and share your progress.
          </h2>
          <p>Visualize a goal, replay your photo history, and share the changes you want to celebrate.</p>
        </header>
        <div className={cx("more-grid")}>
          <article className={cx("more-feature", "more-future")} aria-labelledby="future-heading" data-reveal="">
            <figure className={cx("more-stage", "more-future-stage")}>
              <div className={cx("more-future-crop")}>
                <ImageAsset name="future-you" alt="Future You app example showing a current physique beside an AI-generated illustration of a possible future physique." />
              </div>
              <figcaption>AI illustration · Future You example from the app</figcaption>
            </figure>
            <div className={cx("more-copy")}>
              <span className={cx("more-eyebrow")}>Future You</span>
              <h3 id="future-heading">Visualize the physique you’re working toward.</h3>
              <p>Create an AI illustration of your goal to explore what you’re aiming for.</p>
              <p className={cx("more-fine-print")}>Illustrative AI projection, not a prediction.</p>
              <a className={cx("more-link")} href="/features/">
                Explore Future You
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
          <article className={cx("more-feature", "more-rewind")} aria-labelledby="rewind-heading" data-reveal="">
            <figure className={cx("more-stage", "more-rewind-stage")}>
              <div className={cx("more-rewind-phone")}>
                <ImageAsset name="rewind" alt="Rewind showing the same pose across six months, one year, and two years" />
              </div>
              <figcaption>Every check-in is part of your story.</figcaption>
            </figure>
            <div className={cx("more-copy")}>
              <span className={cx("more-eyebrow")}>Rewind</span>
              <h3 id="rewind-heading">Replay your progress, check-in by check-in.</h3>
              <p>Replay your photos in the same pose. Scrub through past check-ins and open the moments that show how far you’ve come.</p>
              <a className={cx("more-link")} href="/features/">
                Explore Rewind
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
          <article className={cx("more-feature", "more-collage")} aria-labelledby="collage-heading" data-reveal="">
            <figure className={cx("more-stage", "more-collage-stage")} aria-labelledby="collage-illustration-caption">
              <div className={cx("more-layouts")} aria-hidden="true">
                <div className={cx("more-layout", "more-layout-two")}>
                  <i></i>
                  <i></i>
                </div>
                <div className={cx("more-layout", "more-layout-three")}>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className={cx("more-layout", "more-layout-four")}>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
              </div>
              <figcaption id="collage-illustration-caption">Two, three, or four photos · Layout illustration</figcaption>
            </figure>
            <div className={cx("more-copy")}>
              <span className={cx("more-eyebrow")}>Photo collages</span>
              <h3 id="collage-heading">Turn progress photos into shareable collages.</h3>
              <p>Bring 2–4 progress photos into one image. Choose a layout, add dates or weight if you like, then save or share your collage.</p>
              <a className={cx("more-link")} href="/features/">
                Explore photo collages
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
          <article className={cx("more-feature", "more-community")} aria-labelledby="community-heading" data-reveal="">
            <figure className={cx("more-stage", "more-community-stage")}>
              <div className={cx("more-community-phone")}>
                <ImageAsset name="leaderboard" alt="GainFrame October leaderboard showing members, photos, ranks, and GainScores." />
              </div>
              <figcaption>Leaderboard · Example from the app</figcaption>
            </figure>
            <div className={cx("more-copy")}>
              <span className={cx("more-eyebrow")}>Leaderboard</span>
              <h3 id="community-heading">See how you rank. Share your progress.</h3>
              <p>Explore the rankings and share a progress photo when you’re ready. Taking part is optional. You choose what becomes public.</p>
              <a className={cx("more-link")} href="/features/">
                Explore the leaderboard
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Tools() {
  return (
    <section className={cx("tool-section", "wrap")} id="tools">
      <div className={cx("section-intro")} data-reveal="">
        <div>
          <p className={cx("section-label")}>Start here, too</p>
          <h2>
            Try a progress tool
            <br />{" "}
            in your browser.
          </h2>
        </div>
        <p>
          Try a focused tool in your browser.
          <br />{" "}
          Keep the full story going in GainFrame.
        </p>
      </div>
      <div className={cx("tool-grid")}>
        <a className={cx("tool-card")} href="/tools/progress-photo-compare/" data-reveal="">
            <h3>Compare two photos.</h3>
          <p>Align, overlay, and export a pair of check-ins. Your photos stay in your browser.</p>
          <span className={cx("tool-action")}>
            Try photo compare
            <span>↗</span>
          </span>
        </a>
        <a className={cx("tool-card")} href="/tools/recomp-reality-checker/" data-reveal="">
            <h3>Read your recomp trend.</h3>
          <p>Bring weight, waist, and strength signals together for a more considered look.</p>
          <span className={cx("tool-action")}>
            Check your trend
            <span>↗</span>
          </span>
        </a>
        <a className={cx("tool-card")} href="/tools/progress-photo-setup/" data-reveal="">
            <h3>Set up a better check-in.</h3>
          <p>Find repeatable lighting, framing, and poses before your next progress photo.</p>
          <span className={cx("tool-action")}>
            Plan your setup
            <span>↗</span>
          </span>
        </a>
      </div>
      <a className={cx("all-tools")} href="/tools/">
        Explore all free tools
        <span>↗</span>
      </a>
    </section>
  );
}

function Guides() {
  return (
    <section className={cx("journal-section", "wrap")} id="guides">
      <div className={cx("section-intro")} data-reveal="">
        <h2>
          Make your next
          <br />{" "}
          check-in count.
        </h2>
        <a className={cx("text-link")} href="/blog/">
          Explore the guides
          <span>↗</span>
        </a>
      </div>
      <div className={cx("journal-grid")}>
        <a className={cx("journal-card")} href="/blog/take-progress-photos-by-yourself/" data-reveal="">
          <div className={cx("journal-cover")}>
            <ImageAsset name="guide-photos" alt="Illustration of repeatable progress photos" />
          </div>
          <p className={cx("article-topic")}>The setup</p>
          <h3>How to take progress photos by yourself.</h3>
          <p>Lighting, poses, and a setup you can repeat.</p>
          <span>Read the guide ↗</span>
        </a>
        <a className={cx("journal-card")} href="/blog/how-to-track-muscle-gain-progress/" data-reveal="">
          <div className={cx("journal-cover")}>
            <ImageAsset name="guide-progress" alt="Illustration of reviewing progress over time" />
          </div>
          <p className={cx("article-topic")}>The bigger picture</p>
          <h3>Track muscle gain beyond the scale.</h3>
          <p>Look at photos, lifts, and measurements together.</p>
          <span>Read the guide ↗</span>
        </a>
        <a className={cx("journal-card")} href="/blog/bulk-cut-or-recomp/" data-reveal="">
          <div className={cx("journal-cover")}>
            <ImageAsset name="guide-phase" alt="Illustration for choosing a training phase" />
          </div>
          <p className={cx("article-topic")}>The next step</p>
          <h3>
            Bulk, cut, or recomp?
            <br />{" "}
            Start with your goal.
          </h3>
          <p>A practical guide to choosing your next phase.</p>
          <span>Read the guide ↗</span>
        </a>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className={cx("founder", "wrap")} id="about">
      <div className={cx("founder-inner")} data-reveal="">
        <ImageAsset className={cx("founder-portrait")} name="michael-rode" alt="Michael Rode, creator of GainFrame" />
        <div className={cx("founder-copy")}>
          <h2>
            Built for the progress
            <br />{" "}
            that’s easy to miss.
          </h2>
          <p>Michael built GainFrame after years of progress photos sat in his camera roll without useful feedback. The idea was simple: bring those photos together and make the changes easier to understand.</p>
          <a className={cx("text-link")} href="/about/">
            Read Michael’s story
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Questions() {
  return (
    <section className={cx("questions", "wrap")} id="questions" data-reveal="">
      <div>
        <h2>
          Your photos.
          <br />{" "}
          Your choice.
        </h2>
        <p>Your photo history stays on your device. Selected photos are sent for AI analysis. Public sharing is optional.</p>
        <a className={cx("text-link")} href="/privacy/">
          Read about privacy
          <span>↗</span>
        </a>
      </div>
      <div className={cx("faq")}>
        <details>
          <summary>Can I start with photos I already have?</summary>
          <p>Yes. Smart Import organizes existing gym photos by pose and builds your progress timeline.</p>
        </details>
        <details>
          <summary>What does the body fat number mean?</summary>
          <p>It is an AI estimate, not a medical measurement or a replacement for a DEXA scan. Consistent photos help you follow the trend over time.</p>
        </details>
        <details>
          <summary>What can Coach use?</summary>
          <p>Coach can use your check-ins, body metrics, nutrition and connected health or workout information when available.</p>
        </details>
        <details>
          <summary>How are my photos handled?</summary>
          <p>
            Your photo history stays on your device. Photos selected for AI analysis are sent for processing. Public leaderboard sharing is optional.{" "}
            <a href="/privacy/">Read the privacy policy.</a>
          </p>
        </details>
        <details>
          <summary>Is Future You a prediction?</summary>
          <p>No. Future You creates an illustrative AI view of a goal. It does not predict or guarantee an outcome.</p>
        </details>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className={cx("closing", "wrap")} id="download" data-reveal="">
      <ImageAsset name="logo" alt="" />
      <h2>
        You put in the work.
        <br />{" "}
        Now see the progress.
      </h2>
      <PlatformDownloadLink className={cx("button")} source="landing_v2" campaign="web-home-closing" content="closing_download">
        Get GainFrame
        <span>↗</span>
      </PlatformDownloadLink>
      <p>Made for iPhone. Built for your progress.</p>
    </section>
  );
}

function Footer() {
  return (
    <footer className={cx("wrap")}>
      <a className={cx("brand")} href="#start">
        <ImageAsset name="logo" alt="" />
        GainFrame
      </a>
      <nav aria-label="Footer">
        <a href="/features/">Features</a>
        <a href="/tools/">Tools</a>
        <a href="/comics/">Comics</a>
        <a href="/about/">About</a>
        <a href="/blog/">Journal</a>
        <a href="/privacy/">Privacy</a>
        <a href="mailto:michaelrode44@gmail.com">Support</a>
      </nav>
      <small>© 2026 GainFrame</small>
    </footer>
  );
}
