import type { Metadata } from "next";
import AnalyticsPreferencesButton from "@/components/AnalyticsPreferencesButton";

export const metadata: Metadata = {
  title: { absolute: "GainFrame — Privacy Policy" },
  description:
    "Privacy policy for GainFrame: local-first progress photos, AI analysis, community publishing, and website analytics choices.",
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
  .privacy-choice-button {
    appearance: none;
    border: 1px solid #E8836B;
    border-radius: 999px;
    background: transparent;
    color: #9f3f2e;
    padding: 0.65rem 1rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
  }
  .privacy-choice-button:focus-visible {
    outline: 3px solid rgba(232, 131, 107, 0.35);
    outline-offset: 3px;
  }
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
            GainFrame: Progress Photos — Last updated August 13, 2026
          </p>

          <p>
            GainFrame (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;the
            app&rdquo;) is a fitness progress photo tracking app and website built by
            Michael Rode. Your privacy is important to us. This policy explains
            what data the app collects, how it&rsquo;s used, and your rights.
          </p>

          <h2>1. Data Stored on Your Device</h2>
          <p>
            GainFrame is a <strong>local-first</strong> app. Unless you
            deliberately use an opt-in community publishing feature, the
            following data is stored on your iPhone and is not copied to the
            GainFrame community database:
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
            your device unless you separately approve a sanitized community
            scan-image copy as described in Section 6.
          </p>
          <p>
            We do not receive your original photo library or private GainFrame
            history. Publishing to the community sends only the fields and
            separate image copy shown on the final approval screen. Deleting
            the app removes local data from that device, but does not by itself
            withdraw content you previously published; use the community
            controls in the app first.
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
            <li>
              We do not persist the image sent for AI analysis; community scan-image
              publishing is a separate, optional action described in Section 6
            </li>
          </ul>
          <p>
            The public AI tools on gainframe.app similarly send the photo you
            choose through a GainFrame Supabase Edge Function to the configured
            AI provider so the requested result can be returned. Tool-completion
            notifications never contain the uploaded photo, calculator inputs,
            or generated result. If you request an emailed report or unlock,
            the email address is used to fulfill that request and is excluded
            from optional analytics and Slack notifications.
          </p>

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
            <li>
              App onboarding state and, when attribution is available, bounded
              campaign fields such as source, campaign, landing/download page,
              CTA placement, anonymous click/session identifiers, and click time
            </li>
          </ul>
          <p>
            We do not send your name, email address, photos, fitness results, or
            website form entries to RevenueCat as subscriber attributes. See{" "}
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

          <h2>6. Optional Community Profiles and Leaderboard</h2>
          <p>
            Community participation is off by default. If you opt in, GainFrame
            stores an opaque public profile identifier, your chosen username,
            visibility choice, and only the profile fields you choose to share,
            such as a short bio, training-since year, favorite lift, broad
            region, or approved avatar.
          </p>
          <p>
            Each score you publish becomes a separate community entry containing
            its score, goal, chosen calendar date, scoring-contract version,
            verification state, and the maximum audience you approved. Changing
            the profile later can narrow an older entry but cannot silently make
            it available to a broader audience. Your public profile can show all
            eligible entries you have not withdrawn. Ranked standings show only
            your highest eligible listed entry for the selected goal and period.
          </p>
          <p>
            A shared scan image is optional and requires an additional approval. The
            app creates a separate, cropped and resized copy, automatically
            blurs faces it detects, and shows you the exact preview for approval
            before publishing. The original GainFrame photo stays in local
            storage and is not uploaded as the public asset. Approved scan-image
            copies are held in private object storage and delivered to viewers
            using links that expire within approximately five minutes.
          </p>
          <p>
            You can withdraw a profile, entry, or shared scan image in the app.
            Withdrawal stops GainFrame from issuing new public access and takes
            the associated scan-image copy out of active public delivery. A
            delivery link already issued may continue working until its short
            expiration, and we cannot retrieve copies another person saved while
            the content was public. Security, backup, or moderation records may
            persist when reasonably necessary.
          </p>
          <p>
            Members can report profiles, entries, and scan images and can block
            other community profiles. Reports may include the target identifiers,
            selected reason, optional details, workflow status, and moderator
            notes. Automated checks and authorized human reviewers may evaluate
            published content and reports. Blocking affects the in-app experience
            but cannot prevent anonymous access to a public web page. See the{" "}
            <a href="/community-guidelines/">Community Guidelines</a>.
          </p>
          <p>
            For public-web reports, the canonical network address is converted
            into a salted, one-way abuse-prevention fingerprint for rate
            limiting. Browser user-agent text is not part of that quota identity,
            and the raw address is not stored in the leaderboard report row. The
            fingerprint and report may be retained with moderation and security
            records when reasonably necessary.
          </p>

          <h2>7. Advertising and Tracking Choices</h2>
          <p>
            GainFrame does <strong>not</strong>:
          </p>
          <ul>
            <li>Display advertisements</li>
            <li>Access the IDFA without your iOS tracking permission</li>
            <li>Share data with data brokers</li>
            <li>Require an email-based account for core local photo features</li>
          </ul>
          <p>
            The app uses AppsFlyer to measure installation and campaign
            attribution. iOS asks for permission before GainFrame can use the
            IDFA or track activity across other companies&rsquo; apps and websites.
            If permission is denied, GainFrame does not access the IDFA;
            privacy-preserving attribution mechanisms made available by Apple
            may still provide aggregated campaign measurement. See{" "}
            <a
              href="https://www.appsflyer.com/legal/privacy-policy/"
              target="_blank"
              rel="noopener"
            >
              AppsFlyer&rsquo;s Privacy Policy
            </a>
            .
          </p>

          <h2>8. Analytics</h2>
          <p>
            In the app, we collect product analytics and diagnostics, such as
            feature interactions, app and device information, crash and
            performance data, and installation or session identifiers. We use
            this information to operate, secure, and improve GainFrame. When
            you sign in, some analytics may be associated with a pseudonymous
            account identifier so activity can be understood across sessions.
            App analytics providers include PostHog, Firebase, and AppsFlyer.
          </p>
          <p>
            On <strong>gainframe.app</strong>, we use Google Analytics and
            PostHog for website measurement. We also use Microsoft Clarity for
            heatmaps and session replay across the website. Form fields are
            masked from Clarity.
          </p>
          <p>
            When optional website analytics are enabled and you successfully
            use a public tool, the site may send a completion event containing
            the tool name, an anonymous completion identifier, and sanitized
            acquisition/device context to a GainFrame Supabase Edge Function.
            Supabase keeps short-lived deduplication receipts and a
            server-keyed HMAC fingerprint of the request address for abuse rate
            limiting; the raw address is not stored in those records, and the
            records are retained for no more than approximately seven days.
            The completion event is recorded in PostHog and may produce a
            private GainFrame Slack notification. Calculator inputs and
            results, uploaded photos, email addresses, and raw network
            addresses are excluded from this event and notification.
          </p>
          <p>
            If you choose to share or download a public leaderboard card while
            optional analytics are enabled, GainFrame records a share-intent
            event and may send a private Slack notification. It contains only
            the platform, selected card style, share-button placement, a broad
            rank range, goal filter, and leaderboard period. It does not
            contain a username, profile or entry identifier, profile details,
            photos, or scan media.
          </p>
          <p>
            The public AI Ab Analyzer also uses server-keyed HMAC fingerprints
            of a browser identifier and request address to enforce its free-use
            and provider-cost limits. GainFrame retains a content-free keyed
            quota record while its advertised lifetime allowance is enforced.
            These records never contain the uploaded photo, prompt, analysis
            result, raw browser identifier, or raw network address.
          </p>
          <p>
            After optional website analytics consent is granted, App Store
            download links may use a branded AppsFlyer OneLink. The link can
            carry the first website page, download page, CTA placement, source,
            campaign, an anonymous click ID, anonymous PostHog/session IDs,
            medium, click time, and supported advertising click identifiers.
            If the app is installed or opened from that link, GainFrame may
            store this first-touch attribution and mirror bounded fields to
            PostHog and RevenueCat to understand website-to-subscription
            conversion. While consent is pending or denied, the site uses the
            direct App Store destination and does not create this OneLink
            payload.
          </p>
          <p>
            Cloudflare classifies the request country at the edge only to
            decide whether the website must display an analytics-consent
            prompt. The website receives only the resulting yes-or-no decision;
            we do not return or store the country code for this purpose.
            Visitors in the EEA, United Kingdom, and Switzerland can accept or
            decline non-essential analytics. In those regions, Google
            Analytics, PostHog, and Microsoft Clarity do not load unless the
            visitor accepts. A saved decline also keeps them off elsewhere.
            Visitors elsewhere can use the control below to save the same
            preference at any time. We save that choice in browser storage,
            with a first-party preference cookie as a fallback. If Cloudflare
            cannot classify a request country, analytics run without showing
            the regional prompt unless the visitor has previously declined.
          </p>
          <p>
            Analytics are used to understand acquisition and improve the
            product, not for third-party advertising, and we do not sell this
            information to data brokers.
          </p>
          <AnalyticsPreferencesButton />

          <h2>9. Children&rsquo;s Privacy</h2>
          <p>
            GainFrame is not directed to children under 13. Community
            publishing requires an identified account and is unavailable to
            children under 13. GainFrame&rsquo;s age rating is the rating shown
            in its current App Store listing; that rating does not mean the
            community service is intended for children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes
            will be posted on this page with an updated revision date.
          </p>

          <h2>11. Contact</h2>
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
