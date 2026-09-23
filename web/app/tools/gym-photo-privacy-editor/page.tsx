import type { Metadata } from "next";
import PhotoStudioPage, {
  STUDIO_INFO,
} from "@/components/photo-studio/PhotoStudioPage";
const info = STUDIO_INFO.privacy;
export const metadata: Metadata = {
  title: { absolute: `Free ${info.title} | GainFrame` },
  description: info.description,
  alternates: { canonical: `/tools/${info.slug}/` },
  openGraph: {
    title: info.title,
    description: info.description,
    url: `https://gainframe.app/tools/${info.slug}/`,
    type: "website",
    images: [
      { url: `https://gainframe.app/blog/${info.image}/assets/cover.webp` },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: info.title,
    description: info.description,
    images: [`https://gainframe.app/blog/${info.image}/assets/cover.webp`],
  },
};
export default function Page() {
  return <PhotoStudioPage mode="privacy" />;
}
