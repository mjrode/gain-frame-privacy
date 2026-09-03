import assert from "node:assert/strict";
import test from "node:test";

import {
  BLOG_CTA_EXPERIMENT_ID,
  BLOG_CTA_EXPERIMENT_PHASE,
  BLOG_CTA_EXPERIMENT_STORAGE_KEY,
  BLOG_CTA_VARIANTS,
  blogCtaVariantForRandom,
  clearBlogCtaAssignmentMemory,
  getBlogCtaAssignment,
  getBlogCtaAttribution,
} from "./blog-cta-experiment.ts";

test.beforeEach(() => {
  clearBlogCtaAssignmentMemory();
});

test("blog CTA buckets split the random range 50/50", () => {
  assert.equal(blogCtaVariantForRandom(0), "sticky_control");
  assert.equal(blogCtaVariantForRandom(0.499999), "sticky_control");
  assert.equal(blogCtaVariantForRandom(0.5), "editorial_inline");
  assert.equal(blogCtaVariantForRandom(0.999999), "editorial_inline");
  assert.deepEqual(BLOG_CTA_VARIANTS, [
    "sticky_control",
    "editorial_inline",
  ]);
});

test("blog CTA assignment reuses a stored variant", () => {
  const storage = new Map([
    [BLOG_CTA_EXPERIMENT_STORAGE_KEY, "editorial_inline"],
  ]);
  const assignment = getBlogCtaAssignment(
    {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    "",
    () => 0.1,
    true,
  );
  assert.deepEqual(assignment, {
    variant: "editorial_inline",
    forced: false,
  });
});

test("dedicated QA override is forced and does not replace stable assignment", () => {
  const storage = new Map([
    [BLOG_CTA_EXPERIMENT_STORAGE_KEY, "sticky_control"],
  ]);
  const assignment = getBlogCtaAssignment(
    {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    "?gf_cta_variant=future&gf_blog_cta_variant=editorial_inline",
    () => 0.1,
    true,
  );
  assert.deepEqual(assignment, {
    variant: "editorial_inline",
    forced: true,
  });
  assert.equal(storage.get(BLOG_CTA_EXPERIMENT_STORAGE_KEY), "sticky_control");
});

test("assignment stays in memory and never touches storage before consent", () => {
  let reads = 0;
  let writes = 0;
  const storage = {
    getItem() {
      reads += 1;
      return "editorial_inline";
    },
    setItem() {
      writes += 1;
    },
  };

  const first = getBlogCtaAssignment(storage, "", () => 0.1, false);
  const second = getBlogCtaAssignment(storage, "", () => 0.9, false);

  assert.deepEqual(first, { variant: "sticky_control", forced: false });
  assert.deepEqual(second, first);
  assert.equal(reads, 0);
  assert.equal(writes, 0);
});

test("a later consent grant persists the already-visible assignment", () => {
  const storage = new Map([
    [BLOG_CTA_EXPERIMENT_STORAGE_KEY, "editorial_inline"],
  ]);
  const adapter = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };

  const pending = getBlogCtaAssignment(adapter, "", () => 0.1, false);
  const granted = getBlogCtaAssignment(adapter, "", () => 0.9, true);

  assert.deepEqual(pending, { variant: "sticky_control", forced: false });
  assert.deepEqual(granted, pending);
  assert.equal(storage.get(BLOG_CTA_EXPERIMENT_STORAGE_KEY), "sticky_control");
});

test("direct and QR attribution names preserve the experiment variant", () => {
  const sticky = getBlogCtaAttribution("body-fat", "sticky_control");
  const inline = getBlogCtaAttribution("progress", "editorial_inline");

  assert.deepEqual(sticky, {
    campaign: "web-blog-sticky-control",
    content: "blog_cta_sticky_control_body-fat",
  });
  assert.deepEqual(inline, {
    campaign: "web-blog-editorial-inline",
    content: "blog_cta_editorial_inline_progress",
  });
  assert.equal(BLOG_CTA_EXPERIMENT_ID, "blog_contextual_cta_v1");
  assert.equal(
    BLOG_CTA_EXPERIMENT_PHASE,
    "sticky_vs_editorial_inline_v1",
  );
});
