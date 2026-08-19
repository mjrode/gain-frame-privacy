import type { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: { absolute: "Admin · GainFrame" },
  robots: { index: false, follow: false },
};

// Static export friendly — the shell prerenders empty; sign-in and all data
// fetching happen client-side in <AdminClient />. The worker enforces auth
// on every data endpoint, so nothing sensitive is in this bundle.
export default function AdminPage() {
  return (
    <main
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: 1240,
        margin: "0 auto",
        padding: "40px 24px 96px",
        color: "#1a1a1a",
        lineHeight: 1.5,
      }}
    >
      <AdminClient />
    </main>
  );
}
