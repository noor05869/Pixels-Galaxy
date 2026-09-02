import { describe, expect, it } from "vitest";

import { cartLineKey, changeCartLineQuantity, reconcileCartLines, removeCartLine } from "./cart-lines";

describe("cart line catalogue reconciliation", () => {
  it("replaces stale display fields and removes unavailable lines", () => {
    expect(reconcileCartLines([
      { productId: "ku-string", bundleId: "green", quantity: 3, name: "Old", image: "/old.jpg", unitPrice: 1 },
      { productId: "removed", bundleId: "card", quantity: 1, name: "Removed", image: "/old.jpg", unitPrice: 1 },
    ])).toEqual([expect.objectContaining({
      productId: "ku-string", bundleId: "green", quantity: 3,
      name: "Ku string", unitPrice: 199900,
    })]);
  });

  it("updates and removes only the selected product and bundle identity", () => {
    const lines = reconcileCartLines([
      { productId: "ku-string", bundleId: "blue", quantity: 1 },
      { productId: "ku-string", bundleId: "green", quantity: 2 },
    ]);
    const greenKey = cartLineKey(lines[1]);
    const changed = changeCartLineQuantity(lines, greenKey, 1);
    expect(changed.map(({ bundleId, quantity }) => ({ bundleId, quantity }))).toEqual([
      { bundleId: "blue", quantity: 1 }, { bundleId: "green", quantity: 1 },
    ]);
    expect(removeCartLine(changed, greenKey)).toHaveLength(1);
    expect(removeCartLine(changed, greenKey)[0].bundleId).toBe("blue");
  });

  it("keeps bundle quantities compatible at the upper cart limit", () => {
    const [line] = reconcileCartLines([{ productId: "ku-string", bundleId: "pink", quantity: 999 }]);
    expect(line.quantity).toBe(99);
  });

  it("preserves two-piece colour choices as separate cart lines and uses a real product image", () => {
    const lines = reconcileCartLines([
      { productId: "ku-string", bundleId: "pick-any-two", quantity: 2, colors: ["blue", "pink"] },
      { productId: "ku-string", bundleId: "pick-any-two", quantity: 2, colors: ["blue", "blue"] },
    ]);

    expect(lines).toHaveLength(2);
    expect(lines.map((line) => line.colors)).toEqual([["blue", "pink"], ["blue", "blue"]]);
    expect(lines.every((line) => line.image === "/photos/p-1.webp")).toBe(true);
  });
});
