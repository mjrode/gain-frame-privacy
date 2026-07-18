import { Playfair_Display, UnifrakturCook } from "next/font/google";

// Self-hosted via next/font, same as the root-layout fonts: emits @font-face
// declarations under the real family names so CSS referencing
// 'Playfair Display' / 'UnifrakturCook' resolves to local woff2. Rendering
// this component pulls those declarations into the route — keep it out of the
// root layout so the rest of the site doesn't preload these fonts.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});
const unifraktur = UnifrakturCook({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
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
