"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DownloadQr from "@/components/DownloadQr";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";
import { useDownloadPlatform } from "@/components/useDownloadPlatform";
import { track } from "@/lib/analytics";
import { ANALYTICS_CONSENT_STATE_EVENT } from "@/lib/analytics-consent";
import {
  BLOG_CTA_CONFIG,
  BLOG_CTA_OVERRIDES,
  getBlogStickyCtaRollout,
  type BlogCtaIntent,
  type BlogStickyCtaRollout,
} from "@/lib/blog-cta";
import {
  BLOG_CTA_EXPERIMENT_ID,
  BLOG_CTA_EXPERIMENT_PHASE,
  getBlogCtaAssignment,
  getBlogCtaAttribution,
  type BlogCtaAssignment,
  type BlogCtaVariant,
} from "@/lib/blog-cta-experiment";

type BlogArticleCtaProps = {
  intent: BlogCtaIntent;
  slug: string;
};

type BlogCtaPresentation = "legacy_inline" | BlogCtaVariant;

const LEGACY_CTA_SELECTOR =
  ".blog-post-cta, .post-footer-cta, .blog-cta-card, .blog-cta";
const MATERIAL_VIEW_DURATION_MS = 800;

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

function experimentProperties({
  assignment,
  intent,
  placement,
  platform,
  rollout,
  slug,
}: {
  assignment: BlogCtaAssignment;
  intent: BlogCtaIntent;
  placement: "inline" | "sticky";
  platform: string;
  rollout: BlogStickyCtaRollout;
  slug: string;
}) {
  return {
    experiment_id: BLOG_CTA_EXPERIMENT_ID,
    experiment_phase: BLOG_CTA_EXPERIMENT_PHASE,
    experiment_variant: assignment.variant,
    experiment_forced: assignment.forced,
    cta_angle: assignment.variant,
    slug,
    intent,
    placement,
    platform,
    rollout,
  };
}

function EditorialPreview({
  image,
  imageAlt,
}: {
  image: string;
  imageAlt: string;
}) {
  return (
    <figure className="blog-contextual-cta-visual blog-contextual-cta-editorial-visual">
      <div className="blog-contextual-cta-signal" aria-hidden="true">
        <span>Photo</span>
        <i />
        <span>Score</span>
        <i />
        <span>Trend</span>
      </div>
      <div className="blog-contextual-cta-phone">
        <img src={image} alt={imageAlt} loading="lazy" />
        <div className="blog-contextual-cta-trend" aria-hidden="true">
          <span>Progress signal</span>
          <svg viewBox="0 0 126 36">
            <path d="M4 30 C25 29 31 19 48 21 C68 23 75 10 92 13 C108 15 114 6 122 5" />
            <circle cx="122" cy="5" r="3" />
          </svg>
        </div>
      </div>
      <figcaption>Photo → score → progress</figcaption>
    </figure>
  );
}

function ContextualCta({
  assignment,
  intent,
  onDismiss,
  onMaterialView,
  presentation,
  rollout,
  slug,
}: BlogArticleCtaProps & {
  assignment?: BlogCtaAssignment;
  onDismiss?: () => void;
  onMaterialView?: () => void;
  presentation: BlogCtaPresentation;
  rollout?: BlogStickyCtaRollout;
}) {
  const platform = useDownloadPlatform();
  const cardRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (platform === "unknown" || viewedRef.current) return;
    const element = cardRef.current;
    if (!element) return;

    let materialTimer: ReturnType<typeof setTimeout> | null = null;
    const clearMaterialTimer = () => {
      if (materialTimer) clearTimeout(materialTimer);
      materialTimer = null;
    };
    const beginMaterialTimer = () => {
      if (materialTimer || viewedRef.current) return;
      materialTimer = setTimeout(() => {
        viewedRef.current = true;
        onMaterialView?.();
      }, MATERIAL_VIEW_DURATION_MS);
    };

    if (typeof IntersectionObserver === "undefined") {
      const bounds = element.getBoundingClientRect();
      const visibleHeight = Math.max(
        0,
        Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0),
      );
      if (visibleHeight >= bounds.height * 0.5) {
        setInView(true);
        beginMaterialTimer();
      }
      return clearMaterialTimer;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          beginMaterialTimer();
        } else {
          clearMaterialTimer();
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(element);
    return () => {
      clearMaterialTimer();
      observer.disconnect();
    };
  }, [onMaterialView, platform]);

  if (intent === "founder") return null;

  const config = BLOG_CTA_OVERRIDES[slug] ?? BLOG_CTA_CONFIG[intent];
  const source = `/blog/${slug}/`;
  const sticky = presentation === "sticky_control";
  const editorial = presentation === "editorial_inline";
  const placement = sticky ? "sticky" : "inline";
  const attribution = assignment
    ? getBlogCtaAttribution(intent, assignment.variant)
    : {
        campaign: `web-blog-${intent}`,
        content: `contextual_${placement}_${intent}`,
      };

  return (
    <aside
      ref={cardRef}
      className={`blog-contextual-cta blog-contextual-cta--${intent}${sticky ? " blog-contextual-cta--sticky" : ""}${editorial ? " blog-contextual-cta--editorial" : ""}`}
      data-blog-cta-intent={intent}
      data-blog-cta-placement={placement}
      data-blog-cta-in-view={inView ? "true" : "false"}
      data-experiment-id={assignment ? BLOG_CTA_EXPERIMENT_ID : undefined}
      data-experiment-phase={
        assignment ? BLOG_CTA_EXPERIMENT_PHASE : undefined
      }
      data-experiment-variant={assignment?.variant}
      data-experiment-forced={
        assignment ? String(assignment.forced) : undefined
      }
      data-cta-angle={assignment?.variant}
      aria-labelledby={`blog-cta-title-${slug}`}
      onClick={(event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target?.closest("a")) return;
        if (assignment && rollout) {
          track(
            "blog_cta_experiment_clicked",
            experimentProperties({
              assignment,
              intent,
              placement,
              platform,
              rollout,
              slug,
            }),
          );
        }
        if (sticky) {
          track("blog_sticky_cta_clicked", {
            slug,
            intent,
            placement,
            platform,
            rollout,
            ...(assignment
              ? {
                  experiment_id: BLOG_CTA_EXPERIMENT_ID,
                  experiment_phase: BLOG_CTA_EXPERIMENT_PHASE,
                  experiment_variant: assignment.variant,
                  experiment_forced: assignment.forced,
                }
              : {}),
          });
        }
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
        {editorial ? (
          <div className="blog-contextual-cta-chapter" aria-hidden="true">
            <span>The next useful step</span>
            <span>01 — 03</span>
          </div>
        ) : null}
        <p className="blog-contextual-cta-label">{config.label}</p>
        <h3 id={`blog-cta-title-${slug}`}>{config.title}</h3>
        <p>{config.copy}</p>
        <div className="blog-contextual-cta-actions">
          <PlatformDownloadLink
            className="blog-contextual-cta-button"
            source={source}
            content={attribution.content}
            campaign={attribution.campaign}
            androidLabel="Try the free body-fat tool"
          >
            {config.button}
          </PlatformDownloadLink>
          <DownloadQr
            backgroundColor={editorial ? "#ffffff" : undefined}
            className="blog-contextual-cta-qr"
            source={source}
            content={`${attribution.content}_qr`}
            campaign={attribution.campaign}
            foregroundColor={editorial ? "#0a1323" : undefined}
          />
        </div>
        <p className="blog-contextual-cta-proof">
          {config.proof ?? "4.9 ★ · 5,000 lifters"}
        </p>
      </div>
      {editorial ? (
        <EditorialPreview image={config.image} imageAlt={config.imageAlt} />
      ) : (
        <figure className="blog-contextual-cta-visual">
          <img src={config.image} alt={config.imageAlt} loading="lazy" />
          <figcaption>One photo. A clearer signal.</figcaption>
        </figure>
      )}
    </aside>
  );
}

export default function BlogArticleCta({
  intent,
  slug,
}: BlogArticleCtaProps) {
  const [assignment, setAssignment] = useState<BlogCtaAssignment | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [experimentWasViewed, setExperimentWasViewed] = useState(false);
  const continuedRef = useRef(false);
  const legacyStickyViewedRef = useRef(false);
  const rollout =
    intent === "founder" ? null : getBlogStickyCtaRollout(slug);
  const experimentEligible = rollout !== null && intent !== "founder";
  const platform = useDownloadPlatform();
  const presentation: BlogCtaPresentation | null = experimentEligible
    ? (assignment?.variant ?? null)
    : intent === "founder"
      ? null
      : "legacy_inline";

  useEffect(() => {
    if (!experimentEligible) {
      setAssignment(null);
      return;
    }
    const updateAssignment = () => {
      setAssignment(getBlogCtaAssignment());
    };
    updateAssignment();
    window.addEventListener(ANALYTICS_CONSENT_STATE_EVENT, updateAssignment);
    return () => {
      window.removeEventListener(
        ANALYTICS_CONSENT_STATE_EVENT,
        updateAssignment,
      );
    };
  }, [experimentEligible, slug]);

  useEffect(() => {
    if (!presentation) return;
    const article = document.querySelector<HTMLElement>(".post-body");
    if (!article) return;

    setPortalTarget(null);
    setStickyVisible(false);
    setExperimentWasViewed(false);
    continuedRef.current = false;
    legacyStickyViewedRef.current = false;

    const legacyCtas = Array.from(
      article.querySelectorAll<HTMLElement>(LEGACY_CTA_SELECTOR),
    );
    legacyCtas.forEach((cta) => {
      cta.hidden = true;
    });

    if (presentation === "sticky_control") {
      const trigger = article.querySelector<HTMLElement>("h2");
      const activate = () => setStickyVisible(true);

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
    slot.className = `blog-contextual-cta-slot${presentation === "editorial_inline" ? " blog-contextual-cta-slot--editorial" : ""}`;
    insertAfterFirstSection(article, slot);
    setPortalTarget(slot);

    return () => {
      setPortalTarget(null);
      slot.remove();
      legacyCtas.forEach((cta) => {
        cta.hidden = false;
      });
    };
  }, [intent, presentation, slug]);

  useEffect(() => {
    if (presentation !== "sticky_control" || !stickyVisible) return;
    document.body.classList.add("has-blog-sticky-cta");
    return () => document.body.classList.remove("has-blog-sticky-cta");
  }, [presentation, stickyVisible]);

  // Preserve the pre-experiment sticky-view event and its original timing so
  // historical dashboards remain comparable. The experiment's denominator is
  // tracked separately below after a material (50% for 800ms) exposure.
  useEffect(() => {
    if (
      presentation !== "sticky_control" ||
      !stickyVisible ||
      !assignment ||
      !rollout ||
      platform === "unknown" ||
      legacyStickyViewedRef.current
    ) {
      return;
    }
    legacyStickyViewedRef.current = true;
    track("blog_sticky_cta_viewed", {
      slug,
      intent,
      placement: "sticky",
      platform,
      rollout,
      experiment_id: BLOG_CTA_EXPERIMENT_ID,
      experiment_phase: BLOG_CTA_EXPERIMENT_PHASE,
      experiment_variant: assignment.variant,
      experiment_forced: assignment.forced,
    });
  }, [assignment, intent, platform, presentation, rollout, slug, stickyVisible]);

  const markMateriallyViewed = useCallback(() => {
    if (!assignment || !rollout) return;
    const placement = assignment.variant === "sticky_control"
      ? "sticky"
      : "inline";
    const properties = experimentProperties({
      assignment,
      intent,
      placement,
      platform,
      rollout,
      slug,
    });
    setExperimentWasViewed(true);
    track("blog_cta_experiment_viewed", properties);
  }, [assignment, intent, platform, rollout, slug]);

  useEffect(() => {
    if (
      !experimentWasViewed ||
      !assignment ||
      !rollout ||
      continuedRef.current
    ) {
      return;
    }
    const article = document.querySelector<HTMLElement>(".post-body");
    if (!article) return;
    const headings = Array.from(article.querySelectorAll<HTMLElement>("h2"));
    const continuationTarget = headings[2] ?? article.lastElementChild;
    if (!(continuationTarget instanceof HTMLElement)) return;

    const emitContinuedReading = () => {
      if (continuedRef.current) return;
      continuedRef.current = true;
      track(
        "blog_cta_experiment_continued_reading",
        experimentProperties({
          assignment,
          intent,
          placement:
            assignment.variant === "sticky_control" ? "sticky" : "inline",
          platform,
          rollout,
          slug,
        }),
      );
    };
    const bounds = continuationTarget.getBoundingClientRect();
    if (bounds.top <= window.innerHeight && bounds.bottom <= window.innerHeight) {
      emitContinuedReading();
      return;
    }
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          emitContinuedReading();
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(continuationTarget);
    return () => observer.disconnect();
  }, [assignment, experimentWasViewed, intent, platform, rollout, slug]);

  function dismissStickyCta() {
    if (!assignment || !rollout) return;
    setStickyVisible(false);
    const properties = experimentProperties({
      assignment,
      intent,
      placement: "sticky",
      platform,
      rollout,
      slug,
    });
    track("blog_sticky_cta_dismissed", properties);
    track("blog_cta_experiment_dismissed", properties);
  }

  if (presentation === "sticky_control") {
    return stickyVisible ? (
      <ContextualCta
        assignment={assignment ?? undefined}
        intent={intent}
        slug={slug}
        presentation={presentation}
        rollout={rollout ?? undefined}
        onDismiss={dismissStickyCta}
        onMaterialView={markMateriallyViewed}
      />
    ) : null;
  }

  if (!portalTarget || !presentation || intent === "founder") return null;
  return createPortal(
    <ContextualCta
      assignment={assignment ?? undefined}
      intent={intent}
      slug={slug}
      presentation={presentation}
      rollout={rollout ?? undefined}
      onMaterialView={assignment ? markMateriallyViewed : undefined}
    />,
    portalTarget,
  );
}
