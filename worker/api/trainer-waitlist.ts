// POST /api/trainer-waitlist
//
// Soft-CTA email capture for the /trainers landing page. Adds the contact to
// a Resend Audience (so we have a clean list to email when V1 ships) and
// fires a notification email to michaelrode44@gmail.com with the details
// each signup volunteered (active client count, source).
//
// Env vars (Cloudflare dashboard → Worker → Settings → Variables and Secrets):
//   - RESEND_API_KEY           required, Resend API key
//   - RESEND_TRAINER_AUDIENCE_ID  required, audience UUID from Resend dashboard
//   - NOTIFY_EMAIL_TO          optional, defaults to michaelrode44@gmail.com
//   - NOTIFY_EMAIL_FROM        optional, defaults to noreply@gainframe.app
//                              (must be a verified sender in Resend)

export interface TrainerWaitlistEnv {
  RESEND_API_KEY?: string;
  RESEND_TRAINER_AUDIENCE_ID?: string;
  NOTIFY_EMAIL_TO?: string;
  NOTIFY_EMAIL_FROM?: string;
}

interface RequestBody {
  email?: string;
  activeClients?: string;
  source?: string;
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
): Response {
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

export async function handleTrainerWaitlist(
  request: Request,
  env: TrainerWaitlistEnv,
): Promise<Response> {
  if (!env.RESEND_API_KEY || !env.RESEND_TRAINER_AUDIENCE_ID) {
    return jsonResponse(
      { error: "Server is not configured for waitlist signups yet." },
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
  const activeClients = (body.activeClients || "").trim().slice(0, 50);
  const source = (body.source || "trainers-page").trim().slice(0, 80);

  // 1) Add to Resend Audience. We tolerate "already exists" gracefully:
  //    Resend returns 409 (or similar) when the contact is already on the list.
  const audienceRes = await fetch(
    `https://api.resend.com/audiences/${env.RESEND_TRAINER_AUDIENCE_ID}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
      }),
    },
  );

  if (!audienceRes.ok && audienceRes.status !== 409) {
    let detail = "";
    try {
      detail = await audienceRes.text();
    } catch {
      /* ignore */
    }
    console.error("Resend audience add failed", audienceRes.status, detail);
    return jsonResponse(
      { error: "Could not save your signup. Please try again." },
      { status: 502 },
    );
  }

  // 2) Fire-and-forget internal notification. Failure here should not block
  //    the user response — the audience is the source of truth, the
  //    notification is convenience.
  const notifyTo = env.NOTIFY_EMAIL_TO || "michaelrode44@gmail.com";
  const notifyFrom = env.NOTIFY_EMAIL_FROM || "noreply@gainframe.app";
  const notifyPayload = {
    from: `GainFrame Trainer Waitlist <${notifyFrom}>`,
    to: notifyTo,
    reply_to: email,
    subject: `New trainer waitlist signup: ${email}`,
    text: [
      `Email: ${email}`,
      `Active clients: ${activeClients || "(not provided)"}`,
      `Source: ${source}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n"),
  };
  try {
    const notifyRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notifyPayload),
    });
    if (!notifyRes.ok) {
      console.warn(
        "Trainer waitlist notification failed",
        notifyRes.status,
        await notifyRes.text().catch(() => ""),
      );
    }
  } catch (err) {
    console.warn("Trainer waitlist notification threw", err);
  }

  return jsonResponse({ ok: true });
}
