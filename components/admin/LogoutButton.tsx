"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout rejected");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Unable to log out. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-logout">
      <button type="button" onClick={logout} disabled={submitting}>
        {submitting ? "Logging out…" : "Log out"}
      </button>
      {error ? <span role="alert">{error}</span> : null}
    </div>
  );
}
