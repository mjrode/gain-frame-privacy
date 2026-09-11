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
  );
  assert.deepEqual(assignment, {
    variant: "editorial_inline",
    forced: true,
  });
  assert.equal(storage.get(BLOG_CTA_EXPERIMENT_STORAGE_KEY), "sticky_control");
});

test("a saved choice replaces a temporary storage fallback across pages", () => {
  const values = new Map([[BLOG_CTA_EXPERIMENT_STORAGE_KEY, "editorial_inline"]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(getBlogCtaAssignment(null, "", () => 0.1).variant, "sticky_control");
  assert.equal(getBlogCtaAssignment(storage, "", () => 0.1).variant, "editorial_inline");
  assert.equal(values.get(BLOG_CTA_EXPERIMENT_STORAGE_KEY), "editorial_inline");
  clearBlogCtaAssignmentMemory();
  assert.equal(getBlogCtaAssignment(storage, "", () => 0.1).variant, "editorial_inline");
});

test("new visitors persist their assignment immediately and reuse it on reload", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const first = getBlogCtaAssignment(storage, "", () => 0.1);
  assert.equal(values.get(BLOG_CTA_EXPERIMENT_STORAGE_KEY), first.variant);
  clearBlogCtaAssignmentMemory();
  assert.deepEqual(getBlogCtaAssignment(storage, "", () => 0.9), first);
});

test("blocked browser storage keeps a stable page choice without throwing", () => {
  const storage = {getItem() {throw new Error("blocked");}, setItem() {throw new Error("blocked");}};
  const first = getBlogCtaAssignment(storage, "", () => 0.1);
  assert.deepEqual(getBlogCtaAssignment(storage, "", () => 0.9), first);
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
    "sticky_vs_editorial_inline_v2_stable_assignment",
  );
});


test("clean phase ignores assignments from the contaminated phase", () => {
  const values = new Map([["gainframe:experiment:blog_contextual_cta_v1", "editorial_inline"]]);
  const storage = {getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};
  assert.notEqual(BLOG_CTA_EXPERIMENT_STORAGE_KEY, "gainframe:experiment:blog_contextual_cta_v1");
  assert.equal(getBlogCtaAssignment(storage, "", () => 0.1).variant, "sticky_control");
  assert.equal(values.get("gainframe:experiment:blog_contextual_cta_v1"), "editorial_inline");
});
