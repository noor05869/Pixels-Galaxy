import { describe, expect, it } from "vitest";

import { priceOrder } from "./pricing";

describe("priceOrder", () => {
  it("uses the server catalogue price for an exact bundle", () => {
    expect(priceOrder([{ productId: "ku-string", bundleId: "blue", quantity: 2 }])).toEqual({
      items: [
        {
          productId: "ku-string",
          productName: "Ku string",
          bundleId: "blue",
          bundleLabel: "BLUE",
          quantity: 2,
          unitPrice: 199900,
          lineTotal: 399800,
        },
      ],
      total: 399800,
    });
  });

  it("keeps trusted colour choices for a two-piece bundle", () => {
    expect(priceOrder([{ productId: "ku-string", bundleId: "pick-any-two", quantity: 2, colors: ["blue", "blue"] }])).toEqual({
      items: [expect.objectContaining({
        bundleId: "pick-any-two",
        colors: ["blue", "blue"],
        lineTotal: 350000,
      })],
      total: 350000,
    });
  });

  it("rejects a two-piece bundle without exactly two valid colour choices", () => {
    expect(() => priceOrder([{ productId: "ku-string", bundleId: "pick-any-two", quantity: 2 }]))
      .toThrow("Choose two colours");
  });

  it.each([
    { bundleId: "blue", quantity: 0 },
  ])("rejects quantity $quantity that is incompatible with bundle $bundleId", ({ bundleId, quantity }) => {
    expect(() => priceOrder([{ productId: "ku-string", bundleId, quantity }]))
      .toThrow("Cart item is unavailable");
  });

  it.each([
    { items: [{ productId: "unknown", bundleId: "one", quantity: 1 }] },
    { items: [{ productId: "ku-string", bundleId: "fake", quantity: 1 }] },
    { items: [{ productId: "ku-string", bundleId: "card", quantity: 1 }] },
  ])("rejects an unavailable cart item", ({ items }) => {
    expect(() => priceOrder(items)).toThrow("Cart item is unavailable");
  });

  it("rejects duplicate product and bundle lines", () => {
    const item = { productId: "ku-string", bundleId: "blue", quantity: 1 };

    expect(() => priceOrder([item, item])).toThrow("Duplicate cart item");
  });

  it("rejects totals outside the safe integer range", () => {
    expect(() =>
      priceOrder([{ productId: "ku-string", bundleId: "blue", quantity: Number.MAX_SAFE_INTEGER }]),
    ).toThrow("Order total is invalid");
  });
});
