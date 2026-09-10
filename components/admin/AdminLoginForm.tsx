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
      className="relative mx-auto mt-[30px] grid max-w-[520px] grid-cols-1 gap-[22px] rounded-[20px] border border-[#d9e3ef] bg-white p-[clamp(24px,4vw,42px)] text-left shadow-[0_12px_35px_rgba(6,27,67,.08)] max-[560px]:gap-[18px] max-[560px]:px-[18px] max-[560px]:py-[22px]"
      onSubmit={handleSubmit}
    >
      {error ? (
        <div
          ref={errorRef}
          className="flex flex-col gap-[5px] rounded-[10px] border-2 border-[#c8323e] bg-[#fff2f3] px-4 py-3.5 leading-[1.4] text-[#83151f] focus:outline-[3px] focus:outline-[#c8323e] focus:outline-offset-3 [&_strong]:text-sm [&_span]:text-[13px]"
          id="admin-login-error"
          role="alert"
          tabIndex={-1}
        >
          <strong>Sign-in failed</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-2">
        <label className="text-[13px] font-[900]" htmlFor="admin-password">Administrator password</label>
        <input
          className="w-full min-w-0 rounded-[10px] border-2 border-[#cfdbe9] bg-white px-3.5 py-[13px] leading-[1.35] text-ink outline-offset-2 transition-[border-color,box-shadow] duration-150 hover:border-[#99aec7] focus-visible:border-navy focus-visible:outline-[3px] focus-visible:outline-[#1672d8]"
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

      <button className="inline-flex min-h-[54px] w-full cursor-pointer items-center justify-center rounded-full border-0 bg-lime px-6 py-[17px] text-center font-[1000] text-navy outline-offset-4 enabled:hover:bg-[#0bda8f] focus-visible:outline-4 focus-visible:outline-navy focus-visible:shadow-[0_0_0_7px_#fff] disabled:cursor-wait disabled:opacity-[.65]" type="submit" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
