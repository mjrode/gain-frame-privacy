"use client";

import { OPEN_ANALYTICS_PREFERENCES_EVENT } from "@/lib/analytics-consent";

export default function AnalyticsPreferencesButton() {
  return (
    <button
      type="button"
      className="privacy-choice-button"
      onClick={() =>
        window.dispatchEvent(new Event(OPEN_ANALYTICS_PREFERENCES_EVENT))
      }
    >
      Manage website analytics preferences
    </button>
  );
}
