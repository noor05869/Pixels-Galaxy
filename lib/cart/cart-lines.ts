import { products } from "../storefront/content";
import { kuStringColors, type CartLine, type KuStringColor } from "./types";

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
  const colors = Array.isArray(line.colors) && line.colors.every((color): color is KuStringColor => kuStringColors.includes(color as KuStringColor)) ? line.colors : undefined;
  if (bundle?.id === "pick-any-two" && colors?.length !== 2) return null;
  const image = product.media.find((item) => item.type === "image")?.src ?? product.media[0].poster ?? product.media[0].src;
  return { productId: product.id, bundleId: line.bundleId, quantity, bundleQuantity, name: product.name, image, unitPrice: bundle?.unitPrice ?? product.price, ...(colors ? { colors } : {}) };
}

export function cartLineKey(line: Pick<CartLine, "productId" | "bundleId" | "colors">): string {
  return `${line.productId}:${line.bundleId}:${line.colors?.join("+") ?? ""}`;
}

export function reconcileCartLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>(); const result: CartLine[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const line = candidate as StoredCartLine;
    if (typeof line.productId !== "string" || typeof line.bundleId !== "string" || !Number.isFinite(line.quantity)) continue;
    const reconciled = catalogueLine(line); const identity = reconciled ? cartLineKey(reconciled) : "";
    if (reconciled && !seen.has(identity)) { seen.add(identity); result.push(reconciled); }
  }
  return result;
}

export function changeCartLineQuantity(lines: CartLine[], lineKey: string, quantity: number): CartLine[] {
  return lines.map((line) => cartLineKey(line) === lineKey ? catalogueLine({ ...line, quantity }) ?? line : line);
}

export function removeCartLine(lines: CartLine[], lineKey: string): CartLine[] {
  return lines.filter((line) => cartLineKey(line) !== lineKey);
}
