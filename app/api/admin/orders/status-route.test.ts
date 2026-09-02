import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const validOrder = {
  id: "9a6ac6b3-864c-4cd0-afdb-e1ee26f46d2f",
  orderNumber: "PG-ABC234",
  customerName: "Ayesha Khan",
  phone: "03324468116",
  email: "ayesha@example.com",
  city: "Karachi",
  address: "12 Example Street",
  notes: "Call before delivery",
  paymentMethod: "cod" as const,
  currency: "PKR" as const,
  total: 899900,
  status: "confirmed" as const,
  items: [
    {
      productId: "zipstring-original",
      productName: "ZipString Original",
      bundleId: "one",
      bundleLabel: "1 ZIPSTRING",
      quantity: 1,
      unitPrice: 899900,
      lineTotal: 899900,
    },
  ],
  notificationState: "sent" as const,
  createdAt: "2026-08-25T09:00:00.000Z",
  updatedAt: "2026-08-25T09:10:00.000Z",
};

function statusRequest(value: unknown): Request {
  return new Request("https://store.example.pk/api/admin/orders/PG-ABC234/status", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: typeof value === "string" ? value : JSON.stringify(value),
  });
}

function context(orderNumber: string) {
  return { params: Promise.resolve({ orderNumber }) };
}

describe("PATCH /api/admin/orders/:orderNumber/status", () => {
  it("authenticates before reading malformed inputs and returns 401 without a session", async () => {
    const { createStatusHandler } = await import("./[orderNumber]/status/handler");
    const updateOrderStatus = vi.fn();
    const handler = createStatusHandler({
      authenticate: async () => false,
      updateOrderStatus,
    });

    const response = await handler(statusRequest("not-json"), context("not-an-order"));

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(updateOrderStatus).not.toHaveBeenCalled();
  });

  it("rejects a malformed public order number", async () => {
    const { createStatusHandler } = await import("./[orderNumber]/status/handler");
    const updateOrderStatus = vi.fn();
    const handler = createStatusHandler({
      authenticate: async () => true,
      updateOrderStatus,
    });

    const response = await handler(statusRequest({ status: "confirmed" }), context("pg-abc234"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid order update" });
    expect(updateOrderStatus).not.toHaveBeenCalled();
  });

  it("rejects a status outside the allowed order states", async () => {
    const { createStatusHandler } = await import("./[orderNumber]/status/handler");
    const updateOrderStatus = vi.fn();
    const handler = createStatusHandler({
      authenticate: async () => true,
      updateOrderStatus,
    });

    const response = await handler(statusRequest({ status: "refunded" }), context("PG-ABC234"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid order update" });
    expect(updateOrderStatus).not.toHaveBeenCalled();
  });

  it("returns 404 when the valid order number is absent", async () => {
    const { createStatusHandler } = await import("./[orderNumber]/status/handler");
    const handler = createStatusHandler({
      authenticate: async () => true,
      updateOrderStatus: async () => {
        throw new Error("Order not found");
      },
    });

    const response = await handler(statusRequest({ status: "confirmed" }), context("PG-ABC234"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Order not found" });
  });

  it("returns a generic 503 when order storage is unavailable", async () => {
    const { createStatusHandler } = await import("./[orderNumber]/status/handler");
    const handler = createStatusHandler({
      authenticate: async () => true,
      updateOrderStatus: async () => {
        throw new Error("Supabase failed for Ayesha at 12 Example Street");
      },
    });

    const response = await handler(statusRequest({ status: "confirmed" }), context("PG-ABC234"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Order service unavailable" });
  });

  it("returns only the minimal public update fields after a valid status change", async () => {
    const { createStatusHandler } = await import("./[orderNumber]/status/handler");
    const updateOrderStatus = vi.fn(async () => validOrder);
    const handler = createStatusHandler({
      authenticate: async () => true,
      updateOrderStatus,
    });

    const response = await handler(statusRequest({ status: "confirmed" }), context("PG-ABC234"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      orderNumber: "PG-ABC234",
      status: "confirmed",
      updatedAt: "2026-08-25T09:10:00.000Z",
    });
    expect(updateOrderStatus).toHaveBeenCalledWith("PG-ABC234", "confirmed");
  });
});
