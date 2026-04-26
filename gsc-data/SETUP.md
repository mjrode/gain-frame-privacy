# GSC Data Setup

Pulls Google Search Console query data into `queries.csv` so the `keyword-discovery` skill can analyze it automatically.

## One-time setup (~5 minutes)

### Step 1 — Install dependencies

```bash
pip3 install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### Step 2 — Create a Google Cloud project and enable the API

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Click the project dropdown (top left) → **New Project** → name it anything (e.g. `GainFrame GSC`)
3. Once in the project: **APIs & Services** → **Enable APIs and Services**
4. Search for **Google Search Console API** → click it → **Enable**

### Step 3 — Create OAuth credentials

1. **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**
2. If prompted to configure a consent screen: choose **External**, fill in app name (`GainFrame GSC`), your email for support and developer contact, save
3. Back on Create OAuth client ID:
   - **Application type:** Desktop app
   - **Name:** anything (e.g. `GainFrame GSC CLI`)
4. Click **Create**
5. Click **Download JSON** on the confirmation dialog
6. Save the downloaded file as **`gsc-data/client_secrets.json`** in this project

> `client_secrets.json` is gitignored — it won't be committed.

### Step 4 — Run the fetch script

```bash
python3 gsc-data/fetch.py
```

- A browser window opens for Google OAuth consent
- Select your Google account (the one that owns the Search Console property)
- Click **Allow**
- The script fetches the last 90 days of query data
- `gsc-data/queries.csv` is written
- `gsc-data/token.json` is saved (so you don't need to re-auth)

---

## Refreshing data

Any time you want fresh GSC data:

```bash
python3 gsc-data/fetch.py
```

The token auto-refreshes. No browser needed after the first run.

---

## What gets written

`queries.csv` columns match the GSC Performance export format:

| Column | Description |
|---|---|
| Query | The search query |
| Clicks | Number of clicks in the date range |
| Impressions | Number of times the result appeared |
| CTR | Click-through rate as a percentage (e.g. 4.8) |
| Position | Average ranking position |

The `keyword-discovery` skill reads this file automatically at Phase 0.5 on every run.

---

## Troubleshooting

**"Access Not Configured" error** — the Search Console API isn't enabled. Go back to Step 2 and enable it.

**"Site not found" error** — the `SITE_URL` in `fetch.py` must exactly match how your property appears in GSC. Common mismatch: `https://gainframe.app/` vs `sc-domain:gainframe.app`. Check GSC → property selector for the exact format and update line 15 of `fetch.py`.

**OAuth consent screen says "app not verified"** — click **Advanced** → **Go to [app name] (unsafe)**. This is expected for internal/personal tools that haven't been through Google's app verification. It's your own OAuth app accessing your own GSC data.

**Token expired after long break** — the script handles this automatically by refreshing. If refresh fails, delete `token.json` and run again to re-auth.
