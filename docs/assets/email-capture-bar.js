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
        eyebrow: "The Guide",
        message: "What's your actual body fat right now?",
        ctaLabel: "GET IT",
        placeholder: "your@email.com",
        successMessage: "Check your inbox.",
        errorMessage: "Something went wrong, try again.",
    };

    const DISMISSED_KEY = "gf_capture_bar_dismissed";

    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    const mountCaptureBar = () => {

    // ── Inject CSS ─────────────────────────────────────────────────────────────
    // Editorial subscription card — light cream bg, 2px black top rule that
    // mirrors the table bracket lines used elsewhere in the blog. Outfit display
    // headline. Sharp (not pill) input + button. Sage as accent only, never fill.
    const style = document.createElement("style");
    style.textContent = `
        #gf-capture-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: #FBFAF6;
            color: #111111;
            font-family: 'DM Sans', system-ui, sans-serif;
            font-size: 14px;
            border-top: 2px solid #111111;
            padding: 16px 56px 16px 28px;
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 24px;
            min-height: 64px;
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.04);
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
        #gf-capture-bar .gf-bar-pitch {
            display: flex;
            align-items: baseline;
            gap: 14px;
            min-width: 0;
        }
        #gf-capture-bar .gf-bar-eyebrow {
            font-family: 'Outfit', system-ui, sans-serif;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #6B8F71;
            white-space: nowrap;
            flex-shrink: 0;
        }
        #gf-capture-bar .gf-bar-message {
            font-family: 'Outfit', system-ui, sans-serif;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: -0.012em;
            color: #111111;
            line-height: 1.3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        #gf-capture-bar .gf-bar-action {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
        }
        #gf-capture-bar .gf-bar-form {
            display: flex;
            align-items: stretch;
            gap: 0;
            flex-shrink: 0;
        }
        #gf-capture-bar .gf-bar-input {
            height: 40px;
            padding: 0 14px;
            border: 1px solid rgba(0, 0, 0, 0.16);
            border-right: none;
            border-radius: 4px 0 0 4px;
            outline: none;
            font-size: 14px;
            font-family: inherit;
            background: #ffffff;
            color: #111111;
            width: 220px;
            transition: border-color 0.15s ease, width 0.2s ease;
        }
        #gf-capture-bar .gf-bar-input::placeholder {
            color: #9CA3AF;
        }
        #gf-capture-bar .gf-bar-input:focus {
            border-color: #6B8F71;
            box-shadow: inset 0 0 0 1px #6B8F71;
        }
        #gf-capture-bar .gf-bar-btn {
            height: 40px;
            padding: 0 18px;
            border: 1px solid #111111;
            background: #111111;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            font-family: 'Outfit', system-ui, sans-serif;
            letter-spacing: 0.02em;
            cursor: pointer;
            white-space: nowrap;
            border-radius: 0 4px 4px 0;
            transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        #gf-capture-bar .gf-bar-btn:hover {
            background: #6B8F71;
            border-color: #6B8F71;
        }
        #gf-capture-bar .gf-bar-btn:disabled {
            opacity: 0.5;
            cursor: default;
            transform: none;
        }
        #gf-capture-bar .gf-bar-status {
            font-size: 13px;
            font-weight: 500;
            color: #6B7280;
            white-space: nowrap;
        }
        #gf-capture-bar .gf-bar-status.is-success { color: #6B8F71; font-weight: 600; }
        #gf-capture-bar .gf-bar-status.is-error   { color: #E84C3D; }
        #gf-capture-bar .gf-bar-close {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #9CA3AF;
            cursor: pointer;
            font-size: 22px;
            line-height: 1;
            padding: 6px 8px;
            border-radius: 4px;
            transition: color 0.15s ease, background 0.15s ease;
        }
        #gf-capture-bar .gf-bar-close:hover {
            color: #111111;
            background: rgba(0,0,0,0.04);
        }

        /* Tablet — keep one row but tighten spacing */
        @media (max-width: 820px) {
            #gf-capture-bar { gap: 16px; padding: 14px 48px 14px 24px; }
            #gf-capture-bar .gf-bar-input { width: 180px; }
            #gf-capture-bar .gf-bar-message { font-size: 15px; }
        }

        /* Mobile — stack pitch above form */
        @media (max-width: 640px) {
            #gf-capture-bar {
                grid-template-columns: 1fr;
                padding: 14px 44px 14px 20px;
                gap: 10px;
                min-height: 0;
            }
            #gf-capture-bar .gf-bar-pitch {
                gap: 8px;
                flex-wrap: wrap;
                align-items: baseline;
            }
            #gf-capture-bar .gf-bar-message {
                font-size: 14px;
                font-weight: 600;
                white-space: normal;
                overflow: visible;
            }
            #gf-capture-bar .gf-bar-action {
                width: 100%;
            }
            #gf-capture-bar .gf-bar-form {
                flex: 1;
                min-width: 0;
            }
            #gf-capture-bar .gf-bar-input {
                flex: 1;
                width: auto;
                min-width: 0;
                height: 38px;
            }
            #gf-capture-bar .gf-bar-btn {
                height: 38px;
                padding: 0 14px;
                font-size: 12px;
            }
            #gf-capture-bar .gf-bar-status {
                font-size: 12px;
            }
        }

        @media (max-width: 380px) {
            #gf-capture-bar .gf-bar-eyebrow {
                font-size: 10px;
                letter-spacing: 0.14em;
            }
        }
    `;
    document.head.appendChild(style);

    // ── Build HTML ─────────────────────────────────────────────────────────────
    const bar = document.createElement("div");
    bar.id = "gf-capture-bar";
    bar.setAttribute("role", "banner");
    bar.innerHTML = `
        <div class="gf-bar-pitch">
            <span class="gf-bar-eyebrow">${config.eyebrow}</span>
            <span class="gf-bar-message">${config.message}</span>
        </div>
        <div class="gf-bar-action">
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
        </div>
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
    };

    let mounted = false;
    let timerId = 0;

    const removeTriggers = () => {
        window.removeEventListener("scroll", onScroll);
        if (timerId) window.clearTimeout(timerId);
    };

    const mountOnce = () => {
        if (mounted) return;
        mounted = true;
        removeTriggers();
        mountCaptureBar();
    };

    const isPastReadingThreshold = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable <= 0) return false;
        return window.scrollY / scrollable >= 0.5;
    };

    function onScroll() {
        if (isPastReadingThreshold()) mountOnce();
    }

    if (isPastReadingThreshold()) {
        mountOnce();
    } else {
        window.addEventListener("scroll", onScroll, { passive: true });
        timerId = window.setTimeout(mountOnce, 20000);
    }
})();
