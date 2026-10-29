"use client";

import { useEffect } from "react";
import { getWebAnalyticsContext, track } from "@/lib/analytics";
import { parseArticleAssistance, rememberArticleAssistance } from "@/lib/article-assistance";

export default function ArticleJourneyTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.type === "auxclick" && event.button !== 1) return;
      const anchor = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
        "a[data-article-next-step][href]",
      );
      if (!anchor || anchor.origin !== window.location.origin) return;
      const { articleSlug, journeyIntent, destinationKind, placement, articleNextStep } = anchor.dataset;
      // The declaration must belong to the currently read article.
      if (window.location.pathname.replace(/\/$/, "") !== `/blog/${articleSlug}`) return;
      const assistance = parseArticleAssistance({
        article_slug: articleSlug,
        journey_intent: journeyIntent,
        destination_kind: destinationKind,
        destination_path: anchor.pathname,
        placement,
        rollout: articleNextStep,
        clicked_at_ms: Date.now(),
      });
      if (!assistance) return;
      rememberArticleAssistance(assistance);
      track("article_next_step_clicked", { ...getWebAnalyticsContext(), ...assistance });
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);
  return null;
}
