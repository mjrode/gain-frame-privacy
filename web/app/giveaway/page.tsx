import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { SITE } from "@/lib/site";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const PAGE_PATH = "/giveaway/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;

const CAMPAIGN_URL =
  "https://apps.apple.com/app/apple-store/id6759252082?pt=128456047&ct=giveaway-2026-07&mt=8";

export const metadata: Metadata = {
  title: {
    absolute: "GainFrame Transformation Challenge — Win $300 | #GainFrameChallenge",
  },
  description:
    "Post your fitness transformation with #GainFrameChallenge and win up to $300 plus a year of GainFrame Pro. Import two old gym pics, get your AI transformation report, post it. Ends July 31.",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "GainFrame Transformation Challenge — Win $300",
    description:
      "Post your transformation with #GainFrameChallenge. $300 / $100 / $50 + a year of Pro for 3 winners. Ends July 31.",
    type: "website",
    url: PAGE_URL,
    siteName: "GainFrame",
    images: [{ url: `${SITE.url}/assets/promo/giveaway-hero.webp` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GainFrame Transformation Challenge — Win $300",
    description:
      "Post your transformation with #GainFrameChallenge. $300 / $100 / $50 + a year of Pro for 3 winners. Ends July 31.",
    images: [`${SITE.url}/assets/promo/giveaway-hero.webp`],
  },
};

const PRIZES = [
  { place: "1st place", cash: "$300", extra: "+ 1 year of Pro" },
  { place: "2nd place", cash: "$100", extra: "+ 1 year of Pro" },
  { place: "3rd place", cash: "$50", extra: "+ 1 year of Pro" },
];

const STEPS = [
  {
    n: "1",
    title: "Get GainFrame (free)",
    detail:
      "Download from the App Store. No purchase required to enter or win.",
  },
  {
    n: "2",
    title: "Add your before & after",
    detail:
      "Already have old gym pics? Import them from your camera roll — GainFrame builds your transformation report in minutes. Or use photos you've already tracked in the app.",
  },
  {
    n: "3",
    title: "Grab your share card",
    detail:
      "Take a screenshot of the Compare screen, or use the share button on your Deep Dive compare. Camera-shy? Use the built-in blur and crop tools first.",
  },
  {
    n: "4",
    title: "Post it",
    detail:
      "Post your card on TikTok or Instagram with #GainFrameChallenge and follow @gainframeapp. That's your entry.",
  },
];

// Entry embeds — add TikTok video URLs here as entries come in and redeploy.
const ENTRY_VIDEOS: string[] = [];

export default function GiveawayPage() {
  return (
    <div className={geist.className}>
      <link rel="stylesheet" href="/styles-clean.css" />
      <ScrollReveal />
      <Nav />
      <main>
        <style>{`
          .gw-wrap { width: min(1120px, 100%); margin: 0 auto; padding: 48px 20px 0; }
          .gw-head { text-align: center; }
          .gw-head h1 { font-size: clamp(34px, 5vw, 54px); font-weight: 800; letter-spacing: -0.06em; color: var(--ink); margin: 0 0 14px; }
          .gw-head h1 em { font-style: normal; color: var(--red); }
          .gw-head p { color: var(--muted); font-size: 17px; font-weight: 600; letter-spacing: -0.04em; line-height: 1.4; max-width: 600px; margin: 0 auto; }
          .gw-head .gw-tag { font-weight: 800; color: var(--ink); }
          .gw-hero { width: min(980px, 100%); margin: 34px auto 0; border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-soft); background: #F5F0EB; }
          .gw-hero img { display: block; width: 100%; height: auto; }
          .gw-prizes { width: min(980px, 100%); margin: 26px auto 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
          .gw-prize { background: var(--paper); border: 1px solid var(--line-strong); border-radius: var(--radius); box-shadow: var(--shadow-soft); padding: 26px 20px; text-align: center; }
          .gw-prize .place { font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
          .gw-prize .cash { font-size: clamp(34px, 4vw, 44px); font-weight: 800; letter-spacing: -0.05em; color: var(--ink); margin: 6px 0 2px; }
          .gw-prize:first-child .cash { color: var(--red); }
          .gw-prize .extra { font-size: 14px; font-weight: 600; color: var(--muted); }
          .gw-steps { width: min(760px, 100%); margin: 48px auto 0; }
          .gw-steps h2, .gw-rules h2 { font-size: clamp(24px, 3.4vw, 32px); font-weight: 800; letter-spacing: -0.06em; color: var(--ink); text-align: center; margin: 0 0 22px; }
          .gw-step { display: flex; gap: 16px; align-items: flex-start; background: var(--paper); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin-bottom: 12px; }
          .gw-step .num { flex: none; width: 34px; height: 34px; border-radius: 999px; background: var(--ink); color: #fff; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; }
          .gw-step h3 { font-size: 17px; font-weight: 800; letter-spacing: -0.04em; color: var(--ink); margin: 4px 0 4px; }
          .gw-step p { color: var(--muted); font-size: 15px; font-weight: 600; letter-spacing: -0.04em; line-height: 1.35; margin: 0; }
          .gw-cta-row { text-align: center; margin: 30px 0 0; }
          .gw-examples { width: min(860px, 100%); margin: 52px auto 0; }
          .gw-examples-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
          .gw-example { text-align: center; }
          .gw-example img { width: 100%; height: auto; border-radius: 18px; border: 1px solid var(--line); box-shadow: var(--shadow-soft); }
          .gw-example figcaption { margin-top: 10px; color: var(--muted); font-size: 14px; font-weight: 600; letter-spacing: -0.03em; }
          .gw-dates { width: min(760px, 100%); margin: 40px auto 0; text-align: center; color: var(--muted); font-size: 15px; font-weight: 600; letter-spacing: -0.04em; line-height: 1.6; }
          .gw-dates b { color: var(--ink); }
          .gw-rules { width: min(760px, 100%); margin: 52px auto 0; padding-bottom: 70px; }
          .gw-rules ul { list-style: none; padding: 0; margin: 0; }
          .gw-rules li { color: var(--muted); font-size: 13.5px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.5; padding: 7px 0; border-bottom: 1px solid var(--line); }
        `}</style>

        <div className="gw-wrap">
          <div className="gw-head reveal">
            <span className="eyebrow">
              <span></span>GainFrame Transformation Challenge · July 2026
            </span>
            <h1>
              Post your progress. <em>Win $300.</em>
            </h1>
            <p>
              Share your fitness transformation on TikTok with{" "}
              <span className="gw-tag">#GainFrameChallenge</span>. Three
              winners get cash and a year of GainFrame Pro. Entry takes about
              five minutes — even if your before photo is from years ago.
            </p>
          </div>

          <div className="gw-hero reveal">
            <img
              src="/assets/promo/giveaway-hero.webp"
              alt="GainFrame Guy celebrating with a trophy and cash next to before and after transformation frames"
              width={1376}
              height={768}
            />
          </div>

          <div className="gw-prizes">
            {PRIZES.map((p) => (
              <div className="gw-prize reveal" key={p.place}>
                <div className="place">{p.place}</div>
                <div className="cash">{p.cash}</div>
                <div className="extra">{p.extra}</div>
              </div>
            ))}
          </div>

          <div
            className="reveal"
            style={{
              width: "min(980px, 100%)",
              margin: "14px auto 0",
              textAlign: "center",
              background: "#171717",
              color: "#fff",
              borderRadius: "14px",
              padding: "14px 20px",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Early-bird: the first 10 entries each get a free month of Pro —
            guaranteed, win or lose.
          </div>

          <section className="gw-steps reveal">
            <h2>How to enter</h2>
            {STEPS.map((s) => (
              <div className="gw-step" key={s.n}>
                <div className="num">{s.n}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.detail}</p>
                </div>
              </div>
            ))}
            <div className="gw-cta-row">
              <a
                className="btn btn-dark"
                href={CAMPAIGN_URL}
                data-cta-source="/giveaway"
                data-cta-content="download_enter"
              >
                Download GainFrame free <span aria-hidden="true">-&gt;</span>
              </a>
            </div>
          </section>

          <section className="gw-examples reveal">
            <h2 style={{ fontSize: "clamp(24px, 3.4vw, 32px)", fontWeight: 800, letterSpacing: "-0.06em", color: "var(--ink)", textAlign: "center", margin: "0 0 22px" }}>
              What an entry looks like
            </h2>
            <div className="gw-examples-grid">
              <figure className="gw-example" style={{ margin: 0 }}>
                <img
                  src="/assets/promo/entry-example-report.webp"
                  alt="Example entry: GainFrame Transformation Report share card showing a before and after with body fat, score, and weight changes"
                  width={1062}
                  height={1715}
                  loading="lazy"
                />
                <figcaption>
                  The Transformation Report share card — from Compare, tap the
                  share button
                </figcaption>
              </figure>
              <figure className="gw-example" style={{ margin: 0 }}>
                <img
                  src="/assets/promo/entry-example-compare.webp"
                  alt="Example entry: screenshot of the GainFrame Compare screen showing two progress photos side by side"
                  width={1290}
                  height={2330}
                  loading="lazy"
                />
                <figcaption>
                  Or just screenshot your Compare screen — that counts too
                </figcaption>
              </figure>
            </div>
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.03em", marginTop: "16px" }}>
              That's the founder's real 8-month transformation, made in the
              app. Yours doesn't have to beat it — it just has to be yours.
            </p>
          </section>

          {ENTRY_VIDEOS.length > 0 && (
            <section className="gw-examples reveal">
              <h2 style={{ fontSize: "clamp(24px, 3.4vw, 32px)", fontWeight: 800, letterSpacing: "-0.06em", color: "var(--ink)", textAlign: "center", margin: "0 0 22px" }}>
                Entries so far
              </h2>
              <div className="gw-examples-grid">
                {ENTRY_VIDEOS.map((url) => (
                  <blockquote
                    key={url}
                    className="tiktok-embed"
                    cite={url}
                    data-video-id={url.split("/video/")[1]?.split("?")[0] ?? ""}
                    style={{ maxWidth: "325px", minWidth: "260px", margin: "0 auto" }}
                  >
                    <section>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        View entry on TikTok
                      </a>
                    </section>
                  </blockquote>
                ))}
              </div>
              <script async src="https://www.tiktok.com/embed.js"></script>
            </section>
          )}

          <div className="gw-dates reveal">
            Entries close <b>July 31, 2026 at 11:59 PM ET</b>. Winners judged
            on transformation quality and story, announced on{" "}
            <b>@gainframeapp</b> by <b>August 3</b>.
          </div>

          <section className="gw-rules reveal">
            <h2>Official rules</h2>
            <ul>
              <li>
                Open to legal residents of the United States, 18 years or
                older. No purchase necessary — the GainFrame app is free to
                download and free to enter with.
              </li>
              <li>
                To enter: follow @gainframeapp on TikTok and publicly post a
                transformation share card exported from the GainFrame app
                (Compare screen or Transformation Report) on TikTok or
                Instagram with the hashtag #GainFrameChallenge between July 5
                and July 31, 2026, 11:59 PM ET. One entry per person. Photos
                must be of you.
              </li>
              <li>
                Early-bird bonus: the first 10 valid entries each receive one
                free month of GainFrame Pro, regardless of contest outcome.
                Limit one per person, delivered within 3 days of entry.
              </li>
              <li>
                This is a judged contest, not a random drawing. Three winners
                are selected by GainFrame based on transformation quality,
                effort, and story. Judging decisions are final. Winners are
                announced on @gainframeapp by August 3, 2026 and contacted via
                TikTok DM; unclaimed prizes after 7 days may be awarded to a
                runner-up.
              </li>
              <li>
                Prizes: 1st $300, 2nd $100, 3rd $50, paid via PayPal or Venmo
                (US accounts), plus 12 months of GainFrame Pro for each
                winner. Taxes, if any, are the winner&apos;s responsibility.
              </li>
              <li>
                By entering, you grant GainFrame permission to repost and use
                your entry (including your images) in GainFrame&apos;s
                marketing, with credit to your account.
              </li>
              <li>
                This contest is not sponsored by, endorsed by, or associated
                with TikTok. By entering you release TikTok from any
                liability. Entries that are misleading, edited to
                misrepresent results, or that violate TikTok&apos;s community
                guidelines are disqualified.
              </li>
              <li>
                Sponsor: GainFrame, Wilmington, NC. Questions:{" "}
                {SITE.contactEmail}.
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
