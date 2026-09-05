import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import BlogFonts from "@/components/BlogFonts";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute:
      "About GainFrame — Progress Photos Built by Someone Who Needed Them",
  },
  description:
    "Built by Michael Rode — a senior software engineer in Wilmington, NC with 20 years in the gym and 15 in code. GainFrame is the progress photo app he needed.",
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "About GainFrame — The Story Behind the App",
    description:
      "A one-person company in Wilmington, NC, building the progress photo app I always wanted to exist.",
    url: `${SITE.url}/about/`,
    type: "website",
    siteName: "GainFrame",
    images: [{ url: SITE.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About GainFrame — The Story Behind the App",
    description:
      "A one-person company in Wilmington, NC, building the progress photo app I always wanted to exist.",
    images: [SITE.ogImage],
  },
};

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: "https://gainframe.app/about/",
  name: "About GainFrame",
  description:
    "The story behind GainFrame — built by a senior software engineer who got tired of expensive, infrequent body scans and decided to build a better way.",
  mainEntity: {
    "@type": "Organization",
    "@id": "https://gainframe.app/#organization",
    name: "GainFrame",
    url: "https://gainframe.app",
    logo: "https://gainframe.app/assets/favicons/favicon.webp",
    description:
      "AI body composition tracker that turns one gym selfie into a full physique report — precision body fat, 12 muscle scores, and your next milestone in 60 seconds.",
    foundingDate: "2026-03-08",
    founder: { "@type": "Person", "@id": "https://gainframe.app/about/#michael-rode" },
    sameAs: [
      "https://www.tiktok.com/@gainframeapp",
      "https://www.instagram.com/gainframe.app/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "michaelrode44@gmail.com",
      contactType: "customer support",
    },
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://gainframe.app/about/#michael-rode",
  name: "Michael Rode",
  alternateName: "Mike Rode",
  url: "https://gainframe.app/about/",
  image: "https://gainframe.app/assets/team/michael-rode.webp",
  jobTitle: "Founder & Builder",
  worksFor: { "@type": "Organization", name: "GainFrame", url: "https://gainframe.app" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Wilmington",
    addressRegion: "NC",
    addressCountry: "US",
  },
  knowsAbout: [
    "Body composition analysis",
    "Progress photo tracking",
    "AI vision models",
    "iOS development",
    "Backend engineering",
    "DevOps and infrastructure",
    "Strength training",
    "DEXA scan analysis",
  ],
  description:
    "Founder of GainFrame. Full-time backend engineer with 15 years of experience, lifter for 20 years, and new dad squeezing workouts in around naps. Built GainFrame after two expensive DEXA scans convinced him there had to be a better way to track body composition.",
  sameAs: [
    "https://www.linkedin.com/in/michael-rode/",
    "https://x.com/mikerodebuilds",
    "https://github.com/mjrode",
    "https://apps.apple.com/us/developer/michael-rode/id1869450871",
    "https://www.crunchbase.com/person/michael-rode-b23f",
    "https://www.instagram.com/mjrode442/",
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://gainframe.app/" },
    { "@type": "ListItem", position: 2, name: "About", item: "https://gainframe.app/about/" },
  ],
};

export default function AboutPage() {
  return (
    <>
      <BlogFonts />
      <link rel="stylesheet" href="/styles/about-page.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="about-page">
        <BlogNav />

        <header className="about-hero">
          <div className="container">
            <div className="about-hero__shell">
              <div className="about-hero__copy">
                <span className="about-hero__eyebrow">
                  Dad, day job, side project
                </span>
                <h1>Progress deserved better.</h1>
                <p className="about-hero__lede">
                  I&rsquo;m Michael Rode, a backend engineer and lifelong
                  fitness nerd in Wilmington, NC. GainFrame started because
                  years of progress photos were sitting in my camera roll with
                  almost no way to turn them into useful feedback.
                </p>
                <div className="about-hero__actions" aria-label="Contact links">
                  <a href="mailto:michaelrode44@gmail.com">Email</a>
                  <a href="https://x.com/mikerodebuilds" target="_blank" rel="noopener">
                    X
                  </a>
                  <a
                    href="https://www.tiktok.com/@gainframeapp"
                    target="_blank"
                    rel="noopener"
                  >
                    TikTok
                  </a>
                  <a
                    href="https://www.instagram.com/gainframe.app/"
                    target="_blank"
                    rel="noopener"
                  >
                    Instagram
                  </a>
                </div>
              </div>

              <aside className="about-hero__card" aria-label="About Michael Rode">
                <img
                  className="about-hero__photo"
                  src="/assets/team/michael-rode.webp"
                  alt="Michael Rode, founder of GainFrame, headshot"
                />
                <div className="about-hero__facts" aria-label="Founder background">
                  <span className="about-hero__fact">15 years in software</span>
                  <span className="about-hero__fact">20 years lifting</span>
                  <span className="about-hero__fact">Built around naps</span>
                </div>
                <div className="about-hero__caption">
                  <div>
                    <p className="about-hero__name">Michael Rode</p>
                    <p className="about-hero__role">
                      Founder &amp; Builder · Wilmington, NC
                    </p>
                  </div>
                  <span className="about-hero__badge">
                    GF<br />01
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </header>

        <article className="post">
          <div className="container post-container">
            <div className="post-body">
              <section className="about-intro-grid" aria-label="GainFrame at a glance">
                <div className="about-intro-stat">
                  <strong>Mar 2026</strong>
                  <span>Launched on the App Store</span>
                </div>
                <div className="about-intro-stat">
                  <strong>3,500+</strong>
                  <span>Unique app users</span>
                </div>
                <div className="about-intro-stat">
                  <strong>$1.2K+</strong>
                  <span>Monthly recurring revenue</span>
                </div>
              </section>

              <h2>Why GainFrame exists</h2>
              <p>
                I&rsquo;d been taking progress photos for years &mdash;
                sporadically at first, then more deliberately as my training
                got serious. Hundreds of them, sitting in my camera roll, going
                back through different phases of my fitness journey.
              </p>
              <p>
                The problem wasn&rsquo;t taking the photos. It was getting any
                value out of them. They were hard to compare. There was no
                context attached to any of them &mdash; no notes about what I
                was doing, what I was eating, what my training looked like
                that month. I couldn&rsquo;t easily spot trends. I couldn&rsquo;t
                tell what was working.
              </p>
              <p>
                There had to be a better way to use what I&rsquo;d already been
                collecting. That&rsquo;s where GainFrame started: a simple,
                fast way to organize and compare progress photos over time.
                It&rsquo;s grown from there into detailed AI analysis on every
                photo, trend detection across weeks and months, and the daily
                context attached to each shot &mdash; so a photo from six
                months ago is more than just an image. It&rsquo;s a snapshot
                you can actually learn from.
              </p>

              <section
                className="about-principles"
                aria-labelledby="build-principles"
              >
                <header className="about-principles__header">
                  <span>Build notes / 03</span>
                  <h2 id="build-principles">What guides the build</h2>
                  <p>
                    Three rules I come back to whenever a feature risks getting
                    louder than the progress it is meant to clarify.
                  </p>
                </header>
                <div className="about-principles__grid">
                  <article className="about-principle">
                    <span className="about-principle__index">01 / signal</span>
                    <h3>Trends over snapshots</h3>
                    <p>
                      One check-in can be noisy. A consistent run of them is
                      where I look for the real story.
                    </p>
                  </article>
                  <article className="about-principle about-principle--coral">
                    <span className="about-principle__index">02 / limits</span>
                    <h3>Honest estimates over fake precision</h3>
                    <p>
                      I&rsquo;ll show the estimate and its limits. GainFrame is
                      a tracking tool, not a clinical measurement or medical
                      advice.
                    </p>
                  </article>
                  <article className="about-principle about-principle--dark">
                    <span className="about-principle__index">03 / trust</span>
                    <h3>Your photos stay yours</h3>
                    <p>
                      Your history stays on your device. Photos are sent
                      securely for analysis and are never stored outside your
                      device by GainFrame.
                    </p>
                  </article>
                </div>
              </section>

              <hr className="post-divider" />

              <h2>What GainFrame is</h2>
              <p>
                GainFrame is a progress photo app first. The AI body
                composition layer is what makes it powerful, but the
                foundation is simple: organize your photos, compare them, and
                pull insight out of them.
              </p>
              <p>
                The app gets better the more you use it. More photos, more
                context, more time. Two photos from the same week tell you
                very little. Twelve months of weekly check-ins tells you a
                story.
              </p>
              <ul>
                <li>
                  <strong>A progress photo app first.</strong> Capture,
                  organize, and compare your photos. That&rsquo;s the core.
                  Everything else is built on top.
                </li>
                <li>
                  <strong>An AI body composition tracker.</strong> One photo
                  in, full report out. Physique score (1&ndash;100), precision
                  body fat percentage, 12 individually-scored muscle groups,
                  FFMI, BMI, waist-to-hip, and a forecast of where you&rsquo;re
                  heading.
                </li>
              </ul>

              <hr className="post-divider" />

              <h2>What GainFrame is not</h2>
              <p>
                This part matters as much as anything above. I&rsquo;m an
                engineer who built a measurement tool. I&rsquo;m not a doctor,
                dietitian, or certified trainer.
              </p>
              <ul>
                <li>
                  <strong>Not medical advice.</strong> The body fat, BMI, and
                  FFMI numbers GainFrame produces are estimates from a vision
                  model. They&rsquo;re useful for tracking trends. They are
                  not a diagnostic tool. If you have a health condition, talk
                  to your doctor.
                </li>
                <li>
                  <strong>Not a workout or nutrition tracker.</strong>{" "}
                  GainFrame doesn&rsquo;t log your lifts and doesn&rsquo;t
                  count your macros. There are great apps for both &mdash; use
                  them. GainFrame does one thing: progress photos with serious
                  analysis behind them. The goal is to do that one thing
                  better than anyone else.
                </li>
                <li>
                  <strong>Not a coaching service.</strong> The app gives you
                  data and surface-level training suggestions based on visible
                  muscle imbalances. It does not write you a periodized
                  program. For that, hire a coach.
                </li>
                <li>
                  <strong>
                    Not a replacement for a real DEXA when one is medically
                    indicated.
                  </strong>{" "}
                  If your doctor needs a clinical body composition reading,
                  get the clinical reading. GainFrame is built for the 51
                  weeks a year when you&rsquo;re not in a clinic.
                </li>
              </ul>
              <p>
                Being clear about this is part of the trust I&rsquo;m trying
                to build. I&rsquo;d rather you trust the app for what it
                actually is than oversell it.
              </p>

              <hr className="post-divider" />

              <h2>How (and why) I find the time</h2>
              <figure className="about-story-photo">
                <img
                  src="/assets/team/michael-and-daughter.webp"
                  alt="Michael Rode, founder of GainFrame, holding his 5-month-old daughter at the airport — with a thought bubble showing the GainFrame Guy mascot wondering 'I wonder what my GainFrame score is'"
                  loading="lazy"
                />
                <figcaption>
                  Most of GainFrame gets built before this little one wakes up.
                </figcaption>
              </figure>
              <p>
                I have a 5-month-old daughter and a full-time job. The honest
                version of this section is that GainFrame gets built in the
                cracks: an hour in the morning before my daughter is up,
                sometimes an hour in the evening after my wife and baby are
                asleep.
              </p>
              <p>
                Being the only person on this also means I&rsquo;m doing a lot
                of things I haven&rsquo;t done professionally &mdash; design,
                marketing, copywriting, customer support. Most of it is new.
                Most of it is uncomfortable. All of it is making me a better
                builder, and a lot of the tradeoffs you&rsquo;d see on a
                bigger team get made out loud, in public, on the{" "}
                <a href="/blog/">blog</a>.
              </p>
              <p>
                The reason it keeps shipping isn&rsquo;t discipline &mdash;
                it&rsquo;s that GainFrame sits at the intersection of two
                things I genuinely love: lifting and building software. When
                the work on a side project energizes you instead of draining
                you, the cracks in the day are enough.
              </p>
              <p>
                That&rsquo;s also where the confidence to think I can build
                something really great comes from. I&rsquo;ve spent 20 years
                in the gym and 15 years writing code. GainFrame is the rare
                project where I get to use both at the same time.
              </p>
              <p>
                If you want a more tactical look at how I work, the{" "}
                <a href="/blog/">founder-story posts</a> are the most honest
                version of it.
              </p>

              <hr className="post-divider" />

              <section
                className="about-revenue"
                aria-labelledby="state-of-things"
              >
                <div className="about-revenue__header">
                  <span className="about-finale__eyebrow">
                    <span className="dot"></span>Live proof
                  </span>
                  <h2 id="state-of-things">The state of things</h2>
                  <p>
                    RevenueCat verifies the live subscription numbers, so the
                    business side is as public as the build notes.
                  </p>
                </div>
                <div className="about-revenue__frame">
                  <iframe
                    src="https://verified.revenuecat.com/gainframe"
                    title="GainFrame verified RevenueCat metrics"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  ></iframe>
                </div>
                <p className="about-revenue__fallback">
                  <a
                    href="https://verified.revenuecat.com/gainframe"
                    target="_blank"
                    rel="noopener"
                  >
                    Open the verified RevenueCat page
                  </a>
                </p>
                <ul className="about-state-list">
                  <li>
                    <strong>Launched:</strong> March 8, 2026 on the iOS App Store
                  </li>
                  <li>
                    <strong>App Store rating:</strong> 4.9 stars
                  </li>
                  <li>
                    <strong>Product usage, Mar 8&ndash;Jul 21, 2026:</strong>{" "}
                    3,598 unique app users, 3,509 unique installs, and 2,311
                    first scores received
                  </li>
                  <li>
                    <strong>RevenueCat, Jul 21, 2026:</strong> 249 active
                    subscriptions and 1,849 active users in the prior 28 days.
                    Live MRR and revenue are shown above.
                  </li>
                  <li>
                    <strong>Pricing:</strong> Free download; Pro is $7.99/month
                    or $49.99/year. Current plans have no trial.
                  </li>
                  <li>
                    <strong>Team size:</strong> One. Just me.
                  </li>
                </ul>
              </section>

              <hr className="post-divider" />

              <section className="about-finale" aria-labelledby="talk-to-me">
                <span className="about-finale__eyebrow">
                  <span className="dot"></span>Direct line
                </span>
                <h2 id="talk-to-me">Talk to me</h2>
                <p className="about-finale__lede">
                  The fastest way to reach me is the in-app chat &mdash;
                  you&rsquo;re messaging me directly, usually within a few
                  hours. I wrote about{" "}
                  <a href="/blog/in-app-chat/">
                    why I added it and what I&rsquo;m hoping to learn
                  </a>
                  .
                </p>

                <a
                  href={SITE.appStoreUrl}
                  className="about-chat-card"
                  target="_blank"
                  rel="noopener"
                  aria-label="Open the GainFrame app to chat with the founder"
                  data-cta-source="about"
                  data-cta-content="chat_card"
                >
                  <span className="about-chat-card__icon" aria-hidden="true">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </span>
                  <div className="about-chat-card__body">
                    <span className="about-chat-card__kicker">Fastest reply</span>
                    <h3 className="about-chat-card__title">
                      In-app chat with Mike
                    </h3>
                    <p className="about-chat-card__sub">
                      Tap the banner on the home screen &mdash; reach me
                      directly, no support queue.
                    </p>
                  </div>
                  <span className="about-chat-card__arrow" aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="13 6 19 12 13 18" />
                    </svg>
                  </span>
                </a>

                <div className="about-channels">
                  <a className="about-channel" href="mailto:michaelrode44@gmail.com">
                    <span className="about-channel__icon" aria-hidden="true">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <polyline points="3 7 12 13 21 7" />
                      </svg>
                    </span>
                    <p className="about-channel__label">Email</p>
                    <p className="about-channel__handle">michaelrode44</p>
                  </a>

                  <a
                    className="about-channel"
                    href="https://x.com/mikerodebuilds"
                    target="_blank"
                    rel="noopener"
                  >
                    <span className="about-channel__icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </span>
                    <p className="about-channel__label">X / Twitter</p>
                    <p className="about-channel__handle">@mikerodebuilds</p>
                  </a>

                  <a
                    className="about-channel"
                    href="https://www.tiktok.com/@gainframeapp"
                    target="_blank"
                    rel="noopener"
                  >
                    <span className="about-channel__icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.55a8.16 8.16 0 0 0 4.77 1.52V6.69z" />
                      </svg>
                    </span>
                    <p className="about-channel__label">TikTok</p>
                    <p className="about-channel__handle">@gainframeapp</p>
                  </a>

                  <a
                    className="about-channel"
                    href="https://www.instagram.com/gainframe.app/"
                    target="_blank"
                    rel="noopener"
                  >
                    <span className="about-channel__icon" aria-hidden="true">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <path d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </span>
                    <p className="about-channel__label">Instagram</p>
                    <p className="about-channel__handle">@gainframe.app</p>
                  </a>
                </div>
              </section>

              <section className="about-cta" aria-labelledby="try-the-app">
                <span className="about-cta__kicker">
                  <span className="dot"></span>Free download &middot; Pro from
                  $7.99/month
                </span>
                <h2 id="try-the-app" className="about-cta__title">
                  See the body{" "}
                  <span className="accent">you&rsquo;re building.</span>
                </h2>
                <p className="about-cta__sub">
                  One gym selfie. Sixty seconds. A full body-composition
                  report &mdash; physique score, precision body fat, and your
                  next milestone.
                </p>
                <a
                  href={SITE.appStoreUrl}
                  className="about-cta__badge-link"
                  target="_blank"
                  rel="noopener"
                  aria-label="Download GainFrame on the App Store"
                  data-cta-source="about"
                  data-cta-content="store_badge"
                >
                  <img
                    src="https://developer.apple.com/news/images/download-on-the-app-store-badge.png"
                    alt="Download on the App Store"
                  />
                </a>
                <div
                  className="about-cta__trust"
                  aria-label="Average rating four point nine stars on the App Store"
                >
                  <span className="stars" aria-hidden="true">
                    &#9733;&#9733;&#9733;&#9733;&#9733;
                  </span>
                  <span>
                    <strong>4.9</strong> on the App Store
                  </span>
                  <span className="sep" aria-hidden="true"></span>
                  <span>3,500+ app users</span>
                </div>
              </section>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
