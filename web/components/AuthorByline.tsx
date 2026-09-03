// Replicates the byline that shared-nav.js used to inject at the top of .post-body.
// E-E-A-T signal + internal linking back to /about/.

export default function AuthorByline() {
  return (
    <aside
      className="author-byline"
      itemScope
      itemType="https://schema.org/Person"
    >
      <a href="/about/" className="author-byline-avatar">
        <img
          src="/assets/team/michael-rode.webp"
          alt="Michael Rode, founder of GainFrame"
          itemProp="image"
          width="72"
          height="72"
          loading="lazy"
        />
      </a>
      <div className="author-byline-copy">
        <p className="author-byline-label">About the author</p>
        <p className="author-byline-name">
          <a href="/about/" itemProp="url">
            <span itemProp="name">Michael Rode</span>
          </a>
        </p>
        <p className="author-byline-bio" itemProp="description">
          Founder of GainFrame. Full-time backend engineer (15 yrs), lifter for
          20, new dad squeezing workouts in around naps. Built GainFrame after
          two expensive DEXA scans convinced me there had to be a better way to
          track body comp.{" "}
          <a href="/about/">
            More about GainFrame &rarr;
          </a>
        </p>
      </div>
    </aside>
  );
}
