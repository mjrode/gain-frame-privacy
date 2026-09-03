import assert from "node:assert/strict";
import test from "node:test";

import {
  blogCtaCardName,
  describeDownloadCta,
} from "./download-cta-context.ts";

test("blog CTA presentations have plain-language visual descriptions", () => {
  assert.match(blogCtaCardName("legacy_inline"), /green\/cream panel/);
  assert.match(blogCtaCardName("sticky_control"), /floating dock/);
  assert.match(blogCtaCardName("editorial_inline"), /blue\/white panel/);
});

test("download CTA identifiers resolve to useful Slack descriptions", () => {
  assert.equal(describeDownloadCta("link"), "Inline text link (not a card)");
  assert.equal(describeDownloadCta("store_badge"), "App Store badge");
  assert.match(
    describeDownloadCta("blog_cta_editorial_inline_body-fat"),
    /Editorial inline blog card/,
  );
  assert.match(
    describeDownloadCta("contextual_inline_recomposition"),
    /Standard inline blog card/,
  );
  assert.match(
    describeDownloadCta("article_footer_qr_desktop_link"),
    /desktop QR companion link/,
  );
});
