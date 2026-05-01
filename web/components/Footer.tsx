import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="foot">
      <span>© {year} GainFrame</span>
      <div>
        <Link href="/blog/">Blog</Link>
        <Link href="/comics">Comics</Link>
        <Link href="/tools/">Tools</Link>
        <Link href="/about/">About</Link>
        <Link href="/privacy">Privacy</Link>
        <a href={`mailto:${SITE.contactEmail}`}>Support</a>
      </div>
    </footer>
  );
}
