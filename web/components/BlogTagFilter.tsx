"use client";

import { useEffect } from "react";

/* Blog tag filtering.
 *
 * The blog index body is legacy markup injected with dangerouslySetInnerHTML.
 * It used to carry its own `<script src="/assets/blog-tag-filter.js">`, which
 * runs on a hard load (the static export ships it as parsed HTML) but never on
 * a client-side transition — arriving here from a post via the BlogNav <Link>
 * sets the markup with innerHTML, and scripts inserted that way don't execute,
 * leaving the pills dead. Running the same logic from a client component's
 * effect covers both, the way BlogScrollReveal already does.
 *
 * State lives in the URL (?tag=<slug>) which makes every filtered view a
 * shareable link, e.g. /blog/?tag=founder-story shows only Founder Story posts.
 *
 * UI: the top categories are surfaced as pills; everything else lives in a
 * "More topics" dropdown. Both drive the same filter + URL state.
 */
export default function BlogTagFilter() {
  useEffect(() => {
    const filterBar = document.querySelector<HTMLElement>(".blog-filter");
    const grid = document.querySelector<HTMLElement>(".blog-grid");
    if (!filterBar || !grid) return;

    const pills = Array.from(
      filterBar.querySelectorAll<HTMLButtonElement>(".blog-filter-pill"),
    );
    const select = filterBar.querySelector<HTMLSelectElement>(
      "[data-blog-filter-select]",
    );
    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>(".blog-card"),
    );
    const statusEl = document.querySelector<HTMLElement>(
      "[data-blog-filter-status]",
    );

    // Build slug -> clean label and the set of selectable tags.
    const labels: Record<string, string> = { all: "All" };
    const validTags = new Set<string>(["all"]);
    pills.forEach((pill) => {
      const tag = pill.dataset.tag;
      if (!tag) return;
      validTags.add(tag);
      // Strip the trailing count badge ("Founder Story22" -> "Founder Story").
      labels[tag] = (pill.textContent ?? "").replace(/\d+\s*$/, "").trim();
    });
    if (select) {
      Array.from(select.options).forEach((option) => {
        if (!option.value) return;
        validTags.add(option.value);
        labels[option.value] = option.textContent
          ? option.textContent.replace(/\s*\(\d+\)\s*$/, "").trim()
          : option.value;
      });
    }

    const getTag = () => {
      const tag = new URLSearchParams(window.location.search).get("tag");
      return tag && validTags.has(tag) ? tag : "all";
    };

    const isPillTag = (tag: string) => pills.some((p) => p.dataset.tag === tag);

    const apply = (tag: string) => {
      let shown = 0;
      cards.forEach((card) => {
        const match = tag === "all" || card.dataset.category === tag;
        card.classList.toggle("is-hidden", !match);
        // Ensure cards revealed by the filter aren't left invisible by the
        // scroll-reveal animation (which only fires for in-viewport cards).
        if (match) {
          card.classList.add("visible");
          shown += 1;
        }
      });

      // Pills: only one active at a time; dropdown selections deactivate all.
      pills.forEach((pill) => {
        const active = pill.dataset.tag === tag;
        pill.classList.toggle("is-active", active);
        pill.setAttribute("aria-pressed", active ? "true" : "false");
      });

      // Dropdown reflects its own selection, or resets when a pill is active.
      if (select) {
        const inDropdown = !isPillTag(tag) && tag !== "all";
        select.value = inDropdown ? tag : "";
        select.classList.toggle("is-active", inDropdown);
      }

      if (statusEl) {
        if (shown === 0) {
          statusEl.textContent = "No posts found for this topic.";
        } else if (tag === "all") {
          statusEl.textContent = `Showing all ${shown} posts`;
        } else {
          statusEl.textContent = `Showing ${shown} ${labels[tag]} ${
            shown === 1 ? "post" : "posts"
          }`;
        }
      }
    };

    const setTag = (tag: string) => {
      const url = new URL(window.location.href);
      if (tag === "all") {
        url.searchParams.delete("tag");
      } else {
        url.searchParams.set("tag", tag);
      }
      window.history.pushState({ tag }, "", url);
      apply(tag);
    };

    const onFilterClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const pill = target?.closest<HTMLElement>(".blog-filter-pill");
      if (!pill || !pill.dataset.tag) return;
      setTag(pill.dataset.tag);
    };

    const onSelectChange = () => setTag(select?.value || "all");
    const onPopState = () => apply(getTag());

    filterBar.addEventListener("click", onFilterClick);
    select?.addEventListener("change", onSelectChange);
    // Keep the view in sync when the user navigates back/forward.
    window.addEventListener("popstate", onPopState);

    // Apply whatever the shared/bookmarked URL asked for on load.
    apply(getTag());

    return () => {
      filterBar.removeEventListener("click", onFilterClick);
      select?.removeEventListener("change", onSelectChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}
