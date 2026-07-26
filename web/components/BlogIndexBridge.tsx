"use client";

import DownloadQr from "@/components/DownloadQr";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";

export default function BlogIndexBridge() {
  return (
    <section className="blog-product-bridge" aria-labelledby="blog-product-bridge-title">
      <div className="container blog-product-bridge-inner">
        <div className="blog-product-bridge-copy">
          <p className="blog-product-bridge-label">From research to your own data</p>
          <h2 id="blog-product-bridge-title">
            Reading about progress is useful. Seeing yours is better.
          </h2>
          <p>
            Turn one gym photo into body-fat, FFMI, and muscle-group trends,
            then keep the signal going with consistent check-ins.
          </p>
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
            <DownloadQr
              className="blog-product-bridge-qr"
              source="blog_index"
              content="product_bridge"
              campaign="web-blog-index-qr"
            />
          </div>
          <p className="blog-product-bridge-proof">
            4.9 ★ from 35 ratings · 5,000 lifters · Private by design
          </p>
        </div>
        <figure className="blog-product-bridge-visual">
          <img
            src="/app-screenshots/1.21/day-checkin-score.webp"
            alt="GainFrame check-in showing a physique score and estimated body-fat result."
            loading="lazy"
          />
          <figcaption>One photo. Full check-in.</figcaption>
        </figure>
      </div>
    </section>
  );
}
