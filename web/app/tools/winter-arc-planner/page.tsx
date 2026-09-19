import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import WinterArcPlannerClient from "./WinterArcPlannerClient";
import styles from "./page.module.css";

const URL = "https://gainframe.app/tools/winter-arc-planner/";
const COVER = "https://gainframe.app/blog/winter-arc-challenge/assets/winter-arc-mascot.webp";
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
        <a className={styles.back} href="/tools/">← All free tools</a>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.overline}>Free 90-day planner</p>
            <h1>Winter Arc.<br /><span>Make it count.</span></h1>
            <p className={styles.lead}>Put your next 90 days on the calendar. Take the photos. See how far you come.</p>
            <a href="#planner" className={styles.heroButton}>Build my free plan <span aria-hidden="true">↗</span></a>
            <p className={styles.heroNote}>No signup. No email. Just your next step.</p>
          </div>
          <figure className={styles.heroArt}>
            <img src="/blog/winter-arc-challenge/assets/winter-arc-mascot.webp" alt="GainFrame mascot in a red winter scarf planning photo check-ins on a calendar" width="1200" height="800" fetchPriority="high" />
          </figure>
        </header>
        <div className={styles.heroDetails}><span><strong>90</strong> days, your way</span><span><strong>14</strong> photo check-ins</span><span><strong>3</strong> ways to save your plan</span></div>
        <WinterArcPlannerClient />
        <section className={styles.instructions} aria-labelledby="how-to">
          <div className={styles.instructionIntro}>
            <div><span className={styles.overline}>The work adds up. Keep the proof.</span><h2 id="how-to">Same setup.<br />A new chapter.</h2><p>Make each check-in easy to repeat, so your photos tell a clearer story.</p></div>
            <img src="/blog/winter-arc-challenge/assets/photo-routine.webp" alt="GainFrame mascot demonstrating a consistent camera position, light, and pose" width="1200" height="800" loading="lazy" />
          </div>
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
