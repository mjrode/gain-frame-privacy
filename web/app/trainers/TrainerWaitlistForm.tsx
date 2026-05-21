"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export default function TrainerWaitlistForm() {
  const [email, setEmail] = useState("");
  const [clients, setClients] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/trainer-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          activeClients: clients.trim(),
          source: "trainers-page",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Signup failed (${res.status})`);
      }

      setStatus("success");
      setEmail("");
      setClients("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Try again or email Mike directly.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="tr-waitlist-success" role="status">
        <p className="tr-waitlist-success-title">
          You&rsquo;re on the waitlist.
        </p>
        <p className="tr-waitlist-success-body">
          I&rsquo;ll email you once trainer mode opens up. If you change your
          mind and want to lock in founding rate, the deposit link is still
          live above.
        </p>
      </div>
    );
  }

  return (
    <form className="tr-waitlist-form" onSubmit={handleSubmit} noValidate>
      <div className="tr-waitlist-row">
        <label className="tr-waitlist-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting"}
          />
        </label>
        <label className="tr-waitlist-field">
          <span>Active clients</span>
          <input
            type="text"
            name="activeClients"
            placeholder="e.g. 12"
            value={clients}
            onChange={(e) => setClients(e.target.value)}
            disabled={status === "submitting"}
            inputMode="numeric"
          />
        </label>
      </div>
      <button
        type="submit"
        className="tr-btn tr-btn-dark tr-btn-block"
        disabled={status === "submitting"}
        data-analytics="trainer-waitlist-submit"
      >
        {status === "submitting" ? "Adding you…" : "Join waitlist"}
      </button>
      {status === "error" ? (
        <p className="tr-waitlist-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <p className="tr-waitlist-fineprint">
        One email when we have news. No marketing. You can email Mike directly
        any time at{" "}
        <a href="mailto:michaelrode44@gmail.com">michaelrode44@gmail.com</a>.
      </p>
    </form>
  );
}
