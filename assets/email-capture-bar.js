/**
 * email-capture-bar.js
 * Slim dismissible announcement bar with email capture.
 * Injects itself as the first element in <body>, above any nav.
 * Reuses the same Mailchimp endpoint as newsletter-form.js.
 * Dismissed state is stored in sessionStorage so it stays hidden
 * for the rest of the session (not permanently — they'll see it again next visit).
 */
(() => {
    const config = {
        mailchimpAction: "https://app.us18.list-manage.com/subscribe/post?u=a0f1ce00c8f3ffe789cd7d34b&id=c2f1ecc6f0&f_id=00a8b3e6f0",
        hiddenField: { name: "b_a0f1ce00c8f3ffe789cd7d34b_c2f1ecc6f0", value: "" },

        /** Text shown in the bar */
        eyebrow: "Free Guide",
        message: "What's your actual body fat right now?",
        ctaLabel: "Get the guide →",
        placeholder: "your@email.com",
        successMessage: "✓ Check your inbox!",
        errorMessage: "Something went wrong — try again.",
    };

    const DISMISSED_KEY = "gf_capture_bar_dismissed";

    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // ── Inject CSS ─────────────────────────────────────────────────────────────
    const style = document.createElement("style");
    style.textContent = `
        #gf-capture-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: #1c1917;
            color: #fff;
            font-family: 'DM Sans', system-ui, sans-serif;
            font-size: 14px;
            padding: 12px 56px 12px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            flex-wrap: wrap;
            min-height: 48px;
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
            transform: translateY(0);
            transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
            animation: gfBarSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes gfBarSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
        }
        #gf-capture-bar.gf-bar-hidden {
            transform: translateY(100%);
            opacity: 0;
            pointer-events: none;
        }
        #gf-capture-bar .gf-bar-eyebrow {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #4ade80;
            background: rgba(74,222,128,0.12);
            border-radius: 100px;
            padding: 3px 10px;
            white-space: nowrap;
        }
        #gf-capture-bar .gf-bar-message {
            font-size: 14px;
            font-weight: 500;
            color: #e5e5e5;
            white-space: nowrap;
        }
        @media (max-width: 600px) {
            #gf-capture-bar .gf-bar-message { display: none; }
        }
        #gf-capture-bar .gf-bar-form {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }
        #gf-capture-bar .gf-bar-input {
            height: 32px;
            padding: 0 12px;
            border-radius: 100px;
            border: none;
            outline: none;
            font-size: 13px;
            font-family: inherit;
            background: rgba(255,255,255,0.1);
            color: #fff;
            width: 200px;
            transition: background 0.2s, width 0.2s;
        }
        #gf-capture-bar .gf-bar-input::placeholder { color: #888; }
        #gf-capture-bar .gf-bar-input:focus {
            background: rgba(255,255,255,0.16);
            width: 240px;
        }
        @media (max-width: 480px) {
            #gf-capture-bar .gf-bar-input { width: 150px; }
            #gf-capture-bar .gf-bar-input:focus { width: 170px; }
        }
        #gf-capture-bar .gf-bar-btn {
            height: 32px;
            padding: 0 16px;
            border-radius: 100px;
            border: none;
            background: #1a7a4a;
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            white-space: nowrap;
            transition: background 0.2s, opacity 0.2s;
        }
        #gf-capture-bar .gf-bar-btn:hover { background: #22a05e; }
        #gf-capture-bar .gf-bar-btn:disabled { opacity: 0.5; cursor: default; }
        #gf-capture-bar .gf-bar-status {
            font-size: 13px;
            font-weight: 600;
            min-width: 160px;
            text-align: left;
        }
        #gf-capture-bar .gf-bar-status.is-success { color: #4ade80; }
        #gf-capture-bar .gf-bar-status.is-error   { color: #f87171; }
        #gf-capture-bar .gf-bar-close {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
            padding: 4px 6px;
            border-radius: 4px;
            transition: color 0.2s;
        }
        #gf-capture-bar .gf-bar-close:hover { color: #bbb; }
    `;
    document.head.appendChild(style);

    // ── Build HTML ─────────────────────────────────────────────────────────────
    const bar = document.createElement("div");
    bar.id = "gf-capture-bar";
    bar.setAttribute("role", "banner");
    bar.innerHTML = `
        <span class="gf-bar-eyebrow">${config.eyebrow}</span>
        <span class="gf-bar-message">${config.message}</span>
        <form class="gf-bar-form" novalidate>
            <input type="hidden" name="${config.hiddenField.name}" value="${config.hiddenField.value}">
            <input
                class="gf-bar-input"
                type="email"
                name="EMAIL"
                placeholder="${config.placeholder}"
                autocomplete="email"
                required
                aria-label="Email address"
            >
            <button class="gf-bar-btn" type="submit">${config.ctaLabel}</button>
        </form>
        <span class="gf-bar-status" aria-live="polite"></span>
        <button class="gf-bar-close" aria-label="Dismiss">&times;</button>
    `;

    // Append to end of body (fixed position — order doesn't matter)
    document.body.appendChild(bar);

    // ── Dismiss logic ──────────────────────────────────────────────────────────
    const closeBtn = bar.querySelector(".gf-bar-close");
    const dismiss = () => {
        bar.classList.add("gf-bar-hidden");
        sessionStorage.setItem(DISMISSED_KEY, "1");
    };
    closeBtn.addEventListener("click", dismiss);

    // ── Form submission (JSONP — same pattern as newsletter-form.js) ───────────
    const form = bar.querySelector(".gf-bar-form");
    const input = bar.querySelector(".gf-bar-input");
    const btn = bar.querySelector(".gf-bar-btn");
    const status = bar.querySelector(".gf-bar-status");

    const setStatus = (msg, tone) => {
        status.textContent = msg;
        status.className = "gf-bar-status" + (tone ? ` is-${tone}` : "");
    };

    const buildJsonpAction = (action) => {
        const url = new URL(action, window.location.origin);
        url.pathname = url.pathname.replace(/\/post$/, "/post-json");
        return url;
    };

    const toText = (value) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = String(value ?? "");
        return (tmp.textContent || tmp.innerText || "").trim();
    };

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;

        const callbackName = `gfBarCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const script = document.createElement("script");
        const params = new URLSearchParams();
        const formData = new FormData(form);

        formData.forEach((val, key) => params.append(key, String(val)));
        params.set("c", callbackName);

        const jsonpUrl = buildJsonpAction(config.mailchimpAction);
        script.src = `${jsonpUrl.toString()}&${params.toString()}`;
        script.async = true;

        let settled = false;

        const finish = () => {
            btn.removeAttribute("disabled");
            if (script.parentNode) script.parentNode.removeChild(script);
            try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
        };

        window[callbackName] = (response) => {
            settled = true;
            finish();

            if (response?.result === "success") {
                form.reset();
                form.style.display = "none";
                setStatus(config.successMessage, "success");
                // Auto-dismiss after 4 seconds
                setTimeout(dismiss, 4000);
                return;
            }

            const msg = toText(response?.msg) || config.errorMessage;
            setStatus(msg, "error");
        };

        script.onerror = () => {
            settled = true;
            finish();
            setStatus(config.errorMessage, "error");
        };

        btn.setAttribute("disabled", "disabled");
        setStatus("Submitting…", "");
        document.body.appendChild(script);

        // Timeout fallback
        setTimeout(() => {
            if (!settled) {
                finish();
                setStatus(config.errorMessage, "error");
            }
        }, 10000);
    });
})();
