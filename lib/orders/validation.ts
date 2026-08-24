import { z } from "zod";

import type { CheckoutInput } from "./types";

const requiredText = (maxLength: number) => z.string().trim().min(1).max(maxLength);

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).transform((value) => value || undefined).optional();

const checkoutSchema = z.object({
  customerName: requiredText(100),
  phone: z.string().trim().regex(/^(?:03\d{9}|\+923\d{9})$/),
  email: optionalText(254).pipe(z.string().email().optional()),
  city: requiredText(100),
  address: requiredText(500),
  notes: optionalText(1000),
  consent: z.literal(true),
  website: z.string().trim().max(0).transform(() => undefined).optional(),
  items: z
    .array(
      z.object({
        productId: requiredText(100),
        bundleId: requiredText(100),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(20),
});

export function parseCheckoutInput(value: unknown): CheckoutInput {
  return checkoutSchema.parse(value);
}
