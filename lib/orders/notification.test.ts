import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StoredOrder } from "./types";

vi.mock("server-only", () => ({}));

const resendMock = vi.hoisted(() => ({
  apiKeys: [] as string[],
  send: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: resendMock.send };

    constructor(apiKey: string) {
      resendMock.apiKeys.push(apiKey);
    }
  },
}));

const order: StoredOrder = {
  id: "9a6ac6b3-864c-4cd0-afdb-e1ee26f46d2f",
  orderNumber: "PG-ABC234",
  customerName: "Ayesha Khan",
  phone: "03324468116",
  email: "ayesha@example.pk",
  city: "Karachi",
  address: "12 Example Street",
  notes: "Please call first",
  paymentMethod: "cod",
  currency: "PKR",
  total: 1_049_800,
  status: "new",
  items: [
    {
      productId: "zipstring-original",
      productName: "ZipString Original",
      bundleId: "one",
      bundleLabel: "1 ZIPSTRING",
      quantity: 1,
      unitPrice: 899_900,
      lineTotal: 899_900,
    },
    {
      productId: "zipstring-pack",
      productName: "ZipString String Pack",
      bundleId: "card",
      bundleLabel: "Standard",
      quantity: 1,
      unitPrice: 149_900,
      lineTotal: 149_900,
    },
  ],
  notificationState: "pending",
  createdAt: "2026-08-25T09:00:00.000Z",
  updatedAt: "2026-08-25T09:00:00.000Z",
};

const serverEnvironment = {
  NEXT_PUBLIC_SITE_URL: "https://store.example.pk/",
  SUPABASE_URL: "https://project-ref.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_test",
  RESEND_API_KEY: "re_test",
  ORDER_NOTIFICATION_EMAIL: "orders@example.pk",
  ORDER_FROM_EMAIL: "Pixels Galaxy Orders <orders@example.pk>",
  ADMIN_PASSWORD_HASH: "scrypt$salt$hash",
  ADMIN_SESSION_SECRET: "a-secure-session-secret-with-32-bytes",
};

beforeEach(() => {
  for (const [key, value] of Object.entries(serverEnvironment)) {
    vi.stubEnv(key, value);
  }
  resendMock.apiKeys.length = 0;
  resendMock.send.mockReset().mockResolvedValue({ data: { id: "email-1" }, error: null });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("sendOrderNotification", () => {
  it("sends the configured recipient a complete itemized order and dashboard URL", async () => {
    const { sendOrderNotification } = await import("./notification");

    await sendOrderNotification(order);

    expect(resendMock.apiKeys).toEqual(["re_test"]);
    expect(resendMock.send).toHaveBeenCalledOnce();
    const message = resendMock.send.mock.calls[0][0];
    expect(message).toMatchObject({
      from: "Pixels Galaxy Orders <orders@example.pk>",
      to: "orders@example.pk",
      subject: "New COD Order — PG-ABC234",
    });
    expect(message.text).toContain("ZipString Original — 1 ZIPSTRING — 1 × PKR 8,999.00 = PKR 8,999.00");
    expect(message.text).toContain("ZipString String Pack — Standard — 1 × PKR 1,499.00 = PKR 1,499.00");
    expect(message.text).toContain("Total: PKR 10,498.00");
    expect(message.text).toContain("https://store.example.pk/admin/orders/PG-ABC234");
  });

  it("escapes customer-controlled names and notes in HTML", async () => {
    const { sendOrderNotification } = await import("./notification");

    await sendOrderNotification({
      ...order,
      customerName: '<script>alert("name")</script>',
      notes: "Leave at <script>alert('notes')</script>",
    });

    const html = resendMock.send.mock.calls[0][0].html as string;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(&quot;name&quot;)&lt;/script&gt;");
    expect(html).toContain("Leave at &lt;script&gt;alert(&#39;notes&#39;)&lt;/script&gt;");
  });

  it("replaces provider errors with a sanitized notification error", async () => {
    resendMock.send.mockResolvedValue({
      data: null,
      error: { message: "secret provider response", name: "provider_error" },
    });
    const { sendOrderNotification } = await import("./notification");

    await expect(sendOrderNotification(order)).rejects.toThrow("Order notification failed");
  });
});
