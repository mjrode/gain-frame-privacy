import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Progress photos that explain what changed | GainFrame",
  },
  description:
    "GainFrame turns progress photos into body-composition trends, muscle comparisons, and private Coach conversations about what changed.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export { default } from "./landing-v2/page";
