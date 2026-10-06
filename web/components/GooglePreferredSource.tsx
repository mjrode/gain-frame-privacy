import GooglePreferredSourceButton from "./GooglePreferredSourceButton";
import styles from "./GooglePreferredSource.module.css";

export function GooglePreferredSourceFooter() {
  return (
    <footer className={styles.footer} aria-label="Follow GainFrame on Google">
      <p>More GainFrame in your Google Search.</p>
      <GooglePreferredSourceButton />
    </footer>
  );
}

export function GooglePreferredSourceCard() {
  return (
    <aside className={styles.card} aria-label="GainFrame on Google">
      <div>
        <h2>See GainFrame more often in Google</h2>
        <p>
          Add GainFrame as a preferred source to make our articles more likely
          to appear in your Top Stories.
        </p>
      </div>
      <GooglePreferredSourceButton />
    </aside>
  );
}
