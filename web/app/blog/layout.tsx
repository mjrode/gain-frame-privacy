import Script from "next/script";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Script src="/assets/email-capture-bar.js" strategy="afterInteractive" />
    </>
  );
}
