import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { SITE } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Features — Progress photos, Coach, and food logging",
  description: "Track your progress photos, compare changes, and talk with Coach. Explore GainFrame’s upcoming food chat and opt-in ChatGPT diary connection.",
  alternates: { canonical: "/features/" },
  openGraph: { title: "Your progress, in one place — GainFrame", url: `${SITE.url}/features/`, images: [{ url: SITE.ogImage }] },
};

const features = [
  { number: "01", title: "A home for your progress photos", text: "Keep check-ins together, bring in older photos, and follow the work over time.", detail: "Your camera roll, with a purpose." },
  { number: "02", title: "See what changed", text: "Compare photos side by side and explore AI estimates of body composition and muscle development.", detail: "Estimates that help you follow a trend." },
  { number: "03", title: "Ask your Coach", text: "Talk through your progress and get context for the changes you see in your photos.", detail: "A conversation built around your check-ins." },
  { number: "04", title: "Keep the full picture", text: "Bring weight and workout context alongside your photos with optional Apple Health and Hevy connections.", detail: "More context for the same hard work." },
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
          <p>Photos, useful context, and fewer things to keep in your head. Built for the work you put in between check-ins.</p>
          <div className={styles.actions}>
            <PlatformDownloadLink className={styles.primary} source="features" content="hero_download" campaign="web-features" androidLabel="Try a free tool">Get GainFrame for iPhone</PlatformDownloadLink>
            <a href="#food-chat">Explore food chat <span aria-hidden="true">↗</span></a>
          </div>
        </header>

        <section className={styles.grid} aria-label="GainFrame features">
          {features.map((feature) => <article className={styles.feature} key={feature.number}>
            <span className={styles.number}>{feature.number}</span>
            <h2>{feature.title}</h2><p>{feature.text}</p><small>{feature.detail}</small>
          </article>)}
        </section>

        <section id="food-chat" className={styles.food} aria-labelledby="food-title">
          <div className={styles.foodCopy}>
            <p className={styles.eyebrow}>Coming next · Food chat beta</p>
            <h2 id="food-title">Say what you ate.<br />Get on with your day.</h2>
            <p>Log food in a conversation inside GainFrame, or connect your food diary to ChatGPT. A clear request saves your meal, with a compact receipt you can correct afterward.</p>
            <ul><li>Food illustrations, portions, calories, and macros together.</li><li>Say “make that two” to change a portion.</li><li>Ask what you logged and see your diary totals.</li></ul>
            <p className={styles.note}>In development. ChatGPT directory registration is pending, and the food-chat update is not yet in the public iPhone release.</p>
            <a className={styles.textLink} href="#connect">How the connection works <span aria-hidden="true">↓</span></a>
          </div>
          <figure className={styles.demo} aria-label="Illustrative food chat preview with sample foods">
            <div className={styles.chatLabel}><span>GainFrame</span><span>Food chat</span></div>
            <p className={styles.bubble}>I had two eggs and a slice of toast for breakfast.</p>
            <div className={styles.receipt}>
              <div className={styles.receiptHeader}><strong>Breakfast logged</strong><span>✓ Saved</span></div>
              <div className={styles.foodRow}><span className={styles.artwork} aria-hidden="true">🍳</span><div><strong>Eggs</strong><small>2 large eggs</small></div><span>144 <small>kcal</small></span></div>
              <div className={styles.foodRow}><span className={styles.artwork} aria-hidden="true">🍞</span><div><strong>Toast</strong><small>1 slice</small></div><span>120 <small>kcal</small></span></div>
              <div className={styles.total}><strong>264 <small>kcal</small></strong><span>16g protein · 24g carbs · 11g fat</span></div>
            </div>
            <p className={styles.followup}>Actually, make that two slices of toast.</p>
            <figcaption>Example conversation and estimated nutrition. Food artwork is illustrative.</figcaption>
          </figure>
        </section>

        <section id="connect" className={styles.setup} aria-labelledby="connect-title">
          <div><p className={styles.eyebrow}>GainFrame + ChatGPT</p><h2 id="connect-title">Connect once.<br />Keep control.</h2><p>Your diary stays on your device until you choose to sync it. The connector can read and log food only after you connect your account.</p></div>
          <ol>
            <li><strong>Enable Connected diary in GainFrame.</strong><p>In a supported beta build, open Settings → Connected diary and sign in. Choose whether to sync your food entries.</p></li>
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

        <div className={styles.closing}><h2>One place to follow your progress.</h2><p>Explore GainFrame today. For food-chat beta questions, <a href={`mailto:${SITE.contactEmail}?subject=GainFrame%20food%20chat`}>contact Michael</a>.</p></div>
      </main>
      <Footer />
    </div>
  );
}
