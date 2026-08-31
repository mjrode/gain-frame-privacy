"use client";

import { useEffect } from "react";

type BlogIndexPayload = {
  total: number;
  pageSize: number;
  posts: Array<{
    categorySlug: string;
    html: string;
  }>;
};

function isBlogIndexPayload(value: unknown): value is BlogIndexPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BlogIndexPayload>;
  return (
    typeof candidate.total === "number" &&
    typeof candidate.pageSize === "number" &&
    Array.isArray(candidate.posts) &&
    candidate.posts.every(
      (post) =>
        post &&
        typeof post.categorySlug === "string" &&
        typeof post.html === "string",
    )
  );
}

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
 * The archive is paginated so the initial page only contains 30 cards. State
 * still lives in the URL (?tag=<slug>), and choosing a topic lazily downloads
 * the generated blog index so filtering covers every post, not just the page
 * currently visible. Returning to "All" restores that static archive page.
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
    const statusEl = document.querySelector<HTMLElement>(
      "[data-blog-filter-status]",
    );
    const initialGridHtml = grid.innerHTML;
    const initialStatus = statusEl?.textContent ?? "";
    let latestRequest = 0;
    let indexPromise: Promise<BlogIndexPayload> | null = null;

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

    const updateControls = (tag: string) => {
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
    };

    const revealCards = () => {
      grid.querySelectorAll<HTMLElement>(".blog-card").forEach((card) => {
        card.classList.add("visible");
      });
    };

    const restoreArchivePage = () => {
      if (grid.dataset.blogFilterMode !== "all") {
        grid.innerHTML = initialGridHtml;
      }
      grid.dataset.blogFilterMode = "all";
      grid.removeAttribute("aria-busy");
      revealCards();
      if (statusEl) statusEl.textContent = initialStatus;
    };

    const renderFilteredCards = (posts: BlogIndexPayload["posts"]) => {
      const template = document.createElement("template");
      template.innerHTML = posts.map((post) => post.html).join("\n");
      grid.replaceChildren(template.content.cloneNode(true));
      revealCards();
    };

    const loadIndex = () => {
      if (!indexPromise) {
        indexPromise = fetch("/blog-index.json", {
          headers: { Accept: "application/json" },
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Blog index request failed (${response.status})`);
            }
            const data: unknown = await response.json();
            if (!isBlogIndexPayload(data)) {
              throw new Error("Blog index response was invalid");
            }
            return data;
          })
          .catch((error: unknown) => {
            // Allow a later filter selection to retry after a transient error.
            indexPromise = null;
            throw error;
          });
      }
      return indexPromise;
    };

    const apply = async (tag: string) => {
      const request = ++latestRequest;
      updateControls(tag);

      if (tag === "all") {
        restoreArchivePage();
        return;
      }

      grid.setAttribute("aria-busy", "true");
      if (statusEl) statusEl.textContent = `Loading ${labels[tag]} posts…`;

      try {
        const index = await loadIndex();
        if (request !== latestRequest) return;

        const matches = index.posts.filter(
          (post) => post.categorySlug === tag,
        );
        renderFilteredCards(matches);
        grid.dataset.blogFilterMode = tag;
        grid.removeAttribute("aria-busy");

        if (statusEl) {
          const shown = matches.length;
          if (shown === 0) {
            statusEl.textContent = "No posts found for this topic.";
          } else {
            statusEl.textContent = `Showing ${shown} ${labels[tag]} ${
              shown === 1 ? "post" : "posts"
            }`;
          }
        }
      } catch {
        if (request !== latestRequest) return;
        grid.removeAttribute("aria-busy");
        if (statusEl) {
          statusEl.textContent =
            "We couldn’t load that topic. The current archive page is still available.";
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
      void apply(tag);
    };

    const onFilterClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const pill = target?.closest<HTMLElement>(".blog-filter-pill");
      if (!pill || !pill.dataset.tag) return;
      setTag(pill.dataset.tag);
    };

    const onSelectChange = () => setTag(select?.value || "all");
    const onPopState = () => void apply(getTag());

    filterBar.addEventListener("click", onFilterClick);
    select?.addEventListener("change", onSelectChange);
    // Keep the view in sync when the user navigates back/forward.
    window.addEventListener("popstate", onPopState);

    // Apply whatever the shared/bookmarked URL asked for on load.
    void apply(getTag());

    return () => {
      latestRequest += 1;
      filterBar.removeEventListener("click", onFilterClick);
      select?.removeEventListener("change", onSelectChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}
