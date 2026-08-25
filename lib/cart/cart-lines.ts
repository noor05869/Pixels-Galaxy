import { products } from "../storefront/content";
import type { CartLine } from "./types";

type StoredCartLine = Partial<CartLine> & Pick<CartLine, "productId" | "bundleId" | "quantity">;

function catalogueLine(line: StoredCartLine): CartLine | null {
  const product = products.find((candidate) => candidate.id === line.productId);
  if (!product) return null;
  const bundle = product.bundles.length ? product.bundles.find((candidate) => candidate.id === line.bundleId) : line.bundleId === "card" ? undefined : null;
  if (bundle === null || (product.bundles.length > 0 && !bundle)) return null;
  const bundleQuantity = bundle?.quantity ?? 1;
  const maxCompatibleQuantity = Math.floor(99 / bundleQuantity) * bundleQuantity;
  const requested = Math.max(bundleQuantity, Math.min(maxCompatibleQuantity, Math.round(line.quantity)));
  const quantity = Math.min(maxCompatibleQuantity, Math.ceil(requested / bundleQuantity) * bundleQuantity);
  return { productId: product.id, bundleId: line.bundleId, quantity, bundleQuantity, name: product.name, image: product.media[0].src, unitPrice: bundle?.unitPrice ?? product.price };
}

export function reconcileCartLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>(); const result: CartLine[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const line = candidate as StoredCartLine;
    if (typeof line.productId !== "string" || typeof line.bundleId !== "string" || !Number.isFinite(line.quantity)) continue;
    const reconciled = catalogueLine(line); const identity = `${line.productId}:${line.bundleId}`;
    if (reconciled && !seen.has(identity)) { seen.add(identity); result.push(reconciled); }
  }
  return result;
}

export function changeCartLineQuantity(lines: CartLine[], productId: string, bundleId: string, quantity: number): CartLine[] {
  return lines.map((line) => line.productId === productId && line.bundleId === bundleId ? catalogueLine({ ...line, quantity }) ?? line : line);
}

export function removeCartLine(lines: CartLine[], productId: string, bundleId: string): CartLine[] {
  return lines.filter((line) => line.productId !== productId || line.bundleId !== bundleId);
}
