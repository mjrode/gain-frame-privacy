"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navLinksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 24);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const closeMenu = () => setOpen(false);

  return (
    <nav
      className={`nav${scrolled ? " nav--scrolled" : ""}`}
      aria-label="Primary navigation"
    >
      <Link className="nav-brand" href="/">
        <img
          className="nav-logo"
          src="/assets/favicons/favicon.webp"
          alt="GainFrame"
        />
        <span>GainFrame</span>
      </Link>
      <div
        className={`nav-links${open ? " open" : ""}`}
        id="navLinks"
        ref={navLinksRef}
      >
        <Link href="/" className={isActive("/") ? "active" : undefined} onClick={closeMenu}>
          Home
        </Link>
        <Link href="/blog/" className={isActive("/blog") ? "active" : undefined} onClick={closeMenu}>
          Blog
        </Link>
        <span className="nav-comics-target">
          <Link href="/comics" className={isActive("/comics") ? "active" : undefined} onClick={closeMenu}>
            Comics
          </Link>
          <Link
            className="nav-mascot-link nav-mascot-link--desktop"
            href="/comics"
            aria-label="Read GainFrame comics"
            onClick={closeMenu}
          >
            <img
              src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp"
              alt=""
            />
          </Link>
        </span>
        <Link href="/tools/" className={isActive("/tools") ? "active" : undefined} onClick={closeMenu}>
          Tools
        </Link>
        <Link href="/about/" className={isActive("/about") ? "active" : undefined} onClick={closeMenu}>
          About
        </Link>
      </div>
      <div className="nav-actions">
        <a
          className="nav-cta"
          href={SITE.appStoreUrl}
          target="_blank"
          rel="noopener"
        >
          Download
        </a>
        <Link
          className="nav-mascot-link nav-mascot-link--mobile"
          href="/comics"
          aria-label="Read GainFrame comics"
          onClick={closeMenu}
        >
          <img src="/assets/gainframe-guy/poses/gainframe-guy-wave.webp" alt="" />
        </Link>
        <button
          className="nav-burger"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="navLinks"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
