import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { SITE } from "@/lib/site";
import FeatureIcon, { FoodIllustration, type FeatureIconName } from "./FeatureIcon";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Features — Progress photos, AI analysis, Coach, and more",
  description: "Explore GainFrame: progress photos, Smart Import, side-by-side comparisons, Deep Dive body analysis, AI Coach, Future You, nutrition, integrations, and private sharing.",
  alternates: { canonical: "/features/" },
  openGraph: { title: "Your progress, in one place — GainFrame", url: `${SITE.url}/features/`, images: [{ url: SITE.ogImage }] },
};

const highlights = [
  { name: "Compare", title: "See the work paying off.", text: "Line up two check-ins side by side or use the swipe slider. Match your pose, adjust alignment, and filter your history to find a useful comparison.", image: "/app-screenshots/1.21/compare.webp", width: 1320, height: 2868, alt: "GainFrame Compare showing two aligned progress photos with dates, estimated body fat, and photo adjustment controls." },
  { name: "Deep Dive", title: "Go beyond the mirror.", text: "Explore estimated body fat, lean mass, FFMI, and 12 muscle groups. See strengths, areas to focus on, and how your physique is changing over time.", image: "/app-screenshots/1.21/muscle-map.webp", width: 1320, height: 2868, alt: "GainFrame Deep Dive showing before and after muscle maps and a muscle-group comparison chart." },
  { name: "AI Coach", title: "An answer with context.", text: "Ask about your progress, training, or next step. Coach draws on your check-ins, body metrics, and connected activity when those sources are available.", image: "/assets/shared/coach-goal-progress.webp", width: 860, height: 1864, alt: "GainFrame Coach answering a goal progress question using body metrics and a weight trend chart." },
];

const featureGroups: { id: string; number: string; title: string; description: string; features: { icon: FeatureIconName; title: string; text: string }[] }[] = [
  {
    id: "photos", number: "01", title: "Build your photo history.", description: "Start where you are. Bring the earlier chapters with you.",
    features: [
      { icon: "camera", title: "Guided progress photos", text: "Use a reference-photo overlay to repeat your framing and pose, so the next check-in is easier to compare." },
      { icon: "import", title: "Smart Import", text: "Bring in older gym photos in one batch. AI helps classify poses, and you review the selection before saving. Link an album for future imports." },
      { icon: "album", title: "An organized timeline", text: "Keep photos together by date and pose, browse monthly albums, and add weight, workout details, tags, and notes to each check-in." },
    ],
  },
  {
    id: "insights", number: "02", title: "Understand your direction.", description: "Look past one photo and make the next step more concrete.",
    features: [
      { icon: "chart", title: "Trends & report history", text: "Follow weight, estimated body composition, and muscle development across check-ins. Revisit past reports and spot changes over weeks and months." },
      { icon: "future", title: "Future You", text: "Explore an AI illustration of your goal over a 3, 6, or 12 month horizon. Compare it with your starting point and make your goal feel more tangible." },
      { icon: "target", title: "Target Training", text: "Choose muscle groups to focus on, explore exercise recommendations, and return to your photos to see how those areas develop." },
    ],
  },
  {
    id: "daily", number: "03", title: "Keep the daily pieces together.", description: "Your photos tell more of the story with the right context.",
    features: [
      { icon: "calendar", title: "Check-ins & reminders", text: "Log a photo or your weight, follow your check-in streak, and choose reminders that fit your routine." },
      { icon: "connections", title: "Health & workout connections", text: "Connect Apple Health, Hevy, or Strava to bring available weight, training, and activity data alongside your progress photos." },
      { icon: "food", title: "Food diary & macro targets", text: "Keep meals, portions, calories, and protein, carb, and fat totals in one diary. Search foods and revisit recent entries. Availability depends on your app version." },
    ],
  },
  {
    id: "sharing", number: "04", title: "Look back. Share on your terms.", description: "Keep a record for yourself, or share a milestone with someone else.",
    features: [
      { icon: "rewind", title: "Throwbacks & recaps", text: "Revisit earlier check-ins with then-and-now comparisons and monthly progress stories. See the changes that are easy to miss day to day." },
      { icon: "share", title: "Collages & shareable reports", text: "Arrange photos into a collage or export a comparison and Deep Dive report. Choose the layout and details you want to include." },
      { icon: "shield", title: "Photo privacy controls", text: "Blur faces, remove backgrounds, and hide selected metrics on report exports. Choose which integrations to connect and what you share." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className={styles.page}>
      <link rel="stylesheet" href="/styles-clean.css" />
      <link rel="stylesheet" href="/styles.css" />
      <Nav />
      <main className={styles.main}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>The GainFrame toolkit</p>
          <h1>Your progress.<br /><span>The whole picture.</span></h1>
          <p>Track your progress photos, understand what’s changing, and get help with what comes next. Your training, nutrition, and goals belong in the same picture.</p>
          <div className={styles.actions}>
            <PlatformDownloadLink className={styles.primary} source="features" content="hero_download" campaign="web-features" androidLabel="Try a free tool">Get GainFrame for iPhone</PlatformDownloadLink>
            <a href="#core-features">Explore the features <FeatureIcon name="arrow" /></a>
          </div>
        </header>

        <nav className={styles.sectionNav} aria-label="Feature categories">
          <a href="#core-features">Compare & Coach</a>
          {featureGroups.map((group) => <a href={`#${group.id}`} key={group.id}>{({ photos: "Photos", insights: "Insights", daily: "Daily tracking", sharing: "Sharing & privacy" } as Record<string, string>)[group.id]}</a>)}
          <a href="#food-chat">Food chat <span>Coming next</span></a>
        </nav>

        <section id="core-features" className={styles.highlights} aria-labelledby="core-title">
          <div className={styles.sectionHeading}><p className={styles.eyebrow}>At the heart of GainFrame</p><h2 id="core-title">The photos. The changes. The next step.</h2></div>
          <div className={styles.highlightGrid}>
            {highlights.map((feature) => <article className={styles.highlight} key={feature.name}>
              <div className={styles.highlightCopy}><p className={styles.eyebrow}>{feature.name}</p><h3>{feature.title}</h3><p>{feature.text}</p></div>
              <div className={styles.screenshot}><Image src={feature.image} width={feature.width} height={feature.height} alt={feature.alt} sizes="(max-width: 650px) 78vw, (max-width: 1000px) 28vw, 300px" /></div>
            </article>)}
          </div>
          <p className={styles.caption}>Screens from the app. AI body-composition numbers are estimates; use consistent check-ins to follow a trend.</p>
        </section>

        {featureGroups.map((group) => <section id={group.id} className={styles.featureGroup} aria-labelledby={`${group.id}-title`} key={group.id}>
          <div className={styles.groupHeading}><span className={styles.number}>{group.number}</span><div><h2 id={`${group.id}-title`}>{group.title}</h2><p>{group.description}</p></div></div>
          <div className={styles.grid}>{group.features.map((feature) => <article className={styles.feature} key={feature.title}>
            <FeatureIcon name={feature.icon} className={styles.featureIcon} /><h3>{feature.title}</h3><p>{feature.text}</p>
          </article>)}</div>
        </section>)}
        <p className={styles.availability}>Some features require GainFrame Pro. Future You images illustrate possible goals and are not predictions of results.</p>

        <section id="food-chat" className={styles.food} aria-labelledby="food-title">
          <div className={styles.foodCopy}>
            <p className={styles.eyebrow}>Coming next · Food chat beta</p>
            <h2 id="food-title">Say what you ate.<br />Get on with your day.</h2>
            <p>Log food in a conversation inside GainFrame, or connect your food diary to ChatGPT. A clear request saves your meal, with a compact receipt you can correct afterward.</p>
            <ul><li>Food illustrations, portions, calories, and macros together.</li><li>Say “make that two” to change a portion.</li><li>Ask what you logged and see your diary totals.</li></ul>
            <p className={styles.note}>In development. ChatGPT directory registration is pending, and the food-chat update is not yet in the public iPhone release.</p>
            <a className={styles.textLink} href="#connect">How the connection works <FeatureIcon name="arrow" /></a>
          </div>
          <figure className={styles.demo} aria-label="Illustrative food chat preview with sample foods">
            <div className={styles.chatLabel}><span>GainFrame</span><span>Food chat</span></div>
            <p className={styles.bubble}>I had two eggs and a slice of toast for breakfast.</p>
            <div className={styles.receipt}>
              <div className={styles.receiptHeader}><strong>Breakfast logged</strong><span><FeatureIcon name="check" /> Saved</span></div>
              <div className={styles.foodRow}><span className={styles.artwork}><FoodIllustration food="eggs" /></span><div><strong>Eggs</strong><small>2 large eggs</small></div><span>144 <small>kcal</small></span></div>
              <div className={styles.foodRow}><span className={styles.artwork}><FoodIllustration food="toast" /></span><div><strong>Toast</strong><small>1 slice</small></div><span>120 <small>kcal</small></span></div>
              <div className={styles.total}><strong>264 <small>kcal</small></strong><span>16g protein · 24g carbs · 11g fat</span></div>
            </div>
            <p className={styles.followup}>Actually, make that two slices of toast.</p>
            <figcaption>Example conversation and estimated nutrition. Food artwork is illustrative.</figcaption>
          </figure>
        </section>

        <section id="connect" className={styles.setup} aria-labelledby="connect-title">
          <div><p className={styles.eyebrow}>GainFrame + ChatGPT</p><h2 id="connect-title">Connect once.<br />Keep control.</h2><p>Your diary stays on your device until you choose to sync it. The connector can read and log food only after you connect your account.</p></div>
          <ol>
            <li><strong>Enable Connected diary in GainFrame.</strong><p>In a supported beta build, open Connected diary in Settings and sign in. Choose whether to sync your food entries.</p></li>
            <li><strong>Link GainFrame from ChatGPT.</strong><p>When the connector is available, open it in ChatGPT and approve the connection in GainFrame. On desktop, use the connection code shown on the linking page.</p></li>
            <li><strong>Describe your meal, then edit if needed.</strong><p>Try “Log two eggs for breakfast” or “What have I logged today?” ChatGPT may show its own tool-permission prompts.</p></li>
          </ol>
        </section>

        <section className={styles.questions} aria-label="Food chat questions">
          <details><summary>What information is shared?</summary><p>With your opt-in, GainFrame syncs food names, portions, calories, macros, meal labels, and logging times. The connector does not access progress photos, body measurements, workouts, or Apple Health records. <Link href="/privacy/#connected-diary">Read the connected-diary privacy details.</Link></p></details>
          <details><summary>Can I change a meal after logging it?</summary><p>Yes. Ask to change the food or portion, or edit the entry in GainFrame. Changes sync when the app is active or you choose Sync now.</p></details>
          <details><summary>Can I disconnect later?</summary><p>Yes. Turn off Connected diary in GainFrame to stop syncing and revoke connector access. Turning it off does not erase the stored cloud copy; contact support to request deletion.</p></details>
          <details><summary>How accurate are the nutrition numbers?</summary><p>Nutrition depends on the food, brand, portion, and preparation. ChatGPT may estimate values. Check the receipt and correct details when you have better information.</p></details>
        </section>

        <div className={styles.closing}><h2>Start with your next check-in.</h2><p>Your photos, your progress, and a clearer idea of what comes next.</p><div className={styles.actions}><PlatformDownloadLink className={styles.primary} source="features" content="footer_download" campaign="web-features" androidLabel="Try a free tool">Get GainFrame for iPhone</PlatformDownloadLink><a href={`mailto:${SITE.contactEmail}`}>Ask a question <FeatureIcon name="arrow" /></a></div></div>
      </main>
      <Footer />
    </div>
  );
}
