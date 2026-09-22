import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { SITE } from "@/lib/site";
import FeatureIcon, { AppleMark, type FeatureIconName } from "./FeatureIcon";
import DrawnScene from "./DrawnScene";
import FoodChatPreview from "./FoodChatPreview";
import styles from "./page.module.css";
import chatGPTSetup from "@/public/config/chatgpt-setup-v1.json";

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
    id: "photos", number: "01", title: "Your camera roll already has a story.", description: "Bring your older gym photos into one timeline, then make every new check-in easier to compare. Find the right pair without hunting through months of photos.",
    features: [
      { icon: "camera", title: "Guided progress photos", text: "Use a reference-photo overlay to repeat your framing and pose, so the next check-in is easier to compare." },
      { icon: "import", title: "Smart Import", text: "Bring in older gym photos in one batch. AI helps classify poses, and you review the selection before saving. Link an album for future imports." },
      { icon: "album", title: "An organized timeline", text: "Keep photos together by date and pose, browse monthly albums, and add weight, workout details, tags, and notes to each check-in." },
    ],
  },
  {
    id: "insights", number: "02", title: "A clearer view of where you’re going.", description: "A single check-in is a starting point. Your history helps you see a direction, choose a focus, and put a picture to the goal you’re working toward.",
    features: [
      { icon: "chart", title: "Trends & report history", text: "Follow weight, estimated body composition, and muscle development across check-ins. Revisit past reports and spot changes over weeks and months." },
      { icon: "future", title: "Future You", text: "Explore an AI illustration of your goal over a 3, 6, or 12 month horizon. Compare it with your starting point and make your goal feel more tangible." },
      { icon: "target", title: "Target Training", text: "Choose muscle groups to focus on, explore exercise recommendations, and return to your photos to see how those areas develop." },
    ],
  },
  {
    id: "daily", number: "03", title: "The little things add up.", description: "A weight log. A workout. A meal. Keep the everyday details close to your photos, so your progress has context beyond how you looked on one particular day.",
    features: [
      { icon: "calendar", title: "Check-ins & reminders", text: "Log a photo or your weight, follow your check-in streak, and choose reminders that fit your routine." },
      { icon: "connections", title: "Health & workout connections", text: "Connect Apple Health, Hevy, or Strava to bring available weight, training, and activity data alongside your progress photos." },
      { icon: "food", title: "Food diary & macro targets", text: "Keep meals, portions, calories, and protein, carb, and fat totals in one diary. Search foods and revisit recent entries. Availability depends on your app version." },
    ],
  },
  {
    id: "sharing", number: "04", title: "Your progress. Your audience.", description: "Keep a quiet record for yourself or turn a milestone into something worth sharing. Choose the photos, the layout, and the details that leave the app.",
    features: [
      { icon: "rewind", title: "Throwbacks & recaps", text: "Revisit earlier check-ins with then-and-now comparisons and monthly progress stories. See the changes that are easy to miss day to day." },
      { icon: "share", title: "Collages & shareable reports", text: "Arrange photos into a collage or export a comparison and Deep Dive report. Choose the layout and details you want to include." },
      { icon: "shield", title: "Photo privacy controls", text: "Blur faces, remove backgrounds, and hide selected metrics on report exports. Choose which integrations to connect and what you share." },
    ],
  },
];

type Screen = { src: string; title: string; alt: string; width: number; height: number };
const chapterMedia: Record<string, { label: string; screens: Screen[]; artwork?: string; artworkLabel?: string; tags: string[] }> = {
  photos: {
    label: "From camera roll to progress history",
    screens: [
      { src: "/assets/shared/smart-import.webp", title: "Smart Import", alt: "Smart Import classifying a batch of progress photos by pose.", width: 1290, height: 2796 },
      { src: "/assets/GF-Promo/timeline-quarter.webp", title: "Your photo timeline", alt: "GainFrame photo history grouped into quarters, with photos, weight, and estimated body fat.", width: 1290, height: 2796 },
    ],
    tags: ["Pose matching", "Batch import", "Monthly albums"],
  },
  insights: {
    label: "See your trend. Visualize your goal.",
    screens: [
      { src: "/app-screenshots/1.21/weight-chart.webp", title: "Weight trends", alt: "Weight history with a goal, milestones, and a 90-day trend chart.", width: 1290, height: 2796 },
      { src: "/app-screenshots/1.21/future-you.webp", title: "Future You illustration", alt: "Future You comparing a current photo with a clearly labeled illustrative six-month physique scenario.", width: 1320, height: 2868 },
    ],
    tags: ["Report history", "Goal illustrations", "Training focus"],
  },
  daily: {
    label: "A routine you can come back to",
    screens: [{ src: "/app-screenshots/1.21/check-ins.webp", title: "Check-ins & consistency", alt: "GainFrame Check-In Streak showing a weekly check-in and today's weight log.", width: 1290, height: 2796 }],
    artwork: "nutrition", artworkLabel: "Food, alongside your fitness.",
    tags: ["Apple Health", "Hevy", "Strava"],
  },
  sharing: {
    label: "Save the moment. Choose what to share.",
    screens: [
      { src: "/app-screenshots/1.21/throwback.webp", title: "Then & now", alt: "A GainFrame Throwback with two progress photos a month apart and a Preview and Share button.", width: 1290, height: 2796 },
      { src: "/assets/before-after/export.webp", title: "A report worth keeping", alt: "An exported GainFrame comparison report with progress photos, estimated body composition, and training recommendations.", width: 780, height: 1775 },
    ],
    tags: ["Face blur", "Export controls", "Photo collages"],
  },
};

function DownloadButton({ content }: { content: string }) {
  return <PlatformDownloadLink className={styles.primary} source="features" content={content} campaign="web-features" androidLabel="Explore the free tools"><AppleMark /><span><small>Download for iPhone</small><strong>Get GainFrame</strong></span></PlatformDownloadLink>;
}

function ChapterVisual({ id }: { id: string }) {
  const media = chapterMedia[id];
  return <div className={styles.chapterVisual}>
    <div className={styles.stageHeading}><span>{media.label}</span><FeatureIcon name="gallery" /></div>
    <div className={styles.screenPair}>
      {media.screens.map((screen) => <figure className={styles.screenCard} key={screen.src}>
        <a href={screen.src} target="_blank" rel="noopener" aria-label={`Enlarge ${screen.title} screenshot (opens in a new tab)`}><Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes="(max-width: 650px) 40vw, (max-width: 1000px) 34vw, 240px" /><span className={styles.zoom}><FeatureIcon name="expand" /></span></a>
        <figcaption>{screen.title}</figcaption>
      </figure>)}
      {media.artwork && <div className={styles.artworkPanel}><DrawnScene kind="nutrition" compact /><p>{media.artworkLabel}</p><span>Meals, portions, and daily macros in one diary.</span></div>}
    </div>
    <div className={styles.stageTags}>{media.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
  </div>;
}

export default function FeaturesPage() {
  return (
    <div className={styles.page}>
      <link rel="stylesheet" href="/styles-clean.css" />
      <link rel="stylesheet" href="/styles.css" />
      <Nav />
      <main className={styles.main}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>The GainFrame toolkit</p>
          <h1>Your progress.<br /><span>The whole picture.</span></h1>
          <p>Track your progress photos, understand what’s changing, and get help with what comes next. Your training, nutrition, and goals belong in the same picture.</p>
          <div className={styles.actions}>
            <DownloadButton content="hero_download" />
            <a className={styles.explore} href="#core-features"><span className={styles.exploreIcon}><FeatureIcon name="gallery" /></span>Explore features</a>
          </div>
          <p className={styles.heroNote}>Built for iPhone. Built around your check-ins.</p>
          </div>
          <DrawnScene kind="progress" />
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
              <a className={styles.screenshot} href={feature.image} target="_blank" rel="noopener" aria-label={`Enlarge ${feature.name} screenshot (opens in a new tab)`}><Image src={feature.image} width={feature.width} height={feature.height} alt={feature.alt} sizes="(max-width: 650px) 78vw, (max-width: 1000px) 28vw, 300px" /><span className={styles.zoom}><FeatureIcon name="expand" /></span></a>
            </article>)}
          </div>
          <p className={styles.caption}>Screens from the app. AI body-composition numbers are estimates; use consistent check-ins to follow a trend.</p>
        </section>

        {featureGroups.map((group, index) => <section id={group.id} className={`${styles.featureGroup} ${index % 2 ? styles.reverse : ""}`} aria-labelledby={`${group.id}-title`} key={group.id}>
          <div className={styles.chapterCopy}>
            <div className={styles.groupHeading}><span className={styles.number}>Chapter {group.number}</span><h2 id={`${group.id}-title`}>{group.title}</h2><p>{group.description}</p></div>
            <div className={styles.grid}>{group.features.map((feature) => <article className={styles.feature} key={feature.title}>
              <span className={styles.iconSurface}><FeatureIcon name={feature.icon} /></span><div><h3>{feature.title}</h3><p>{feature.text}</p></div>
            </article>)}</div>
          </div>
          <ChapterVisual id={group.id} />
        </section>)}
        <p className={styles.availability}>Some features require GainFrame Pro. Future You images illustrate possible goals and are not predictions of results.</p>

        <section id="food-chat" className={styles.food} aria-labelledby="food-title">
          <div className={styles.foodCopy}>
            <p className={styles.eyebrow}>Food chat + ChatGPT</p>
            <h2 id="food-title">Say what you ate.<br />Get on with your day.</h2>
            <p>Log food in a conversation inside GainFrame, or connect your food diary to ChatGPT. A clear request saves your meal, with a compact receipt you can correct afterward.</p>
            <ul><li>Food illustrations, portions, calories, and macros together.</li><li>Say “make that two” to change a portion.</li><li>Ask what you logged and see your diary totals.</li></ul>
            <p className={styles.note}><strong>{chatGPTSetup.availability.title}.</strong> {chatGPTSetup.availability.message}</p>
            <a className={styles.textLink} href="#connect">How the connection works <FeatureIcon name="chevron" /></a>
          </div>
          <FoodChatPreview />
        </section>

        <section id="connect" className={styles.setup} aria-labelledby="connect-title">
          <div><p className={styles.eyebrow}>GainFrame + ChatGPT</p><h2 id="connect-title">Connect once.<br />Keep control.</h2><p>Your diary stays on your device until you choose to sync it. The connector can read and log food only after you connect your account.</p></div>
          <ol>
            {chatGPTSetup.steps.map((step, index) => <li key={index}><strong>{step.title}</strong>{step.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</li>)}
          </ol>
          {chatGPTSetup.availability.linkURL.startsWith("https://chatgpt.com/") && <a className={styles.textLink} href={chatGPTSetup.availability.linkURL}>{chatGPTSetup.availability.linkTitle} <FeatureIcon name="chevron" /></a>}
        </section>

        <section className={styles.questions} aria-label="Food chat questions">
          <details><summary>What information is shared?</summary><p>With your opt-in, GainFrame syncs food names, portions, calories, macros, meal labels, and logging times. The connector does not access progress photos, body measurements, workouts, or Apple Health records. <Link href="/privacy/#connected-diary">Read the connected-diary privacy details.</Link> See the <Link href="/connected-diary-terms/">Connected Diary Terms of Service</Link> for how the service works.</p></details>
          <details><summary>Can I change a meal after logging it?</summary><p>Yes. Ask to change the food or portion, or edit the entry in GainFrame. Changes sync when the app is active or you choose Sync now.</p></details>
          <details><summary>Can I disconnect later?</summary><p>Yes. Turn off Connected diary in GainFrame to stop syncing and revoke connector access. Turning it off does not erase the stored cloud copy; contact support to request deletion.</p></details>
          <details><summary>How accurate are the nutrition numbers?</summary><p>Nutrition depends on the food, brand, portion, and preparation. ChatGPT may estimate values. Check the receipt and correct details when you have better information.</p></details>
        </section>

        <div className={styles.closing}><p className={styles.eyebrow}>Make your next check-in count</p><h2>The work is yours.<br /><span>Keep a record of it.</span></h2><p>Your photos, your progress, and a clearer idea of what comes next.</p><div className={styles.actions}><DownloadButton content="footer_download" /><a className={styles.explore} href={`mailto:${SITE.contactEmail}`}>Ask a question <FeatureIcon name="chevron" /></a></div></div>
      </main>
      <Footer />
    </div>
  );
}
