# Mailchimp Email: Launch Day Blast

**Audience**: Full Mailchimp list (all 150 subscribers — includes Tier 2 beta testers and general signups)
**Timing**: Day 0 (Launch Day — now)
**Goal**: Drive App Store downloads, offer 1-month free Pro to all subscribers, get initial reviews

---

## Email Details

| Field | Value |
|---|---|
| **From** | Michael @ GainFrame |
| **Subject** | It's here. GainFrame is live on the App Store. |
| **Preview text** | Download now and get a free month of Pro — on the house. |

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

              <p style="margin:0 0 16px 0;">The wait is over. <strong>GainFrame is officially live on the App Store.</strong></p>

              <p style="margin:0 0 16px 0;">You signed up early — and I want to make that mean something.</p>

              <p style="margin:0 0 16px 0;">Every subscriber on this list gets a <strong>free month of GainFrame Pro</strong>. No strings, no credit card required upfront. Just download the app, and reply to this email with your Apple ID email so I can activate it for you.</p>

              <p style="margin:0 0 24px 0;"><a href="https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082?utm_source=mailchimp&amp;utm_medium=email&amp;utm_campaign=launch-day" style="color:#1a1a1a; font-weight:600;">Download GainFrame on the App Store →</a></p>

              <p style="margin:0 0 8px 0;"><strong>What you'll get with Pro:</strong></p>

              <ul style="margin:0 0 16px 0; padding-left:20px;">
                <li style="margin-bottom:6px;"><strong>Precision AI Body Fat</strong> — body fat %, lean mass, and FFMI from a single photo (tested against clinical DEXA scans)</li>
                <li style="margin-bottom:6px;"><strong>Ghost Overlay</strong> — match your previous pose perfectly, no more crooked comparisons</li>
                <li style="margin-bottom:6px;"><strong>Deep Dive Compare</strong> — align any two photos and see exactly what changed, broken down by muscle group</li>
                <li style="margin-bottom:6px;"><strong>Future Physique</strong> — see a predicted image of where your body is headed in 3, 6, or 12 months</li>
              </ul>

              <p style="margin:0 0 8px 0;"><strong>One quick favor</strong></p>

              <p style="margin:0 0 16px 0;">If you download the app and like what you see, <strong>leaving a quick review on the App Store would mean the world to me.</strong> Early reviews are absolutely critical for a new indie app to gain traction.</p>

              <p style="margin:0 0 0 0;">Thank you for following along. Let's get to work.</p>

            </td>
          </tr>
          <!-- CONTENT END -->

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding:28px 0 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#1a1a1a; border-radius:6px;">
                    <a href="https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082?utm_source=mailchimp&amp;utm_medium=email&amp;utm_campaign=launch-day" target="_blank"
                       style="display:inline-block; padding:12px 28px; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600;">
                      Download on the App Store
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:40px 0 0 0; font-size:12px; line-height:1.5; color:#999999;">
              <p style="margin:0;">— Michael</p>
              <p style="margin:4px 0 0 0;"><a href="https://gainframe.app?utm_source=mailchimp&amp;utm_medium=email&amp;utm_campaign=launch-day" style="color:#999999;">GainFrame</a></p>
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

- **Offer**: 1 month free Pro for ALL subscribers on the list
- **Redemption**: Reply with Apple ID email → grant via RevenueCat Promotional Entitlements
- Uses `*|FNAME|*` and `*|UNSUB|*` Mailchimp merge tags
- All links include UTM parameters (`utm_campaign=launch-day`)
- Single CTA button at the bottom links to the App Store
- Preview in Mailchimp and send a test email to yourself before sending
