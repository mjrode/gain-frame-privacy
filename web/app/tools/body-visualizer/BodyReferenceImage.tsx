"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Reference = { src: string; alt: string };
type Frames = { current: Reference | null; previous: Reference | null };

/** Keep the last decoded frame visible while the next reference loads. */
export default function BodyReferenceImage({
  src,
  alt,
  adjacent,
}: Reference & { adjacent: string[] }) {
  const [frames, setFrames] = useState<Frames>({
    current: null,
    previous: null,
  });
  const [failed, setFailed] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.src = src;
    image
      .decode()
      .then(() => {
        if (cancelled) return;
        setFrames((old) => ({ previous: old.current, current: { src, alt } }));
        setFailed(null);
      })
      .catch(() => {
        if (!cancelled) setFailed(src);
      });
    return () => {
      cancelled = true;
    };
  }, [src, alt, retry]);

  // Fetch only neighbors after the selected image is decoded. Never download
  // the complete atlas on page load, especially on cellular connections.
  const neighbors = adjacent.join("|");
  useEffect(() => {
    if (frames.current?.src !== src) return;
    const images = neighbors
      .split("|")
      .filter(Boolean)
      .map((path) => {
        const image = new window.Image();
        image.src = path;
        return image;
      });
    return () => {
      images.forEach((image) => {
        image.src = "";
      });
    };
  }, [frames.current?.src, src, neighbors]);

  const loading = frames.current?.src !== src;
  return (
    <div
      className={styles.referenceImageStack}
      aria-busy={loading && failed !== src}
    >
      {frames.previous && (
        <Image
          className={styles.previousImage}
          src={frames.previous.src}
          alt=""
          aria-hidden
          width={768}
          height={1024}
          sizes="(max-width: 760px) 92vw, 45vw"
        />
      )}
      {frames.current && (
        <Image
          key={frames.current.src}
          className={styles.physiqueImage}
          src={frames.current.src}
          alt={frames.current.alt}
          width={768}
          height={1024}
          sizes="(max-width: 760px) 92vw, 45vw"
        />
      )}
      {loading && (
        <div className={styles.imageStatus} role="status">
          {failed === src ? (
            <>
              <span>This view couldn&apos;t load.</span>
              <button
                type="button"
                onClick={() => {
                  setFailed(null);
                  setRetry((value) => value + 1);
                }}
              >
                Retry image
              </button>
            </>
          ) : (
            "Loading reference…"
          )}
        </div>
      )}
    </div>
  );
}
