import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import {
  BLOG_CTA_OVERRIDES,
  BLOG_STICKY_CTA_EXPANSION_SLUGS,
  BLOG_STICKY_CTA_INITIAL_SLUGS,
  BLOG_STICKY_CTA_SLUGS,
  getBlogStickyCtaRollout,
  hasBlogStickyCta,
} from "./blog-cta.ts";

test("sticky blog CTA cohorts preserve the initial 20 and expansion 59", () => {
  assert.equal(BLOG_STICKY_CTA_INITIAL_SLUGS.length, 20);
  assert.equal(BLOG_STICKY_CTA_EXPANSION_SLUGS.length, 59);
  assert.equal(BLOG_STICKY_CTA_SLUGS.length, 79);
  assert.equal(new Set(BLOG_STICKY_CTA_SLUGS).size, 79);
  assert.equal(hasBlogStickyCta("average-bicep-size"), true);
  assert.equal(hasBlogStickyCta("body-composition-pictures"), true);
  assert.equal(hasBlogStickyCta("not-in-the-rollout"), false);
  assert.equal(getBlogStickyCtaRollout("average-bicep-size"), "initial_20");
  assert.equal(
    getBlogStickyCtaRollout("body-composition-pictures"),
    "expansion_59",
  );
  assert.equal(getBlogStickyCtaRollout("not-in-the-rollout"), null);
});

test("every sticky blog CTA has page-specific copy", () => {
  for (const slug of BLOG_STICKY_CTA_SLUGS) {
    const config = BLOG_CTA_OVERRIDES[slug];
    assert.ok(config, `${slug} must have a contextual CTA override`);
    assert.ok(config.title.length > 10);
    assert.ok(config.copy.length > 20);
    assert.ok(config.button.length > 5);
  }
});

test("every sticky CTA slug resolves to a published blog post", () => {
  for (const slug of BLOG_STICKY_CTA_SLUGS) {
    const post = new URL(`../content/blog/${slug}.mdx`, import.meta.url);
    assert.equal(existsSync(post), true, `${slug} must resolve to a blog post`);
  }
});

test("blog CTA experiment keeps tools isolated and measures material exposure", () => {
  const component = readFileSync(
    new URL("../components/BlogArticleCta.tsx", import.meta.url),
    "utf8",
  );
  const styles = readFileSync(
    new URL("../public/styles/blog-post-page.css", import.meta.url),
    "utf8",
  );

  assert.match(component, /MATERIAL_VIEW_DURATION_MS = 800/);
  assert.match(component, /intersectionRatio >= 0\.5/);
  assert.match(component, /blog_cta_experiment_viewed/);
  assert.match(component, /blog_cta_experiment_clicked/);
  assert.match(component, /blog_cta_experiment_continued_reading/);
  assert.match(component, /data-experiment-variant/);
  assert.match(component, /content=\{`\$\{attribution\.content\}_qr`\}/);
  assert.doesNotMatch(component, /TOOL_CTA_EXPERIMENT/);
  assert.match(styles, /blog-contextual-cta--editorial/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
