// Replicates the byline that shared-nav.js used to inject at the top of .post-body.
// E-E-A-T signal + internal linking back to /about/.

export default function AuthorByline() {
  return (
    <aside
      className="author-byline"
      itemScope
      itemType="https://schema.org/Person"
      style={{
        display: "flex",
        gap: "1.25rem",
        alignItems: "center",
        padding: "1.5rem",
        margin: "2.5rem 0 1.5rem",
        background: "#f8f8f6",
        borderRadius: "20px",
        border: "1px solid #ececea",
        flexWrap: "wrap",
      }}
    >
      <a href="/about/" style={{ flexShrink: 0 }}>
        <img
          src="/assets/team/michael-rode.webp"
          alt="Michael Rode, founder of GainFrame"
          itemProp="image"
          loading="lazy"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </a>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div
          style={{
            fontSize: "0.78rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#888",
            marginBottom: "0.2rem",
          }}
        >
          Written by
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "1.05rem",
            marginBottom: "0.35rem",
          }}
        >
          <a
            href="/about/"
            itemProp="url"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <span itemProp="name">Michael Rode</span>
          </a>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: "#555",
            lineHeight: 1.5,
          }}
          itemProp="description"
        >
          Founder of GainFrame. Full-time backend engineer (15 yrs), lifter for
          20, new dad squeezing workouts in around naps. Built GainFrame after
          two expensive DEXA scans convinced me there had to be a better way to
          track body comp.{" "}
          <a
            href="/about/"
            style={{
              color: "#555",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            More about GainFrame &rarr;
          </a>
        </p>
      </div>
    </aside>
  );
}
