// Compact one-line byline shown at the top of a blog post — minimal trust
// signal without pushing content down. The full author card lives at the
// bottom of the post (AuthorByline component).

export default function ByLine({ displayDate }: { displayDate?: string }) {
  return (
    <p
      className="post-byline"
      itemScope
      itemType="https://schema.org/Person"
      style={{
        margin: "0 0 1.5rem",
        fontSize: "0.875rem",
        color: "#666",
        letterSpacing: "0.01em",
      }}
    >
      <span style={{ color: "#888" }}>By </span>
      <a
        href="/about/"
        itemProp="url"
        style={{
          color: "#111",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <span itemProp="name">Michael Rode</span>
      </a>
      {displayDate ? (
        <>
          <span style={{ margin: "0 0.5rem", color: "#bbb" }}>·</span>
          <time>{displayDate}</time>
        </>
      ) : null}
    </p>
  );
}
