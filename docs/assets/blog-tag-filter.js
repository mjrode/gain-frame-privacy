/* Blog tag filtering.
 *
 * The blog index is a static export, so filtering is entirely client-side.
 * State lives in the URL (?tag=<slug>) which makes every filtered view a
 * shareable link, e.g. /blog/?tag=founder-story shows only Founder Story posts.
 */
(() => {
    const filterBar = document.querySelector('.blog-filter');
    const grid = document.querySelector('.blog-grid');
    if (!filterBar || !grid) return;

    const chips = Array.from(filterBar.querySelectorAll('.blog-filter-chip'));
    const cards = Array.from(grid.querySelectorAll('.blog-card'));
    const statusEl = document.querySelector('[data-blog-filter-status]');

    const validTags = new Set(chips.map((c) => c.dataset.tag));
    const labelForTag = (tag) => {
        const chip = chips.find((c) => c.dataset.tag === tag);
        if (!chip) return '';
        // Chip text without the trailing count badge.
        return chip.textContent.replace(/\d+\s*$/, '').trim();
    };

    const getTag = () => {
        const tag = new URLSearchParams(window.location.search).get('tag');
        return tag && validTags.has(tag) ? tag : 'all';
    };

    const apply = (tag) => {
        let shown = 0;
        cards.forEach((card) => {
            const match = tag === 'all' || card.dataset.category === tag;
            card.classList.toggle('is-hidden', !match);
            // Ensure cards revealed by the filter aren't left invisible by the
            // scroll-reveal animation (which only fires for in-viewport cards).
            if (match) card.classList.add('visible');
            if (match) shown += 1;
        });

        chips.forEach((chip) => {
            const active = chip.dataset.tag === tag;
            chip.classList.toggle('is-active', active);
            chip.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (statusEl) {
            if (shown === 0) {
                statusEl.textContent = 'No posts found for this topic.';
            } else if (tag === 'all') {
                statusEl.textContent = `Showing all ${shown} posts`;
            } else {
                const label = labelForTag(tag);
                statusEl.textContent = `Showing ${shown} ${label} ${shown === 1 ? 'post' : 'posts'}`;
            }
        }
    };

    const setTag = (tag, { push } = { push: true }) => {
        const url = new URL(window.location.href);
        if (tag === 'all') {
            url.searchParams.delete('tag');
        } else {
            url.searchParams.set('tag', tag);
        }
        if (push) {
            window.history.pushState({ tag }, '', url);
        }
        apply(tag);
    };

    filterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.blog-filter-chip');
        if (!chip) return;
        setTag(chip.dataset.tag);
    });

    // Keep the view in sync when the user navigates back/forward.
    window.addEventListener('popstate', () => apply(getTag()));

    // Apply whatever the shared/bookmarked URL asked for on load.
    apply(getTag());
})();
