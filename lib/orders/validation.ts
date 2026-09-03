import { z } from "zod";

import type { CheckoutInput } from "./types";
import { isProvinceCode } from "@/lib/locations/pakistan";

const requiredText = (maxLength: number) => z.string().trim().min(1).max(maxLength);

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).transform((value) => value || undefined).optional();

const checkoutSchema = z.object({
  customerName: requiredText(100),
  phone: z.string().trim().regex(/^(?:03\d{9}|\+923\d{9}|00923\d{9})$/).transform((value) => value.startsWith("+92") ? `0${value.slice(3)}` : value.startsWith("0092") ? `0${value.slice(4)}` : value),
  email: optionalText(254).pipe(z.string().email().optional()),
  city: requiredText(100),
  address: requiredText(500),
  province: z.string().trim().refine(isProvinceCode),
  postalCode: optionalText(10).pipe(z.string().regex(/^[A-Za-z0-9 -]{3,10}$/).optional()),
  landmark: optionalText(200),
  addressType: z.enum(["home", "office"]),
  notes: optionalText(1000),
  consent: z.literal(true),
  website: z.string().trim().max(0).transform(() => undefined).optional(),
  expectedTotal: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  catalogueRevision: requiredText(100),
  items: z
    .array(
      z.object({
        productId: requiredText(100),
        bundleId: requiredText(100),
        quantity: z.number().int().min(1).max(99),
        colors: z.array(z.enum(["blue", "green", "pink"])).length(2).optional(),
      }),
    )
    .min(1)
    .max(20),
});

export function parseCheckoutInput(value: unknown): CheckoutInput {
  return checkoutSchema.parse(value);
}
