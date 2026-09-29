"use client";

import { useRef } from "react";

/** A fresh picker grants access again without clearing the rest of the form. */
export default function PhotoRecoveryActions({
  className,
  onPick,
  onRetry,
}: {
  className: string;
  onPick: (file: File) => void;
  onRetry?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 280, margin: "0 auto" }}>
      {onRetry && <button type="button" className={className} onClick={onRetry}>Retry this photo</button>}
      <button type="button" className={className} onClick={() => inputRef.current?.click()}>
        Choose photo again
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        hidden
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) onPick(file);
        }}
      />
    </div>
  );
}
