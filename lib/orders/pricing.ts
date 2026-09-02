import { products } from "../storefront/content";

import type { CheckoutCartItem, TrustedOrderItem } from "./types";

export const CATALOGUE_REVISION = "2026-08-28-ku-string-colours-v2";

const unavailable = () => {
  throw new Error("Cart item is unavailable");
};

export function priceOrder(items: CheckoutCartItem[]): { items: TrustedOrderItem[]; total: number } {
  const seenItems = new Set<string>();
  let total = 0;

  const trustedItems = items.map((item) => {
    const itemKey = `${item.productId}:${item.bundleId}:${item.colors?.join("+") ?? ""}`;
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
    if (bundle && (item.quantity < bundle.quantity || item.quantity % bundle.quantity !== 0)) return unavailable();
    if (bundle?.id === "pick-any-two" && item.colors?.length !== 2) throw new Error("Choose two colours");
    if (bundle?.id !== "pick-any-two" && item.colors) return unavailable();

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
      ...(item.colors ? { colors: item.colors } : {}),
    };
  });

  return { items: trustedItems, total };
}
