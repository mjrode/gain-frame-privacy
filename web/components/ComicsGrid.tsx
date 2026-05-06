import { COMICS_MANIFEST } from "@/lib/comics-manifest.mjs";

type Comic = { slug: string; title: string; date: string; ext: string };

const TAG_MAP: Array<[string, RegExp]> = [
  ["Training", /exercise|split|overload|core|gym|workout|lifting|working-out|doing-wrong|that-guy|beginner/],
  ["Nutrition", /protein|food|bulk|cut|alcohol|water|creatine|cheap|muscle-foods|supplements/],
  ["Recovery", /sleep|overtraining|plateau|stuck|deload|signs-making/],
  ["Body Comp", /body-fat|tracking|progress|1month|gains|first-cut|skinny-fat|one-year/],
];
const FALLBACK_TAG = "Mindset";

const SERIES: Record<string, string[]> = {
  "Beginner's Guide": ["beginner-gym-split", "your-first-gym-week", "progressive-overload", "first-cut-tips"],
  "Nutrition Essentials": ["30g-of-protein", "cheap-muscle-foods", "supplements-that-work", "creatine-myths-vs-facts"],
  "Body Recomp": ["skinny-fat-trap", "bulk-vs-cut", "bulk-cut-maintain", "stop-guessing-body-fat"],
};

const PULL_QUOTES = [
  { text: '"The last three reps are what makes the muscle grow."', cite: "— Arnold Schwarzenegger" },
  { text: '"What gets measured, gets managed."', cite: "— Peter Drucker" },
  { text: '"Discipline is choosing between what you want now and what you want most."', cite: "— Abraham Lincoln" },
];

const FILTERS = ["All", "Training", "Nutrition", "Recovery", "Body Comp", "Mindset"];
const NEW_COUNT = 3;

function getTag(slug: string): string {
  for (const [tag, re] of TAG_MAP) if (re.test(slug)) return tag;
  return FALLBACK_TAG;
}

function getSeriesName(slug: string): string | null {
  for (const [name, slugs] of Object.entries(SERIES)) {
    if (slugs.includes(slug)) return name;
  }
  return null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

const SHARE_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const SERIES_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
  </svg>
);

const SLIDE_COUNT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 3v18" />
  </svg>
);

function Hero({ comic, totalCount }: { comic: Comic; totalCount: number }) {
  const tag = getTag(comic.slug);
  const series = getSeriesName(comic.slug);
  return (
    <div
      className="comic-hero scroll-reveal"
      data-slug={comic.slug}
      data-tag={tag}
      role="button"
      tabIndex={0}
    >
      <div className="comic-hero-cover">
        <img
          src={`/assets/tiktok/comic/${comic.slug}/slide-0-cover.${comic.ext}`}
          alt={comic.title}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="comic-new-ribbon">
          <span>New</span>
        </div>
      </div>
      <div className="comic-hero-info">
        <span className="hero-label">
          Latest Issue — No. {String(totalCount).padStart(2, "0")}
        </span>
        <h3>{comic.title}</h3>
        <span className="comic-tag">{tag}</span>
        {series ? (
          <span className="comic-series-badge">
            {SERIES_ICON}
            {series}
          </span>
        ) : null}
        <span className="hero-date">{formatDate(comic.date)}</span>
        <span className="hero-cta">Read Now &#8594;</span>
      </div>
      <button
        className="comic-share-btn"
        style={{ top: "auto", bottom: "12px", right: "12px" }}
        data-share-slug={comic.slug}
        data-share-title={comic.title}
        aria-label="Share"
      >
        {SHARE_ICON}
      </button>
    </div>
  );
}

function Card({ comic, index, totalCount }: { comic: Comic; index: number; totalCount: number }) {
  const tag = getTag(comic.slug);
  const series = getSeriesName(comic.slug);
  const isNew = index < NEW_COUNT;
  const issueNum = totalCount - (index + 1);
  const delay = (index % 3) + 1;
  return (
    <div
      className={`comic-card scroll-reveal-card card-delay-${delay}`}
      data-slug={comic.slug}
      data-tag={tag}
      role="button"
      tabIndex={0}
    >
      <div className="comic-card-cover">
        <img
          src={`/assets/tiktok/comic/${comic.slug}/slide-0-cover.${comic.ext}`}
          alt={comic.title}
          loading="lazy"
          decoding="async"
        />
        <span className="comic-issue-num">No. {String(issueNum).padStart(2, "0")}</span>
        <span className="comic-slide-count">
          {SLIDE_COUNT_ICON}
          6 slides
        </span>
        {isNew ? (
          <div className="comic-new-ribbon">
            <span>New</span>
          </div>
        ) : null}
      </div>
      <div className="comic-card-info">
        <h3>{comic.title}</h3>
        <div className="comic-card-date">{formatDate(comic.date)}</div>
        <span className="comic-tag">{tag}</span>
        {series ? (
          <span className="comic-series-badge">
            {SERIES_ICON}
            {series}
          </span>
        ) : null}
        <button
          className="comic-share-btn"
          data-share-slug={comic.slug}
          data-share-title={comic.title}
          aria-label="Share"
        >
          {SHARE_ICON}
        </button>
      </div>
    </div>
  );
}

function PullQuote({ quote }: { quote: { text: string; cite: string } }) {
  return (
    <div className="newspaper-pullquote scroll-reveal">
      <blockquote>{quote.text}</blockquote>
      <cite>{quote.cite}</cite>
    </div>
  );
}

export default function ComicsGrid() {
  const total = COMICS_MANIFEST.length;
  const [hero, ...rest] = COMICS_MANIFEST as Comic[];

  // Build the grid children — pull-quotes are inserted after every 6 cards,
  // matching the original client-side logic exactly.
  const items: React.ReactNode[] = [];
  let pqIdx = 0;
  rest.forEach((comic, i) => {
    if (i > 0 && i % 6 === 0 && pqIdx < PULL_QUOTES.length) {
      items.push(<PullQuote key={`pq-${pqIdx}`} quote={PULL_QUOTES[pqIdx]} />);
      pqIdx++;
    }
    items.push(<Card key={comic.slug} comic={comic} index={i} totalCount={total} />);
  });

  return (
    <>
      <header className="newspaper-masthead">
        <div className="container" style={{ maxWidth: "960px" }}>
          <div className="masthead-rule" />
          <div className="masthead-rule-thin" />
          <h1 className="masthead-title">The GainFrame Gazette</h1>
          <p className="masthead-subtitle">&ldquo;All the gains that are fit to print.&rdquo;</p>
          <div className="masthead-dateline">
            <span>Science-Backed</span>
            <span className="dateline-diamond" />
            <span id="comicsCountLabel">
              {total} Issue{total !== 1 ? "s" : ""}
            </span>
            <span className="dateline-diamond" />
            <span>Est. 2026</span>
          </div>
        </div>
      </header>

      <section className="newspaper-gallery">
        <div className="section-headline">
          <h2>Latest Issues</h2>
          <span className="section-count" id="sectionCount">
            {total} comic{total !== 1 ? "s" : ""} published
          </span>
        </div>
        <div className="filter-bar" id="filterBar">
          {FILTERS.map((tag) => (
            <button
              key={tag}
              className={`filter-pill${tag === "All" ? " active" : ""}`}
              data-filter={tag}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="comics-mascot-peek" aria-hidden="true">
          <img
            src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp"
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>

        <Hero comic={hero} totalCount={total} />

        <div className="newspaper-grid" id="comicsGrid">
          {items}
        </div>

        <div className="newspaper-endmark">
          <div className="endmark-rule" />
          <div className="endmark-symbol">— ◆ —</div>
        </div>
      </section>
    </>
  );
}
