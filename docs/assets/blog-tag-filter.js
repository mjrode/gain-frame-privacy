/* Blog tag filtering.
 *
 * The blog index is a static export, so filtering is entirely client-side.
 * State lives in the URL (?tag=<slug>) which makes every filtered view a
 * shareable link, e.g. /blog/?tag=founder-story shows only Founder Story posts.
 *
 * UI: the top categories are surfaced as pills; everything else lives in a
 * "More topics" dropdown. Both drive the same filter + URL state.
 */
(() => {
    const filterBar = document.querySelector('.blog-filter');
    const grid = document.querySelector('.blog-grid');
    if (!filterBar || !grid) return;

    const pills = Array.from(filterBar.querySelectorAll('.blog-filter-pill'));
    const select = filterBar.querySelector('[data-blog-filter-select]');
    const cards = Array.from(grid.querySelectorAll('.blog-card'));
    const statusEl = document.querySelector('[data-blog-filter-status]');

    // Build slug -> clean label and the set of selectable tags.
    const labels = { all: 'All' };
    const validTags = new Set(['all']);
    pills.forEach((p) => {
        validTags.add(p.dataset.tag);
        labels[p.dataset.tag] = p.textContent.replace(/\d+\s*$/, '').trim();
    });
    if (select) {
        Array.from(select.options).forEach((o) => {
            if (!o.value) return;
            validTags.add(o.value);
            labels[o.value] = o.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();
        });
    }

    const getTag = () => {
        const tag = new URLSearchParams(window.location.search).get('tag');
        return tag && validTags.has(tag) ? tag : 'all';
    };

    const isPillTag = (tag) => pills.some((p) => p.dataset.tag === tag);

    const apply = (tag) => {
        let shown = 0;
        cards.forEach((card) => {
            const match = tag === 'all' || card.dataset.category === tag;
            card.classList.toggle('is-hidden', !match);
            // Ensure cards revealed by the filter aren't left invisible by the
            // scroll-reveal animation (which only fires for in-viewport cards).
            if (match) {
                card.classList.add('visible');
                shown += 1;
            }
        });

        // Pills: only one active at a time; dropdown selections deactivate all.
        pills.forEach((pill) => {
            const active = pill.dataset.tag === tag;
            pill.classList.toggle('is-active', active);
            pill.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        // Dropdown reflects its own selection, or resets when a pill is active.
        if (select) {
            const inDropdown = !isPillTag(tag) && tag !== 'all';
            select.value = inDropdown ? tag : '';
            select.classList.toggle('is-active', inDropdown);
        }

        if (statusEl) {
            if (shown === 0) {
                statusEl.textContent = 'No posts found for this topic.';
            } else if (tag === 'all') {
                statusEl.textContent = `Showing all ${shown} posts`;
            } else {
                statusEl.textContent = `Showing ${shown} ${labels[tag]} ${shown === 1 ? 'post' : 'posts'}`;
            }
        }
    };

    const setTag = (tag) => {
        const url = new URL(window.location.href);
        if (tag === 'all') {
            url.searchParams.delete('tag');
        } else {
            url.searchParams.set('tag', tag);
        }
        window.history.pushState({ tag }, '', url);
        apply(tag);
    };

    filterBar.addEventListener('click', (e) => {
        const pill = e.target.closest('.blog-filter-pill');
        if (!pill) return;
        setTag(pill.dataset.tag);
    });

    if (select) {
        select.addEventListener('change', () => setTag(select.value || 'all'));
    }

    // Keep the view in sync when the user navigates back/forward.
    window.addEventListener('popstate', () => apply(getTag()));

    // Apply whatever the shared/bookmarked URL asked for on load.
    apply(getTag());
})();
