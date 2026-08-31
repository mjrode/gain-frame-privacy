import assert from "node:assert/strict";
import test from "node:test";
import {
  getBlogPage,
  getBlogPageCount,
  renderCard,
  renderPagination,
} from "./generate-blog-grid.mjs";

test("splits the current archive into eight 30-post pages", () => {
  const posts = Array.from({ length: 239 }, (_, index) => index + 1);

  assert.equal(getBlogPageCount(posts.length), 8);
  assert.deepEqual(getBlogPage(posts, 1), posts.slice(0, 30));
  assert.deepEqual(getBlogPage(posts, 2), posts.slice(30, 60));
  assert.deepEqual(getBlogPage(posts, 8), posts.slice(210));
});

test("pagination links page one directly back to the canonical blog URL", () => {
  const pageOne = renderPagination(1, 239);
  const pageTwo = renderPagination(2, 239);
  const lastPage = renderPagination(8, 239);

  assert.doesNotMatch(pageOne, /rel="prev"/);
  assert.match(pageOne, /href="\/blog\/page\/2\/" rel="next"/);
  assert.match(pageTwo, /href="\/blog\/" rel="prev"/);
  assert.match(pageTwo, /href="\/blog\/page\/3\/" rel="next"/);
  assert.doesNotMatch(lastPage, /rel="next"/);
  assert.match(lastPage, /Page 8 of 8/);
});

test("generated cards escape frontmatter before it reaches the HTML archive", () => {
  const html = renderCard(
    {
      slug: "safe-slug",
      title: 'A <strong>title</strong> & "quote"',
      category: "Guide",
      categorySlug: "guide",
      displayDate: "Aug 30, 2026",
      cardText: "Use <script>carefully</script>",
      coverAlt: 'A "quoted" image',
    },
    0,
  );

  assert.match(html, /A &lt;strong&gt;title&lt;\/strong&gt; &amp; &quot;quote&quot;/);
  assert.match(html, /Use &lt;script&gt;carefully&lt;\/script&gt;/);
  assert.match(html, /alt="A &quot;quoted&quot; image"/);
  assert.match(html, /loading="eager"/);
});
