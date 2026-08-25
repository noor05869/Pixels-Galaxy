import type { CartLine } from "@/lib/cart/types";
import type { CheckoutCartItem } from "./types";

export function toCheckoutPayload(lines: CartLine[]): CheckoutCartItem[] {
  return lines.map(({ productId, bundleId, quantity }) => ({
    productId,
    bundleId,
    quantity,
  }));
}
