"use client";

import PlatformDownloadLink from "@/components/PlatformDownloadLink";

export default function BlogIndexBridge() {
  return (
    <section className="blog-product-bridge" aria-labelledby="blog-product-bridge-title">
      <div className="container blog-product-bridge-inner">
        <div className="blog-product-bridge-copy">
          <h2 id="blog-product-bridge-title">
            Reading about progress is useful. Seeing yours is better.
          </h2>
          <p>
            Turn one gym photo into body-fat, FFMI, and muscle-group trends,
            then keep the signal going with consistent check-ins.
          </p>
        </div>
        <div className="blog-product-bridge-actions">
            <PlatformDownloadLink
              className="blog-product-bridge-button"
              source="blog_index"
              content="product_bridge"
              campaign="web-blog-index"
              androidLabel="Try the free body-fat tool"
            >
              Try GainFrame free
            </PlatformDownloadLink>
          <p className="blog-product-bridge-proof">
            4.9 ★ from 35 ratings · 5,000 lifters · Private by design
          </p>
        </div>
      </div>
    </section>
  );
}
