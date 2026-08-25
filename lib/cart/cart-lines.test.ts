import { describe, expect, it } from "vitest";

import { changeCartLineQuantity, reconcileCartLines, removeCartLine } from "./cart-lines";

describe("cart line catalogue reconciliation", () => {
  it("replaces stale display fields and removes unavailable lines", () => {
    expect(reconcileCartLines([
      { productId: "zipstring-original", bundleId: "two", quantity: 3, name: "Old", image: "/old.jpg", unitPrice: 1 },
      { productId: "removed", bundleId: "card", quantity: 1, name: "Removed", image: "/old.jpg", unitPrice: 1 },
    ])).toEqual([expect.objectContaining({
      productId: "zipstring-original", bundleId: "two", quantity: 4,
      name: "ZipString Original", unitPrice: 849900,
    })]);
  });

  it("updates and removes only the selected product and bundle identity", () => {
    const lines = reconcileCartLines([
      { productId: "zipstring-original", bundleId: "one", quantity: 1 },
      { productId: "zipstring-original", bundleId: "two", quantity: 2 },
    ]);
    const changed = changeCartLineQuantity(lines, "zipstring-original", "two", 1);
    expect(changed.map(({ bundleId, quantity }) => ({ bundleId, quantity }))).toEqual([
      { bundleId: "one", quantity: 1 }, { bundleId: "two", quantity: 2 },
    ]);
    expect(removeCartLine(changed, "zipstring-original", "two")).toHaveLength(1);
    expect(removeCartLine(changed, "zipstring-original", "two")[0].bundleId).toBe("one");
  });

  it("keeps bundle quantities compatible at the upper cart limit", () => {
    const [line] = reconcileCartLines([{ productId: "zipstring-original", bundleId: "four", quantity: 99 }]);
    expect(line.quantity).toBe(96);
    expect(line.quantity % 4).toBe(0);
  });
});
