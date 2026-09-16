import type { Metadata } from "next";
import BlogNav from "@/components/BlogNav";
import { SITE } from "@/lib/site";
import LeanBodyMassClient from "./LeanBodyMassClient";
import styles from "./page.module.css";

const URL = `${SITE.url}/tools/lean-body-mass-calculator/`;
const DESCRIPTION =
  "Calculate lean body mass and fat mass from weight and body-fat percentage in lb or kg. Explore uncertainty and see how fat-free mass differs from DEXA lean tissue.";
export const metadata: Metadata = {
  title: { absolute: "Lean Body Mass Calculator: Fat-Free Mass in lb & kg" },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: "Lean Body Mass Calculator",
    description: DESCRIPTION,
    url: URL,
    type: "website",
    images: [SITE.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lean Body Mass Calculator",
    description: DESCRIPTION,
    images: [SITE.ogImage],
  },
};
const faqs = [
  [
    "How do you calculate lean body mass?",
    "Multiply your weight by one minus your body-fat percentage divided by 100. For example, 180 lb at 20% body fat gives 144 lb of fat-free mass and 36 lb of fat mass. This calculator uses the common fitness shorthand lean body mass for that fat-free result.",
  ],
  [
    "Is lean body mass the same as muscle mass?",
    "No. Fat-free mass includes muscle, water, organs, bone and other non-fat tissue. The term lean body mass can also include essential lipids in technical definitions. This tool calculates the two-compartment fat-free mass value and does not estimate skeletal muscle alone.",
  ],
  [
    "Can I calculate lean body mass without body-fat percentage?",
    "This tool needs a supplied body-fat estimate. Height-and-weight equations can predict lean mass from population averages, but this calculator does not use them. A photo or tape-based estimate can provide a starting point, with its own uncertainty.",
  ],
  [
    "What does the uncertainty range mean?",
    "You choose how many percentage points above and below your body-fat estimate to explore. The calculator holds weight constant and recalculates fat-free mass at both ends. The range is an illustration of input sensitivity, not a confidence interval or a validated accuracy guarantee.",
  ],
  [
    "Why is my DEXA lean mass different from this result?",
    "DEXA reports usually separate fat mass, lean soft tissue and bone mineral content. Fat-free mass includes both lean soft tissue and bone mineral. Some reports also calculate fat percentage over soft tissue rather than total mass. Check the report's definitions before entering its percentage.",
  ],
  [
    "Does an increase in fat-free mass prove muscle gain?",
    "No. Water, glycogen and measurement variation can change the estimate. Compare the same method under similar conditions over time, alongside training performance and consistent progress photos. This arithmetic cannot determine which tissue changed.",
  ],
];
const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Lean Body Mass Calculator",
    url: URL,
    description: DESCRIPTION,
    applicationCategory: "HealthApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: `${SITE.url}/tools/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Lean Body Mass Calculator",
        item: URL,
      },
    ],
  },
];
export default function LeanBodyMassPage() {
  return (
    <div className={styles.page}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      <BlogNav />
      <main>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <a href="/tools/">Free tools</a> / Lean body mass
        </nav>
        <header className={styles.hero}>
          <p className={styles.kicker}>Body composition / Free calculator</p>
          <h1>
            Lean body mass
            <br />
            calculator.
          </h1>
          <p>
            Turn your weight and body-fat estimate into fat-free mass and fat
            mass. See how much the answer changes when your estimate shifts.
          </p>
        </header>
        <LeanBodyMassClient />
        <article className={styles.content}>
          <h2>What does this lean body mass calculator measure?</h2>
          <p>
            It calculates <strong>fat-free mass</strong> from the numbers you
            supply. In everyday fitness language, this is often called lean body
            mass. The result includes muscle, water, organs, bone and other
            non-fat tissue. Technical definitions of lean body mass can include
            essential lipids, so the terms are not perfectly interchangeable.
          </p>
          <p>
            The arithmetic is simple:{" "}
            <strong>fat mass = weight × body fat ÷ 100</strong>. Subtract that
            fat mass from total weight to get fat-free mass. At 180 lb and 20%
            body fat, that gives 36 lb of fat and 144 lb of fat-free mass. Our{" "}
            <a href="/blog/lean-mass-vs-muscle-mass/">
              lean mass and muscle mass guide
            </a>{" "}
            explains the distinction.
          </p>
          <h2>
            How much can an uncertain body-fat estimate change the answer?
          </h2>
          <p>
            At 180 lb, each percentage point changes calculated fat-free mass by
            1.8 lb. If your body-fat estimate could be 18% to 22%, the
            calculated range becomes 140.4 to 147.6 lb. A decimal in the output
            does not make the input more accurate.
          </p>
          <p>
            Enable the optional sensitivity range above and choose the
            uncertainty you want to explore. The default two points is just a
            worked example. It is not a validated error range for a scale, photo
            tool or scan.
          </p>
          <h2>Why can a real DEXA report show a different lean-mass number?</h2>
          <p>
            A report can divide your body into three compartments. The following
            numbers come from the founder's real GE Lunar report, reproduced in
            our{" "}
            <a href="/blog/dexa-scan-body-fat-percentage/">DEXA report guide</a>
            . Personal details are omitted here.
          </p>
          <div className={styles.report}>
            <p className={styles.kicker}>
              One published report / rounded values
            </p>
            <dl>
              <dt>Total scan mass</dt>
              <dd>232.8 lb</dd>
              <dt>Fat mass</dt>
              <dd>41.7 lb</dd>
              <dt>Lean soft tissue</dt>
              <dd>182.1 lb</dd>
              <dt>Bone mineral content</dt>
              <dd>9.0 lb</dd>
              <dt>Fat-free mass: 182.1 + 9.0</dt>
              <dd>191.1 lb</dd>
            </dl>
            <p>
              Dividing 41.7 by the full 232.8 lb gives about{" "}
              <strong>17.9% fat by total mass</strong>. The report prints{" "}
              <strong>18.6%</strong>, which is consistent with using soft tissue
              (fat plus lean tissue) as its denominator. Putting that printed
              percentage into a total-weight calculator would mix two
              definitions.
            </p>
          </div>
          <p>
            Check your report's denominator. Fat-free mass includes bone
            mineral; the report's lean-soft-tissue field excludes it. The{" "}
            <a
              href="https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1479_web.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              IAEA body-composition guide
            </a>{" "}
            describes these compartments. This example illustrates the
            definitions and is not a validation study of this calculator.
          </p>
          <h2>How can you use the result to follow progress?</h2>
          <ul>
            <li>
              Record which body-fat method you used and repeat under similar
              conditions.
            </li>
            <li>
              Read changes alongside weight trends, training performance and
              comparable photos.
            </li>
            <li>
              Use <a href="/blog/what-is-ffmi/">FFMI</a> when you want to relate
              fat-free mass to height.
            </li>
            <li>
              Keep expectations modest: water and glycogen can change fat-free
              mass without a matching change in muscle.
            </li>
          </ul>
          <h2>What else should you know about lean body mass?</h2>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
          <div className={styles.links}>
            <a href="/tools/ffmi-calculator/">FFMI calculator</a>
            <a href="/tools/body-fat-from-photo/">Photo body-fat estimator</a>
            <a href="/blog/ffmi-chart/">FFMI chart</a>
          </div>
        </article>
        <footer className={styles.footer}>
          Free fitness arithmetic. Results depend on your inputs.{" "}
          <a href="/tools/">Explore all tools</a>
        </footer>
      </main>
    </div>
  );
}
