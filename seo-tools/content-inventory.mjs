#!/usr/bin/env node
/**
 * content-inventory.mjs — local, offline facts about the gainframe.app blog.
 *
 * No network, no model, no API keys. Everything here is derived from
 * web/content/blog/*.mdx and the files on disk, so it is cheap to run as often
 * as you like and it never disagrees with production for reasons you can't see.
 *
 * Usage:
 *   node seo-tools/content-inventory.mjs              # full JSON
 *   node seo-tools/content-inventory.mjs --markdown   # human-readable report
 *   node seo-tools/content-inventory.mjs --check      # gate: exit 1 on hard failures
 *   node seo-tools/content-inventory.mjs --slug foo   # one post's row
 *   node seo-tools/content-inventory.mjs --check --slug foo # strict new/modified-post gate
 *
 * What it reports:
 *   - link graph      inbound/outbound internal links between posts (orphans)
 *   - cannibalization title+description keyword overlap between post pairs
 *   - freshness       posts whose dateModified is older than 180 days
 *   - quick answer    the 40-60 word AEO block, counted
 *   - assets          cover.webp presence for every post that references one
 *   - hygiene         canonical, description length, structured-data contract, long dashes
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(REPO, "web", "content", "blog");
const ASSET_DIR = path.join(REPO, "docs", "blog");

const STALE_DAYS = 180;
const OVERLAP_THRESHOLD = 0.6;
const QUICK_ANSWER_MIN = 40;
const QUICK_ANSWER_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 165;
const AUTHOR = {
  "@type": "Person",
  name: "Michael Rode",
  url: "https://gainframe.app/about",
};
const PUBLISHER = {
  "@type": "Organization",
  name: "GainFrame",
  url: "https://gainframe.app",
  logo: {
    "@type": "ImageObject",
    url: "https://gainframe.app/assets/favicons/favicon.webp",
  },
};

// The founder / product-announcement lane (topical map cluster 12-13) is judged
// on sessions and social traction, never on GSC. Those posts do not need a
// Quick Answer block, so flagging them as defects just trains you to skim.
const SEO_EXEMPT_CATEGORIES = new Set(
  [
    "founder story",
    "product",
    "product update",
    "announcement",
    "community",
    "case study",
    "deep dive",
    "integration",
  ].map((c) => c.toLowerCase()),
);

const STOP_WORDS = new Set(
  ("a an and are as at be by for from how in is it its of on or that the to " +
    "was what when where which who why will with your you youre their there " +
    "this these those does do can could should would has have had but not " +
    "vs versus best top guide review app apps 2026 2025").split(" "),
);

// ---------------------------------------------------------------- parsing ---

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: raw };
  const block = raw.slice(3, end);
  const body = raw.slice(end + 4);

  // Deliberately shallow: we only need scalar keys plus the raw schema lines.
  const data = {};
  for (const line of block.split("\n")) {
    const m = /^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)$/.exec(line);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[m[1]] = value;
  }
  data.__schemaBlock = block;
  return { data, body };
}

function firstMatch(re, text) {
  const m = re.exec(text);
  return m ? m[1] : undefined;
}

function words(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/[\s-]+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t)),
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared += 1;
  return shared / (a.size + b.size - shared);
}

function daysSince(iso) {
  if (!iso) return undefined;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return undefined;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function normalizeText(text) {
  return String(text ?? "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`#>]/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSchemas(schemaBlock) {
  const schemas = [];
  const errors = [];
  for (const [index, line] of schemaBlock.split("\n").entries()) {
    const match = /^\s*-\s*(\{.*\})\s*$/.exec(line);
    if (!match) continue;
    try {
      schemas.push(JSON.parse(match[1]));
    } catch (error) {
      errors.push(`schema line ${index + 1} is invalid JSON: ${error.message}`);
    }
  }
  return { schemas, errors };
}

function blogLinks(text) {
  return new Set([
    ...[...text.matchAll(/href="\/blog\/([a-z0-9-]+)\/?"/g)].map((m) => m[1]),
    ...[...text.matchAll(/\]\(\.\.\/([a-z0-9-]+)\/?\)/g)].map((m) => m[1]),
    ...[...text.matchAll(/\]\(\/blog\/([a-z0-9-]+)\/?\)/g)].map((m) => m[1]),
  ]);
}

function validateSchemaContract(post) {
  const errors = [...post.schemaParseErrors];
  const expectedCanonical = `https://gainframe.app/blog/${post.slug}/`;
  const article = post.schemas.find((schema) =>
    ["BlogPosting", "Article"].includes(schema["@type"]),
  );
  const breadcrumb = post.schemas.find((schema) => schema["@type"] === "BreadcrumbList");
  const faq = post.schemas.find((schema) => schema["@type"] === "FAQPage");

  if (post.canonical !== expectedCanonical) {
    errors.push(`canonical must be ${expectedCanonical}`);
  }
  if (!article) {
    errors.push("missing BlogPosting or Article schema");
  } else {
    if (article["@context"] !== "https://schema.org") errors.push("Article @context must be https://schema.org");
    if (article.headline !== post.title) errors.push("Article headline must match frontmatter title");
    if (article.description !== post.description) errors.push("Article description must match frontmatter description");
    if (article.image !== `${expectedCanonical}assets/cover.webp`) errors.push("Article image must use the canonical cover.webp URL");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(article.datePublished ?? "")) errors.push("Article datePublished must be YYYY-MM-DD");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(article.dateModified ?? "")) errors.push("Article dateModified must be YYYY-MM-DD");
    if ((article.dateModified ?? "") < (article.datePublished ?? "")) errors.push("Article dateModified cannot precede datePublished");
    if (JSON.stringify(article.author) !== JSON.stringify(AUTHOR)) errors.push("Article author does not match the canonical Michael Rode entity");
    if (JSON.stringify(article.publisher) !== JSON.stringify(PUBLISHER)) errors.push("Article publisher does not match the canonical GainFrame entity");
    if (article.mainEntityOfPage?.["@id"] !== expectedCanonical) errors.push("Article mainEntityOfPage must match canonical");
    if (article.articleSection !== post.category) errors.push("Article articleSection must match the display category");
  }

  if (!breadcrumb) {
    errors.push("missing BreadcrumbList schema");
  } else {
    const items = breadcrumb.itemListElement;
    if (!Array.isArray(items) || !items.length) {
      errors.push("BreadcrumbList must contain itemListElement entries");
    } else {
      const finalItem = items.at(-1);
      if (finalItem?.item !== expectedCanonical) errors.push("final breadcrumb URL must match canonical");
      if (finalItem?.position !== items.length) errors.push("final breadcrumb position must match the item count");
    }
  }

  if (!post.seoExempt && !faq) {
    errors.push("SEO-lane post is missing FAQPage schema");
  }
  if (faq) {
    if (!Array.isArray(faq.mainEntity) || !faq.mainEntity.length) {
      errors.push("FAQPage must contain mainEntity questions");
    } else {
      for (const [index, entity] of faq.mainEntity.entries()) {
        const question = normalizeText(entity.name);
        const answer = normalizeText(entity.acceptedAnswer?.text);
        if (!question || !post.visibleBody.includes(question)) errors.push(`FAQ question ${index + 1} does not appear in the visible body`);
        if (!answer || !post.visibleBody.includes(answer)) errors.push(`FAQ answer ${index + 1} does not match the visible body`);
      }
    }
  }

  return errors;
}

// ------------------------------------------------------------------ load ----

async function loadPosts() {
  const files = (await fs.readdir(BLOG_DIR)).filter((f) => f.endsWith(".mdx"));

  return Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = await fs.readFile(path.join(BLOG_DIR, file), "utf8");
      const { data, body } = parseFrontmatter(raw);
      const schemaBlock = data.__schemaBlock ?? "";
      const { schemas, errors: schemaParseErrors } = extractSchemas(schemaBlock);

      // Two link styles coexist in this corpus and both count as real internal
      // links. Newer posts use absolute hrefs; older ones use markdown
      // relative links (189 of them as of 2026-08-01). Counting only the first
      // style reported linked posts as orphans.
      const outbound = blogLinks(body);
      outbound.delete(slug);
      const relatedStart = body.search(/<div\s+class(?:Name)?=["']post-related/);
      const contextualBody = relatedStart === -1 ? body : body.slice(0, relatedStart);
      const contextualOutbound = blogLinks(contextualBody);
      contextualOutbound.delete(slug);

      const toolLinks = new Set(
        [...body.matchAll(/href="\/tools\/([a-z0-9-]+)\/?"/g)].map((m) => m[1]),
      );

      const quickAnswer = firstMatch(
        /post-quick-answer[^>]*>\s*<p>\s*<strong>Quick answer:<\/strong>([\s\S]*?)<\/p>/,
        body,
      );

      return {
        slug,
        title: data.title ?? "",
        description: data.description ?? "",
        category: data.displayCategory ?? data.breadcrumbCategory ?? "",
        canonical: data.canonical ?? "",
        datePublished: firstMatch(/"datePublished":"([\d-]+)"/, schemaBlock),
        dateModified: firstMatch(/"dateModified":"([\d-]+)"/, schemaBlock),
        schemas,
        schemaParseErrors,
        outbound: [...outbound],
        contextualOutbound: [...contextualOutbound],
        toolLinks: [...toolLinks],
        inbound: [],
        contextualInbound: [],
        quickAnswerWords: quickAnswer ? words(quickAnswer).length : 0,
        hasQuickAnswer: Boolean(quickAnswer),
        hasFaqSchema: schemaBlock.includes('"@type":"FAQPage"'),
        hasBreadcrumbSchema: schemaBlock.includes('"@type":"BreadcrumbList"'),
        referencesCover: body.includes("assets/cover.webp"),
        bodyWords: words(body.replace(/<[^>]+>/g, " ")).length,
        visibleBody: normalizeText(body),
        longDashCount: (raw.match(/[—–]/g) ?? []).length,
        seoExempt: SEO_EXEMPT_CATEGORIES.has(
          (data.displayCategory ?? data.breadcrumbCategory ?? "").trim().toLowerCase(),
        ),
      };
    }),
  );
}

async function attachAssets(posts) {
  await Promise.all(
    posts.map(async (post) => {
      if (!post.referencesCover) {
        post.coverOnDisk = null;
        return;
      }
      const cover = path.join(ASSET_DIR, post.slug, "assets", "cover.webp");
      post.coverOnDisk = await fs
        .access(cover)
        .then(() => true)
        .catch(() => false);
    }),
  );
}

// --------------------------------------------------------------- analysis ---

function buildInventory(posts) {
  const bySlug = new Map(posts.map((p) => [p.slug, p]));

  const brokenLinks = [];
  for (const post of posts) {
    for (const target of post.outbound) {
      const dest = bySlug.get(target);
      if (dest) {
        dest.inbound.push(post.slug);
        if (post.contextualOutbound.includes(target)) dest.contextualInbound.push(post.slug);
      }
      else brokenLinks.push({ from: post.slug, to: target });
    }
  }

  const tokens = new Map(
    posts.map((p) => [p.slug, tokenize(`${p.title} ${p.description}`)]),
  );

  // Series pages ("Average Bicep Size" / "Average Chest Size") share a title
  // template and score high on token overlap while competing for entirely
  // different queries — verified in GSC on 2026-08-01, zero shared queries.
  // Flag them as likely-series so nobody merges two pages that never competed.
  const seriesShape = (slug) => slug.split("-").filter((t) => t.length > 2);
  const looksLikeSeries = (a, b) => {
    const [x, y] = [seriesShape(a), seriesShape(b)];
    if (x.length !== y.length) return false;
    const differing = x.filter((t, i) => t !== y[i]).length;
    return differing === 1; // identical template, one slot differs
  };

  const cannibalization = [];
  for (let i = 0; i < posts.length; i += 1) {
    for (let j = i + 1; j < posts.length; j += 1) {
      const score = jaccard(tokens.get(posts[i].slug), tokens.get(posts[j].slug));
      if (score >= OVERLAP_THRESHOLD) {
        cannibalization.push({
          a: posts[i].slug,
          b: posts[j].slug,
          overlap: Number(score.toFixed(2)),
          likelySeries: looksLikeSeries(posts[i].slug, posts[j].slug),
        });
      }
    }
  }
  cannibalization.sort((x, y) => y.overlap - x.overlap);

  const stale = posts
    .map((p) => ({ slug: p.slug, ageDays: daysSince(p.dateModified) }))
    .filter((p) => p.ageDays !== undefined && p.ageDays > STALE_DAYS)
    .sort((a, b) => b.ageDays - a.ageDays);

  const seoPosts = posts.filter(
    (p) => !SEO_EXEMPT_CATEGORIES.has(p.category.trim().toLowerCase()),
  );

  for (const post of posts) post.schemaContractIssues = validateSchemaContract(post);

  const quickAnswerIssues = seoPosts
    .filter(
      (p) =>
        !p.hasQuickAnswer ||
        p.quickAnswerWords < QUICK_ANSWER_MIN ||
        p.quickAnswerWords > QUICK_ANSWER_MAX,
    )
    .map((p) => ({
      slug: p.slug,
      words: p.quickAnswerWords,
      issue: p.hasQuickAnswer ? "out of 40-60 range" : "missing",
    }));

  const descriptionIssues = posts
    .filter(
      (p) => p.description.length < DESC_MIN || p.description.length > DESC_MAX,
    )
    .map((p) => ({ slug: p.slug, length: p.description.length }));

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    totals: {
      posts: posts.length,
      seoPosts: seoPosts.length,
      founderLanePosts: posts.length - seoPosts.length,
      internalLinks: posts.reduce((n, p) => n + p.outbound.length, 0),
      medianInbound: median(posts.map((p) => p.inbound.length)),
      medianBodyWords: median(posts.map((p) => p.bodyWords)),
    },
    orphans: posts
      .filter((p) => p.inbound.length === 0)
      .map((p) => ({ slug: p.slug, published: p.datePublished })),
    weaklyLinked: posts
      .filter((p) => p.inbound.length > 0 && p.inbound.length < 2)
      .map((p) => ({ slug: p.slug, inbound: p.inbound.length })),
    lowOutbound: posts
      .filter((p) => p.outbound.length < 3)
      .map((p) => ({ slug: p.slug, outbound: p.outbound.length })),
    brokenLinks,
    cannibalization,
    stale,
    quickAnswerIssues,
    descriptionIssues,
    missingFaqSchema: seoPosts.filter((p) => !p.hasFaqSchema).map((p) => p.slug),
    missingBreadcrumbSchema: posts
      .filter((p) => !p.hasBreadcrumbSchema)
      .map((p) => p.slug),
    missingCanonical: posts.filter((p) => !p.canonical).map((p) => p.slug),
    malformedSchema: posts
      .filter((p) => p.schemaParseErrors.length)
      .map((p) => ({ slug: p.slug, issues: p.schemaParseErrors })),
    schemaContractIssues: posts
      .filter((p) => p.schemaContractIssues.length)
      .map((p) => ({ slug: p.slug, issues: p.schemaContractIssues })),
    longDashIssues: posts
      .filter((p) => p.longDashCount)
      .map((p) => ({ slug: p.slug, count: p.longDashCount })),
    missingCover: posts
      .filter((p) => p.referencesCover && p.coverOnDisk === false)
      .map((p) => p.slug),
    posts: posts
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        published: p.datePublished,
        modified: p.dateModified,
        inbound: p.inbound.length,
        contextualInbound: p.contextualInbound.length,
        outbound: p.outbound.length,
        bodyWords: p.bodyWords,
        quickAnswerWords: p.quickAnswerWords,
        schemaContractIssues: p.schemaContractIssues,
        longDashCount: p.longDashCount,
      }))
      .sort((a, b) => (a.published ?? "").localeCompare(b.published ?? "")),
  };
}

function median(nums) {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ----------------------------------------------------------------- output ---

function toMarkdown(inv) {
  const lines = [];
  const list = (items, fmt, limit = 25) => {
    if (!items.length) return ["_none_"];
    const shown = items.slice(0, limit).map((i) => `- ${fmt(i)}`);
    if (items.length > limit) shown.push(`- _…${items.length - limit} more_`);
    return shown;
  };

  lines.push(`# Blog content inventory — ${inv.generatedAt}`, "");
  lines.push(
    `**${inv.totals.posts} posts** (${inv.totals.seoPosts} SEO lane, ` +
      `${inv.totals.founderLanePosts} founder/product lane) · ` +
      `${inv.totals.internalLinks} internal links · ` +
      `median ${inv.totals.medianInbound} inbound / ${inv.totals.medianBodyWords} words per post`,
    "",
  );

  lines.push(`## Orphans — no inbound internal links (${inv.orphans.length})`, "");
  lines.push(...list(inv.orphans, (o) => `\`${o.slug}\` (published ${o.published ?? "?"})`));
  lines.push("");

  lines.push(`## Weakly linked — 1 inbound link (${inv.weaklyLinked.length})`, "");
  lines.push(...list(inv.weaklyLinked, (o) => `\`${o.slug}\``));
  lines.push("");

  lines.push(`## Broken internal links (${inv.brokenLinks.length})`, "");
  lines.push(...list(inv.brokenLinks, (b) => `\`${b.from}\` → \`/blog/${b.to}/\` (no such post)`));
  lines.push("");

  lines.push(
    `## Cannibalization risk — title+description overlap ≥ ${OVERLAP_THRESHOLD} (${inv.cannibalization.length})`,
    "",
  );
  lines.push(
    ...list(
      inv.cannibalization,
      (c) =>
        `${c.overlap} — \`${c.a}\` vs \`${c.b}\`` +
        (c.likelySeries ? " — **likely series, verify in GSC before merging**" : ""),
    ),
  );
  lines.push(
    "",
    "> Title overlap is a candidate signal, never a verdict. Confirm the two pages actually",
    "> share queries with `mcp__gsc__get_search_by_page_query` before merging anything.",
  );
  lines.push("");

  lines.push(`## Stale — dateModified older than ${STALE_DAYS} days (${inv.stale.length})`, "");
  lines.push(...list(inv.stale, (s) => `\`${s.slug}\` — ${s.ageDays} days`));
  lines.push("");

  lines.push(`## Quick Answer problems (${inv.quickAnswerIssues.length})`, "");
  lines.push(...list(inv.quickAnswerIssues, (q) => `\`${q.slug}\` — ${q.words} words, ${q.issue}`));
  lines.push("");

  lines.push(`## Meta description outside ${DESC_MIN}-${DESC_MAX} chars (${inv.descriptionIssues.length})`, "");
  lines.push(...list(inv.descriptionIssues, (d) => `\`${d.slug}\` — ${d.length} chars`));
  lines.push("");

  lines.push("## Hygiene", "");
  lines.push(`- Missing FAQPage schema: ${inv.missingFaqSchema.length}`);
  lines.push(`- Missing BreadcrumbList schema: ${inv.missingBreadcrumbSchema.length}`);
  lines.push(`- Missing canonical: ${inv.missingCanonical.length}`);
  lines.push(`- Cover referenced but absent on disk: ${inv.missingCover.length}`);
  lines.push(`- Malformed JSON-LD: ${inv.malformedSchema.length}`);
  lines.push(`- Structured-data contract drift: ${inv.schemaContractIssues.length}`);
  lines.push(`- Posts with reader-visible long dashes: ${inv.longDashIssues.length}`);
  if (inv.missingCover.length) {
    lines.push(...inv.missingCover.map((s) => `  - \`${s}\``));
  }
  lines.push("");

  return lines.join("\n");
}

// Hard failures only — things that are broken, versus things worth reviewing.
function runCheck(inv, selectedPost) {
  const failures = [];
  if (inv.brokenLinks.length) {
    failures.push(
      `${inv.brokenLinks.length} internal link(s) point at a post that does not exist: ` +
        inv.brokenLinks.map((b) => `${b.from}→${b.to}`).join(", "),
    );
  }
  if (inv.missingCover.length) {
    failures.push(
      `${inv.missingCover.length} post(s) reference assets/cover.webp with no file on disk: ` +
        inv.missingCover.join(", "),
    );
  }
  if (inv.missingCanonical.length) {
    failures.push(`${inv.missingCanonical.length} post(s) missing canonical: ${inv.missingCanonical.join(", ")}`);
  }
  if (inv.malformedSchema.length) {
    failures.push(
      `${inv.malformedSchema.length} post(s) contain malformed JSON-LD: ` +
        inv.malformedSchema.map((p) => p.slug).join(", "),
    );
  }

  if (selectedPost) {
    if (selectedPost.schemaContractIssues.length) {
      failures.push(
        `${selectedPost.slug} structured-data contract: ${selectedPost.schemaContractIssues.join("; ")}`,
      );
    }
    if (selectedPost.longDashCount) {
      failures.push(`${selectedPost.slug} contains ${selectedPost.longDashCount} en/em dash(es)`);
    }
    if (selectedPost.inbound.length < 2) {
      failures.push(`${selectedPost.slug} needs at least 2 inbound links; found ${selectedPost.inbound.length}`);
    }
    if (selectedPost.contextualInbound.length < 1) {
      failures.push(`${selectedPost.slug} needs at least 1 contextual inbound link; found ${selectedPost.contextualInbound.length}`);
    }
  }

  const warnings = [
    `${inv.orphans.length} orphan(s)`,
    `${inv.cannibalization.length} cannibalization pair(s)`,
    `${inv.quickAnswerIssues.length} Quick Answer issue(s)`,
    `${inv.stale.length} stale post(s)`,
    `${inv.schemaContractIssues.length} structured-data contract issue(s)`,
    `${inv.longDashIssues.length} post(s) with legacy long dashes`,
  ];

  if (failures.length) {
    console.error("FAIL");
    for (const f of failures) console.error(`  ✗ ${f}`);
    console.error(`  review: ${warnings.join(" · ")}`);
    return 1;
  }
  console.log(
    `PASS — ${inv.totals.posts} posts, no broken links, missing assets, or malformed JSON-LD` +
      (selectedPost ? `; ${selectedPost.slug} passes strict launch checks` : ""),
  );
  console.log(`  review: ${warnings.join(" · ")}`);
  return 0;
}

// ------------------------------------------------------------------- main ---

const args = process.argv.slice(2);
const posts = await loadPosts();
await attachAssets(posts);
const inventory = buildInventory(posts);

const slugIndex = args.indexOf("--slug");
if (slugIndex !== -1) {
  const wanted = args[slugIndex + 1];
  const row = inventory.posts.find((p) => p.slug === wanted);
  if (!row) {
    console.error(`No post named "${wanted}"`);
    process.exit(1);
  }
  const full = posts.find((p) => p.slug === wanted);
  if (args.includes("--check")) {
    process.exit(runCheck(inventory, full));
  }
  console.log(
    JSON.stringify(
      {
        ...row,
        inboundFrom: full.inbound,
        contextualInboundFrom: full.contextualInbound,
        outboundTo: full.outbound,
        contextualOutboundTo: full.contextualOutbound,
      },
      null,
      2,
    ),
  );
} else if (args.includes("--check")) {
  process.exit(runCheck(inventory));
} else if (args.includes("--markdown")) {
  console.log(toMarkdown(inventory));
} else {
  console.log(JSON.stringify(inventory, null, 2));
}
