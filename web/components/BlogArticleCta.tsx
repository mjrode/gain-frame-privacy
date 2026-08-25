"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DownloadQr from "@/components/DownloadQr";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import {
  BLOG_CTA_CONFIG,
  BLOG_CTA_OVERRIDES,
  type BlogCtaIntent,
} from "@/lib/blog-cta";

type BlogArticleCtaProps = {
  intent: BlogCtaIntent;
  slug: string;
};

const LEGACY_CTA_SELECTOR =
  ".blog-post-cta, .post-footer-cta, .blog-cta-card, .blog-cta";

function insertAfterFirstSection(article: HTMLElement, slot: HTMLElement) {
  const children = Array.from(article.children);
  const headings = children.filter((child) => child.tagName === "H2");

  if (headings.length > 1) {
    article.insertBefore(slot, headings[1]);
    return;
  }

  const legacyCta = article.querySelector(LEGACY_CTA_SELECTOR);
  if (legacyCta?.parentElement) {
    legacyCta.parentElement.insertBefore(slot, legacyCta);
    return;
  }

  article.appendChild(slot);
}

function ContextualCta({ intent, slug }: BlogArticleCtaProps) {
  if (intent === "founder") return null;

  const config = BLOG_CTA_OVERRIDES[slug] ?? BLOG_CTA_CONFIG[intent];
  const source = `/blog/${slug}/`;
  const content = `contextual_inline_${intent}`;

  return (
    <aside
      className={`blog-contextual-cta blog-contextual-cta--${intent}`}
      data-blog-cta-intent={intent}
      aria-labelledby={`blog-cta-title-${slug}`}
    >
      <div className="blog-contextual-cta-copy">
        <p className="blog-contextual-cta-label">{config.label}</p>
        <h3 id={`blog-cta-title-${slug}`}>{config.title}</h3>
        <p>{config.copy}</p>
        <div className="blog-contextual-cta-actions">
          <PlatformDownloadLink
            className="blog-contextual-cta-button"
            source={source}
            content={content}
            campaign={`web-blog-${intent}`}
            androidLabel="Try the free body-fat tool"
          >
            {config.button}
          </PlatformDownloadLink>
          <DownloadQr
            className="blog-contextual-cta-qr"
            source={source}
            content={content}
            campaign="web-blog-qr"
          />
        </div>
        <p className="blog-contextual-cta-proof">
          {config.proof ?? "4.9 ★ · 5,000 lifters"}
        </p>
      </div>
      <figure className="blog-contextual-cta-visual">
        <img src={config.image} alt={config.imageAlt} loading="lazy" />
        <figcaption>One photo. A clearer signal.</figcaption>
      </figure>
    </aside>
  );
}

export default function BlogArticleCta({
  intent,
  slug,
}: BlogArticleCtaProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".post-body");
    if (!article) return;

    const legacyCtas = Array.from(
      article.querySelectorAll<HTMLElement>(LEGACY_CTA_SELECTOR),
    );
    legacyCtas.forEach((cta) => {
      cta.hidden = true;
    });

    if (intent === "founder") {
      return () => {
        legacyCtas.forEach((cta) => {
          cta.hidden = false;
        });
      };
    }

    const slot = document.createElement("div");
    slot.className = "blog-contextual-cta-slot";
    insertAfterFirstSection(article, slot);
    setPortalTarget(slot);

    return () => {
      setPortalTarget(null);
      slot.remove();
      legacyCtas.forEach((cta) => {
        cta.hidden = false;
      });
    };
  }, [intent, slug]);

  if (!portalTarget || intent === "founder") return null;
  return createPortal(
    <ContextualCta intent={intent} slug={slug} />,
    portalTarget,
  );
}
