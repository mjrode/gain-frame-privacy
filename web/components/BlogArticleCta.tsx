"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DownloadQr from "@/components/DownloadQr";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
import { track } from "@/lib/analytics";
import {
  BLOG_CTA_CONFIG,
  BLOG_CTA_OVERRIDES,
  hasBlogStickyCta,
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

function ContextualCta({
  intent,
  slug,
  sticky = false,
  onDismiss,
}: BlogArticleCtaProps & {
  sticky?: boolean;
  onDismiss?: () => void;
}) {
  const platform = useDownloadPlatform();
  if (intent === "founder") return null;

  const config = BLOG_CTA_OVERRIDES[slug] ?? BLOG_CTA_CONFIG[intent];
  const source = `/blog/${slug}/`;
  const placement = sticky ? "sticky" : "inline";
  const content = `contextual_${placement}_${intent}`;

  return (
    <aside
      className={`blog-contextual-cta blog-contextual-cta--${intent}${sticky ? " blog-contextual-cta--sticky" : ""}`}
      data-blog-cta-intent={intent}
      data-blog-cta-placement={placement}
      aria-labelledby={`blog-cta-title-${slug}`}
      onClick={(event) => {
        if (!sticky) return;
        const target = event.target instanceof Element ? event.target : null;
        if (!target?.closest("a")) return;
        track("blog_sticky_cta_clicked", {
          slug,
          intent,
          placement,
          platform,
        });
      }}
    >
      {sticky ? (
        <button
          className="blog-contextual-cta-dismiss"
          type="button"
          aria-label="Dismiss app promotion"
          title="Dismiss app promotion"
          onClick={onDismiss}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
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
  const [stickyVisible, setStickyVisible] = useState(false);
  const stickyViewedRef = useRef(false);
  const sticky = intent !== "founder" && hasBlogStickyCta(slug);
  const platform = useDownloadPlatform();

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(".post-body");
    if (!article) return;

    setStickyVisible(false);
    stickyViewedRef.current = false;

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

    if (sticky) {
      const trigger = article.querySelector<HTMLElement>("h2");
      const activate = () => {
        setStickyVisible(true);
      };

      if (!trigger || typeof IntersectionObserver === "undefined") {
        activate();
        return () => {
          legacyCtas.forEach((cta) => {
            cta.hidden = false;
          });
        };
      }

      if (trigger.getBoundingClientRect().top <= window.innerHeight * 0.4) {
        activate();
        return () => {
          legacyCtas.forEach((cta) => {
            cta.hidden = false;
          });
        };
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) =>
                entry.isIntersecting ||
                entry.boundingClientRect.top <= window.innerHeight * 0.4,
            )
          ) {
            activate();
            observer.disconnect();
          }
        },
        { rootMargin: "0px 0px -60% 0px" },
      );
      observer.observe(trigger);

      return () => {
        observer.disconnect();
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
  }, [intent, slug, sticky]);

  useEffect(() => {
    if (!sticky || !stickyVisible) return;
    document.body.classList.add("has-blog-sticky-cta");
    return () => document.body.classList.remove("has-blog-sticky-cta");
  }, [sticky, stickyVisible]);

  useEffect(() => {
    if (
      !sticky ||
      !stickyVisible ||
      platform === "unknown" ||
      stickyViewedRef.current
    ) {
      return;
    }
    stickyViewedRef.current = true;
    track("blog_sticky_cta_viewed", {
      slug,
      intent,
      placement: "sticky",
      platform,
    });
  }, [intent, platform, slug, sticky, stickyVisible]);

  function dismissStickyCta() {
    setStickyVisible(false);
    track("blog_sticky_cta_dismissed", {
      slug,
      intent,
      placement: "sticky",
      platform,
    });
  }

  if (sticky) {
    return stickyVisible ? (
      <ContextualCta
        intent={intent}
        slug={slug}
        sticky
        onDismiss={dismissStickyCta}
      />
    ) : null;
  }

  if (!portalTarget || intent === "founder") return null;
  return createPortal(
    <ContextualCta intent={intent} slug={slug} />,
    portalTarget,
  );
}
