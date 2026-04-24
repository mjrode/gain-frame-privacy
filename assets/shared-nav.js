/**
 * shared-nav.js
 * Single-source nav component injected into every page via <div data-site-nav></div>.
 * Auto-detects the active link from the current URL.
 * Includes hamburger menu for mobile.
 *
 * Also auto-injects an author byline at the end of every blog post .post-body
 * (any page under /blog/<slug>/) for E-E-A-T signal + internal linking to /about/.
 */
(() => {
    // ── Use absolute paths (site is at domain root) ────────────────────────────
    const path = window.location.pathname;
    const prefix = "/";

    // ── Determine active link ────────────────────────────────────────────────
    const normPath = path.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
    const isHome = normPath === "" || normPath === "/" || /^\/index\.html?$/.test(path);
    const isBlog = /\/blog(\.html)?$/.test(normPath) || /\/blog\//.test(normPath);
    const isComics = /\/comics(\.html)?$/.test(normPath);
    const isTools = /\/tools/.test(normPath);
    const isFeatures = /\/features(\.html)?$/.test(normPath);
    const isAbout = /^\/about/.test(normPath);
    const isBlogPost = /^\/blog\/.+/.test(normPath);

    const activeClass = (match) => match ? ' class="active"' : "";

    // ── Inject site nav ──────────────────────────────────────────────────────
    const navPlaceholder = document.querySelector("[data-site-nav]");
    if (navPlaceholder) {
        const navHtml = `
        <nav class="blog-nav">
            <div class="container blog-nav-inner">
                <a href="${prefix}" class="blog-nav-logo">
                    <img src="${prefix}assets/favicon.webp" alt="GainFrame" loading="lazy" class="blog-nav-icon">
                    <span class="blog-nav-wordmark">GainFrame</span>
                </a>
                <button class="nav-hamburger" id="navHamburger" aria-label="Open menu" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
                <div class="blog-nav-links" id="navLinks">
                    <a href="${prefix}"${activeClass(isHome)}>Home</a>
                    <a href="${prefix}blog/"${activeClass(isBlog)}>Blog</a>
                    <a href="${prefix}comics.html"${activeClass(isComics)}>Comics</a>
                    <a href="${prefix}tools/"${activeClass(isTools)}>Tools</a>
                    <a href="${prefix}features.html"${activeClass(isFeatures)}>Features</a>
                    <a href="${prefix}about/"${activeClass(isAbout)}>About</a>
                    <a href="https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082"
                        class="nav-cta-btn" target="_blank" rel="noopener">Download</a>
                </div>
            </div>
        </nav>`;

        navPlaceholder.outerHTML = navHtml;

        // Hamburger toggle
        const btn = document.getElementById("navHamburger");
        const links = document.getElementById("navLinks");
        if (btn && links) {
            btn.addEventListener("click", () => {
                const open = links.classList.toggle("nav-open");
                btn.classList.toggle("nav-hamburger--open", open);
                btn.setAttribute("aria-expanded", open);
            });
        }
    }

    // ── Inject author byline on blog posts ───────────────────────────────────
    // Deferred until DOMContentLoaded because .post-body is parsed after this script runs.
    function injectByline() {
        const postBody = document.querySelector(".post-body");
        if (!postBody) return;
        const bylineHtml = `
            <aside class="author-byline" itemscope itemtype="https://schema.org/Person"
                style="display: flex; gap: 1.25rem; align-items: center; padding: 1.5rem; margin: 2.5rem 0 1.5rem; background: #f8f8f6; border-radius: 20px; border: 1px solid #ececea; flex-wrap: wrap;">
                <a href="${prefix}about/" style="flex-shrink: 0;">
                    <img src="${prefix}assets/team/michael-rode.webp"
                         alt="Michael Rode, founder of GainFrame"
                         itemprop="image"
                         loading="lazy"
                         style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; display: block;">
                </a>
                <div style="flex: 1; min-width: 220px;">
                    <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 0.2rem;">Written by</div>
                    <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.35rem;">
                        <a href="${prefix}about/" itemprop="url" style="color: inherit; text-decoration: none;">
                            <span itemprop="name">Michael Rode</span>
                        </a>
                    </div>
                    <p style="margin: 0; font-size: 0.9rem; color: #555; line-height: 1.5;" itemprop="description">
                        Founder of GainFrame. Senior software engineer (15 yrs, backend &amp; infra). Lifting 20 yrs. Built GainFrame after paying for two DEXA scans and deciding there had to be a better way. <a href="${prefix}about/" style="color: #555; text-decoration: underline; text-underline-offset: 2px;">More about GainFrame &rarr;</a>
                    </p>
                </div>
            </aside>`;

        postBody.insertAdjacentHTML("afterend", bylineHtml);
    }
    if (isBlogPost) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", injectByline);
        } else {
            injectByline();
        }
    }
})();
