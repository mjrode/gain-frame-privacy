"use client";

import { useEffect, useRef } from "react";
import styles from "./app-incident-notice.module.css";

const DISMISSED_KEY = "gainframe-3-17-opening-issue-dismissed";

export default function AppIncidentNotice() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    try {
      if (window.sessionStorage.getItem(DISMISSED_KEY) === "true") return;
    } catch {
      // The notice can still be dismissed if browser storage is unavailable.
    }

    dialog.showModal();
    return () => dialog.close();
  }, []);

  function dismiss() {
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // Closing the dialog must not depend on browser storage.
    }
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="app-incident-title"
      aria-describedby="app-incident-description"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div className={styles.content}>
        <button
          type="button"
          className={styles.close}
          aria-label="Dismiss app status notice"
          onClick={dismiss}
        >
          <span aria-hidden="true">×</span>
        </button>
        <p className={styles.eyebrow}>GainFrame app update</p>
        <h2 id="app-incident-title">Having trouble opening GainFrame?</h2>
        <div id="app-incident-description" className={styles.description}>
          <p>
            We’re aware of a bug in version 3.17 that prevents the app from
            opening. The fix has been submitted to Apple, and we expect it to
            roll out this afternoon (September 8, Eastern Time), pending App
            Store approval.
          </p>
          <p>
            We’re sorry for the disruption and appreciate your patience.
          </p>
        </div>
        <button type="button" className={styles.dismiss} onClick={dismiss}>
          Got it
        </button>
      </div>
    </dialog>
  );
}
