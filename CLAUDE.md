# gain-frame-privacy

## Communication style (applies to all replies)

Always write replies to the user in ASD-STE100 Simplified Technical English:

- Use the active voice.
- Keep sentences short: no more than 20 words in an instruction, no more than
  25 words in a description.
- Give only one instruction in each sentence.
- Use simple, approved words. Use one word for one meaning.
- Use vertical lists to present complex data.
- Start safety-related items with a clear command.

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
| `RESEND_API_KEY` | `/api/trainer-waitlist` | signups return 503 |
| `RESEND_TRAINER_AUDIENCE_ID` | `/api/trainer-waitlist` | signups return 503 |
