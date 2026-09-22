import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Connected Diary Terms of Service — GainFrame",
  description: "Terms for using GainFrame Connected Diary and its ChatGPT connector.",
  alternates: { canonical: "/connected-diary-terms/" },
  robots: { index: false, follow: false },
};

export default function ConnectedDiaryTermsPage() {
  return (
    <div className={styles.page}>
      <link rel="stylesheet" href="/styles-clean.css" />
      <link rel="stylesheet" href="/styles.css" />
      <Nav />
      <main className={styles.main}>
        <header>
          <p className={styles.eyebrow}>GainFrame Connected Diary</p>
          <h1>Terms of Service</h1>
          <p className={styles.updated}>Effective September 22, 2026</p>
        </header>
        <article>
          <p>These terms cover the GainFrame Connected Diary service and its ChatGPT connector, provided by Michael James Rode ("GainFrame", "we", or "us"). By using the service, you agree to these terms. The GainFrame iPhone app remains subject to its separate <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Apple Standard End User License Agreement</a>. OpenAI’s terms govern your use of ChatGPT.</p>
          <h2>The service</h2>
          <p>Connected Diary lets you sync GainFrame food entries with your account and authorize ChatGPT to read, add, edit, and remove those entries. Regular use requires a GainFrame account, a supported iPhone build, and your choice to enable diary sync and approve the connection. Demo accounts contain sample data and are provided separately for testing.</p>
          <p>This connector accesses food names, portions, estimated nutrition, meal labels, and logging times. It does not provide access to your progress photos, workouts, body measurements, Apple Health records, or Coach conversations. It does not process purchases or change your subscriptions.</p>
          <h2>Your account and instructions</h2>
          <p>Use an account you own or are authorized to use. Keep your sign-in details private and tell us if you believe someone has obtained unauthorized access. You must meet ChatGPT’s applicable minimum-age requirements and be at least 13. If you are below the age of legal majority where you live, obtain permission from a parent or guardian.</p>
          <p>When you clearly ask to log, change, or remove a food, the service may act immediately without an additional GainFrame confirmation. Review the result and correct entries when needed. ChatGPT may apply its own confirmation controls. Changes reach the iPhone app when it next successfully syncs; offline devices and conflicting edits can delay synchronization.</p>
          <p>Do not use the service to access someone else’s information without permission, bypass security controls or limits, disrupt the service, or submit unlawful content. Demo credentials must be used only with sample information, never a real person’s diary.</p>
          <h2>Estimates and fitness information</h2>
          <p>Food descriptions, portions, calories, and macros can be incomplete or inaccurate. ChatGPT-supplied nutrition is an estimate and may differ from a product label or actual preparation. The service is a recordkeeping tool for general fitness and wellness. It does not diagnose, treat, or prevent medical conditions, and its results are not individualized medical advice. Do not submit medical records or other information unrelated to food logging through this connector.</p>
          <h2>Your data and choices</h2>
          <p>You retain your rights to the information you provide. You allow GainFrame to process and store it, and send requested diary entries and results to OpenAI, only as needed to operate the service, follow your instructions, and meet applicable obligations. The <a href="https://gainframe.app/privacy/#connected-diary">GainFrame Privacy Policy</a> explains the information involved, recipients, retention, and deletion options. OpenAI handles conversations and tool results under its own terms, privacy policy, and your account settings.</p>
          <p>You can turn off Connected Diary in GainFrame Settings to stop sync and revoke connector access once that request reaches the server. Disconnect the app in ChatGPT to remove that connection there as well. Disabling sync or uninstalling the app does not erase the cloud copy. Follow the deletion controls and contact process in the Privacy Policy to request removal of cloud records.</p>
          <h2>Availability and changes</h2>
          <p>We work to keep the service reliable, but cannot guarantee uninterrupted availability, error-free estimates, or compatibility with every app version or third-party service. We may change, suspend, or discontinue features, or restrict access to address misuse, security issues, or legal requirements. Where reasonably possible, we will provide notice of material changes that affect your use.</p>
          <p>To the extent permitted by applicable law, the service is provided as available. Nothing in these terms excludes obligations or limits consumer rights that cannot legally be excluded or limited.</p>
          <p>We may update these terms by publishing a revised version and effective date. We will provide appropriate notice of material changes. You can stop using the connector and disconnect your account if you do not accept an update.</p>
          <h2>Contact</h2>
          <p>For support or questions about these terms, contact <a href="mailto:michaelrode44@gmail.com">michaelrode44@gmail.com</a>.</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
