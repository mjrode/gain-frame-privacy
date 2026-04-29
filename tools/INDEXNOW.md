# IndexNow

## What it is

[IndexNow](https://www.indexnow.org/) is an open protocol that lets you
notify search engines the moment a URL is added or updated, instead of
waiting for them to crawl the sitemap on their own schedule.

**Participating engines:** Bing, Yandex, Seznam, Naver, Yep, and a handful
of smaller engines. **Google does NOT participate** as of 2026.

The cost is near-zero (one HTTP POST), and even though Google ignores it,
it meaningfully reduces "Discovered – currently not indexed" lag for the
engines that do honor it.

## How auth works

IndexNow uses a public-key-as-file scheme:

1. Pick a 32-char hex key. Ours is `99929eeb331db70cd363352a87102acf`.
2. Drop a text file named `<key>.txt` at the site root. Its content is
   exactly the key, no trailing newline. We have:
   `https://gainframe.app/99929eeb331db70cd363352a87102acf.txt`
3. When pinging IndexNow, the engine fetches that file and verifies the
   key matches. If it does, the ping is accepted.

Don't rotate the key unless you have to — every engine cache invalidates
when the key changes and you'll see a couple days of failed pings.

## How to use the script

```bash
# URLs as CLI args
python3 tools/indexnow-ping.py https://gainframe.app/blog/post-a/

# URLs from stdin
cat /tmp/urls.txt | python3 tools/indexnow-ping.py

# Mix: CLI args + stdin
python3 tools/indexnow-ping.py https://gainframe.app/blog/featured/ < /tmp/more.txt
```

The script:
- accepts URLs from args and/or stdin (deduped, in order)
- requires every URL to be under `https://gainframe.app/` (IndexNow
  rejects cross-host submissions)
- POSTs to `https://api.indexnow.org/indexnow`
- prints status + response body
- appends a row to `tools/indexnow-log.csv` (this file is gitignored)

Successful responses: **200 OK** (URLs accepted, will be processed) or
**202 Accepted** (URLs queued for validation; key file fetch pending).
Anything else and the script exits non-zero.

## When to ping

- **New blog post published** — ping the post URL.
- **Significant content update** — ping the URL again. IndexNow has
  per-host rate limits (~10k/day) so pinging on every minor edit is
  fine.
- **Sitewide changes** — don't bulk-ping the whole site without reason;
  it can be flagged as spammy.

## Adding new URLs in the future

When a new post ships, add the URL to your post-deploy step:

```bash
python3 tools/indexnow-ping.py https://gainframe.app/blog/<new-slug>/
```

Or append to `tools/indexnow-batch.txt` and pipe it:

```bash
echo "https://gainframe.app/blog/<new-slug>/" >> /tmp/indexnow-queue.txt
cat /tmp/indexnow-queue.txt | python3 tools/indexnow-ping.py
```

## Why we set this up (2026-04-29 context)

After Phase 3 of the SEO retrofit, an indexing audit found that **21 of
29 unindexed posts** were in the "Discovered – currently not indexed"
state in Google Search Console — Google had heard of them but hadn't
crawled them. Google ignores IndexNow, but Bing/Yandex/Seznam/Naver
honor it, and a faster path to indexing on those engines plus
cross-engine canonical signals can indirectly help Google's
discovery process. The setup cost was 30 minutes; the upside is
non-zero and the downside is essentially zero.

## Reference: full audit
See `/tmp/indexing-audit-2026-04-29.md` for the per-URL diagnosis that
prompted this setup.
