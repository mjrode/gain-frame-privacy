// POST /api/android-waitlist
//
// Android visitors to the physique rater can't install the iPhone app, so
// instead of bouncing them to another free web tool we take an email and send
// them the App Store link to open later — and keep the address on a Resend
// Audience so they hear first if Android ever ships.
//
// Env vars (Cloudflare dashboard → Worker → Settings → Variables and Secrets):
//   - RESEND_API_KEY              required, Resend API key (shared with
//                                 /api/trainer-waitlist)
//   - RESEND_ANDROID_AUDIENCE_ID  optional, audience UUID from Resend; when
//                                 missing the link email still sends, the
//                                 address just isn't kept on a list
//   - NOTIFY_EMAIL_TO             optional, defaults to michaelrode44@gmail.com
//   - NOTIFY_EMAIL_FROM           optional, defaults to noreply@gainframe.app
//                                 (must be a verified sender in Resend)

// Defined locally rather than imported from trainer-waitlist so the node
// test runner (no extensionless-import resolution) can load this module.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export interface AndroidWaitlistEnv {
  RESEND_API_KEY?: string;
  RESEND_ANDROID_AUDIENCE_ID?: string;
  NOTIFY_EMAIL_TO?: string;
  NOTIFY_EMAIL_FROM?: string;
}

interface RequestBody {
  email?: string;
  source?: string;
}

// ct= token so installs that come back through this email are attributable in
// App Store Connect (same pt as every other web surface).
const APP_STORE_LINK =
  "https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082?pt=128456047&ct=web-rater-android-email&mt=8";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...(init.headers || {}),
    },
  });
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function handleAndroidWaitlist(
  request: Request,
  env: AndroidWaitlistEnv,
): Promise<Response> {
  if (!env.RESEND_API_KEY) {
    return jsonResponse(
      { error: "Server is not configured to send emails yet." },
      { status: 503 },
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !isLikelyEmail(email)) {
    return jsonResponse({ error: "Enter a valid email." }, { status: 400 });
  }
  const source = (body.source || "physique_rater").trim().slice(0, 80);

  // 1) Send the visitor the App Store link — this is the success criterion.
  const linkRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `GainFrame <${env.NOTIFY_EMAIL_FROM || "noreply@gainframe.app"}>`,
      to: email,
      subject: "Your GainFrame App Store link",
      text: [
        "Here's the App Store link for GainFrame:",
        "",
        APP_STORE_LINK,
        "",
        "Open it on an iPhone or iPad to install. GainFrame scores every",
        "progress photo — body fat %, FFMI, and a 12-muscle breakdown — free",
        "to start.",
        "",
        "There's no Android app yet; you're on the list to hear first if that",
        "changes.",
        "",
        "— Michael, GainFrame",
      ].join("\n"),
    }),
  });

  if (!linkRes.ok) {
    let detail = "";
    try {
      detail = await linkRes.text();
    } catch {
      /* ignore */
    }
    console.error("Android waitlist link email failed", linkRes.status, detail);
    return jsonResponse(
      { error: "Could not send the email. Please try again." },
      { status: 502 },
    );
  }

  // 2) Keep the address on the Android-interest audience when one is
  //    configured. Failure here should not fail the request — the link email
  //    already went out. Resend returns 409 when the contact already exists.
  if (env.RESEND_ANDROID_AUDIENCE_ID) {
    try {
      const audienceRes = await fetch(
        `https://api.resend.com/audiences/${env.RESEND_ANDROID_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        },
      );
      if (!audienceRes.ok && audienceRes.status !== 409) {
        console.warn(
          "Android waitlist audience add failed",
          audienceRes.status,
          await audienceRes.text().catch(() => ""),
        );
      }
    } catch (err) {
      console.warn("Android waitlist audience add threw", err);
    }
  }

  // 3) Fire-and-forget internal notification.
  try {
    const notifyRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `GainFrame Android Waitlist <${env.NOTIFY_EMAIL_FROM || "noreply@gainframe.app"}>`,
        to: env.NOTIFY_EMAIL_TO || "michaelrode44@gmail.com",
        reply_to: email,
        subject: `New Android waitlist signup: ${email}`,
        text: [
          `Email: ${email}`,
          `Source: ${source}`,
          `Time: ${new Date().toISOString()}`,
        ].join("\n"),
      }),
    });
    if (!notifyRes.ok) {
      console.warn(
        "Android waitlist notification failed",
        notifyRes.status,
        await notifyRes.text().catch(() => ""),
      );
    }
  } catch (err) {
    console.warn("Android waitlist notification threw", err);
  }

  return jsonResponse({ ok: true });
}
