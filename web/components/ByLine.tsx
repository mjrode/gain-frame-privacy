// Compact trust signal for the article masthead. Publication details already
// live in the metadata row, so this stays focused on authorship.
export default function ByLine() {
  return (
    <div
      className="post-byline"
      itemScope
      itemType="https://schema.org/Person"
    >
      <a
        href="/about/"
        className="post-byline-avatar"
        itemProp="url"
        aria-label="About Michael Rode"
      >
        <img
          src="/assets/team/michael-rode.webp"
          alt=""
          width="36"
          height="36"
          loading="eager"
          itemProp="image"
        />
      </a>
      <p className="post-byline-copy">
        <span>Written by</span>{" "}
        <a href="/about/" itemProp="url">
          <span itemProp="name">Michael Rode</span>
        </a>
      </p>
    </div>
  );
}
