import { describe, expect, it, vi } from "vitest";

import type { NewOrder, StoredOrder } from "./types";

vi.mock("server-only", () => ({}));

const checkout = {
  customerName: "Ayesha Khan",
  phone: "03324468116",
  email: "ayesha@example.pk",
  city: "Karachi",
  address: "12 Example Street",
  notes: "Please call first",
  consent: true,
  items: [{ productId: "zipstring-original", bundleId: "one", quantity: 1 }],
};

function storedOrder(order: NewOrder): StoredOrder {
  return {
    ...order,
    id: "9a6ac6b3-864c-4cd0-afdb-e1ee26f46d2f",
    createdAt: "2026-08-25T09:00:00.000Z",
    updatedAt: "2026-08-25T09:00:00.000Z",
  };
}

describe("createOrderService", () => {
  it("classifies unavailable catalogue items as invalid orders", async () => {
    const { createOrderService, InvalidOrderError } = await import("./service");
    const service = createOrderService({
      repository: { createOrder: vi.fn(), setNotificationState: vi.fn() },
      notify: vi.fn(),
      createOrderNumber: () => "PG-ABC234",
    });

    await expect(
      service({
        ...checkout,
        items: [{ productId: "removed-product", bundleId: "card", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(InvalidOrderError);
  });

  it("persists trusted order data before notifying and marks notification sent", async () => {
    const events: string[] = [];
    let savedOrder: NewOrder | undefined;
    const { createOrderService } = await import("./service");
    const service = createOrderService({
      repository: {
        createOrder: async (order) => {
          events.push("persist");
          savedOrder = order;
          return storedOrder(order);
        },
        setNotificationState: async (_id, state) => {
          events.push(`state:${state}`);
        },
      },
      notify: async () => {
        events.push("notify");
      },
      createOrderNumber: () => "PG-ABC234",
    });

    await expect(service(checkout)).resolves.toEqual({ orderNumber: "PG-ABC234" });
    expect(events).toEqual(["persist", "notify", "state:sent"]);
    expect(savedOrder).toMatchObject({
      orderNumber: "PG-ABC234",
      customerName: "Ayesha Khan",
      total: 899_900,
      paymentMethod: "cod",
      currency: "PKR",
      status: "new",
      notificationState: "failed",
      items: [
        expect.objectContaining({
          productId: "zipstring-original",
          productName: "ZipString Original",
          unitPrice: 899_900,
          lineTotal: 899_900,
        }),
      ],
    });
  });

  it("does not notify or return an order number when persistence fails", async () => {
    const notify = vi.fn();
    const { createOrderService } = await import("./service");
    const service = createOrderService({
      repository: {
        createOrder: async () => {
          throw new Error("Order storage failed");
        },
        setNotificationState: vi.fn(),
      },
      notify,
      createOrderNumber: () => "PG-ABC234",
    });

    await expect(service(checkout)).rejects.toThrow("Order storage failed");
    expect(notify).not.toHaveBeenCalled();
  });

  it("keeps the pessimistic failed state when notification fails", async () => {
    const stateUpdates: Array<{ state: string; failure?: string }> = [];
    let persistedOrder: NewOrder | undefined;
    const { createOrderService } = await import("./service");
    const service = createOrderService({
      repository: {
        createOrder: async (order) => {
          persistedOrder = order;
          return storedOrder(order);
        },
        setNotificationState: async (_id, state, failure) => {
          stateUpdates.push({ state, failure });
        },
      },
      notify: async () => {
        throw new Error("provider request id secret-123 failed");
      },
      createOrderNumber: () => "PG-ABC234",
    });

    await expect(service(checkout)).resolves.toEqual({ orderNumber: "PG-ABC234" });
    expect(persistedOrder?.notificationState).toBe("failed");
    expect(stateUpdates).toEqual([]);
  });

  it("remains durably failed when promotion after a successful email cannot be stored", async () => {
    let durableState: "sent" | "failed" = "sent";
    const setNotificationState = vi.fn(async (_id: string, state: "sent" | "failed") => {
      if (state === "sent") throw new Error("Order storage failed");
      durableState = state;
    });
    const { createOrderService } = await import("./service");
    const service = createOrderService({
      repository: {
        createOrder: async (order) => {
          durableState = order.notificationState;
          return storedOrder(order);
        },
        setNotificationState,
      },
      notify: async () => undefined,
      createOrderNumber: () => "PG-ABC234",
    });

    await expect(service(checkout)).resolves.toEqual({ orderNumber: "PG-ABC234" });
    expect(setNotificationState).toHaveBeenCalledWith(
      "9a6ac6b3-864c-4cd0-afdb-e1ee26f46d2f",
      "sent",
    );
    expect(durableState).toBe("failed");
  });

  it("retries a unique order-number collision with a fresh bounded identifier", async () => {
    const { OrderNumberCollisionError } = await import("./repository");
    const { createOrderService } = await import("./service");
    const attemptedNumbers: string[] = [];
    const numbers = ["PG-ABC234", "PG-DEF567"];
    const service = createOrderService({
      repository: {
        createOrder: async (order) => {
          attemptedNumbers.push(order.orderNumber);
          if (attemptedNumbers.length === 1) throw new OrderNumberCollisionError();
          return storedOrder(order);
        },
        setNotificationState: async () => undefined,
      },
      notify: async () => undefined,
      createOrderNumber: () => numbers.shift() ?? "PG-EXTRA9",
    });

    await expect(service(checkout)).resolves.toEqual({ orderNumber: "PG-DEF567" });
    expect(attemptedNumbers).toEqual(["PG-ABC234", "PG-DEF567"]);
  });

  it("stops after three unique order-number collisions", async () => {
    const { OrderNumberCollisionError } = await import("./repository");
    const { createOrderService } = await import("./service");
    const createOrder = vi.fn(async () => {
      throw new OrderNumberCollisionError();
    });
    const service = createOrderService({
      repository: { createOrder, setNotificationState: vi.fn() },
      notify: vi.fn(),
      createOrderNumber: () => "PG-ABC234",
    });

    await expect(service(checkout)).rejects.toThrow("Order storage failed");
    expect(createOrder).toHaveBeenCalledTimes(3);
  });
});
