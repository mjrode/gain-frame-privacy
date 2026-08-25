"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PlatformDownloadLink from "@/components/PlatformDownloadLink";

export default function BlogNav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  const norm = pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  const isBlog = /^\/blog($|\/)/.test(norm);
  const isComics = /^\/comics($|\/|\.html$)/.test(norm);
  const isTools = /^\/tools($|\/)/.test(norm);
  const isAbout = /^\/about($|\/)/.test(norm);
  const isLeaderboard = /^\/leaderboard($|\/)/.test(norm);

  const cls = (active: boolean) => (active ? "active" : undefined);

  return (
    <nav className="blog-nav">
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
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-navigation-links"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div
          id="site-navigation-links"
          className={`blog-nav-links${open ? " nav-open" : ""}`}
        >
          <Link
            href="/comics/"
            className={cls(isComics)}
            onClick={() => setOpen(false)}
          >
            Comics
          </Link>
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
          <Link
            href="/leaderboard/"
            className={cls(isLeaderboard)}
            onClick={() => setOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            href="/blog/"
            className={cls(isBlog)}
            onClick={() => setOpen(false)}
          >
            Blog
          </Link>
          <PlatformDownloadLink
            className="nav-cta-btn"
            source="blog_nav"
            content="nav_download"
            campaign="web-blog-nav"
            androidLabel="Try free tool"
          >
            Get the app
          </PlatformDownloadLink>
        </div>
      </div>
    </nav>
  );
}
