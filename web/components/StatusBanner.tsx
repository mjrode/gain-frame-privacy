// REMOVE WHEN 2.1 SHIPS — temporary status notice for the 2.0 photo-import / AI-scoring / pose-categorization bug.
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gf-status-banner-2-0-bug";

export default function StatusBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "dismissed") return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-banner-title"
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(15, 18, 24, 0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "gfStatusFade 180ms ease-out",
      }}
    >
      <style>{`
        @keyframes gfStatusFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gfStatusPop {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "440px",
          width: "100%",
          background: "#ffffff",
          color: "#0f1218",
          borderRadius: "16px",
          padding: "28px 28px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          animation: "gfStatusPop 220ms ease-out",
          fontFamily:
            '"DM Sans", "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "32px",
            height: "32px",
            border: "none",
            background: "transparent",
            color: "#6b7280",
            fontSize: "22px",
            lineHeight: 1,
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          ×
        </button>
        <h2
          id="status-banner-title"
          style={{
            margin: "0 0 12px",
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          Heads up — fix in flight
        </h2>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: "15px",
            lineHeight: 1.55,
            color: "#374151",
          }}
        >
          We&apos;ve identified an issue impacting photo import, AI scoring, and
          pose categorization in the current build. The fix is submitted to the
          App Store and waiting on review. We&apos;ll restore everything once
          the update is approved.
        </p>
        <button
          type="button"
          onClick={dismiss}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "40px",
            padding: "0 18px",
            border: "none",
            background: "#0f1218",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
