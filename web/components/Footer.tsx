import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="foot">
      <span>
        © {year} GainFrame ·{" "}
        <a href="https://www.fatsecret.com" target="_blank" rel="noopener">
          Powered by fatsecret nutrition API
        </a>
      </span>
      <div>
        <Link href="/blog/">Blog</Link>
        <Link href="/comics">Comics</Link>
        <Link href="/tools/">Tools</Link>
        <Link href="/about/">About</Link>
        <a href="/feedback/">Feedback</a>
        <Link href="/privacy">Privacy</Link>
        <a href={`mailto:${SITE.contactEmail}`}>Support</a>
      </div>
    </footer>
  );
}
