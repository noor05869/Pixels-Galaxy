import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  listOrders: vi.fn(),
  getOrderByNumber: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("server-only", () => ({}));
vi.mock("../../../lib/admin/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("../../../lib/orders/repository", () => ({
  listOrders: mocks.listOrders,
  getOrderByNumber: mocks.getOrderByNumber,
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
}));

const order = {
  id: "9a6ac6b3-864c-4cd0-afdb-e1ee26f46d2f",
  orderNumber: "PG-ABC234",
  customerName: "Ayesha Khan",
  phone: "03324468116",
  city: "Karachi",
  address: "12 Example Street",
  paymentMethod: "cod" as const,
  currency: "PKR" as const,
  total: 899900,
  status: "new" as const,
  items: [],
  notificationState: "sent" as const,
  createdAt: "2026-08-25T09:00:00.000Z",
  updatedAt: "2026-08-25T09:00:00.000Z",
};

describe("admin order pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.listOrders.mockResolvedValue([]);
    mocks.getOrderByNumber.mockResolvedValue(order);
  });

  it("protects the list before reading orders", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    const { default: OrdersPage } = await import("./page");

    await expect(OrdersPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.listOrders).not.toHaveBeenCalled();
  });

  it("renders an explicit provider-error state without provider diagnostics", async () => {
    mocks.listOrders.mockRejectedValue(new Error("Supabase secret provider diagnostic"));
    const { default: OrdersPage } = await import("./page");

    const html = renderToStaticMarkup(await OrdersPage());

    expect(html).toContain("Orders unavailable");
    expect(html).not.toContain("Supabase");
    expect(html).toContain("Log out");
  });

  it("renders an announced busy state while list or detail navigation loads", async () => {
    const { default: OrdersLoading } = await import("./loading");

    const html = renderToStaticMarkup(createElement(OrdersLoading));

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Loading orders");
    expect(html).toContain("Fetching the latest Cash on Delivery records.");
  });

  it("does not query storage for a malformed detail order number", async () => {
    const { default: OrderPage } = await import("./[orderNumber]/page");

    await expect(OrderPage({ params: Promise.resolve({ orderNumber: "pg-abc234" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.getOrderByNumber).not.toHaveBeenCalled();
  });

  it("returns notFound for an absent valid order", async () => {
    mocks.getOrderByNumber.mockResolvedValue(null);
    const { default: OrderPage } = await import("./[orderNumber]/page");

    await expect(OrderPage({ params: Promise.resolve({ orderNumber: "PG-ABC234" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(mocks.getOrderByNumber).toHaveBeenCalledWith("PG-ABC234");
  });

  it("renders a generic provider-error state for a valid detail request", async () => {
    mocks.getOrderByNumber.mockRejectedValue(new Error("Address leaked in provider failure"));
    const { default: OrderPage } = await import("./[orderNumber]/page");

    const html = renderToStaticMarkup(
      await OrderPage({ params: Promise.resolve({ orderNumber: "PG-ABC234" }) }),
    );

    expect(html).toContain("Order unavailable");
    expect(html).not.toContain("Address leaked");
    expect(html).toContain("Log out");
  });
});
