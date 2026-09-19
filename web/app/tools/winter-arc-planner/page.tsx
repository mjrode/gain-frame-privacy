import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import WinterArcPlannerClient from "./WinterArcPlannerClient";
import styles from "./page.module.css";

const URL = "https://gainframe.app/tools/winter-arc-planner/";
const COVER = "https://gainframe.app/blog/winter-arc-challenge/assets/cover.webp";
const DESCRIPTION = "Build your free 90-day Winter Arc plan with 14 photo check-ins, a printable checklist, and a calendar download. Track your full arc in GainFrame.";

export const metadata: Metadata = {
  title: { absolute: "Free Winter Arc Planner: 90-Day Calendar & Checklist | GainFrame" },
  description: DESCRIPTION,
  alternates: { canonical: "/tools/winter-arc-planner/" },
  openGraph: { title: "Your Winter Arc starts with one photo.", description: DESCRIPTION, url: URL, type: "website", images: [{ url: COVER }] },
  twitter: { card: "summary_large_image", title: "Free 90-Day Winter Arc Planner", description: DESCRIPTION, images: [COVER] },
};

const FAQS = [
  { question: "What is a Winter Arc?", answer: "A Winter Arc is a self-directed period of working on your habits and goals, often during autumn and winter. There is no official rulebook. This planner focuses on one part: documenting your fitness progress with consistent photos over 90 days." },
  { question: "When does a 90-day Winter Arc end?", answer: "Your chosen start is day 1, and the final photo falls 89 days later. Starting October 1, 2026 means finishing December 29, 2026. October 1 through December 31 is 92 days; you can keep tracking through New Year's Eve if you prefer." },
  { question: "What is included in the free planner?", answer: "You get 14 photo dates: your baseline, 12 weekly follow-ups, and a final day-90 photo. Comparisons are scheduled for days 29, 57, and 90. Download the calendar, save the text checklist, or print the plan without an account." },
  { question: "How do I add the dates to my calendar?", answer: "Build your plan and download the .ics file. Open or import it in Apple Calendar, Google Calendar, Outlook, or another compatible calendar app. It contains 14 separate all-day events. Your calendar controls notifications; the planner does not send reminders." },
  { question: "Does the website save my progress photos?", answer: "This tool creates a schedule and does not collect photos or save your check-ins. Download your plan before leaving. Use GainFrame on iPhone to keep your actual photo history together, or use the free photo comparison tool for a one-off before-and-after." },
  { question: "What if I miss a check-in?", answer: "Take the next photo when you can and continue. A missed date does not erase the work you did. The weekly schedule is a practical planning choice, not a requirement to see visible change every seven days." },
];

export default function WinterArcPlannerPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Winter Arc Planner", url: URL, description: DESCRIPTION, applicationCategory: "LifestyleApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "GainFrame", item: "https://gainframe.app/" }, { "@type": "ListItem", position: 2, name: "Free tools", item: "https://gainframe.app/tools/" }, { "@type": "ListItem", position: 3, name: "Winter Arc Planner", item: URL }] },
  ];
  return (
    <div className={styles.page}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
      <BlogNav />
      <main className={styles.main}>
        <header className={styles.hero}>
          <div>
            <a className={styles.back} href="/tools/">← All free tools</a>
            <p className={styles.overline}>A little structure for a whole season</p>
            <h1>Winter Arc<br /><em>planner.</em></h1>
            <p className={styles.lead}>Make this the winter you can look back on. Build a free 90-day photo plan, save your check-in dates, and give your progress a place to start.</p>
            <div className={styles.heroDetails}><span>90 days</span><span>14 photo dates</span><span>100% free</span></div>
          </div>
          <figure className={styles.heroArt}>
            <img src="/blog/winter-arc-challenge/assets/cover.webp" alt="Illustrated check-in calendar beside two progress-photo frames" width="1200" height="900" fetchPriority="high" />
            <figcaption>Start with one photo. Come back to the bigger picture.</figcaption>
          </figure>
        </header>
        <WinterArcPlannerClient />
        <section className={styles.instructions} aria-labelledby="how-to">
          <span className={styles.overline}>Keep the setup simple</span>
          <h2 id="how-to">A photo routine you can repeat.</h2>
          <div className={styles.steps}>
            <article><span>01</span><h3>Take your baseline</h3><p>Use the same spot, camera height, light, and poses you can return to. Front, side, and back photos give you a useful starting set.</p></article>
            <article><span>02</span><h3>Capture, then carry on</h3><p>Take the weekly photo before a workout, under similar conditions. You do not need a visible transformation every seven days.</p></article>
            <article><span>03</span><h3>Compare the bigger gaps</h3><p>Review days 29, 57, and 90 against your baseline. Use the <a href="/tools/progress-photo-compare/">free progress-photo comparison tool</a> to put two photos side by side.</p></article>
          </div>
          <a className={styles.guideLink} href="/blog/winter-arc-challenge/">Read the Winter Arc guide: dates, rules, and a realistic photo routine <span aria-hidden="true">↗</span></a>
        </section>
        <section className={styles.faq} aria-labelledby="faq-title">
          <span className={styles.overline}>Before you start</span>
          <h2 id="faq-title">Winter Arc planner questions.</h2>
          {FAQS.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
        </section>
        <footer className={styles.footer}><a href="/tools/">Explore the free tools</a><a href="/privacy/">Privacy</a><span>Made by GainFrame</span></footer>
      </main>
    </div>
  );
}
