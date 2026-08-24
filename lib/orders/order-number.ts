import { randomBytes } from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createOrderNumber(): string {
  const suffix = Array.from(randomBytes(6), (byte) => alphabet[byte % alphabet.length]).join("");

  return `PG-${suffix}`;
}
