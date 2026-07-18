import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import BlogFonts from "@/components/BlogFonts";
import EditorialFonts from "@/components/EditorialFonts";
import BlogScrollReveal from "@/components/BlogScrollReveal";

export const metadata: Metadata = {
  title: {
    absolute:
      "The Book of Enoch, UFO Files, and the Ancient Warning We May Have Ignored",
  },
  description:
    "The Pentagon just released a new batch of UFO files. An ancient book left out of most modern Bibles was already telling the same story.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/alien/" },
};

const ALIEN_STYLES = `
  /* Scoped theme: dark editorial occult */
  body:has(.alien-page) {
    background: #0c0a16;
  }
  .alien-page {
    --ink: #ece1c8;
    --ink-soft: #b8a98a;
    --ink-muted: #7d735c;
    --gold: #d9a953;
    --gold-soft: #b88836;
    --paper: #f4ead2;
    --bg: #0c0a16;
    --bg-2: #14101f;
    --rule: rgba(217, 169, 83, 0.18);
    background: var(--bg);
    color: var(--ink);
    min-height: 100vh;
    position: relative;
    overflow-x: clip;
  }
  /* Star/grain field */
  .alien-page::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(1px 1px at 20% 18%, rgba(255,255,255,0.55), transparent 50%),
      radial-gradient(1px 1px at 78% 12%, rgba(255,255,255,0.4), transparent 50%),
      radial-gradient(1px 1px at 35% 65%, rgba(255,255,255,0.35), transparent 50%),
      radial-gradient(1px 1px at 88% 80%, rgba(255,255,255,0.5), transparent 50%),
      radial-gradient(1px 1px at 12% 90%, rgba(255,255,255,0.3), transparent 50%),
      radial-gradient(1.5px 1.5px at 62% 30%, rgba(255,255,255,0.55), transparent 60%),
      radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.25), transparent 50%);
    background-size: 700px 700px, 900px 900px, 1100px 1100px, 800px 800px, 1000px 1000px, 1300px 1300px, 600px 600px;
    background-repeat: repeat;
    pointer-events: none;
    z-index: 0;
    opacity: 0.55;
    mix-blend-mode: screen;
  }
  .alien-page > * {
    position: relative;
    z-index: 1;
  }

  /* Override BlogNav contrast on the dark page (nav lives outside .alien-page) */
  body:has(.alien-page) .blog-nav {
    background: rgba(12, 10, 22, 0.78) !important;
    backdrop-filter: saturate(140%) blur(14px);
    -webkit-backdrop-filter: saturate(140%) blur(14px);
    border-bottom: 1px solid rgba(217, 169, 83, 0.12) !important;
  }
  body:has(.alien-page) .blog-nav-wordmark,
  body:has(.alien-page) .blog-nav-links a {
    color: #ece1c8 !important;
  }
  body:has(.alien-page) .blog-nav-links a:hover,
  body:has(.alien-page) .blog-nav-links a.active {
    color: #d9a953 !important;
  }
  body:has(.alien-page) .nav-cta-btn {
    background: #d9a953 !important;
    color: #1a1408 !important;
    border-color: #d9a953 !important;
  }
  body:has(.alien-page) .nav-hamburger span {
    background: #ece1c8 !important;
  }
  body:has(.alien-page) .blog-nav-icon {
    filter: brightness(1.1) contrast(0.95);
  }

  /* === HEADER === */
  .alien-hero {
    max-width: 1180px;
    margin: 0 auto;
    padding: 6rem 1.75rem 3rem;
    display: grid;
    gap: 2.5rem;
  }
  @media (min-width: 880px) {
    .alien-hero {
      padding: 7rem 2rem 4rem;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
      align-items: center;
      gap: 3rem;
    }
  }
  @media (min-width: 1180px) {
    .alien-hero {
      gap: 4rem;
    }
  }
  .alien-eyebrow {
    font-family: "UnifrakturCook", serif;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: 0.04em;
    font-size: 1.15rem;
    margin: 0 0 1.5rem 0;
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
  }
  .alien-eyebrow::before,
  .alien-eyebrow::after {
    content: "";
    width: 38px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }
  .alien-title {
    font-family: "Playfair Display", "Times New Roman", serif;
    font-weight: 400;
    font-style: italic;
    font-size: clamp(2.4rem, 5.5vw, 4.4rem);
    line-height: 1.04;
    letter-spacing: -0.015em;
    color: var(--paper);
    margin: 0 0 1.5rem 0;
    text-wrap: balance;
  }
  .alien-title em {
    font-style: normal;
    color: var(--gold);
  }
  .alien-deck {
    font-family: "Playfair Display", serif;
    font-style: italic;
    font-weight: 400;
    color: var(--ink-soft);
    font-size: clamp(1.1rem, 1.4vw, 1.3rem);
    line-height: 1.55;
    max-width: 36rem;
    margin: 0 0 2rem 0;
  }
  .alien-meta {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    color: var(--ink-muted);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-family: "DM Sans", sans-serif;
  }
  .alien-meta span:not(:last-child)::after {
    content: "·";
    margin-left: 1.25rem;
    color: var(--gold);
  }
  .alien-cover {
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    box-shadow:
      0 30px 80px -20px rgba(0,0,0,0.7),
      0 0 0 1px rgba(217, 169, 83, 0.15);
  }
  .alien-cover::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(12,10,22,0.55));
    pointer-events: none;
  }
  .alien-cover img {
    display: block;
    width: 100%;
    height: auto;
  }

  /* === ESSAY === */
  .alien-essay {
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem 1.75rem 5rem;
    font-family: "DM Sans", system-ui, sans-serif;
    font-size: 1.155rem;
    line-height: 1.78;
    color: var(--ink);
  }
  .alien-essay p {
    margin: 0 0 1.5rem 0;
  }
  .alien-essay p:last-child {
    margin-bottom: 0;
  }
  .alien-essay strong {
    color: var(--paper);
    font-weight: 600;
  }
  .alien-essay em {
    color: var(--gold);
    font-style: italic;
    font-family: "Playfair Display", serif;
  }

  /* Drop cap */
  .alien-essay .alien-lede::first-letter {
    font-family: "UnifrakturCook", serif;
    font-weight: 700;
    float: left;
    font-size: 5.4rem;
    line-height: 0.85;
    padding: 0.4rem 0.9rem 0 0;
    color: var(--gold);
    text-shadow: 0 0 30px rgba(217, 169, 83, 0.35);
  }

  /* H2 chapter markers */
  .alien-essay h2 {
    font-family: "Playfair Display", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    line-height: 1.15;
    color: var(--paper);
    letter-spacing: -0.01em;
    margin: 4rem 0 1.6rem 0;
    text-wrap: balance;
    position: relative;
  }
  .alien-essay h2::before {
    display: block;
    font-family: "UnifrakturCook", serif;
    font-style: normal;
    font-weight: 700;
    font-size: 1.4rem;
    color: var(--gold);
    letter-spacing: 0.05em;
    margin-bottom: 0.9rem;
    content: attr(data-chapter);
  }

  /* Section dividers */
  .alien-rule {
    border: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--rule), transparent);
    margin: 3.5rem auto;
    max-width: 280px;
  }
  .alien-ornament {
    text-align: center;
    margin: 3rem 0;
    color: var(--gold);
    font-family: "UnifrakturCook", serif;
    font-size: 1.6rem;
    letter-spacing: 1.2em;
    line-height: 1;
    user-select: none;
  }

  /* Pull quote (no border, just typography) */
  .alien-pullquote {
    margin: 3rem 0;
    padding: 0;
    border: 0;
    text-align: center;
  }
  .alien-pullquote p {
    font-family: "Playfair Display", serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(1.4rem, 2.6vw, 2rem);
    line-height: 1.35;
    color: var(--paper);
    margin: 0;
    text-wrap: balance;
    position: relative;
    padding: 0 1.5rem;
  }
  .alien-pullquote p::before,
  .alien-pullquote p::after {
    color: var(--gold);
    opacity: 0.6;
    font-style: normal;
    font-size: 0.8em;
  }
  .alien-pullquote p::before { content: "“ "; }
  .alien-pullquote p::after { content: " ”"; }

  /* Compare-rows (In Enoch / Today) */
  .alien-compare {
    display: grid;
    gap: 0;
    margin: 2.5rem 0;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }
  .alien-compare-row {
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 1.5rem;
    padding: 1.4rem 0;
    align-items: baseline;
  }
  .alien-compare-row + .alien-compare-row {
    border-top: 1px solid var(--rule);
  }
  .alien-compare-row dt {
    font-family: "UnifrakturCook", serif;
    color: var(--gold);
    font-size: 1.05rem;
    letter-spacing: 0.02em;
    text-transform: none;
  }
  .alien-compare-row dd {
    margin: 0;
    color: var(--ink);
    font-size: 1.05rem;
    line-height: 1.6;
  }

  /* Stacked emphatic single-sentence paragraphs (the staccato beats) */
  .alien-staccato {
    margin: 2rem 0;
  }
  .alien-staccato p {
    margin: 0 0 0.5rem 0;
    color: var(--paper);
    font-weight: 500;
  }

  /* Closing flourish */
  .alien-finis {
    text-align: center;
    margin: 4rem 0 0 0;
    color: var(--gold);
    font-family: "UnifrakturCook", serif;
    font-size: 2rem;
    letter-spacing: 0.4em;
    user-select: none;
  }

  /* === AUTHOR CARD === */
  .alien-author-wrap {
    max-width: 720px;
    margin: 4rem auto 6rem;
    padding: 0 1.75rem;
  }
  .alien-author {
    position: relative;
    background:
      linear-gradient(180deg, #f4ead2 0%, #e7d8b0 100%);
    color: #2b2418;
    border-radius: 6px;
    padding: 2.25rem 2rem;
    box-shadow:
      0 24px 60px -20px rgba(0,0,0,0.6),
      inset 0 0 0 1px rgba(217, 169, 83, 0.5);
    display: grid;
    gap: 1.75rem;
  }
  @media (min-width: 640px) {
    .alien-author {
      grid-template-columns: 200px 1fr;
      align-items: center;
      padding: 2.5rem;
      gap: 2.25rem;
    }
  }
  .alien-author::before {
    content: "";
    position: absolute;
    top: -1px; left: -1px; right: -1px; bottom: -1px;
    border-radius: 7px;
    background: linear-gradient(135deg, var(--gold), transparent 30%, transparent 70%, var(--gold));
    z-index: -1;
    opacity: 0.6;
  }
  .alien-author-eyebrow {
    font-family: "UnifrakturCook", serif;
    font-size: 0.95rem;
    color: var(--gold-soft);
    letter-spacing: 0.04em;
    margin: 0 0 0.5rem 0;
  }
  .alien-author-name {
    font-family: "Playfair Display", serif;
    font-style: italic;
    font-weight: 700;
    font-size: 2rem;
    line-height: 1.05;
    color: #1a1408;
    margin: 0 0 1rem 0;
  }
  .alien-author-bio {
    font-family: "DM Sans", sans-serif;
    font-size: 1rem;
    line-height: 1.65;
    color: #4a3f2a;
    margin: 0;
  }
  .alien-author-photo {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 4px;
    overflow: hidden;
    box-shadow:
      0 12px 30px -10px rgba(0,0,0,0.45),
      inset 0 0 0 1px rgba(0,0,0,0.1);
    background: #2b2418;
    position: relative;
  }
  .alien-author-photo::after {
    content: "";
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 40px rgba(0,0,0,0.25);
    pointer-events: none;
  }
  .alien-author-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: saturate(0.9) contrast(1.02);
  }
  .alien-author-corner {
    position: absolute;
    font-family: "UnifrakturCook", serif;
    color: var(--gold-soft);
    font-size: 1.4rem;
    line-height: 1;
    opacity: 0.55;
    user-select: none;
  }
  .alien-author-corner.tl { top: 14px; left: 18px; }
  .alien-author-corner.tr { top: 14px; right: 18px; }
  .alien-author-corner.bl { bottom: 14px; left: 18px; }
  .alien-author-corner.br { bottom: 14px; right: 18px; }
`;

export default function AlienPage() {
  return (
    <>
      <BlogFonts />
      <EditorialFonts />
      <BlogNav />
      <BlogScrollReveal />
      <style dangerouslySetInnerHTML={{ __html: ALIEN_STYLES }} />

      <div className="alien-page">
        <header className="alien-hero">
          <div>
            <p className="alien-eyebrow">An Essay</p>
            <h1 className="alien-title">
              The Book of Enoch, UFO Files, and the Ancient Warning <em>We May Have Ignored</em>
            </h1>
            <p className="alien-deck">
              The Pentagon just released a new batch of UFO files. An ancient
              book left out of most modern Bibles was already telling the same
              story.
            </p>
            <div className="alien-meta">
              <span>Field notes</span>
              <span>5 min</span>
            </div>
          </div>
          <figure className="alien-cover">
            <img
              src="/alien/cover.webp"
              alt="An ancient scroll resting on weathered desert stones, covered in faded script and a sketch of winged figures descending from the sky. A robed figure stands on a distant ridge, looking up at a single glowing orb of light hovering low in the dark sky."
              loading="eager"
            />
          </figure>
        </header>

        <article className="alien-essay">
          <p className="alien-lede">
            The Pentagon just released a new batch of UFO files. Not rumors.
            Not internet folklore. Government files.
          </p>
          <p>
            The official language is careful: UAPs, unexplained aerial objects,
            strange sightings, unresolved cases. They are not saying
            &ldquo;aliens are real.&rdquo; But they are admitting something
            important.
          </p>

          <blockquote className="alien-pullquote scroll-reveal">
            <p>
              There are things in our skies that trained observers, military
              systems, and government agencies still cannot fully explain.
            </p>
          </blockquote>

          <p>And that makes an ancient book suddenly feel a lot less ancient.</p>

          <hr className="alien-rule" />

          <h2 data-chapter="I.">
            The Book of Enoch was already talking about visitors from above
          </h2>
          <p>
            The Book of Enoch is an ancient religious text left out of most
            modern Bibles. But its story is wild.
          </p>
          <p>It describes beings called the Watchers.</p>

          <div className="alien-staccato">
            <p>They came from the heavens.</p>
            <p>They watched humanity.</p>
            <p>Then they came down.</p>
            <p>And when they did, everything changed.</p>
          </div>

          <p>
            These Watchers did not just observe humans. They interacted with
            them. They taught them forbidden knowledge: weapons, metalwork,
            astrology, cosmetics, secret arts, and other things mankind
            supposedly was not ready to understand.
          </p>
          <p>That is the part that feels impossible to ignore.</p>
          <p>Because today, we are once again asking the same question.</p>

          <blockquote className="alien-pullquote scroll-reveal">
            <p>Has something been watching us from above?</p>
          </blockquote>

          <div className="alien-ornament" aria-hidden="true">✦ ✦ ✦</div>

          <h2 data-chapter="II.">The parallel is hard to miss</h2>

          <dl className="alien-compare">
            <div className="alien-compare-row">
              <dt>Then</dt>
              <dd>Mysterious beings descend from the sky.</dd>
            </div>
            <div className="alien-compare-row">
              <dt>Now</dt>
              <dd>
                Military pilots and sensors report strange objects moving
                through the sky in ways that do not fit normal aircraft.
              </dd>
            </div>
            <div className="alien-compare-row">
              <dt>Then</dt>
              <dd>These beings possess advanced knowledge.</dd>
            </div>
            <div className="alien-compare-row">
              <dt>Now</dt>
              <dd>
                Witnesses describe objects with capabilities that appear far
                beyond known human technology.
              </dd>
            </div>
            <div className="alien-compare-row">
              <dt>Then</dt>
              <dd>Powerful institutions control the story.</dd>
            </div>
            <div className="alien-compare-row">
              <dt>Now</dt>
              <dd>
                Governments release UFO information slowly, carefully, and
                often only after years of pressure.
              </dd>
            </div>
          </dl>

          <p>
            Different language. Same mystery. Ancient people called them
            Watchers. Modern officials call them UAPs. But the core idea is the
            same.
          </p>

          <blockquote className="alien-pullquote scroll-reveal">
            <p>
              Something is above us — and we may not fully understand what it is.
            </p>
          </blockquote>

          <div className="alien-ornament" aria-hidden="true">✦ ✦ ✦</div>

          <h2 data-chapter="III.">Was Enoch a prophecy?</h2>
          <p>
            Maybe the Book of Enoch was not predicting Pentagon UFO files
            directly. But it may have been warning us about a much bigger idea:
          </p>

          <blockquote className="alien-pullquote scroll-reveal">
            <p>
              Humanity is not as alone, powerful, or informed as it thinks it is.
            </p>
          </blockquote>

          <p>
            The Watchers story is not just about beings from heaven. It is
            about what happens when hidden knowledge enters the human world. It
            is about power, secrecy, corruption, technology, and the danger of
            learning things before we are ready.
          </p>
          <p>That sounds ancient. It also sounds very modern.</p>

          <div className="alien-ornament" aria-hidden="true">✦ ✦ ✦</div>

          <h2 data-chapter="IV.">The creepiest part</h2>
          <p>
            The most unsettling part of Enoch is not that the Watchers came
            down. It is that they were already watching.
          </p>
          <p>That idea hits differently now.</p>
          <p>
            Because every new UFO file, every blurred military video, every
            official statement that says &ldquo;unidentified,&rdquo; forces us
            to sit with the same uncomfortable possibility:
          </p>

          <div className="alien-staccato">
            <p>What if this has been happening for a very long time?</p>
            <p>
              What if ancient people described it with the language they had —
              angels, heavens, Watchers, forbidden knowledge?
            </p>
            <p>
              And what if today we are describing the same phenomenon with our
              language — aircraft, sensors, UAPs, classified programs?
            </p>
          </div>

          <div className="alien-ornament" aria-hidden="true">✦ ✦ ✦</div>

          <h2 data-chapter="V.">The real question</h2>
          <p>
            The Book of Enoch may not be proof of aliens. But it is proof of
            something almost as strange.
          </p>
          <p>
            For thousands of years, humans have told stories about powerful
            beings from above, hidden knowledge, and a reality bigger than the
            official version. Now the Pentagon is releasing files that show
            even modern governments do not have all the answers.
          </p>
          <p>So maybe the real question is not:</p>
          <p>
            <em>Did Enoch predict aliens?</em>
          </p>
          <p>Maybe the better question is —</p>

          <blockquote className="alien-pullquote scroll-reveal">
            <p>
              Why does an ancient book about beings from the heavens suddenly
              feel so relevant right now?
            </p>
          </blockquote>

          <div className="alien-finis" aria-hidden="true">FINIS</div>
        </article>

        <aside className="alien-author-wrap scroll-reveal" aria-label="About the author">
          <div className="alien-author">
            <span className="alien-author-corner tl" aria-hidden="true">✦</span>
            <span className="alien-author-corner tr" aria-hidden="true">✦</span>
            <span className="alien-author-corner bl" aria-hidden="true">✦</span>
            <span className="alien-author-corner br" aria-hidden="true">✦</span>
            <div className="alien-author-photo">
              <img
                src="/assets/team/james-rode.webp"
                alt="James Rode, photographed at a beachside bar with his wife on his shoulders, both laughing."
                loading="lazy"
              />
            </div>
            <div>
              <p className="alien-author-eyebrow">Authored by</p>
              <h3 className="alien-author-name">James Rode</h3>
              <p className="alien-author-bio">
                A man of many talents. When he isn&rsquo;t chasing big questions
                like this one, you&rsquo;ll find him picking the banjo on the
                porch or shaping something beautiful out of wood in the shop
                out back.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
