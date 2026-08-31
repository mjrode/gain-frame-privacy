import BlogFonts from "@/components/BlogFonts";
import BlogIndexBridge from "@/components/BlogIndexBridge";
import BlogNav from "@/components/BlogNav";
import BlogScrollReveal from "@/components/BlogScrollReveal";
import BlogTagFilter from "@/components/BlogTagFilter";
import { renderBlogArchiveBody } from "@/lib/blog-archive";
import { SITE } from "@/lib/site";

const BRIDGE_MARKER = "<!-- BLOG_APP_CTA_SLOT -->";

export default async function BlogArchive({ page }: { page: number }) {
  const bodyHtml = await renderBlogArchiveBody(page);
  const markerIndex = bodyHtml.indexOf(BRIDGE_MARKER);
  const beforeBridge =
    markerIndex === -1 ? bodyHtml : bodyHtml.slice(0, markerIndex);
  const afterBridge =
    markerIndex === -1
      ? ""
      : bodyHtml.slice(markerIndex + BRIDGE_MARKER.length);
  const pageUrl =
    page === 1 ? `${SITE.url}/blog/` : `${SITE.url}/blog/page/${page}/`;
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page === 1 ? "GainFrame Blog" : `GainFrame Blog — Page ${page}`,
    description:
      "Tips, guides, and updates from GainFrame — the AI-powered progress photo app for gym-goers.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "GainFrame",
      url: SITE.url,
    },
  };

  return (
    <>
      <BlogFonts />
      <link rel="stylesheet" href="/styles/blog-index-page.css" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <BlogScrollReveal />
      <BlogTagFilter />
      <div className="blog-index-page">
        <BlogNav />
        <div
          className="blog-html-fragment"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: beforeBridge }}
        />
        <BlogIndexBridge />
        {afterBridge ? (
          <div
            className="blog-html-fragment"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: afterBridge }}
          />
        ) : null}
      </div>
    </>
  );
}
