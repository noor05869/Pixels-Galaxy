import { describe, expect, it } from "vitest";

import type { CartLine } from "@/lib/cart/types";
import { toCheckoutPayload } from "./checkout-payload";

describe("toCheckoutPayload", () => {
  it("keeps only identifiers and quantity from each cart line", () => {
    const line: CartLine = {
      productId: "zipstring-pro",
      bundleId: "double-pack",
      quantity: 2,
      name: "ZipString Pro Double Pack",
      image: "/products/zipstring-pro.jpg",
      unitPrice: 1299900,
    };

    expect(toCheckoutPayload([line])).toEqual([
      {
        productId: line.productId,
        bundleId: line.bundleId,
        quantity: line.quantity,
      },
    ]);
  });
});
