"use client";

import { useEffect } from "react";
import {
  initializePreferredSource,
  openPreferredSource,
  PREFERRED_SOURCE_URL,
} from "@/lib/google-preferred-source";
import styles from "./GooglePreferredSource.module.css";

export default function GooglePreferredSourceButton() {
  useEffect(() => { initializePreferredSource(); }, []);

  return (
    <a
      className={styles.button}
      href={PREFERRED_SOURCE_URL}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (openPreferredSource()) event.preventDefault();
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.36Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.23-2.51c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.12H3.05v2.59A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.07 12c0-.67.11-1.32.32-1.92V7.49H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.51l3.34-2.59Z" />
        <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.34 2.59C7.18 7.72 9.39 5.96 12 5.96Z" />
      </svg>
      Make us preferred on Google
    </a>
  );
}
