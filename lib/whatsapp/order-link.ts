import { whatsappNumber } from "../config/public";

export type WhatsAppOrderLinkInput = {
  productName: string;
  bundleLabel: string;
  quantity: number;
  total: number;
};

const pkrFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
});

export function createWhatsAppOrderLink(input: WhatsAppOrderLinkInput): string {
  if (
    !Number.isSafeInteger(input.quantity) ||
    input.quantity <= 0 ||
    !Number.isSafeInteger(input.total) ||
    input.total <= 0 ||
    !/^\d+$/.test(whatsappNumber)
  ) {
    throw new Error("WhatsApp order details are invalid");
  }

  const amount = pkrFormatter.format(input.total / 100);
  const message =
    `Hi Pixels Galaxy! I want to order ${input.productName}. ` +
    `Bundle: ${input.bundleLabel}. Quantity: ${input.quantity}. Total: Rs ${amount}.`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
