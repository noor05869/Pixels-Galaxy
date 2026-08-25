import { describe, expect, it } from "vitest";

import type { CartLine } from "@/lib/cart/types";
import { createCheckoutPayload } from "./checkout-payload";
import { CATALOGUE_REVISION } from "./pricing";

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

    expect(createCheckoutPayload([line])).toEqual({
      items: [{
        productId: line.productId,
        bundleId: line.bundleId,
        quantity: line.quantity,
      }],
      expectedTotal: 2599800,
      catalogueRevision: CATALOGUE_REVISION,
    });
  });
});
