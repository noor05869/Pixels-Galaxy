import { describe, expect, it } from "vitest";

import { whatsappNumber } from "../config/public";

import { createWhatsAppOrderLink } from "./order-link";

describe("createWhatsAppOrderLink", () => {
  it("creates an encoded order link with the trusted product total", () => {
    expect(
      createWhatsAppOrderLink({
        productName: "ZipString Original",
        bundleLabel: "2 ZIPSTRING",
        quantity: 2,
        total: 1699800,
      }),
    ).toBe(
      "https://wa.me/923324468116?text=" +
        encodeURIComponent(
          "Hi Pixels Galaxy! I want to order ZipString Original. Bundle: 2 ZIPSTRING. Quantity: 2. Total: Rs 16,998.",
        ),
    );
  });

  it("formats PKR with no decimal places", () => {
    const link = createWhatsAppOrderLink({
      productName: "ZipString String Pack",
      bundleLabel: "Standard",
      quantity: 1,
      total: 149950,
    });

    expect(decodeURIComponent(new URL(link).searchParams.get("text") ?? "")).toContain(
      "Total: Rs 1,500.",
    );
  });

  it.each([
    { field: "quantity", quantity: 0, total: 100 },
    { field: "quantity", quantity: -1, total: 100 },
    { field: "quantity", quantity: 1.5, total: 100 },
    { field: "total", quantity: 1, total: 0 },
    { field: "total", quantity: 1, total: -1 },
    { field: "total", quantity: 1, total: Number.POSITIVE_INFINITY },
  ])("rejects an invalid $field", ({ quantity, total }) => {
    expect(() =>
      createWhatsAppOrderLink({
        productName: "ZipString Original",
        bundleLabel: "1 ZIPSTRING",
        quantity,
        total,
      }),
    ).toThrow("WhatsApp order details are invalid");
  });

  it("uses a digits-only configured destination", () => {
    expect(whatsappNumber).toBe("923324468116");
    expect(whatsappNumber).toMatch(/^\d+$/);
  });

  it("does not accept customer personal information", () => {
    createWhatsAppOrderLink({
      productName: "ZipString Original",
      bundleLabel: "1 ZIPSTRING",
      quantity: 1,
      total: 899900,
      // @ts-expect-error Customer PII is outside the WhatsApp link contract.
      customerName: "Customer",
    });
  });
});
