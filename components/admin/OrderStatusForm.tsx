"use client";

import { FormEvent, useId, useState } from "react";
import { useRouter } from "next/navigation";

import { orderStatuses } from "../../lib/orders/types";
import type { OrderStatus } from "../../lib/orders/types";
import { orderStatusLabel } from "./orderPresentation";

type OrderStatusFormProps = {
  orderNumber: string;
  currentStatus: OrderStatus;
};

export function OrderStatusForm({ orderNumber, currentStatus }: OrderStatusFormProps) {
  const router = useRouter();
  const selectId = useId();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!orderStatuses.includes(status)) {
      setError("Choose a valid order status.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderNumber}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Status update rejected");
      setSuccess("Order status updated.");
      router.refresh();
    } catch {
      setError("The status could not be updated. Your selection has been kept; try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-[22px] grid gap-3" onSubmit={handleSubmit}>
      <label className="text-xs font-[900]" htmlFor={selectId}>Status</label>
      <select
        className="w-full rounded-[10px] border-2 border-[#bfcede] bg-white px-[13px] py-3 pr-[38px] font-[800] text-ink outline-offset-3 focus-visible:outline-4 focus-visible:outline-[#075ebf] focus-visible:shadow-[0_0_0_7px_#fff] disabled:cursor-wait disabled:opacity-[.65]"
        id={selectId}
        name="status"
        value={status}
        onChange={(event) => setStatus(event.target.value as OrderStatus)}
        disabled={submitting}
      >
        {orderStatuses.map((option) => (
          <option key={option} value={option}>{orderStatusLabel(option)}</option>
        ))}
      </select>
      <button className="min-h-12 w-full cursor-pointer rounded-full border-0 bg-navy px-5 py-[13px] font-[900] text-white outline-offset-3 enabled:hover:bg-[#075ebf] focus-visible:outline-4 focus-visible:outline-[#075ebf] focus-visible:shadow-[0_0_0_7px_#fff] disabled:cursor-wait disabled:opacity-[.65]" type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Update status"}
      </button>
      {error ? <p className="m-0 rounded-[9px] bg-[#fff0f1] px-3 py-[11px] text-xs font-[800] leading-[1.45] text-[#8d2029]" role="alert">{error}</p> : null}
      {success ? <p className="m-0 rounded-[9px] bg-[#e7faef] px-3 py-[11px] text-xs font-[800] leading-[1.45] text-[#22684b]" role="status">{success}</p> : null}
    </form>
  );
}
