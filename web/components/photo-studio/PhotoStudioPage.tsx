import { Cormorant_Garamond, Manrope } from "next/font/google";
import BlogNav from "@/components/BlogNav";
import PhotoStudio from "./PhotoStudio";
import styles from "./studio.module.css";
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--studio-display",
  display: "swap",
});
const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--studio-body",
  display: "swap",
});
export const STUDIO_INFO = {
  privacy: {
    slug: "gym-photo-privacy-editor",
    title: "Gym Photo Privacy Editor",
    emphasis: "Share on your terms.",
    description:
      "Blur faces or cover identifying details in gym photos. Crop, preview and export clean PNG copies locally in your browser. Free, no signup or watermark.",
    intro:
      "Cover a face. Crop a reflection. Share the photo you intended. Your images stay in this browser, from first edit to final export.",
    image: "blur-faces-iphone-gym-photos",
    notes: [
      [
        "Choose what stays private",
        "Draw a region around a face, name badge, tattoo or reflection. Use an opaque cover for details you want completely hidden.",
      ],
      [
        "Review the whole frame",
        "Check bystanders, mirrors, screens and location clues. Blur reduces detail but does not guarantee anonymity.",
      ],
      [
        "Save a separate copy",
        "Export a flattened PNG with the original file metadata removed. Your original stays untouched; the editor keeps no saved library.",
      ],
    ],
    faqs: [
      [
        "Are my photos uploaded?",
        "No. Photo decoding, editing and export happen locally in this browser. The editor does not upload the image files, filenames, dates or edit regions. Basic usage events exclude those details.",
      ],
      [
        "How do I blur a face in a photo?",
        "Choose a JPEG, PNG or WebP, then drag a rectangle over the face or use Add cover. Select Blur and adjust its strength. Use the position and size sliders to cover the entire area, then prepare a PNG and inspect it before sharing.",
      ],
      [
        "Is an opaque cover better than blur?",
        "An opaque cover replaces the selected pixels with a solid color. Blur keeps a softened representation of the original area and can leave identifying information visible. Neither removes clues elsewhere in the image, so review the entire photo.",
      ],
      [
        "Can I edit several photos?",
        "Yes. Add up to 10 photos, with a maximum of 12 MB and 32 megapixels per source file. Images are resized to at most 1,600 pixels on the longest edge. Each photo has independent regions and crop settings. Prepare all PNGs, then save the individual edited copies.",
      ],
      [
        "Does it work on iPhone?",
        "Use a current Safari browser and choose JPEG, PNG or WebP images. HEIC is not supported here. Exports are PNGs; open a downloaded file and use Share, then Save Image, to add the copy to Photos.",
      ],
      [
        "Does the exported PNG keep location metadata?",
        "The export is a new image rendered from pixels. Original EXIF data, including embedded GPS and camera fields, is not copied into it. Visible signs, buildings, reflections and labels can still reveal a location.",
      ],
    ],
  },
  timelapse: {
    slug: "progress-photo-timelapse-maker",
    title: "Progress Photo Timelapse Maker",
    emphasis: "Give your progress a little motion.",
    description:
      "Turn 3–24 real progress photos into a free timelapse GIF. Arrange frames, align a shared crop, add dates and export locally. No signup, uploads or AI morphing.",
    intro:
      "Your check-ins, in sequence. Match the framing, set the pace, and turn the photos already on your device into a loop worth keeping.",
    image: "macrofactor-workouts-review",
    notes: [
      [
        "Put your history in order",
        "Choose 3–24 photos. Move frames earlier or later and add optional dates. The order you see is the order you export.",
      ],
      [
        "Keep the frame consistent",
        "Use a shared zoom with individual positioning. A faint first-frame guide helps line up landmarks. Repeat pose, lighting and camera distance for useful comparisons.",
      ],
      [
        "Export what actually happened",
        "Create a 480 × 600 GIF or a PNG contact sheet. Every animation frame is one of your photos. There are no invented in-between bodies or predicted outcomes.",
      ],
    ],
    faqs: [
      [
        "How do I make a progress photo timelapse?",
        "Choose at least three photos, arrange them in order, and position each within the shared portrait crop. Set the interval, play the preview, then create and download a GIF. You can also save a still contact sheet of the sequence.",
      ],
      [
        "Are the photos processed locally?",
        "Yes. The editor decodes, aligns and exports images in your browser. Photo files, filenames, optional dates and face-cover positions are not sent to GainFrame. Closing the tab clears the working session.",
      ],
      [
        "Can I add dates or hide faces?",
        "Yes. Select a frame to add its optional date or cover a face or identifying detail. Regions are set independently for every photo. Review each frame before exporting; the editor does not automatically detect faces.",
      ],
      [
        "What are the limits?",
        "Add 3–24 JPEG, PNG or WebP files, each no larger than 12 MB or 32 megapixels. GIFs export at 480 × 600 with a choice of three playback speeds. HEIC, videos and MP4 export are not supported.",
      ],
      [
        "What if GIF export fails on my phone?",
        "Try fewer frames or save the PNG contact sheet, which needs less encoding work. Keep the tab open until the file is ready. On iPhone, open the downloaded file and use the share menu to save it to Photos.",
      ],
      [
        "Does the timelapse measure muscle gain or fat loss?",
        "No. It plays your photos in order. Lighting, clothing, pose, exercise pump and camera distance can change appearance. It does not measure body composition or generate physical changes.",
      ],
    ],
  },
} as const;
export default function PhotoStudioPage({
  mode,
}: {
  mode: keyof typeof STUDIO_INFO;
}) {
  const info = STUDIO_INFO[mode],
    url = `https://gainframe.app/tools/${info.slug}/`;
  return (
    <div className={`${styles.page} ${display.variable} ${body.variable}`}>
      <link rel="stylesheet" href="/styles.css" />
      <link rel="stylesheet" href="/styles/tool-conversion-card.css" />
      <BlogNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: info.title,
            url,
            description: info.description,
            applicationCategory: "MultimediaApplication",
            operatingSystem: "All",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: info.faqs.map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }),
        }}
      />
      <main>
        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>
              GainFrame photo tools · Free to use
            </span>
            <h1>
              {info.title}
              <br />
              <em>{info.emphasis}</em>
            </h1>
            <p>{info.intro}</p>
          </div>
          <aside className={styles.heroNote}>
            <strong>Made for your real photos.</strong>
            <span>
              No account. No image uploads.
              <br />
              Just a useful file, ready to keep.
            </span>
          </aside>
        </header>
        <PhotoStudio mode={mode} />
        <section className={styles.notes}>
          <div className={styles.noteGrid}>
            {info.notes.map(([title, body], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <div className={styles.faq}>
            <h2>
              A few things
              <br />
              worth knowing.
            </h2>
            <div>
              {info.faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
          <nav className={styles.related} aria-label="Related tools and guides">
            <a href="/tools/">All free tools</a>
            <a
              href={`/tools/${mode === "privacy" ? STUDIO_INFO.timelapse.slug : STUDIO_INFO.privacy.slug}/`}
            >
              {mode === "privacy"
                ? "Make a photo timelapse"
                : "Edit a photo privately"}
            </a>
            <a href="/tools/progress-photo-compare/">Compare two photos</a>
            <a
              href={
                mode === "privacy"
                  ? "/blog/blur-faces-iphone-gym-photos/"
                  : "/blog/pump-vs-no-pump-progress-photos/"
              }
            >
              {mode === "privacy"
                ? "The iPhone photo privacy guide"
                : "Make your progress photos comparable"}
            </a>
          </nav>
        </section>
      </main>
    </div>
  );
}
