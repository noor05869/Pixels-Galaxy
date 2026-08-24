import { products } from "../storefront/content";

import type { CheckoutCartItem, TrustedOrderItem } from "./types";

const unavailable = () => {
  throw new Error("Cart item is unavailable");
};

export function priceOrder(items: CheckoutCartItem[]): { items: TrustedOrderItem[]; total: number } {
  const seenItems = new Set<string>();
  let total = 0;

  const trustedItems = items.map((item) => {
    const itemKey = `${item.productId}:${item.bundleId}`;
    if (seenItems.has(itemKey)) {
      throw new Error("Duplicate cart item");
    }
    seenItems.add(itemKey);

    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) {
      return unavailable();
    }

    const bundle = product.bundles.length > 0 ? product.bundles.find((candidate) => candidate.id === item.bundleId) : undefined;
    if (product.bundles.length > 0 && !bundle) {
      return unavailable();
    }
    if (product.bundles.length === 0 && item.bundleId !== "card") {
      return unavailable();
    }

    const unitPrice = bundle?.unitPrice ?? product.price;
    const lineTotal = unitPrice * item.quantity;
    if (!Number.isSafeInteger(lineTotal)) {
      throw new Error("Order total is invalid");
    }

    total += lineTotal;
    if (!Number.isSafeInteger(total)) {
      throw new Error("Order total is invalid");
    }

    return {
      productId: product.id,
      productName: product.name,
      bundleId: item.bundleId,
      bundleLabel: bundle?.label ?? "Standard",
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    };
  });

  return { items: trustedItems, total };
}
