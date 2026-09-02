import type { NotificationState, OrderStatus } from "../../lib/orders/types";

const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Karachi",
});

const timestampFormatter = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Karachi",
});

const numberFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function formatOrderDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatOrderTimestamp(value: string): string {
  return timestampFormatter.format(new Date(value));
}

export function formatPkr(amountInPaisa: number): string {
  return `PKR ${numberFormatter.format(amountInPaisa / 100)}`;
}

export function orderStatusLabel(status: OrderStatus): string {
  return status[0].toUpperCase() + status.slice(1);
}

export function notificationLabel(state: NotificationState): string {
  return state === "sent" ? "Email sent" : "Email failed";
}
