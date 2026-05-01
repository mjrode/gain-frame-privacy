import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "GainFrame — Privacy Policy" },
  description:
    "Privacy policy for GainFrame: how progress photo and body composition data is handled. Local-first storage, AI image analysis details, no advertising or tracking.",
  alternates: { canonical: "/privacy/" },
};

const styles = `
  .privacy-page {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.7;
    color: #1a1a1a;
    background: #fafafa;
    padding: 2rem 1rem;
    min-height: 100vh;
  }
  .privacy-page * { margin: 0; padding: 0; box-sizing: border-box; }
  .privacy-container {
    max-width: 720px;
    margin: 0 auto;
    background: #fff;
    border-radius: 16px;
    padding: 3rem 2.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }
  .privacy-container h1 { font-size: 2rem; margin-bottom: 0.25rem; color: #111; }
  .privacy-subtitle {
    color: #666;
    font-size: 0.95rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
  }
  .privacy-container h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.75rem; color: #222; }
  .privacy-container p,
  .privacy-container li { color: #444; font-size: 0.95rem; margin-bottom: 0.75rem; }
  .privacy-container ul { padding-left: 1.5rem; margin-bottom: 1rem; }
  .privacy-container li { margin-bottom: 0.4rem; }
  .privacy-container strong { color: #222; }
  .privacy-container a { color: #E8836B; }
  .privacy-footer {
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
    font-size: 0.85rem;
    color: #999;
  }
`;

export default function PrivacyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="privacy-page">
        <div className="privacy-container">
          <h1>Privacy Policy</h1>
          <p className="privacy-subtitle">
            GainFrame: Progress Photos — Last updated February 20, 2026
          </p>

          <p>
            GainFrame (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;the
            app&rdquo;) is a fitness progress photo tracking app built by
            Michael Rode. Your privacy is important to us. This policy explains
            what data the app collects, how it&rsquo;s used, and your rights.
          </p>

          <h2>1. Data Stored on Your Device</h2>
          <p>
            GainFrame is a <strong>local-first</strong> app. The following data
            is stored exclusively on your iPhone — we do not operate a cloud
            database and none of this data is stored on our servers:
          </p>
          <ul>
            <li>Progress photos and camera roll imports</li>
            <li>Photo metadata (weight, workout type, notes, dates)</li>
            <li>Pose templates and reference photos</li>
            <li>Face blur and background removal settings</li>
            <li>App preferences and settings</li>
          </ul>
          <p>
            <strong>Important:</strong> When you use AI features, your photos
            are transmitted to Google&rsquo;s Gemini API for analysis (see
            Section 2). They are not retained by Google or by us — they are
            processed and discarded, and the only persistent copy remains on
            your device.
          </p>
          <p>
            We do not have access to your photos or personal data. If you
            delete the app, all local data is permanently removed.
          </p>

          <h2>2. AI Image Analysis</h2>
          <p>
            When you use AI features (Physique Review, AI Compare, AI Scoring),
            your photos are sent to <strong>Google&rsquo;s Gemini API</strong>{" "}
            for analysis. Specifically:
          </p>
          <ul>
            <li>Images are sent over an encrypted (HTTPS) connection</li>
            <li>Google processes the image to generate text-based analysis</li>
            <li>
              Images are not permanently stored by Google and are processed in
              accordance with{" "}
              <a
                href="https://ai.google.dev/terms"
                target="_blank"
                rel="noopener"
              >
                Google&rsquo;s API Terms of Service
              </a>
            </li>
            <li>We do not store your images on any server</li>
          </ul>

          <h2>3. Apple Health</h2>
          <p>
            With your permission, GainFrame reads <strong>body weight</strong>,{" "}
            <strong>height</strong>, <strong>workout history</strong>, and{" "}
            <strong>date of birth</strong> from Apple Health. The app may also
            write weight measurements to Apple Health when you log your
            weight. This data is:
          </p>
          <ul>
            <li>Processed and stored only on your device</li>
            <li>Never shared with third parties</li>
            <li>
              Date of birth is used solely to calculate your age for
              age-adjusted metrics (e.g., BMR) — it is never transmitted off
              your device
            </li>
          </ul>

          <h2>4. Subscriptions</h2>
          <p>
            GainFrame Pro subscriptions are managed through{" "}
            <strong>RevenueCat</strong>, a third-party subscription management
            service. RevenueCat processes:
          </p>
          <ul>
            <li>
              An anonymous user identifier (not linked to your real identity)
            </li>
            <li>Subscription status and purchase history</li>
          </ul>
          <p>
            No personal information (name, email, etc.) is shared with
            RevenueCat. See{" "}
            <a
              href="https://www.revenuecat.com/privacy"
              target="_blank"
              rel="noopener"
            >
              RevenueCat&rsquo;s Privacy Policy
            </a>
            .
          </p>

          <h2>5. Hevy Integration</h2>
          <p>
            If you connect your Hevy account, GainFrame accesses your workout
            data (exercises, sets, reps, weight) through Hevy&rsquo;s API to
            attach workout details to your progress photos. This data is
            stored locally on your device and is not shared with any other
            third party.
          </p>

          <h2>6. No Tracking or Advertising</h2>
          <p>
            GainFrame does <strong>not</strong>:
          </p>
          <ul>
            <li>Display advertisements</li>
            <li>Use cross-app tracking</li>
            <li>Collect device advertising identifiers (IDFA)</li>
            <li>Share data with data brokers</li>
            <li>Require an account or login</li>
          </ul>

          <h2>7. Analytics</h2>
          <p>
            We may collect anonymized, aggregated usage data (such as which
            features are used most frequently) to improve the app. This data
            cannot be used to identify individual users.
          </p>

          <h2>8. Children&rsquo;s Privacy</h2>
          <p>
            GainFrame is rated 4+ and does not knowingly collect data from
            children under 13. The app does not require any personal
            information to function.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes
            will be posted on this page with an updated revision date.
          </p>

          <h2>10. Contact</h2>
          <p>
            If you have questions about this privacy policy, contact us at:
            <br />
            <strong>michaelrode44@gmail.com</strong>
          </p>

          <div className="privacy-footer">
            © 2026 Michael Rode. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
