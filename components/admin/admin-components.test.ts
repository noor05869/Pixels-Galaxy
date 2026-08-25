import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { StoredOrder } from "../../lib/orders/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
}));

const order: StoredOrder = {
  id: "9a6ac6b3-864c-4cd0-afdb-e1ee26f46d2f",
  orderNumber: "PG-ABC234",
  customerName: "Ayesha Khan",
  phone: "03324468116",
  email: "ayesha@example.com",
  city: "Karachi",
  address: "12 Example Street",
  notes: "Call before delivery",
  paymentMethod: "cod",
  currency: "PKR",
  total: 899900,
  status: "confirmed",
  items: [
    {
      productId: "zipstring-original",
      productName: "ZipString Original",
      bundleId: "one",
      bundleLabel: "1 ZIPSTRING",
      quantity: 2,
      unitPrice: 449950,
      lineTotal: 899900,
    },
  ],
  notificationState: "failed",
  notificationFailure: "Provider unavailable",
  createdAt: "2026-08-25T09:00:00.000Z",
  updatedAt: "2026-08-25T09:10:00.000Z",
};

describe("admin order components", () => {
  it("renders an explicit empty state when there are no orders", async () => {
    const { OrdersTable } = await import("./OrdersTable");

    const html = renderToStaticMarkup(createElement(OrdersTable, { orders: [] }));

    expect(html).toContain("No orders yet");
    expect(html).toContain("New Cash on Delivery orders will appear here.");
  });

  it("renders every dashboard field with Pakistani date and currency formatting", async () => {
    const { OrdersTable } = await import("./OrdersTable");

    const html = renderToStaticMarkup(createElement(OrdersTable, { orders: [order] }));

    expect(html).toContain("/admin/orders/PG-ABC234");
    expect(html).toContain("PG-ABC234");
    expect(html).toContain("25 Aug 2026");
    expect(html).toContain("Ayesha Khan");
    expect(html).toContain("Karachi");
    expect(html).toContain("03324468116");
    expect(html).toMatch(/PKR(?:&nbsp;|\s)8,999/);
    expect(html).toContain("Email failed");
    expect(html).toContain("Confirmed");
  });

  it("renders delivery details, immutable line items, COD, email state, and timestamps", async () => {
    const { OrderDetail } = await import("./OrderDetail");

    const html = renderToStaticMarkup(createElement(OrderDetail, { order }));

    expect(html).toContain("Ayesha Khan");
    expect(html).toContain("ayesha@example.com");
    expect(html).toContain("12 Example Street");
    expect(html).toContain("Call before delivery");
    expect(html).toContain("ZipString Original");
    expect(html).toContain("1 ZIPSTRING");
    expect(html).toContain("4,500");
    expect(html).toContain("8,999");
    expect(html).toContain("Cash on Delivery");
    expect(html).toContain("Email failed");
    expect(html).toContain("Created");
    expect(html).toContain("Last updated");
  });

  it("renders only allowed status choices and retains the current selection", async () => {
    const { OrderStatusForm } = await import("./OrderStatusForm");

    const html = renderToStaticMarkup(
      createElement(OrderStatusForm, {
        orderNumber: order.orderNumber,
        currentStatus: order.status,
      }),
    );

    expect(html).toContain('value="new"');
    expect(html).toContain('value="confirmed" selected=""');
    expect(html).toContain('value="shipped"');
    expect(html).toContain('value="completed"');
    expect(html).toContain('value="cancelled"');
    expect(html).not.toContain("refunded");
  });

  it("renders an accessible logout action", async () => {
    const { LogoutButton } = await import("./LogoutButton");

    const html = renderToStaticMarkup(createElement(LogoutButton));

    expect(html).toContain("Log out");
    expect(html).toContain('type="button"');
  });
});
