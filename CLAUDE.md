# gain-frame-privacy

## Repo layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js 16 site (static export → Cloudflare Workers) |
| `worker/` | Worker entry: serves `web/out` as static assets, handles `/api/*` |
| `wrangler.jsonc` | Worker + static-assets config (must stay at the repo root) |
| `docs/` | Legacy Jekyll/GitHub Pages site (superseded) |

## Cloudflare deployment

The site runs on **Cloudflare Workers with Static Assets** (it was a Pages
project until Jul 2026). `web/out` is uploaded as the asset store — including
`_headers` and `_redirects`, which Workers assets honour the same way Pages did.
Worker-first routing lets `worker/index.ts` permanently redirect HTTP requests
to the canonical HTTPS URL and handle `/api/*`; all other requests are delegated
to the static asset binding. The `gainframe.app` custom domain is declared in
`wrangler.jsonc`.

### Automatic (normal flow)
Push to `main` → Workers Builds runs the build command and deploys.

### CLI deploy (manual / branch previews)

Install the CLI once:
```bash
npm install -g wrangler
wrangler login
```

Build, then deploy from the repo root (wrangler reads `wrangler.jsonc`):
```bash
cd web && npm run build && cd .. && npx wrangler deploy
```

To upload a version without making it live — what Workers Builds does for
non-production branches; it gets a preview URL you can promote later:
```bash
npx wrangler versions upload
```

Run the deployed shape locally (assets plus `/api/*`):
```bash
npx wrangler dev
```

### Build config (set in dashboard)
| Setting | Value |
|---------|-------|
| Build command | `cd web && npm install && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |
| Environment variable | `NODE_VERSION=20` |
| Production branch | `main` |

There is no "build output directory" setting under Workers — `assets.directory`
in `wrangler.jsonc` (`web/out`) is what gets uploaded.

### Secrets used by `/api/*`
Set under Worker → Settings → Variables and Secrets. The endpoints degrade
instead of erroring when one is missing, but the feature is inert without it:

| Name | Used by | Missing behaviour |
|------|---------|-------------------|
| `POSTHOG_PERSONAL_API_KEY` | `/api/stats` | lifter count falls back to 5,000 |
| `RESEND_API_KEY` | `/api/trainer-waitlist`, `/api/android-waitlist` | signups return 503 |
| `RESEND_TRAINER_AUDIENCE_ID` | `/api/trainer-waitlist` | signups return 503 |
| `RESEND_ANDROID_AUDIENCE_ID` | `/api/android-waitlist` | link email still sends; address just isn't kept on a list |
| `SLACK_REPORT_BOT_TOKEN` | Daily tool CTA experiment report to `#gainframe-alerts` | scheduled report is logged as skipped |

### Scheduled experiment report

Cloudflare runs the `tool_result_cta_v1` PostHog-to-Slack report every day at
`14:05 UTC`. It compares unique viewers and clickers for the Improve, Track,
and Future CTA variants over the trailing 24 hours and trailing 7 days. The
report excludes `gf_cta_variant` QA overrides. Configure the GainFrame Slack
bot token with `npx wrangler secret put SLACK_REPORT_BOT_TOKEN`;
`SLACK_REPORT_CHANNEL_ID` points at `#gainframe-alerts`, and
`POSTHOG_PERSONAL_API_KEY` is the same read-only secret used by `/api/stats`
and the admin dashboard.

### Website analytics consent

`/api/privacy-region` uses Cloudflare's request country only to return a
yes-or-no consent requirement; the country code is not exposed to the static
site. The website's GA4, PostHog, and Microsoft Clarity loading rules live in
`web/components/AnalyticsConsentManager.tsx`. Clarity loads on every production
website route after consent is granted or implied. See
`web/docs/analytics-consent.md` before changing analytics loading behavior.
