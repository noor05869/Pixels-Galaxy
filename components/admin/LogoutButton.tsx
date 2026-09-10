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
    <div className="flex shrink-0 flex-col items-end gap-2 max-[760px]:items-start">
      <button className="cursor-pointer rounded-full border-0 bg-navy px-5 py-[13px] font-[900] text-white outline-offset-3 enabled:hover:bg-[#075ebf] focus-visible:outline-4 focus-visible:outline-[#075ebf] focus-visible:shadow-[0_0_0_7px_#fff] disabled:cursor-wait disabled:opacity-[.65]" type="button" onClick={logout} disabled={submitting}>
        {submitting ? "Logging out…" : "Log out"}
      </button>
      {error ? <span className="max-w-[250px] text-right text-xs font-[800] text-[#9d1d28] max-[760px]:text-left" role="alert">{error}</span> : null}
    </div>
  );
}
