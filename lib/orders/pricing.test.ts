import { describe, expect, it } from "vitest";

import { priceOrder } from "./pricing";

describe("priceOrder", () => {
  it("uses the server catalogue price for an exact bundle", () => {
    expect(priceOrder([{ productId: "zipstring-original", bundleId: "one", quantity: 2 }])).toEqual({
      items: [
        {
          productId: "zipstring-original",
          productName: "ZipString Original",
          bundleId: "one",
          bundleLabel: "1 ZIPSTRING",
          quantity: 2,
          unitPrice: 899900,
          lineTotal: 1799800,
        },
      ],
      total: 1799800,
    });
  });

  it("uses the base price only with the card bundle for products without bundles", () => {
    expect(priceOrder([{ productId: "zipstring-glow", bundleId: "card", quantity: 2 }]).total).toBe(1399800);
  });

  it.each([
    { items: [{ productId: "unknown", bundleId: "one", quantity: 1 }] },
    { items: [{ productId: "zipstring-original", bundleId: "fake", quantity: 1 }] },
    { items: [{ productId: "zipstring-glow", bundleId: "one", quantity: 1 }] },
  ])("rejects an unavailable cart item", ({ items }) => {
    expect(() => priceOrder(items)).toThrow("Cart item is unavailable");
  });

  it("rejects duplicate product and bundle lines", () => {
    const item = { productId: "zipstring-original", bundleId: "one", quantity: 1 };

    expect(() => priceOrder([item, item])).toThrow("Duplicate cart item");
  });

  it("rejects totals outside the safe integer range", () => {
    expect(() =>
      priceOrder([{ productId: "zipstring-original", bundleId: "one", quantity: Number.MAX_SAFE_INTEGER }]),
    ).toThrow("Order total is invalid");
  });
});
