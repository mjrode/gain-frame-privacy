import localFont from "next/font/local";

// Self-hosted via next/font, same as the root-layout fonts: emits @font-face
// declarations under the real family names so CSS referencing
// 'Playfair Display' / 'UnifrakturCook' resolves to local woff2. Rendering
// this component pulls those declarations into the route — keep it out of the
// root layout so the rest of the site doesn't preload these fonts.
const playfair = localFont({
  src: [
    { path: "../fonts/playfair-display/normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/playfair-display/normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/playfair-display/normal.woff2", weight: "900", style: "normal" },
    { path: "../fonts/playfair-display/italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/playfair-display/italic.woff2", weight: "700", style: "italic" },
    { path: "../fonts/playfair-display/italic.woff2", weight: "900", style: "italic" },
  ],
  display: "swap",
  fallback: ["Playfair Display", "serif"],
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "Playfair Display" }],
});
const unifraktur = localFont({
  src: [
    { path: "../fonts/unifraktur-cook/bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  fallback: ["UnifrakturCook", "serif"],
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "UnifrakturCook" }],
});

export default function EditorialFonts() {
  return (
    <span
      className={`${playfair.className} ${unifraktur.className}`}
      hidden
      aria-hidden
    />
  );
}
