#!/usr/bin/env node
// Converts each docs/blog/<slug>/index.html into content/blog/<slug>.mdx
// with YAML frontmatter + Markdown body.
//
// Strategy:
//   1. Parse meta from <head> (og tags, twitter tags, ld+json schemas, dates).
//   2. Extract post-container from <body>.
//   3. Parse post-header → frontmatter fields (title, breadcrumb, meta, cover).
//   4. Extract post-body content.
//   5. Convert post-body HTML to Markdown via turndown.
//   6. Preserve custom-class wrappers as raw HTML — MDX accepts inline HTML.
//   7. Emit .mdx with frontmatter (YAML) + body.
//
// Run: node scripts/convert-blog-to-mdx.mjs

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, "..", "..", "docs", "blog");
const contentDir = path.join(__dirname, "..", "content", "blog");

// Configure turndown
function makeTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    hr: "---",
  });
  td.use(gfm);

  // Preserve every element that carries a class attribute — they're all
  // CSS-styled in styles.css and lose styling if turndown converts them to
  // plain markdown. Covers post-* (callout, table-wrapper, inline-screenshot,
  // divider, related, footer), scenario-* and stack-* card grids, badge-*,
  // chart-* visualizations, methods-table, blog-cta, and dozens more.
  // Also always keep figures, iframes, videos, asides regardless of class.
  td.keep((node) => {
    if (["FIGURE", "IFRAME", "VIDEO", "ASIDE"].includes(node.nodeName)) {
      return true;
    }
    const cls = node.getAttribute && node.getAttribute("class");
    return Boolean(cls && cls.trim());
  });

  // turndown's built-in `hr` rule fires before keep(), so <hr class="post-divider">
  // gets converted to `---` despite the keep filter. Add an explicit rule that
  // emits the raw tag so the editorial three-dot divider styling is preserved.
  td.addRule("post-divider-hr", {
    filter: (node) =>
      node.nodeName === "HR" &&
      /\bpost-divider\b/.test(node.getAttribute("class") || ""),
    replacement: (_content, node) =>
      `\n\n<hr class="${node.getAttribute("class")}">\n\n`,
  });

  // Strip empty paragraphs (artifact of HTML formatting)
  td.addRule("strip-empty-p", {
    filter: (node) =>
      node.nodeName === "P" &&
      !node.textContent.trim() &&
      node.querySelectorAll("img, video, iframe").length === 0,
    replacement: () => "",
  });

  return td;
}

// Find the matching closing tag for an opening tag, respecting nesting.
// Returns the index where the matching close starts, or -1.
function findMatchingClose(html, openIdx, openTag, tagName) {
  const openRe = new RegExp(`<${tagName}\\b`, "ig");
  const closeRe = new RegExp(`<\\/${tagName}>`, "ig");
  let cursor = openIdx + openTag.length;
  let depth = 1;
  while (cursor < html.length) {
    openRe.lastIndex = cursor;
    closeRe.lastIndex = cursor;
    const o = openRe.exec(html);
    const c = closeRe.exec(html);
    if (!c) return -1;
    if (o && o.index < c.index) {
      depth++;
      cursor = o.index + 1;
    } else {
      depth--;
      if (depth === 0) return c.index;
      cursor = c.index + c[0].length;
    }
  }
  return -1;
}

// Extract the post-container HTML from the full page body (strips nav, scripts, etc.)
function extractContainer(fullHtml) {
  const re = /<div\s+class=["'][^"']*\bpost-container\b[^"']*["'][^>]*>/i;
  const m = re.exec(fullHtml);
  if (!m) return fullHtml;
  const closeIdx = findMatchingClose(fullHtml, m.index, m[0], "div");
  if (closeIdx === -1) return fullHtml.slice(m.index);
  return fullHtml.slice(m.index, closeIdx + "</div>".length);
}

// Pull the contents of every <style> block inside the post body and concatenate
// them. The page template renders this as a per-post <style> tag so bespoke
// classes (scenario-grid, stack-card, decision-grid, etc.) keep their visuals.
function extractInlineStyles(html) {
  const blocks = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const css = m[1].trim();
    if (css) blocks.push(css);
  }
  return blocks.join("\n\n");
}

// Parse meta from <head> section of the full HTML page.
function parseMeta(html, slug) {
  const head = /<head[\s\S]*?<\/head>/i.exec(html)?.[0] ?? "";

  const getMeta = (attrName, attrValue) => {
    const re = new RegExp(
      `<meta\\s+${attrName}=["']${attrValue}["']\\s+content=["']([^"']+)["']|` +
        `<meta\\s+content=["']([^"']+)["']\\s+${attrName}=["']${attrValue}["']`,
      "i",
    );
    const m = re.exec(head);
    return m ? (m[1] ?? m[2]) : undefined;
  };

  const canonical =
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i.exec(head)?.[1];

  // Extract all ld+json schema blocks
  const schemas = [];
  const schemaRe = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let sm;
  while ((sm = schemaRe.exec(head)) !== null) {
    try {
      schemas.push(JSON.parse(sm[1]));
    } catch {}
  }

  // Pull datePublished/dateModified from the Article schema if present
  let datePublished, dateModified;
  for (const s of schemas) {
    if (s["@type"] === "Article") {
      datePublished = s.datePublished;
      dateModified = s.dateModified;
      break;
    }
  }

  return {
    slug,
    description: getMeta("name", "description"),
    canonical,
    ogTitle: getMeta("property", "og:title"),
    ogDescription: getMeta("property", "og:description"),
    ogImage: getMeta("property", "og:image"),
    ogType: getMeta("property", "og:type"),
    twitterTitle: getMeta("name", "twitter:title"),
    twitterDescription: getMeta("name", "twitter:description"),
    twitterImage: getMeta("name", "twitter:image"),
    datePublished,
    dateModified,
    schemas,
  };
}

// Parse the post-header out of the raw body HTML.
function parseHeader(html) {
  // post-header may be <div class="post-header"> OR <header class="post-header">
  const headerOpenRe =
    /<(div|header)\s+class=["'][^"']*\bpost-header\b[^"']*["'][^>]*>/i;
  const m = headerOpenRe.exec(html);
  if (!m) return { fields: {}, headerEnd: 0 };
  const tagName = m[1].toLowerCase();
  const closeIdx = findMatchingClose(html, m.index, m[0], tagName);
  if (closeIdx === -1) return { fields: {}, headerEnd: 0 };
  const inner = html.slice(m.index + m[0].length, closeIdx);
  const headerEnd = closeIdx + `</${tagName}>`.length;

  const get = (re) => {
    const x = re.exec(inner);
    return x ? x[1].trim() : undefined;
  };

  const breadcrumbCategory = (() => {
    // last <span> after "<a href="/blog/">Blog</a><span>›</span>"
    const spans = [...inner.matchAll(/<span[^>]*>([^<]+)<\/span>/g)].map((x) =>
      x[1].trim(),
    );
    // skip "›" and ">" separator, pick category text
    return spans.find((s) => s && !/^[›>]$/.test(s));
  })();

  const title = get(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const category = get(
    /<span\s+class=["'][^"']*\bpost-category\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
  );
  const displayDate = get(
    /<span\s+class=["'][^"']*\bpost-date\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
  );
  const readTime = get(
    /<span\s+class=["'][^"']*\bpost-read-time\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
  );
  // Layout B: post-meta → h1 → post-subtitle → hero (no breadcrumb)
  const subtitle = get(
    /<p\s+class=["'][^"']*\bpost-subtitle\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i,
  );

  // post-hero-image — img may be self-closed
  let coverImage, coverAlt;
  const heroRe =
    /<div\s+class=["'][^"']*\bpost-hero-image\b[^"']*["'][^>]*>[\s\S]*?<img\s+([^>]*?)(?:\s*\/)?>/i;
  const hm = heroRe.exec(inner);
  if (hm) {
    const attrs = hm[1];
    const srcM = /\bsrc=["']([^"']+)["']/.exec(attrs);
    const altM = /\balt=["']([^"']+)["']/.exec(attrs);
    if (srcM) coverImage = srcM[1];
    if (altM) coverAlt = altM[1];
  }

  return {
    fields: {
      title: title?.replace(/<[^>]+>/g, "").trim(),
      breadcrumbCategory,
      category,
      displayDate,
      readTime,
      subtitle: subtitle?.replace(/<[^>]+>/g, "").trim(),
      coverImage,
      coverAlt,
    },
    headerEnd,
  };
}

// Extract the post-body content (everything inside .post-body).
// Also grabs post-footer which lives outside post-body in some posts.
function extractBody(html, headerEnd) {
  // Primary: find .post-body opening tag
  const bodyOpenRe =
    /<(?:div|article|section)\s+class=["'][^"']*\bpost-body\b[^"']*["'][^>]*>/i;
  const m = bodyOpenRe.exec(html);

  let bodyContent = "";
  let bodyEnd = headerEnd;

  if (m) {
    const startTag = m[0];
    const tagName = /<([a-z]+)/i.exec(startTag)[1].toLowerCase();
    const openRe = new RegExp(`<${tagName}\\b`, "ig");
    const closeRe = new RegExp(`<\\/${tagName}>`, "ig");
    let cursor = m.index + m[0].length;
    let depth = 1;
    let lastIdx = -1;
    while (cursor < html.length) {
      openRe.lastIndex = cursor;
      closeRe.lastIndex = cursor;
      const o = openRe.exec(html);
      const c = closeRe.exec(html);
      if (!c) break;
      if (o && o.index < c.index) {
        depth++;
        cursor = o.index + 1;
      } else {
        depth--;
        if (depth === 0) {
          lastIdx = c.index;
          break;
        }
        cursor = c.index + c[0].length;
      }
    }
    if (lastIdx > -1) {
      bodyContent = html.slice(m.index + startTag.length, lastIdx).trim();
      bodyEnd = lastIdx + `</${tagName}>`.length;
    }
  }

  // Also grab .post-footer if it follows post-body in the container
  const footerRe =
    /<div\s+class=["'][^"']*\bpost-footer\b[^"']*["'][^>]*>/i;
  const afterBody = html.slice(bodyEnd);
  const fm = footerRe.exec(afterBody);
  if (fm) {
    const closeIdx = findMatchingClose(
      afterBody,
      fm.index,
      fm[0],
      "div",
    );
    if (closeIdx > -1) {
      const footerHtml = afterBody.slice(fm.index, closeIdx + "</div>".length);
      bodyContent = bodyContent + "\n\n" + footerHtml.trim();
    }
  }

  if (bodyContent) return bodyContent;

  // Fallback: everything after post-header
  let rest = html.slice(headerEnd);
  rest = rest
    .replace(/^[\s\S]*?<!--\s*POST BODY[\s\S]*?-->/i, "")
    .replace(/<\/(?:div|main|article|section)>\s*$/i, "")
    .trim();
  return rest;
}

function escapeYaml(v) {
  if (v == null) return "";
  if (typeof v !== "string") return JSON.stringify(v);
  // If contains special YAML chars, double-quote and escape
  if (/[:#\n"']|^[-?!&*|>]/.test(v) || v.includes("&amp;")) {
    const unesc = v
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&mdash;/g, "—")
      .replace(/&ndash;/g, "–");
    return JSON.stringify(unesc);
  }
  return v;
}

function buildFrontmatter(meta, headerFields, customStyles) {
  const lines = ["---"];
  const push = (k, v) => {
    if (v == null || v === "") return;
    lines.push(`${k}: ${escapeYaml(v)}`);
  };
  push("title", headerFields.title || meta.ogTitle);
  push("description", meta.description);
  push("slug", meta.slug);
  push("canonical", meta.canonical);
  push("ogTitle", meta.ogTitle);
  push("ogDescription", meta.ogDescription);
  push("ogImage", meta.ogImage);
  push("ogType", meta.ogType);
  push("twitterTitle", meta.twitterTitle);
  push("twitterDescription", meta.twitterDescription);
  push("twitterImage", meta.twitterImage);
  push("datePublished", meta.datePublished);
  push("dateModified", meta.dateModified);
  push("breadcrumbCategory", headerFields.breadcrumbCategory);
  push("displayCategory", headerFields.category);
  push("displayDate", headerFields.displayDate);
  push("readTime", headerFields.readTime);
  push("subtitle", headerFields.subtitle);
  push("coverImage", headerFields.coverImage);
  push("coverAlt", headerFields.coverAlt);
  if (meta.schemas?.length) {
    lines.push("schemas:");
    for (const s of meta.schemas) {
      lines.push(`  - ${JSON.stringify(s)}`);
    }
  }
  if (customStyles && customStyles.trim()) {
    // YAML literal block: preserves newlines verbatim. Indent every line by 2.
    const indented = customStyles
      .split("\n")
      .map((l) => "  " + l)
      .join("\n");
    lines.push("customStyles: |");
    lines.push(indented);
  }
  lines.push("---");
  lines.push("");
  return lines.join("\n");
}

// Convert a CSS declaration block ("key: val; key2: val2") into the inside of a
// JSX `style={{...}}` object literal: `key1: 'val1', key2: 'val2'`.
// CSS property names are camelCased (background-color → backgroundColor) except
// for custom properties (--var-name) which are kept as quoted string keys.
// Returns "" if the declaration list has no usable declarations.
function cssDeclsToJsxStyle(decls) {
  const parts = [];
  // Split on ';' but respect parens (for var(...), linear-gradient(...), etc.)
  const tokens = [];
  let depth = 0;
  let buf = "";
  for (const ch of decls) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === ";" && depth === 0) {
      tokens.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) tokens.push(buf);

  for (const tok of tokens) {
    const colon = tok.indexOf(":");
    if (colon < 0) continue;
    const key = tok.slice(0, colon).trim();
    const value = tok.slice(colon + 1).trim();
    if (!key || !value) continue;
    const jsKey = /^--/.test(key)
      ? `'${key}'`
      : key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    // Escape single quotes & backslashes inside the value string
    const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    parts.push(`${jsKey}: '${escaped}'`);
  }
  return parts.join(", ");
}

// Make HTML inside MDX JSX-compatible:
//   class= → className=
//   strip inline style="..." (cosmetic, redundant with classes)
//   self-close void elements (<br>, <hr>, <img ...>, <input>, <meta>, <link>)
//   escape { and } inside <code>/<pre> text content (MDX would parse them as JSX expressions)
const VOID_TAGS = ["br", "hr", "img", "input", "meta", "link"];
function jsxify(html) {
  let out = html;

  // <pre> blocks with blank lines break the MDX paragraph parser even inside a
  // JSX `{...}` expression — MDX's block-level parser closes on the blank line
  // before the JS expression sees it. Workaround: wrap the content in a JS
  // template-literal expression AND escape every literal newline as `\n`, so
  // the entire `{`...`}` lives on a single source line. JavaScript reinflates
  // the newlines at runtime when the template literal evaluates.
  out = out.replace(
    /<pre\b([^>]*)>([\s\S]*?)<\/pre>/gi,
    (m, attrs, inner) => {
      if (!/\n/.test(inner)) return m;
      const escaped = inner
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$\{/g, "\\${")
        .replace(/\r/g, "")
        .replace(/\n/g, "\\n");
      return `<pre${attrs}>{\`${escaped}\`}</pre>`;
    },
  );

  // Escape { and } inside <code>...</code> bodies — MDX treats `{` in JSX
  // text as the start of an expression. A literal JSON-ish snippet like
  // `{ "@type": "Person" }` chokes the acorn parser.
  out = out.replace(
    /<code\b([^>]*)>([\s\S]*?)<\/code>/gi,
    (_m, attrs, inner) =>
      `<code${attrs}>${inner.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;")}</code>`,
  );
  // class= → className=
  out = out.replace(/\bclass=(["'])/g, "className=$1");
  // Convert HTML inline `style="key: value; ..."` into a JSX style prop
  // `style={{key: 'value', ...}}`. Required for chart bars whose widths /
  // heights / opacities are dynamic per-element and cannot move to global
  // CSS. Falls back to stripping if the declaration block is empty.
  out = out.replace(
    /\s+style=(["'])([^"']*)\1/gi,
    (_m, _q, decls) => {
      const obj = cssDeclsToJsxStyle(decls);
      return obj ? ` style={{${obj}}}` : "";
    },
  );
  // self-close void elements
  for (const tag of VOID_TAGS) {
    const re = new RegExp(`<${tag}\\b([^>]*?)(\\s*/)?>`, "gi");
    out = out.replace(re, (_m, attrs) => `<${tag}${attrs} />`);
  }
  return out;
}

// Rewrite <table> elements (and any wrapper) to the canonical post-table-wrapper /
// post-table classes. Strips legacy comp-table styling artifacts. Wraps bare
// <table>s that were not already inside a post-table-wrapper. Idempotent.
function normalizeTables(html) {
  let out = html;

  // Replace legacy class names on the wrapper
  out = out.replace(
    /\bclass=(["'])([^"']*?)\bcomp-table-wrap\b([^"']*?)\1/g,
    (_m, q, pre, post) =>
      `class=${q}${(pre + " post-table-wrapper " + post).replace(/\s+/g, " ").trim()}${q}`,
  );

  // Replace legacy class names on the table itself
  out = out.replace(
    /\bclass=(["'])([^"']*?)\bcomp-table\b([^"']*?)\1/g,
    (_m, q, pre, post) =>
      `class=${q}${(pre + " post-table " + post).replace(/\s+/g, " ").trim()}${q}`,
  );

  // Drop the legacy `gf` highlight class — column highlighting is now handled
  // entirely by .post-table CSS based on column position.
  out = out.replace(/\bclass=(["'])gf\1/g, "");
  out = out.replace(
    /\bclass=(["'])([^"']*?)\bgf\b([^"']*?)\1/g,
    (_m, q, pre, post) => {
      const cls = (pre + " " + post).replace(/\s+/g, " ").trim();
      return cls ? `class=${q}${cls}${q}` : "";
    },
  );

  // Wrap bare <table>s (not already inside a post-table-wrapper). We detect by
  // looking back for the opening wrapper a few hundred chars before the table.
  out = out.replace(/<table\b([^>]*)>/gi, (m, attrs, offset, full) => {
    const before = full.slice(Math.max(0, offset - 400), offset);
    const alreadyWrapped =
      /<div\s+class=["'][^"']*\bpost-table-wrapper\b[^"']*["'][^>]*>\s*$/.test(
        before,
      );
    // Ensure the table itself carries the post-table class
    const hasClass = /\bclass=/.test(attrs);
    const newAttrs = hasClass
      ? attrs.replace(
          /\bclass=(["'])([^"']*)\1/,
          (_a, q, v) =>
            /\bpost-table\b/.test(v)
              ? `class=${q}${v}${q}`
              : `class=${q}${(v + " post-table").trim()}${q}`,
        )
      : `${attrs} class="post-table"`;
    const newOpen = `<table${newAttrs}>`;
    return alreadyWrapped ? newOpen : `<div class="post-table-wrapper">${newOpen}`;
  });

  // For the bare <table>s we just wrapped, close the wrapper after </table>.
  // We do this by tracking which tables had a wrapper inserted — easier path:
  // append a closing </div> to every </table> that wasn't already followed by
  // one. The keep filter and idempotence handle the rest.
  out = out.replace(/<\/table>(?!\s*<\/div>)/gi, "</table></div>");

  return out;
}

async function processOne(slug) {
  const htmlPath = path.join(docsDir, slug, "index.html");
  if (!existsSync(htmlPath)) return null;

  const fullHtml = await readFile(htmlPath, "utf8");

  // Extract meta from <head>
  const meta = parseMeta(fullHtml, slug);

  // Extract post-container from body (strips nav/footer/scripts)
  const containerHtml = extractContainer(fullHtml);

  const { fields: headerFields, headerEnd } = parseHeader(containerHtml);
  let bodyHtml = extractBody(containerHtml, headerEnd);

  // Lift inline <style> blocks out of the page head AND body into a
  // frontmatter field. CSS curly braces break the MDX acorn parser, so we
  // cannot leave them inline, but the styles are bespoke per-post (scenario
  // cards, stack grids, etc.) and must follow the post into Next.
  const inlineCss = extractInlineStyles(fullHtml);
  bodyHtml = bodyHtml.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Strip GA / external scripts
  bodyHtml = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Normalize comparison/legacy table classes to the canonical post-table CSS so
  // the keep filter preserves them as raw HTML (turndown's gfm plugin would
  // otherwise convert them to pipe-table syntax that next-mdx-remote does not
  // parse without remark-gfm).
  bodyHtml = normalizeTables(bodyHtml);

  const td = makeTurndown();
  let markdown = td.turndown(bodyHtml);

  // Make retained raw HTML JSX-compatible
  markdown = jsxify(markdown);

  // Escape literal "<" that's not the start of a tag.
  // MDX treats `<5%` as the start of a JSX tag and chokes.
  markdown = markdown
    .replace(/<(\d)/g, "&lt;$1")
    .replace(/<\s/g, "&lt; ")
    .replace(/<=/g, "&lt;=");

  // Normalize multiple blank lines
  markdown = markdown.replace(/\n{3,}/g, "\n\n").trim() + "\n";

  const frontmatter = buildFrontmatter(meta, headerFields, inlineCss);
  const out = frontmatter + markdown;

  const dest = path.join(contentDir, `${slug}.mdx`);
  await writeFile(dest, out);
  return slug;
}

async function main() {
  await mkdir(contentDir, { recursive: true });
  const entries = await readdir(docsDir, { withFileTypes: true });
  const slugs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  console.log("Converting", slugs.length, "blog posts to MDX…");
  const ok = [];
  const failed = [];
  for (const slug of slugs) {
    try {
      const r = await processOne(slug);
      if (r) ok.push(r);
      else console.log(`  skip: ${slug} (no index.html)`);
    } catch (e) {
      failed.push({ slug, error: e.message });
      console.error(`  FAIL: ${slug} — ${e.message}`);
    }
  }
  console.log(`\nOK: ${ok.length}  Failed: ${failed.length}`);
  if (failed.length) console.log("Failures:", JSON.stringify(failed, null, 2));
}

await main();
