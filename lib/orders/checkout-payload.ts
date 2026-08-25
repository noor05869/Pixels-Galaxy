import type { CartLine } from "@/lib/cart/types";
import type { CheckoutCartItem } from "./types";
import { CATALOGUE_REVISION } from "./pricing";

export function createCheckoutPayload(lines: CartLine[]): { items: CheckoutCartItem[]; expectedTotal: number; catalogueRevision: string } {
  return {
    items: lines.map(({ productId, bundleId, quantity }) => ({ productId, bundleId, quantity })),
    expectedTotal: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    catalogueRevision: CATALOGUE_REVISION,
  };
}
