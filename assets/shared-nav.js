/**
 * shared-nav.js
 * Single-source nav component injected into every page via <div data-site-nav></div>.
 * Auto-detects the active link from the current URL.
 * Includes hamburger menu for mobile.
 */
(() => {
    const placeholder = document.querySelector("[data-site-nav]");
    if (!placeholder) return;

    // ── Determine path prefix from current page depth ────────────────────────
    const path = window.location.pathname;

    // Resolve the base path to site root so all links work from any depth
    const depth = (path.replace(/\/[^/]*$/, "").match(/\//g) || []).length;
    // For root pages (index.html, blog.html, features.html) depth is 1
    // For /tools/ depth is 2, for /tools/body-fat-estimator/ and /blog/slug/ depth is 3
    const prefix = depth <= 1 ? "" : "../".repeat(depth - 1);

    // ── Determine active link ────────────────────────────────────────────────
    const normPath = path.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
    const isHome = normPath === "" || normPath === "/" || /^\/index\.html?$/.test(path);
    const isBlog = /\/blog(\.html)?$/.test(normPath) || /\/blog\//.test(normPath);
    const isTools = /\/tools/.test(normPath);
    const isFeatures = /\/features(\.html)?$/.test(normPath);

    const activeClass = (match) => match ? ' class="active"' : "";

    // ── Build HTML ───────────────────────────────────────────────────────────
    const html = `
    <nav class="blog-nav">
        <div class="container blog-nav-inner">
            <a href="${prefix}index.html" class="blog-nav-logo">
                <img src="${prefix}assets/favicon.webp" alt="GainFrame" loading="lazy" class="blog-nav-icon">
                <span class="blog-nav-wordmark">GainFrame</span>
            </a>
            <button class="nav-hamburger" id="navHamburger" aria-label="Open menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
            <div class="blog-nav-links" id="navLinks">
                <a href="${prefix}index.html"${activeClass(isHome)}>Home</a>
                <a href="${prefix}blog.html"${activeClass(isBlog)}>Blog</a>
                <a href="${prefix}tools/"${activeClass(isTools)}>Tools</a>
                <a href="${prefix}features.html"${activeClass(isFeatures)}>Features</a>
                <a href="https://apps.apple.com/us/app/gainframe-progress-photos/id6759252082"
                    class="nav-cta-btn" target="_blank" rel="noopener">Download</a>
            </div>
        </div>
    </nav>`;

    placeholder.outerHTML = html;

    // ── Hamburger toggle ─────────────────────────────────────────────────────
    const btn = document.getElementById("navHamburger");
    const links = document.getElementById("navLinks");
    if (btn && links) {
        btn.addEventListener("click", () => {
            const open = links.classList.toggle("nav-open");
            btn.classList.toggle("nav-hamburger--open", open);
            btn.setAttribute("aria-expanded", open);
        });
    }
})();
