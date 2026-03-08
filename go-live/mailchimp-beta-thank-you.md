# Mailchimp Email: Beta Tester Thank-You (Tier 0 + Tier 1)

**Audience**: Top engaged beta testers from [beta-testers.md](./beta-testers.md) — Tier 0 (Allen) and Tier 1 (9 testers)
**Timing**: Send now (personal emails recommended for Tier 0/1)
**Goal**: Thank top testers, offer free year of Pro (Tier 1) / lifetime (Tier 0), drive App Store review

---

## Email Details

| Field | Value |
|---|---|
| **From** | Michael @ GainFrame |
| **Subject** | You helped build GainFrame — claim your free Pro year |
| **Preview text** | GainFrame is live on the App Store. Your beta testing earned you something. |
| **Segment** | Tier 0 + Tier 1 testers only (see beta-testers.md) |

---

## Paste-Ready HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GainFrame</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- CONTENT START -->
          <tr>
            <td style="font-size:16px; line-height:1.6; color:#1a1a1a;">

              <p style="margin:0 0 16px 0;">Hey *|FNAME|*,</p>

              <p style="margin:0 0 16px 0;">You've been part of something from the very beginning.</p>

              <p style="margin:0 0 16px 0;">Over the past few months, you've been testing GainFrame on TestFlight — using it, breaking it, and helping shape it into something real. That matters more than you know.</p>

              <p style="margin:0 0 16px 0;"><strong>GainFrame is officially live on the App Store</strong>, and I wanted to make sure you heard it from me first.</p>

              <p style="margin:0 0 8px 0;"><strong>Here's what you earned:</strong></p>

              <p style="margin:0 0 16px 0;">Your testing and feedback directly shaped GainFrame. As a thank-you, you're getting a <strong>free year of GainFrame Pro</strong> — no strings, no catch. It's the least I can do for someone who helped build this.</p>

              <p style="margin:0 0 16px 0;"><strong>To claim yours, just reply to this email or send a quick note to <a href="mailto:michael@gainframe.app" style="color:#1a1a1a;">michael@gainframe.app</a>.</strong> I'll set it up for you personally via RevenueCat.</p>

              <p style="margin:0 0 8px 0;"><strong>What happens next:</strong></p>

              <ul style="margin:0 0 16px 0; padding-left:20px;">
                <li style="margin-bottom:6px;">The TestFlight beta will expire very soon</li>
                <li style="margin-bottom:6px;">Download GainFrame from the App Store: <a href="https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082?utm_source=mailchimp&amp;utm_medium=email&amp;utm_campaign=beta-thank-you" style="color:#1a1a1a; font-weight:600;">Download GainFrame →</a></li>
                <li style="margin-bottom:6px;">Your free Pro year will be activated once you're on the App Store version</li>
              </ul>

              <p style="margin:0 0 8px 0;"><strong>One favor</strong></p>

              <p style="margin:0 0 16px 0;">If GainFrame has been useful to you, I'd really appreciate an honest review on the App Store. Early reviews are make-or-break for a new app, and yours would carry real weight.</p>

              <p style="margin:0 0 0 0;">Thank you for being part of this.</p>

            </td>
          </tr>
          <!-- CONTENT END -->

          <!-- FOOTER -->
          <tr>
            <td style="padding:40px 0 0 0; font-size:12px; line-height:1.5; color:#999999;">
              <p style="margin:0;">— Michael</p>
              <p style="margin:4px 0 0 0;"><a href="https://gainframe.app?utm_source=mailchimp&amp;utm_medium=email&amp;utm_campaign=beta-thank-you" style="color:#999999;">GainFrame</a></p>
              <p style="margin:20px 0 0 0; border-top:1px solid #eeeeee; padding-top:16px;">
                You're receiving this because you signed up at gainframe.app.<br>
                <a href="*|UNSUB|*" style="color:#999999;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Notes

- **Tier 0 (Allen Salama)**: Send separately with "Lifetime Pro" language instead of "free year" — personalize heavily
- **Tier 1 (9 testers)**: This template works as-is — "free year of Pro"
- No CTA button — reply-to-claim keeps it personal
- Uses `*|FNAME|*` and `*|UNSUB|*` Mailchimp merge tags
- All links include UTM parameters (`utm_campaign=beta-thank-you`)
- Preview in Mailchimp and send a test email before sending
