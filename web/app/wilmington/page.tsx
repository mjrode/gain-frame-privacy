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
const pageFontClass = geist.className;

const PAGE_PATH = "/wilmington/";
const PAGE_URL = `${SITE.url}${PAGE_PATH}`;

const REDEEM_URL =
  "https://apps.apple.com/redeem?ctx=offercodes&id=6759252082&code=CASHSTASH";
const CAMPAIGN_URL =
  "https://apps.apple.com/app/apple-store/id6759252082?pt=128456047&ct=cashstash-wilm&mt=8";

export const metadata: Metadata = {
  title: {
    absolute: "July 4th CashStash Special — 50% Off GainFrame Pro | Wilmington, NC",
  },
  description:
    "GainFrame is built in Wilmington. While you hunt the CashStash drop, grab 50% off your first year of Pro with code CASHSTASH — AI body fat estimates, physique scores, and a coach on your progress pics.",
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "July 4th CashStash Special — 50% Off GainFrame Pro",
    description:
      "Code CASHSTASH: 50% off your first year of GainFrame Pro. Built in Wilmington, NC.",
    type: "website",
    url: PAGE_URL,
    siteName: "GainFrame",
    images: [{ url: `${SITE.url}/assets/promo/cashstash-hero.webp` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "July 4th CashStash Special — 50% Off GainFrame Pro",
    description:
      "Code CASHSTASH: 50% off your first year of GainFrame Pro. Built in Wilmington, NC.",
    images: [`${SITE.url}/assets/promo/cashstash-hero.webp`],
  },
};

const FEATURES = [
  {
    title: "Unlimited AI photo analysis",
    detail: "Body fat %, physique score, and FFMI from every check-in.",
  },
  {
    title: "Coach chat on your data",
    detail:
      "Ask why your score moved — answers built from your photos, weight, and workouts.",
  },
  {
    title: "Deep Dive reports",
    detail: "Muscle-group reads and what-to-do-next, on demand.",
  },
  {
    title: "Trends & insights",
    detail: "See what's actually changing across weeks, not vibes.",
  },
];

export default function WilmingtonPromoPage() {
  return (
    <div className={pageFontClass}>
      <link rel="stylesheet" href="/styles-clean.css" />
      <ScrollReveal />
      <Nav />
      <main>
        <style>{`
          .cs-wrap { width: min(1120px, 100%); margin: 0 auto; padding: 48px 20px 0; }
          .cs-head { text-align: center; }
          .cs-head h1 { font-size: clamp(34px, 5vw, 54px); font-weight: 800; letter-spacing: -0.06em; color: var(--ink); margin: 0 0 14px; }
          .cs-head h1 em { font-style: normal; color: var(--red); }
          .cs-head p { color: var(--muted); font-size: 17px; font-weight: 600; letter-spacing: -0.04em; line-height: 1.4; max-width: 560px; margin: 0 auto; }
          .cs-hero { width: min(980px, 100%); margin: 34px auto 0; border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-soft); background: #F5F0EB; }
          .cs-hero img { display: block; width: 100%; height: auto; }
          .cs-offer { width: min(980px, 100%); margin: 26px auto 0; background: var(--paper); border: 1px solid var(--line-strong); border-radius: var(--radius); box-shadow: var(--shadow-soft); padding: clamp(24px, 4vw, 40px); display: flex; flex-wrap: wrap; gap: 22px; align-items: center; justify-content: space-between; }
          .cs-offer-copy h2 { font-size: clamp(22px, 3vw, 30px); font-weight: 800; letter-spacing: -0.06em; color: var(--ink); margin: 0 0 8px; }
          .cs-price { color: var(--muted); font-size: 15px; font-weight: 600; letter-spacing: -0.04em; }
          .cs-price s { color: var(--faint); }
          .cs-code { font-family: var(--mono); font-size: 13px; font-weight: 600; color: #4d4d4b; background: var(--paper-soft); border: 1px dashed var(--line-strong); border-radius: 999px; padding: 8px 16px; display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; }
          .cs-code b { color: var(--ink); letter-spacing: 0.08em; }
          .cs-actions { display: flex; gap: 12px; flex-wrap: wrap; }
          .cs-features { width: min(980px, 100%); margin: 44px auto 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
          .cs-feature { background: var(--paper); border: 1px solid var(--line); border-radius: 14px; padding: 20px 18px 24px; box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset; }
          .cs-feature h3 { font-size: 19px; font-weight: 800; letter-spacing: -0.05em; color: var(--ink); margin: 0 0 8px; }
          .cs-feature p { color: var(--muted); font-size: 15px; font-weight: 600; letter-spacing: -0.04em; line-height: 1.3; margin: 0; }
          .cs-hunt { width: min(980px, 100%); margin: 40px auto 0; text-align: center; color: var(--muted); font-size: 15px; font-weight: 600; letter-spacing: -0.04em; line-height: 1.5; }
          .cs-hunt a { color: var(--ink); }
          .cs-final { text-align: center; padding: 70px 20px 80px; }
          .cs-final h2 { font-size: clamp(26px, 4vw, 38px); font-weight: 800; letter-spacing: -0.06em; color: var(--ink); margin: 0 0 12px; }
          .cs-final p { color: var(--muted); font-size: 16px; font-weight: 600; letter-spacing: -0.04em; max-width: 480px; margin: 0 auto 26px; line-height: 1.4; }
          .cs-fine { color: var(--faint); font-size: 12.5px; font-weight: 600; letter-spacing: -0.03em; margin-top: 22px; }
        `}</style>

        <div className="cs-wrap">
          <div className="cs-head reveal">
            <span className="eyebrow">
              <span></span>July 4th CashStash special · Wilmington, NC
            </span>
            <h1>
              Hunt cash. <em>Track gains.</em>
            </h1>
            <p>
              GainFrame is made here in Wilmington. Take a gym selfie and it
              estimates your body fat %, scores your physique, and shows you
              whether anything&apos;s actually changing.
            </p>
          </div>

          <div className="cs-hero reveal">
            <img
              src="/assets/promo/cashstash-hero.webp"
              alt="GainFrame Guy in a coach's cap coaching up a flexing cartoon seahawk mascot on a Wilmington beach with July 4th fireworks"
              width={1376}
              height={768}
            />
          </div>

          <div className="cs-offer reveal">
            <div className="cs-offer-copy">
              <h2>50% off your first year of Pro</h2>
              <div className="cs-price">
                <s>$39.99</s> $19.99 for one year · new members · ends July 17
              </div>
              <div className="cs-code">
                code <b>CASHSTASH</b>
              </div>
            </div>
            <div className="cs-actions">
              <a
                className="btn btn-dark"
                href={REDEEM_URL}
                data-cta-source="/wilmington"
                data-cta-content="redeem_offer"
              >
                Claim 50% off <span aria-hidden="true">-&gt;</span>
              </a>
              <a
                className="btn btn-light"
                href={CAMPAIGN_URL}
                data-cta-source="/wilmington"
                data-cta-content="download_free"
              >
                Download free
              </a>
            </div>
          </div>

          <div className="cs-features">
            {FEATURES.map((f) => (
              <div className="cs-feature reveal" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.detail}</p>
              </div>
            ))}
          </div>

          <p className="cs-hunt reveal">
            Hunting the real cash? Clues are posted by{" "}
            <a
              href="https://www.tiktok.com/@cashstashwilmington"
              target="_blank"
              rel="noopener noreferrer"
            >
              @cashstashwilmington
            </a>{" "}
            — and the next clue drops on GainFrame&apos;s TikTok and Instagram.
            Good luck out there.
          </p>
        </div>

        <section className="cs-final reveal">
          <h2>Take a photo. Ask Coach what changed.</h2>
          <p>
            Download free, get your first AI analysis, and use code CASHSTASH
            if you want the full year of Pro at half price.
          </p>
          <a
            className="btn btn-dark"
            href={CAMPAIGN_URL}
            data-cta-source="/wilmington"
            data-cta-content="closing_download"
          >
            Download on App Store <span aria-hidden="true">-&gt;</span>
          </a>
          <div className="cs-fine">
            Offer valid for new GainFrame Pro subscribers in the US through
            July 17, 2026, while codes last. Redeemed through the App Store.
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
