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
    <form className="admin-status-form" onSubmit={handleSubmit}>
      <label htmlFor={selectId}>Status</label>
      <select
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
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Update status"}
      </button>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      {success ? <p className="admin-form-success" role="status">{success}</p> : null}
    </form>
  );
}
