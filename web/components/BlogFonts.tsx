// Fonts are loaded once via next/font in app/layout.tsx (self-hosted).
// This component just brings in the legacy global stylesheet that the
// blog/comics pages depend on for layout and component styles.
export default function BlogFonts() {
  return <link rel="stylesheet" href="/styles.css?v=nav-mascot" />;
}
