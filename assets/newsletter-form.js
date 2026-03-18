(() => {
    const newsletterConfig = {
        action: "https://app.us18.list-manage.com/subscribe/post?u=a0f1ce00c8f3ffe789cd7d34b&id=c2f1ecc6f0&f_id=00a8b3e6f0",
        hiddenFields: [
            { name: "b_a0f1ce00c8f3ffe789cd7d34b_c2f1ecc6f0", value: "" },
        ],
        title: "Stay in the Loop",
        description: "Training tips, app updates, and new features — no spam, unsubscribe anytime.",
        placeholder: "Your email address",
        buttonLabel: "Subscribe",
        note: "Free forever · No spam · Unsubscribe anytime",
        setupPendingMessage: "Newsletter signup is being updated right now. Check back in a bit.",
        successMessage: "You're subscribed.",
        genericErrorMessage: "Something went wrong. Please try again in a moment.",
    };

    const mountSelector = "[data-newsletter-signup]";
    const mounts = document.querySelectorAll(mountSelector);

    if (!mounts.length) {
        return;
    }

    const escapeHtml = (value) =>
        String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const normalizeHiddenFields = (hiddenFields) => {
        if (!hiddenFields) {
            return [];
        }

        if (Array.isArray(hiddenFields)) {
            return hiddenFields.filter((field) => field && field.name);
        }

        return Object.entries(hiddenFields).map(([name, value]) => ({ name, value }));
    };

    const configuredAction = newsletterConfig.action.trim();
    const isConfigured = configuredAction.length > 0 && !configuredAction.includes("XXXXXXX");
    const hiddenFields = normalizeHiddenFields(newsletterConfig.hiddenFields);

    const toText = (value) => {
        const temp = document.createElement("div");
        temp.innerHTML = String(value ?? "");
        return (temp.textContent || temp.innerText || "").trim();
    };

    const buildJsonpAction = (action) => {
        const url = new URL(action, window.location.origin);
        url.pathname = url.pathname.replace(/\/post$/, "/post-json");
        return url;
    };

    const renderHiddenFields = () =>
        hiddenFields
            .map(
                (field) =>
                    `<input type="hidden" name="${escapeHtml(field.name)}" value="${escapeHtml(field.value ?? "")}">`
            )
            .join("");

    const renderNewsletter = () => `
        <section class="newsletter-section">
            <div class="container">
                <h2 class="newsletter-title">${escapeHtml(newsletterConfig.title)}</h2>
                <p class="newsletter-desc">${escapeHtml(newsletterConfig.description)}</p>
                <form class="newsletter-form" ${isConfigured ? `action="${escapeHtml(configuredAction)}"` : ""} method="post" novalidate data-newsletter-configured="${isConfigured ? "true" : "false"}">
                    ${renderHiddenFields()}
                    <input type="email" name="EMAIL" class="newsletter-input" placeholder="${escapeHtml(newsletterConfig.placeholder)}" autocomplete="email" required>
                    <button type="submit" class="newsletter-btn">${escapeHtml(newsletterConfig.buttonLabel)}</button>
                </form>
                <p class="newsletter-status" data-newsletter-status aria-live="polite"></p>
                <p class="newsletter-note">${escapeHtml(newsletterConfig.note)}</p>
            </div>
        </section>
    `;

    const setStatus = (mount, message, tone) => {
        const status = mount.querySelector("[data-newsletter-status]");
        if (!status) {
            return;
        }

        status.textContent = message;
        status.classList.remove("is-error", "is-success");

        if (tone === "error") {
            status.classList.add("is-error");
        }

        if (tone === "success") {
            status.classList.add("is-success");
        }
    };

    mounts.forEach((mount) => {
        mount.innerHTML = renderNewsletter();

        const form = mount.querySelector(".newsletter-form");
        if (!form) {
            return;
        }

        const button = mount.querySelector(".newsletter-btn");
        const input = mount.querySelector(".newsletter-input");

        form.addEventListener("submit", (event) => {
            if (form.dataset.newsletterConfigured !== "true") {
                event.preventDefault();
                setStatus(mount, newsletterConfig.setupPendingMessage, "error");
                return;
            }

            event.preventDefault();

            if (!form.reportValidity()) {
                return;
            }

            const jsonpAction = buildJsonpAction(form.action);
            const callbackName = `mailchimpCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            const script = document.createElement("script");
            const params = new URLSearchParams();
            const formData = new FormData(form);

            formData.forEach((value, key) => {
                params.append(key, String(value));
            });

            params.set("c", callbackName);
            script.src = `${jsonpAction.toString()}&${params.toString()}`;
            script.async = true;

            let settled = false;

            const finish = () => {
                button?.removeAttribute("disabled");
                input?.removeAttribute("aria-busy");

                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }

                try {
                    delete window[callbackName];
                } catch (error) {
                    window[callbackName] = undefined;
                }
            };

            window[callbackName] = (response) => {
                settled = true;
                finish();

                if (response?.result === "success") {
                    form.reset();
                    setStatus(mount, toText(response?.msg) || newsletterConfig.successMessage, "success");
                    return;
                }

                const errorMessage = toText(response?.msg) || newsletterConfig.genericErrorMessage;
                setStatus(mount, errorMessage, "error");
            };

            script.onerror = () => {
                settled = true;
                finish();
                setStatus(mount, newsletterConfig.genericErrorMessage, "error");
            };

            button?.setAttribute("disabled", "disabled");
            input?.setAttribute("aria-busy", "true");
            setStatus(mount, "Submitting...", "success");
            document.body.appendChild(script);

            window.setTimeout(() => {
                if (settled) {
                    return;
                }

                finish();
                setStatus(mount, newsletterConfig.genericErrorMessage, "error");
            }, 10000);
        });
    });
})();
