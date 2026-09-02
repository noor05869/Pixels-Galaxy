import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type DatabaseOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string;
  notes: string | null;
  payment_method: "cod";
  currency: "PKR";
  total: number;
  status: "new" | "confirmed" | "shipped" | "completed" | "cancelled";
  items: Array<{
    productId: string;
    productName: string;
    bundleId: string;
    bundleLabel: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  notification_state: "sent" | "failed";
  notification_failure: string | null;
  created_at: string;
  updated_at: string;
};

const newOrder = {
  orderNumber: "PG-ABC234",
  customerName: "Ayesha Khan",
  phone: "03324468116",
  city: "Karachi",
  address: "12 Example Street",
  paymentMethod: "cod" as const,
  currency: "PKR" as const,
  total: 899900,
  status: "new" as const,
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
  notificationState: "failed" as const,
};

const databaseOrder: DatabaseOrder = {
  id: "9a6ac6b3-864c-4cd0-afdb-e1ee26f46d2f",
  order_number: newOrder.orderNumber,
  customer_name: newOrder.customerName,
  phone: newOrder.phone,
  email: null,
  city: newOrder.city,
  address: newOrder.address,
  notes: null,
  payment_method: newOrder.paymentMethod,
  currency: newOrder.currency,
  total: newOrder.total,
  status: newOrder.status,
  items: newOrder.items,
  notification_state: newOrder.notificationState,
  notification_failure: null,
  created_at: "2026-08-25T09:00:00.000Z",
  updated_at: "2026-08-25T09:00:00.000Z",
};

async function loadRepository() {
  return import("./repository");
}

describe("orders repository", () => {
  it("identifies only order-number unique violations as retryable collisions", async () => {
    const { OrderNumberCollisionError, toOrderStorageError } = await loadRepository();

    expect(
      toOrderStorageError({
        code: "23505",
        details: "Key (order_number)=(PG-ABC234) already exists.",
      }),
    ).toBeInstanceOf(OrderNumberCollisionError);
    expect(
      toOrderStorageError({ code: "23505", details: "Key (another_column)=(value) already exists." }),
    ).toEqual(new Error("Order storage failed"));
  });

  it("maps a created database row back to application order fields", async () => {
    const repositoryModule = await loadRepository();
    expect(repositoryModule).not.toBeNull();
    if (!repositoryModule) return;

    let insertedRow: unknown;
    const repository = repositoryModule.createOrdersRepository({
      insert: async (row: unknown) => {
        insertedRow = row;
        return databaseOrder;
      },
      selectMany: async () => [],
      selectByOrderNumber: async () => null,
      updateStatus: async () => null,
      updateNotificationState: async () => undefined,
    });

    await expect(repository.createOrder(newOrder)).resolves.toEqual({
      ...newOrder,
      id: databaseOrder.id,
      createdAt: databaseOrder.created_at,
      updatedAt: databaseOrder.updated_at,
    });
    expect(insertedRow).toEqual({
      order_number: newOrder.orderNumber,
      customer_name: newOrder.customerName,
      phone: newOrder.phone,
      email: null,
      city: newOrder.city,
      address: newOrder.address,
      notes: null,
      payment_method: "cod",
      currency: "PKR",
      total: 899900,
      status: "new",
      items: newOrder.items,
      notification_state: "failed",
      notification_failure: null,
    });
  });

  it("requests orders newest first and maps each returned row", async () => {
    const repositoryModule = await loadRepository();
    expect(repositoryModule).not.toBeNull();
    if (!repositoryModule) return;

    let ordering: unknown;
    const repository = repositoryModule.createOrdersRepository({
      insert: async () => databaseOrder,
      selectMany: async (requestedOrdering: unknown) => {
        ordering = requestedOrdering;
        return [databaseOrder];
      },
      selectByOrderNumber: async () => null,
      updateStatus: async () => null,
      updateNotificationState: async () => undefined,
    });

    await expect(repository.listOrders()).resolves.toEqual([
      expect.objectContaining({ orderNumber: "PG-ABC234", createdAt: databaseOrder.created_at }),
    ]);
    expect(ordering).toEqual({ column: "created_at", ascending: false });
  });

  it("returns null when the requested public order number is absent", async () => {
    const repositoryModule = await loadRepository();
    expect(repositoryModule).not.toBeNull();
    if (!repositoryModule) return;

    const repository = repositoryModule.createOrdersRepository({
      insert: async () => databaseOrder,
      selectMany: async () => [],
      selectByOrderNumber: async () => null,
      updateStatus: async () => null,
      updateNotificationState: async () => undefined,
    });

    await expect(repository.getOrderByNumber("PG-MISSING")).resolves.toBeNull();
  });

  it("updates an order with an allowed status and maps the returned row", async () => {
    const repositoryModule = await loadRepository();
    expect(repositoryModule).not.toBeNull();
    if (!repositoryModule) return;

    let update: unknown;
    const repository = repositoryModule.createOrdersRepository({
      insert: async () => databaseOrder,
      selectMany: async () => [],
      selectByOrderNumber: async () => null,
      updateStatus: async (orderNumber: string, status: string) => {
        update = { orderNumber, status };
        return { ...databaseOrder, status: "confirmed" };
      },
      updateNotificationState: async () => undefined,
    });

    await expect(repository.updateOrderStatus("PG-ABC234", "confirmed")).resolves.toEqual(
      expect.objectContaining({ orderNumber: "PG-ABC234", status: "confirmed" }),
    );
    expect(update).toEqual({ orderNumber: "PG-ABC234", status: "confirmed" });
  });

  it("sanitizes and limits notification failure notes before storing them", async () => {
    const repositoryModule = await loadRepository();
    expect(repositoryModule).not.toBeNull();
    if (!repositoryModule) return;

    let notificationUpdate: unknown;
    const repository = repositoryModule.createOrdersRepository({
      insert: async () => databaseOrder,
      selectMany: async () => [],
      selectByOrderNumber: async () => null,
      updateStatus: async () => null,
      updateNotificationState: async (id: string, state: string, failureNote: string | null) => {
        notificationUpdate = { id, state, failureNote };
      },
    });

    await repository.setNotificationState(
      databaseOrder.id,
      "failed",
      `  Delivery\nfailed\t${"x".repeat(400)}`,
    );

    expect(notificationUpdate).toEqual({
      id: databaseOrder.id,
      state: "failed",
      failureNote: `Delivery failed ${"x".repeat(284)}`,
    });
  });
});
