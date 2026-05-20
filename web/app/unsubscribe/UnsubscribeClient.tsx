"use client";

import { useEffect, useState } from "react";

/// Calls the Supabase `email-unsubscribe` edge function with the token from
/// the URL. The page is rendered statically; this component runs only in the
/// browser so we can keep `output: "export"` for Cloudflare Pages.
///
/// The edge function does the actual DB write — this component is just a UI
/// wrapper that translates the response into a friendly state.
const EDGE_FUNCTION_URL =
  "https://qpctmhhnomeeyajbivne.supabase.co/functions/v1/email-unsubscribe";

type Status = "idle" | "working" | "success" | "missing-token" | "error";

export default function UnsubscribeClient() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token")?.trim();

    if (!token) {
      setStatus("missing-token");
      return;
    }

    setStatus("working");
    fetch(`${EDGE_FUNCTION_URL}?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          return res.text().then((body) => {
            setErrorMsg(body || `Server returned ${res.status}`);
            setStatus("error");
          });
        }
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : "Network error");
        setStatus("error");
      });
  }, []);

  if (status === "idle" || status === "working") {
    return (
      <>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Unsubscribing…</h1>
        <p style={{ color: "#555" }}>One moment.</p>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>You&apos;re unsubscribed.</h1>
        <p style={{ color: "#555" }}>
          You won&apos;t get any more lifecycle emails from GainFrame.
        </p>
        <p style={{ marginTop: 32, fontSize: 14, color: "#888" }}>
          If this was a mistake, just reply to any prior email and I&apos;ll
          re-add you. — Michael
        </p>
      </>
    );
  }

  if (status === "missing-token") {
    return (
      <>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>
          Missing unsubscribe token.
        </h1>
        <p style={{ color: "#555" }}>
          The link looks incomplete. Reply to the email and I&apos;ll handle it
          manually.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Something went wrong.</h1>
      <p style={{ color: "#555" }}>{errorMsg ?? "Please try again."}</p>
      <p style={{ marginTop: 32, fontSize: 14, color: "#888" }}>
        Reply to the email and I&apos;ll handle it manually.
      </p>
    </>
  );
}
