import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { SITE } from "@/lib/site";
import HeroFilm from "./HeroFilm";
import styles from "./page.module.css";

const anton = localFont({
  src: "../../public/assets/gainframe-guy/illustrations/fonts/Anton-Regular.ttf",
  variable: "--font-lab-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Progress photos that explain what changed",
  description:
    "GainFrame turns progress photos into body-composition trends, muscle comparisons, and private Coach conversations about what changed.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type AppStoreCtaProps = {
  className: string;
  content: string;
  children: React.ReactNode;
};

function AppStoreCta({ className, content, children }: AppStoreCtaProps) {
  return (
    <a
      className={className}
      href={SITE.appStoreUrl}
      target="_blank"
      rel="noopener"
      data-cta-source="landing_v2"
      data-cta-content={content}
    >
      <svg
        className={styles.appleMark}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.18-.07 2.04.66 2.75.72 1.05-.21 2.05-.81 3.17-.73 1.34.11 2.35.64 3.02 1.6-2.76 1.66-2.1 5.29.43 6.31-.5 1.32-1.15 2.63-2.37 4.07ZM12.03 7.25C11.88 5.28 13.5 3.65 15.34 3.5c.25 2.28-2.07 3.98-3.31 3.75Z" />
      </svg>
      {children}
    </a>
  );
}

function LabLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className={styles.labLabel}>
      <span>{index}</span>
      <span>{children}</span>
    </div>
  );
}

export default function LandingV2() {
  return (
    <div className={`${styles.page} ${anton.variable}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <header className={styles.navShell}>
        <nav className={styles.nav} aria-label="Landing page navigation">
          <Link className={styles.brand} href="/" aria-label="GainFrame home">
            <Image
              src="/assets/gainframe-guy/illustrations/gary-badge.webp"
              width={1024}
              height={1024}
              sizes="36px"
              alt=""
              aria-hidden="true"
            />
            <span>GainFrame</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#scan">Scan</a>
            <a href="#history">History</a>
            <a href="#coach">Coach</a>
            <span className={styles.navDivider} aria-hidden="true" />
            <Link href="/blog/">Blog</Link>
            <Link href="/comics/">Comics</Link>
            <Link href="/about/">About</Link>
          </div>
          <AppStoreCta className={styles.navCta} content="floating_nav_download">
            Get the app
          </AppStoreCta>
          <details className={styles.mobileMenu}>
            <summary>
              <span>Menu</span>
              <i className={styles.menuGlyph} aria-hidden="true" />
            </summary>
            <div className={styles.mobileMenuPanel}>
              <p>On this page</p>
              <div>
                <a href="#scan"><span>01</span> Scan</a>
                <a href="#history"><span>02</span> History</a>
                <a href="#coach"><span>03</span> Coach</a>
              </div>
              <p>Explore</p>
              <div>
                <Link href="/blog/"><span>A</span> Blog</Link>
                <Link href="/comics/"><span>B</span> Comics</Link>
                <Link href="/about/"><span>C</span> About</Link>
              </div>
            </div>
          </details>
        </nav>
      </header>

      <main id="main-content">
        <section className={styles.hero}>
          <div className={styles.gridTexture} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <span>Physique intelligence</span>
              <span>iPhone · private by design</span>
            </p>
            <h1>Progress photos that explain what changed.</h1>
            <p className={styles.heroLead}>
              Pair a gym selfie with weight, estimated body fat, and training
              context—then see whether you&apos;re gaining muscle, losing fat,
              or just moving the scale.
            </p>
            <div className={styles.heroActions}>
              <AppStoreCta className={styles.primaryCta} content="hero_download">
                Download free
              </AppStoreCta>
              <a
                className={styles.textCta}
                href="#film"
                data-landing-v2-film-sound
              >
                Watch the 38-second film
              </a>
            </div>
            <p className={styles.heroNote}>Built for consistent weekly check-ins on iPhone.</p>
          </div>

          <HeroFilm />
        </section>

        <div className={styles.ticker} aria-label="GainFrame capabilities">
          <div>
            <span>Body fat trend</span><i>✦</i>
            <span>12 muscle groups</span><i>✦</i>
            <span>Smart Import</span><i>✦</i>
            <span>Private Coach</span><i>✦</i>
            <span>Before / after</span><i>✦</i>
            <span>Future You</span><i>✦</i>
          </div>
        </div>

        <section className={`${styles.chapter} ${styles.scanChapter}`} id="scan">
          <div className={styles.chapterCopy}>
            <LabLabel index="01">Photo analysis / body composition</LabLabel>
            <h2>Turn one check-in into a full physique readout.</h2>
            <p>
              Start with one photo for a quick scan, or add multiple angles for
              a more precise estimate. GainFrame maps body fat, FFMI, lean mass,
              and muscle-group scores into one report.
            </p>
            <ul className={styles.readoutList} aria-label="Scan report outputs">
              <li><span>01</span> Estimated body fat</li>
              <li><span>02</span> FFMI + lean mass</li>
              <li><span>03</span> 12 muscle groups</li>
            </ul>
          </div>
          <div className={styles.scanStage}>
            <div className={styles.scanLine} aria-hidden="true" />
            <Image
              className={styles.scanPhone}
              src="/app-screenshots/1.21/muscle-map.webp"
              width={1320}
              height={2868}
              sizes="(max-width: 740px) 74vw, 390px"
              alt="GainFrame muscle analysis comparing before and after muscle maps and a muscle comparison chart."
            />
            <div className={styles.scanAnnotation}>
              <span>Analysis field</span>
              <strong>Before → after</strong>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.compareChapter}`} id="compare">
          <div className={styles.compareArtwork}>
            <div className={styles.comparePhone}>
              <Image
                src="/app-screenshots/1.21/compare.webp"
                width={1320}
                height={2868}
                sizes="(max-width: 740px) 78vw, 410px"
                alt="GainFrame Compare with aligned progress photos, smart filters, score, and estimated body fat."
              />
            </div>
            <span className={styles.photoNote}>Auto-align / filter / blur</span>
          </div>
          <div className={styles.chapterCopy}>
            <LabLabel index="02">Compare / see the difference</LabLabel>
            <h2>Make the change impossible to miss.</h2>
            <p>
              Line up any two photos, choose the same pose, and use smart
              filters to reduce the visual noise. Then open a Deep Dive to see
              what moved and what to focus on next.
            </p>
            <div className={styles.compareStats}>
              <div><strong>A/B</strong><span>side by side</span></div>
              <div><strong>Δ BF</strong><span>trend context</span></div>
              <div><strong>Deep</strong><span>dive report</span></div>
            </div>
          </div>
        </section>

        <section className={`${styles.chapter} ${styles.coachChapter}`} id="coach">
          <div className={styles.chapterCopy}>
            <LabLabel index="03">Coach / grounded context</LabLabel>
            <h2>Ask what changed. Get an answer tied to your data.</h2>
            <p>
              Coach can use check-ins, body metrics, Apple Health, workouts,
              cardio, and nutrition when those sources are available—so the
              explanation starts with your trend, not a blank chat box.
            </p>
            <div className={styles.promptStack} aria-label="Example Coach questions">
              <span>Why did my score drop?</span>
              <span>How am I trending overall?</span>
              <span>What should I focus on next?</span>
            </div>
          </div>
          <div className={styles.coachStage}>
            <span className={styles.coachStamp}>Sources open</span>
            <Image
              className={styles.coachMascot}
              src="/assets/gainframe-guy/poses/gainframe-coach.webp"
              width={1024}
              height={1024}
              sizes="180px"
              alt=""
              aria-hidden="true"
            />
            <Image
              src="/assets/shared/coach-goal-progress.webp"
              width={860}
              height={1864}
              sizes="(max-width: 740px) 78vw, 410px"
              alt="GainFrame Coach answering a goal progress question using body fat, score, weight, and a weight trend chart."
            />
          </div>
        </section>

        <section className={styles.historyChapter} id="history">
          <div className={styles.historyHead}>
            <LabLabel index="04">Smart Import / build your history</LabLabel>
            <h2>Your camera roll already contains a transformation.</h2>
            <p>
              Smart Import classifies old gym photos by pose and builds the
              timeline for you—without making you sort every selfie by hand.
            </p>
          </div>
          <div className={styles.historyStage}>
            <div className={styles.historyPanel}>
              <span className={styles.panelIndex}>A / classify</span>
              <Image
                src="/assets/shared/smart-import.webp"
                width={1290}
                height={2796}
                sizes="(max-width: 740px) 68vw, 340px"
                alt="GainFrame Smart Import classifying camera roll photos by front and back poses while importing."
              />
              <div className={styles.floatingChip}>Pose matched ✓</div>
            </div>
            <div className={`${styles.historyPanel} ${styles.timelinePanel}`}>
              <span className={styles.panelIndex}>B / reconstruct</span>
              <Image
                src="/assets/GF-Promo/timeline-quarter.webp"
                width={1290}
                height={2796}
                sizes="(max-width: 740px) 68vw, 340px"
                alt="GainFrame transformation timeline organized by quarter with photos, weight, AI Score, and estimated body fat."
              />
              <div className={styles.floatingChip}>History restored ↗</div>
            </div>
            <div className={styles.historySummary}>
              <span>Old photos in</span>
              <strong>Clear trend out</strong>
              <p>Day · week · month · quarter · year</p>
            </div>
            <div className={styles.historyMascot} aria-hidden="true">
              <Image
                src="/assets/gainframe-guy/illustrations/mascot-pictures.webp"
                width={1536}
                height={2752}
                sizes="240px"
                alt=""
              />
              <span>Same pose. Clearer story.</span>
            </div>
          </div>
        </section>

        <section className={styles.futureChapter} id="future-you">
          <div className={styles.futureCopy}>
            <LabLabel index="05">Project / Future You</LabLabel>
            <h2>Make the goal feel visible.</h2>
            <p>
              Choose a 3, 6, or 12 month horizon and explore an illustrative
              physique scenario based on your selected goal and intensity.
            </p>
            <p className={styles.disclaimer}>
              Illustrative AI projection—not a prediction or medical advice.
            </p>
          </div>
          <div className={styles.futureStage}>
            <span className={styles.futureOrbit} aria-hidden="true">3M · 6M · 12M ·</span>
            <Image
              src="/app-screenshots/1.21/future-you.webp"
              width={1320}
              height={2868}
              sizes="(max-width: 740px) 76vw, 410px"
              alt="Future You showing current and illustrative six-month physique images, with an in-app projection disclaimer."
            />
          </div>
        </section>

        <section className={styles.systemSection} id="system">
          <div className={styles.systemHead}>
            <LabLabel index="06">The weekly system</LabLabel>
            <h2>Small inputs. A useful history.</h2>
            <p>Keep the loop light enough to repeat and rich enough to explain.</p>
          </div>
          <div className={styles.systemGrid}>
            <article className={styles.systemCard}>
              <div className={styles.cardTop}><span>01</span><strong>Check in</strong></div>
              <div className={styles.cardImage}>
                <Image
                  src="/app-screenshots/1.21/check-ins.webp"
                  width={1290}
                  height={2796}
                  sizes="(max-width: 740px) 84vw, 350px"
                  alt="GainFrame weekly check-in streak and today&apos;s weight log."
                />
              </div>
              <p>Guided photos keep the weekly signal comparable.</p>
            </article>
            <article className={`${styles.systemCard} ${styles.systemCardDark}`}>
              <div className={styles.cardTop}><span>02</span><strong>Look back</strong></div>
              <div className={styles.cardImage}>
                <Image
                  src="/app-screenshots/1.21/throwback.webp"
                  width={1290}
                  height={2796}
                  sizes="(max-width: 740px) 84vw, 350px"
                  alt="GainFrame Throwback comparing photos from one month apart with weight and score changes."
                />
              </div>
              <p>Automatic throwbacks surface progress you may have missed.</p>
            </article>
            <article className={`${styles.systemCard} ${styles.systemCardRed}`}>
              <div className={styles.cardTop}><span>03</span><strong>Connect weight</strong></div>
              <div className={styles.cardImage}>
                <Image
                  src="/app-screenshots/1.21/weight-chart.webp"
                  width={1290}
                  height={2796}
                  sizes="(max-width: 740px) 84vw, 350px"
                  alt="GainFrame weight goal, milestones, and 90-day trajectory chart."
                />
              </div>
              <p>Read the scale beside physique changes, not in isolation.</p>
            </article>
          </div>
        </section>

        <section className={styles.proofStrip} aria-labelledby="proof-heading">
          <div>
            <p className={styles.proofLabel}>Reality check</p>
            <h2 id="proof-heading">Useful estimates. Honest limits.</h2>
          </div>
          <div className={styles.proofItems}>
            <article>
              <strong>0.4 pts</strong>
              <p>
                In one documented head-to-head, GainFrame estimated 19% body
                fat and DEXA measured 18.6%. One user&apos;s test—not a validation study.
              </p>
            </article>
            <article>
              <strong>Never stored</strong>
              <p>
                Photos are sent securely for AI analysis and are never stored
                outside your device by GainFrame. Coach history stays on-device.
              </p>
            </article>
            <article>
              <strong>No account</strong>
              <p>
                No cloud account is required to use the app. Your weekly trend
                does the real work over time.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.workflow} id="workflow">
          <div className={styles.workflowHead}>
            <LabLabel index="07">60-second check-in</LabLabel>
            <h2>Snap. Analyze. Ask.</h2>
          </div>
          <ol className={styles.steps}>
            <li>
              <span>01</span>
              <h3>Take the photo</h3>
              <p>Use guided front, side, and back poses with consistent framing.</p>
            </li>
            <li>
              <span>02</span>
              <h3>Read the report</h3>
              <p>Review estimated body fat, FFMI, lean mass, and muscle scores.</p>
            </li>
            <li>
              <span>03</span>
              <h3>Ask Coach why</h3>
              <p>Connect the photo to your available lifts, recovery, and nutrition.</p>
            </li>
          </ol>
        </section>

        <section className={styles.faq} id="faq">
          <div className={styles.faqHead}>
            <LabLabel index="08">FAQ / good to know</LabLabel>
            <h2>Questions before your first scan.</h2>
          </div>
          <div className={styles.faqList}>
            <details>
              <summary>How accurate is GainFrame&apos;s body fat estimate?</summary>
              <p>
                In one documented head-to-head against a clinical DEXA scan,
                GainFrame&apos;s estimate agreed within 0.4 percentage points
                (DEXA: 18.6%, GainFrame: 19%). That is one user&apos;s test, not a
                peer-reviewed or multi-person validation. Consistent weekly
                conditions make the trend the most useful part.
              </p>
            </details>
            <details>
              <summary>Does GainFrame replace a DEXA scan?</summary>
              <p>
                No. DEXA still provides bone density and absolute visceral-fat
                measurements that a photo app cannot. GainFrame is designed for
                convenient at-home physique tracking between check-ins.
              </p>
            </details>
            <details>
              <summary>What can Coach use?</summary>
              <p>
                When available, Coach can use your check-ins, body metrics,
                Apple Health data, Hevy workouts, Strava activity, nutrition
                logs, and selected comparisons. You can inspect the sources in
                the app.
              </p>
            </details>
            <details>
              <summary>Are my progress photos private?</summary>
              <p>
                Photos are sent securely for AI analysis and are never stored
                outside your device by GainFrame. No cloud account is required,
                and Coach conversation history is stored on-device only.
              </p>
            </details>
            <details>
              <summary>Can I import old gym photos?</summary>
              <p>
                Yes. Smart Import classifies old photos by pose and builds a
                continuous transformation timeline without manual sorting.
              </p>
            </details>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.finalGrid} aria-hidden="true" />
          <Image
            className={styles.finalMascot}
            src="/assets/gainframe-guy/poses/gainframe-guy-jacked.webp"
            width={992}
            height={1087}
            sizes="260px"
            alt=""
            aria-hidden="true"
          />
          <p className={styles.finalLabel}>Your progress starts here</p>
          <h2>Take the photo.<br />See the signal.</h2>
          <p>Start free with one check-in. Your future trend starts there.</p>
          <AppStoreCta className={styles.finalButton} content="closing_download">
            Download GainFrame
          </AppStoreCta>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link className={styles.footerBrand} href="/">GainFrame</Link>
        <p>Physique intelligence for the work between mirrors.</p>
        <div>
          <Link href="/privacy/">Privacy</Link>
          <Link href="/blog/">Journal</Link>
          <a href={`mailto:${SITE.contactEmail}`}>Support</a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
