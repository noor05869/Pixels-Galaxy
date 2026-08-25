"use client";

import { FormEvent, useRef, useState } from "react";

const genericFailure = "Unable to sign in. Check the password and try again.";

export function AdminLoginForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const password = new FormData(form).get("password");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error("Sign-in rejected");
      window.location.assign("/admin/orders");
    } catch {
      setError(genericFailure);
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="checkout-form"
      style={{ gridTemplateColumns: "1fr", maxWidth: 520, margin: "30px auto 0", textAlign: "left" }}
      onSubmit={handleSubmit}
    >
      {error ? (
        <div
          ref={errorRef}
          className="checkout-error"
          id="admin-login-error"
          role="alert"
          tabIndex={-1}
        >
          <strong>Sign-in failed</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="checkout-field checkout-field-wide">
        <label htmlFor="admin-password">Administrator password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          maxLength={1024}
          aria-describedby={error ? "admin-login-error" : undefined}
          required
          autoFocus
        />
      </div>

      <button className="checkout-submit" type="submit" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
