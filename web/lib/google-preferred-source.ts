import { SITE } from "./site.ts";

const SOURCE_HOST = new URL(SITE.url).hostname;
export const PREFERRED_SOURCE_URL =
  `https://www.google.com/preferences/source?q=${SOURCE_HOST}`;

const SCRIPT_ID = "google-preferred-sources";
const OPTIONS = { theme: "light", lang: "en" } as const;

type PreferredSource = {
  init: (options: typeof OPTIONS) => void;
  addPreferredSource: () => void;
};

declare global {
  interface Window {
    PREFERRED_SOURCE?: {
      push: (callback: (source: PreferredSource) => void) => unknown;
    };
  }
}

function loadScript(): HTMLScriptElement | null {
  // The SDK uses the current host. Previews must link to the real site instead.
  if (typeof window === "undefined" || window.location.hostname !== SOURCE_HOST) {
    return null;
  }

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) return existing;

  window.PREFERRED_SOURCE ??= new Array<(source: PreferredSource) => void>();
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://news.google.com/swg/js/v1/publisher.js";
  script.async = true;
  script.setAttribute("preferred-sources-control", "manual");
  script.addEventListener("error", () => { script.dataset.failed = "true"; });
  document.head.appendChild(script);
  return script;
}

export function initializePreferredSource(): void {
  const script = loadScript();
  if (!script || script.dataset.failed) return;
  window.PREFERRED_SOURCE!.push((source) => source.init(OPTIONS));
}

/** Returns false when the anchor should use its normal deeplink navigation. */
export function openPreferredSource(): boolean {
  const script = loadScript();
  if (!script || script.dataset.failed) return false;

  const fallback = () => window.location.assign(PREFERRED_SOURCE_URL);
  script.addEventListener("error", fallback, { once: true });
  // Google drains this queue when ready, including clicks made during loading.
  window.PREFERRED_SOURCE!.push((source) => {
    script.removeEventListener("error", fallback);
    source.init(OPTIONS);
    source.addPreferredSource();
  });
  return true;
}
