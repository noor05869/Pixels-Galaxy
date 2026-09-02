import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const scrypt = promisify(scryptCallback);

async function encodedHashFor(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

describe("verifyPassword", () => {
  it("accepts the password used to create a valid scrypt hash", async () => {
    const { verifyPassword } = await import("./password");
    const encodedHash = await encodedHashFor("correct horse battery staple");

    await expect(verifyPassword("correct horse battery staple", encodedHash)).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const { verifyPassword } = await import("./password");
    const encodedHash = await encodedHashFor("correct horse battery staple");

    await expect(verifyPassword("incorrect password", encodedHash)).resolves.toBe(false);
  });

  it.each([
    "",
    "pbkdf2$c2FsdA$aGFzaA",
    "scrypt$not+base64url$aGFzaA",
    `scrypt$${Buffer.alloc(15).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`,
    `scrypt$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(63).toString("base64url")}`,
    `scrypt$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}$extra`,
  ])("rejects malformed encoded hashes without throwing: %s", async (encodedHash) => {
    const { verifyPassword } = await import("./password");

    await expect(verifyPassword("any password", encodedHash)).resolves.toBe(false);
  });
});
