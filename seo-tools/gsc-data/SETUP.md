# GSC Data Setup

How to make Google Search Console data available to the `keyword-discovery` skill. There are two paths — the MCP path is preferred (live data, no manual exports). The CSV path is a fallback if MCP credentials aren't wired up.

---

## Path A (preferred): GSC MCP

When configured, the `mcp__gsc__*` tools give the `keyword-discovery` skill (and any other skill) live access to Search Console without manual CSV exports.

### One-time setup (~10 min)

#### Step 1 — Google Cloud project

You probably already have one (`gen-lang-client-0641109749` powers the analytics MCP). Reuse it.

1. Open [console.cloud.google.com](https://console.cloud.google.com/)
2. Select your project (or create one if starting fresh)
3. **APIs & Services → Library →** enable **Google Search Console API**

#### Step 2 — Service account

Reuse an existing one if it already has GSC access, or create a new one:

1. **IAM & Admin → Service Accounts → Create service account**
2. Name it something like `gsc-mcp` (the exact name doesn't matter)
3. Skip optional steps (grants, user access)
4. Open the new service account → **Keys → Add Key → Create new key → JSON** → save the download

#### Step 3 — Drop the key + lock perms

```bash
mv ~/Downloads/gen-lang-client-*.json /Users/michael.rode/.config/gainframe/gsc-service-account.json
chmod 600 /Users/michael.rode/.config/gainframe/gsc-service-account.json
```

#### Step 4 — Add the service account to GSC

1. Open [Google Search Console](https://search.google.com/search-console)
2. Settings (gear icon) → **Users and permissions → Add user**
3. Paste the service account email (looks like `xxx@<project>.iam.gserviceaccount.com` — copy from the JSON file's `client_email` field)
4. Permission: **Full** (Restricted works for read-only queries; Full is required if you want `mcp__gsc__batch_url_inspection` to also submit re-index requests)

> If GSC says "email not found": the service account hasn't been used yet, so Google's user-lookup directory hasn't indexed it. Authenticate once via the test command in Step 6 — that registers the account — then retry adding the user. Or try the add in an incognito browser to bypass autocomplete caching.

#### Step 5 — Register the MCP in `~/.claude.json`

```json
"mcpServers": {
  "gsc": {
    "type": "stdio",
    "command": "pipx",
    "args": ["run", "mcp-gsc"],
    "env": {
      "GSC_CREDENTIALS_PATH": "/Users/michael.rode/.config/gainframe/gsc-service-account.json"
    }
  }
}
```

#### Step 6 — Restart Claude Code and test

After fully quitting and relaunching, run:

```
mcp__gsc__list_properties
```

You should see `sc-domain:gainframe.app (siteFullUser)`.

If it errors with "Service account credentials file not found," check the path in `~/.claude.json` matches the actual file location and that file permissions are readable by your user.

### Refreshing data

There's nothing to refresh — every MCP call pulls live from Google with the standard ~2-day GSC reporting lag.

### What `keyword-discovery` does with the MCP

Phase 0.5 of the skill calls:

| MCP tool | Purpose |
|---|---|
| `mcp__gsc__list_properties` | Confirms credentials and discovers the property URL |
| `mcp__gsc__get_search_analytics` | Pulls last 90d of queries (matches CSV export window) |
| `mcp__gsc__compare_search_periods` | Detects trending queries (latest 28d vs prior 28d) |
| `mcp__gsc__batch_url_inspection` | Used downstream of `keyword-discovery` to audit indexing status on existing posts |

Property identifier: **`sc-domain:gainframe.app`** (this is a Domain property — covers http/https + www/non-www in aggregate). NOT `https://gainframe.app/`.

---

## Path B (fallback): CSV export

Use this if the MCP isn't configured (e.g., you're running in a context without MCP access, or credentials are being rotated).

### Manual export

1. Open [Google Search Console](https://search.google.com/search-console) → Performance → Search results
2. Set the date range (last 3 months is standard)
3. Click **Export → Download CSV**. The zip contains `Queries.csv`, `Pages.csv`, `Chart.csv`, plus a few smaller files.
4. Save (or symlink) the latest export's `Queries.csv` to:

   ```
   /Users/michael.rode/code/project/gain-frame-privacy/seo-tools/gsc-data/queries.csv
   ```

   The `keyword-discovery` skill's Phase 0.5 reads that exact path as fallback when the MCP isn't available.

### What gets written

`queries.csv` columns match GSC's export format:

| Column | Description |
|---|---|
| Query | The search query |
| Clicks | Number of clicks in the date range |
| Impressions | Number of times the result appeared |
| CTR | Click-through rate as a percentage (e.g. 4.8) |
| Position | Average ranking position |

The `seo-tools/gsc-data/` directory is gitignored — real traffic data won't be committed.

---

## Troubleshooting

**`mcp__gsc__list_properties` returns empty** — credentials work but the service account isn't a user on any GSC property yet. Complete Step 4 of the MCP path.

**`mcp__gsc__list_properties` returns "credentials file not found"** — `~/.claude.json`'s `GSC_CREDENTIALS_PATH` doesn't point at a readable file. Verify with `ls -la /Users/michael.rode/.config/gainframe/gsc-service-account.json`.

**"Access Not Configured" error** — the Search Console API isn't enabled on the GCP project. Re-do Step 1.

**MCP picks up wrong property** — always pass `site_url="sc-domain:gainframe.app"` (Domain property), not `"https://gainframe.app/"` (URL-prefix property — separate entity with separate data even if both verified).

**CSV path: "Site not found"** — when running an external fetch script directly (not via MCP), the `SITE_URL` must exactly match how the property appears in GSC. For domain properties, prefix with `sc-domain:`.
