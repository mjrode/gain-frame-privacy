import assert from "node:assert/strict";
import test from "node:test";

import {
  BLOG_CTA_OVERRIDES,
  BLOG_STICKY_CTA_SLUGS,
  hasBlogStickyCta,
} from "./blog-cta.ts";

test("sticky blog CTA cohort remains fixed at the measured top 20 posts", () => {
  assert.equal(BLOG_STICKY_CTA_SLUGS.length, 20);
  assert.equal(new Set(BLOG_STICKY_CTA_SLUGS).size, 20);
  assert.equal(hasBlogStickyCta("average-bicep-size"), true);
  assert.equal(hasBlogStickyCta("not-in-the-rollout"), false);
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
