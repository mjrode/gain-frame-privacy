"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

export default function BlogNav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  const norm = pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  const isHome = norm === "/" || norm === "";
  const isBlog = /^\/blog($|\/)/.test(norm);
  const isComics = /^\/comics($|\/|\.html$)/.test(norm);
  const isTools = /^\/tools($|\/)/.test(norm);
  const isAbout = /^\/about($|\/)/.test(norm);
  const showNavMascot = isHome || norm === "/blog";

  const cls = (active: boolean) => (active ? "active" : undefined);

  return (
    <nav className={`blog-nav${open ? " nav--open" : ""}`}>
      <div className="container blog-nav-inner">
        <Link href="/" className="blog-nav-logo">
          <img
            src="/assets/favicons/favicon.webp"
            alt="GainFrame"
            loading="lazy"
            className="blog-nav-icon"
          />
          <span className="blog-nav-wordmark">GainFrame</span>
        </Link>
        <button
          className={`nav-hamburger${open ? " nav-hamburger--open" : ""}`}
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {showNavMascot ? (
          <Link
            className="nav-mascot-link nav-mascot-link--mobile"
            href="/comics"
            aria-label="Read GainFrame comics"
          >
            <img
              src="/assets/gainframe-guy/poses/gainframe-guy-wave.png"
              alt=""
            />
          </Link>
        ) : null}
        <div className={`blog-nav-links${open ? " nav-open" : ""}`}>
          <Link href="/" className={cls(isHome)} onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link
            href="/blog/"
            className={cls(isBlog)}
            onClick={() => setOpen(false)}
          >
            Blog
          </Link>
          <span className="nav-comics-target">
            <Link
              href="/comics"
              className={cls(isComics)}
              onClick={() => setOpen(false)}
            >
              Comics
            </Link>
            {showNavMascot ? (
              <Link
                className="nav-mascot-link nav-mascot-link--desktop"
                href="/comics"
                aria-label="Read GainFrame comics"
              >
                <img
                  src="/assets/gainframe-guy/poses/gainframe-guy-wave.png"
                  alt=""
                />
              </Link>
            ) : null}
          </span>
          <Link
            href="/tools/"
            className={cls(isTools)}
            onClick={() => setOpen(false)}
          >
            Tools
          </Link>
          <Link
            href="/about/"
            className={cls(isAbout)}
            onClick={() => setOpen(false)}
          >
            About
          </Link>
          <a
            href={SITE.appStoreUrl}
            className="nav-cta-btn"
            target="_blank"
            rel="noopener"
          >
            Download
          </a>
        </div>
      </div>
    </nav>
  );
}
