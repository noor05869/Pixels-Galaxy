import "server-only";

import { Resend } from "resend";

import { getNotificationConfig } from "../config/server";
import { provinceNameForCode } from "../locations/pakistan";

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
      `${item.productName} — ${item.bundleLabel}${item.colors ? ` (${item.colors.join(" + ")})` : ""} — ${item.quantity} × ${formatPkr(item.unitPrice)} = ${formatPkr(item.lineTotal)}`,
  );

  return [
    `New COD Order — ${order.orderNumber}`,
    `Placed: ${order.createdAt}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email ?? "Not provided"}`,
    `City: ${order.city}`,
    ...(order.province ? [`Province / territory: ${provinceNameForCode(order.province)}`] : []),
    ...(order.postalCode ? [`Postal code: ${order.postalCode}`] : []),
    `Address: ${order.address}`,
    ...(order.landmark ? [`Landmark: ${order.landmark}`] : []),
    ...(order.addressType ? [`Address type: ${order.addressType === "home" ? "Home" : "Office"}`] : []),
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

// ---- Receipt-style HTML email -------------------------------------------
//
// Built with table-based layout and inline styles throughout, since most
// email clients (Outlook, Gmail) strip <style> blocks and don't support
// modern CSS (flex/grid). This renders like a printable receipt: a bordered
// "card", dashed item separators, a monospace-ish total line.

const COLORS = {
  ink: "#1a1a1a",
  muted: "#6b6b6b",
  border: "#dcdcdc",
  dashed: "#c9c9c9",
  paper: "#ffffff",
  bg: "#f4f4f5",
  accent: "#111111",
};

function buildHtml(order: StoredOrder, dashboardUrl: string): string {
  const itemRows = order.items
    .map((item, index) => {
      const variant = item.colors ? `${item.bundleLabel} (${item.colors.join(" + ")})` : item.bundleLabel;
      const borderTop = index === 0 ? "none" : `1px dashed ${COLORS.dashed}`;
      return `<tr>
        <td style="padding:10px 0 4px; border-top:${borderTop}; font-family:Helvetica,Arial,sans-serif; font-size:14px; color:${COLORS.ink}; vertical-align:top;">
          <div style="font-weight:600;">${escapeHtml(item.productName)}</div>
          <div style="color:${COLORS.muted}; font-size:12px; margin-top:2px;">${escapeHtml(variant)} &middot; Qty ${item.quantity} &middot; ${escapeHtml(formatPkr(item.unitPrice))} each</div>
        </td>
        <td style="padding:10px 0 4px; border-top:${borderTop}; font-family:Helvetica,Arial,sans-serif; font-size:14px; color:${COLORS.ink}; text-align:right; vertical-align:top; white-space:nowrap;">
          ${escapeHtml(formatPkr(item.lineTotal))}
        </td>
      </tr>`;
    })
    .join("");

  const detailRow = (label: string, value: string | null | undefined) =>
    value
      ? `<tr>
          <td style="padding:3px 0; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:${COLORS.muted}; width:120px; vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:3px 0; font-family:Helvetica,Arial,sans-serif; font-size:13px; color:${COLORS.ink}; vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`
      : "";

  return `<!doctype html>
<html>
  <body style="margin:0; padding:24px 12px; background:${COLORS.bg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; margin:0 auto;">
      <tr>
        <td style="background:${COLORS.paper}; border:1px solid ${COLORS.border}; border-radius:10px; padding:28px 28px 24px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">

          <!-- Header -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="font-family:Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:${COLORS.muted};">New Order &middot; Cash on Delivery</div>
                <div style="font-family:Helvetica,Arial,sans-serif; font-size:20px; font-weight:700; color:${COLORS.accent}; margin-top:4px;">Order ${escapeHtml(order.orderNumber)}</div>
              </td>
              <td style="text-align:right; vertical-align:top;">
                <div style="font-family:Helvetica,Arial,sans-serif; font-size:12px; color:${COLORS.muted};">${escapeHtml(order.createdAt)}</div>
              </td>
            </tr>
          </table>

          <div style="border-top:1px dashed ${COLORS.dashed}; margin:18px 0;"></div>

          <!-- Customer / shipping details -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${detailRow("Customer", order.customerName)}
            ${detailRow("Phone", order.phone)}
            ${detailRow("Email", order.email ?? "Not provided")}
            ${detailRow("Address", order.address)}
            ${detailRow("Landmark", order.landmark)}
            ${detailRow(
    "City",
    order.province ? `${order.city}, ${provinceNameForCode(order.province)}` : order.city,
  )}
            ${detailRow("Postal code", order.postalCode)}
            ${detailRow("Address type", order.addressType ? (order.addressType === "home" ? "Home" : "Office") : undefined)}
            ${detailRow("Notes", order.notes)}
          </table>

          <div style="border-top:1px dashed ${COLORS.dashed}; margin:18px 0;"></div>

          <!-- Items -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${itemRows}
          </table>

          <div style="border-top:1px solid ${COLORS.border}; margin:16px 0 12px;"></div>

          <!-- Total -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-family:Helvetica,Arial,sans-serif; font-size:13px; color:${COLORS.muted};">Payment method</td>
              <td style="font-family:Helvetica,Arial,sans-serif; font-size:13px; color:${COLORS.ink}; text-align:right;">Cash on Delivery</td>
            </tr>
            <tr>
              <td style="font-family:Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; color:${COLORS.accent}; padding-top:8px;">Total</td>
              <td style="font-family:Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; color:${COLORS.accent}; text-align:right; padding-top:8px;">${escapeHtml(formatPkr(order.total))}</td>
            </tr>
          </table>

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr>
              <td align="center">
                <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block; background:${COLORS.accent}; color:#ffffff; font-family:Helvetica,Arial,sans-serif; font-size:13px; font-weight:600; text-decoration:none; padding:11px 22px; border-radius:6px;">View order in dashboard</a>
              </td>
            </tr>
          </table>

          <div style="font-family:Helvetica,Arial,sans-serif; font-size:11px; color:${COLORS.muted}; text-align:center; margin-top:20px;">
            This is an automated order notification. Order ${escapeHtml(order.orderNumber)} was placed ${escapeHtml(order.createdAt)}.
          </div>

        </td>
      </tr>
    </table>
  </body>
</html>`;
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