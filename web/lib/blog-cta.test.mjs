import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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
