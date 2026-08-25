import "server-only";

import { Resend } from "resend";

import { getNotificationConfig } from "../config/server";

import type { StoredOrder } from "./types";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "'":
        return "&#39;";
      default:
        return "&quot;";
    }
  });
}

function formatPkr(amount: number): string {
  return `PKR ${(amount / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildText(order: StoredOrder, dashboardUrl: string): string {
  const itemLines = order.items.map(
    (item) =>
      `${item.productName} — ${item.bundleLabel} — ${item.quantity} × ${formatPkr(item.unitPrice)} = ${formatPkr(item.lineTotal)}`,
  );

  return [
    `New COD Order — ${order.orderNumber}`,
    `Placed: ${order.createdAt}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email ?? "Not provided"}`,
    `City: ${order.city}`,
    `Address: ${order.address}`,
    `Notes: ${order.notes ?? "None"}`,
    "",
    "Items:",
    ...itemLines,
    "",
    `Total: ${formatPkr(order.total)}`,
    "Payment: Cash on Delivery",
    `Dashboard: ${dashboardUrl}`,
  ].join("\n");
}

function buildHtml(order: StoredOrder, dashboardUrl: string): string {
  const itemRows = order.items
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.productName)}</td>
        <td>${escapeHtml(item.bundleLabel)}</td>
        <td>${item.quantity}</td>
        <td>${escapeHtml(formatPkr(item.unitPrice))}</td>
        <td>${escapeHtml(formatPkr(item.lineTotal))}</td>
      </tr>`,
    )
    .join("");

  return `<h1>New COD Order — ${escapeHtml(order.orderNumber)}</h1>
    <p>Placed: ${escapeHtml(order.createdAt)}</p>
    <dl>
      <dt>Customer</dt><dd>${escapeHtml(order.customerName)}</dd>
      <dt>Phone</dt><dd>${escapeHtml(order.phone)}</dd>
      <dt>Email</dt><dd>${escapeHtml(order.email ?? "Not provided")}</dd>
      <dt>City</dt><dd>${escapeHtml(order.city)}</dd>
      <dt>Address</dt><dd>${escapeHtml(order.address)}</dd>
      <dt>Notes</dt><dd>${escapeHtml(order.notes ?? "None")}</dd>
    </dl>
    <table>
      <thead><tr><th>Product</th><th>Bundle</th><th>Quantity</th><th>Unit price</th><th>Line total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <p><strong>Total: ${escapeHtml(formatPkr(order.total))}</strong></p>
    <p>Payment: Cash on Delivery</p>
    <p><a href="${escapeHtml(dashboardUrl)}">View order in dashboard</a></p>`;
}

let resend: Resend | undefined;
let resendApiKey: string | undefined;

function getResend(apiKey: string): Resend {
  if (!resend || resendApiKey !== apiKey) {
    resend = new Resend(apiKey);
    resendApiKey = apiKey;
  }

  return resend;
}

export async function sendOrderNotification(order: StoredOrder): Promise<void> {
  try {
    const config = getNotificationConfig();
    const dashboardUrl = `${config.siteUrl.replace(/\/$/, "")}/admin/orders/${encodeURIComponent(order.orderNumber)}`;
    const result = await getResend(config.resendApiKey).emails.send({
      from: config.fromEmail,
      to: config.notificationEmail,
      subject: `New COD Order — ${order.orderNumber}`,
      text: buildText(order, dashboardUrl),
      html: buildHtml(order, dashboardUrl),
    });

    if (result.error) throw result.error;
  } catch {
    throw new Error("Order notification failed");
  }
}
