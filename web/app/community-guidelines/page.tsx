import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { SITE } from "@/lib/site";
import styles from "./community-guidelines.module.css";

export const metadata: Metadata = {
  title: "Community Guidelines — GainFrame",
  description:
    "The rules for respectful, consent-based participation in GainFrame community profiles and shared scan images.",
  alternates: { canonical: "/community-guidelines/" },
};

export default function CommunityGuidelinesPage() {
  return (
    <div className={styles.page}>
      <link rel="stylesheet" href="/styles-clean.css" />
      <link rel="stylesheet" href="/styles.css" />
      <Nav />
      <main className={styles.main}>
        <header className={styles.hero}>
          <div>
            <span>GainFrame community</span>
            <h1>Progress deserves respect.</h1>
            <p>
              The leaderboard is a place to share the work—not to judge
              someone&rsquo;s body. Participation, profile details, check-ins,
              and scan images are always opt-in.
            </p>
          </div>
          <img
            src="/assets/gainframe-guy/illustrations/mascot-pictures.webp"
            alt=""
          />
        </header>

        <div className={styles.layout}>
          <aside className={styles.summary}>
            <strong>The short version</strong>
            <ol>
              <li>Share only yours.</li>
              <li>Respect every body.</li>
              <li>Report problems.</li>
            </ol>
            <a href="/leaderboard/">Visit the leaderboard</a>
          </aside>

          <article className={styles.content}>
            <p className={styles.updated}>Effective August 11, 2026</p>

            <section>
              <span className={styles.number}>01</span>
              <div>
                <h2>Share with permission</h2>
                <p>
                  Publish only photos of yourself or photos you have permission
                  from every visible person to share. Face blur, cropping, and
                  background removal reduce exposure but do not replace that
                  permission. Do not reveal private locations, contact details,
                  medical information, or another person&rsquo;s identity.
                </p>
              </div>
            </section>

            <section>
              <span className={styles.number}>02</span>
              <div>
                <h2>Keep the focus on progress</h2>
                <p>
                  Encouragement is welcome. Objectification is not. Do not use
                  GainFrame to rank attractiveness, sexualize members, shame a
                  body type, encourage disordered behavior, or bully someone
                  about their score or appearance.
                </p>
              </div>
            </section>

            <section>
              <span className={styles.number}>03</span>
              <div>
                <h2>Content we remove</h2>
                <ul>
                  <li>Nudity, sexual content, or sexually suggestive body content</li>
                  <li>Harassment, threats, hate, humiliation, or targeted abuse</li>
                  <li>Impersonation, deceptive scores, spam, or manipulation</li>
                  <li>Images shared without permission or that expose private information</li>
                  <li>Illegal content or content that creates a credible safety risk</li>
                </ul>
              </div>
            </section>

            <section>
              <span className={styles.number}>04</span>
              <div>
                <h2>Reporting and blocking</h2>
                <p>
                  Use <strong>Report profile</strong> or{" "}
                  <strong>Report image</strong> on the public profile. You can
                  also report from the GainFrame app. If the form is
                  unavailable, email{" "}
                  <a href={"mailto:" + SITE.contactEmail}>{SITE.contactEmail}</a>{" "}
                  with the public profile link and a short description. Reports
                  are not displayed to the reported member.
                </p>
                <p>
                  Blocking changes what you see and how accounts can interact
                  in GainFrame. It cannot prevent someone from viewing a public
                  web page anonymously or retaining a copy they already saved.
                </p>
              </div>
            </section>

            <section>
              <span className={styles.number}>05</span>
              <div>
                <h2>How moderation works</h2>
                <p>
                  GainFrame may use automated checks and human review to
                  evaluate published profiles, images, and reports. Depending
                  on the issue, we may hide or remove content, limit publishing,
                  or suspend community access. Serious or repeated violations
                  may lead to account action.
                </p>
                <p>
                  Context matters, and moderation can make mistakes. To ask for
                  another review, email{" "}
                  <a href={"mailto:" + SITE.contactEmail + "?subject=Community%20moderation%20appeal"}>
                    {SITE.contactEmail}
                  </a>{" "}
                  with the profile link and the reason you believe the decision
                  should be reconsidered. We cannot promise a particular
                  outcome or review time.
                </p>
              </div>
            </section>

            <footer className={styles.policyLinks}>
              <p>
                These guidelines explain the community standard; the{" "}
                <a href="/privacy/">Privacy Policy</a> explains how published
                profile data and image copies are handled.
              </p>
            </footer>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
