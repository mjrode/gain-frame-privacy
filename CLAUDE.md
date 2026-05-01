# gain-frame-privacy

## Repo layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js 16 site (static export → Cloudflare Pages) |
| `docs/` | Legacy Jekyll/GitHub Pages site (superseded) |

## Cloudflare Pages deployment

### Automatic (normal flow)
Push to `main` → Cloudflare Pages builds and deploys automatically.

### CLI deploy (manual / branch previews)

Install the CLI once:
```bash
npm install -g wrangler
wrangler login
```

Build locally, then upload the static output:
```bash
cd web
npm run build                          # outputs to web/out/
npx wrangler pages deploy out \
  --project-name gain-frame-privacy    # deploys to gain-frame-privacy.pages.dev
```

To deploy a named preview (e.g. for a feature branch):
```bash
npx wrangler pages deploy out \
  --project-name gain-frame-privacy \
  --branch my-feature-branch           # available at a unique preview URL
```

### Cloudflare Pages build config (set in dashboard)
| Setting | Value |
|---------|-------|
| Framework preset | None |
| Build command | `cd web && npm install && npm run build` |
| Build output directory | `web/out` |
| Environment variable | `NODE_VERSION=20` |
| Production branch | `main` |
