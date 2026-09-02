import "server-only";

import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const SALT_BYTES = 16;
const HASH_BYTES = 64;
const BASE64URL = /^[A-Za-z0-9_-]+$/;
const scrypt = promisify(scryptCallback);

function decodeBase64Url(value: string, expectedBytes: number): Buffer | null {
  if (!BASE64URL.test(value)) return null;

  const decoded = Buffer.from(value, "base64url");
  if (decoded.length !== expectedBytes || decoded.toString("base64url") !== value) return null;
  return decoded;
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const parts = encodedHash.split("$");

  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const salt = decodeBase64Url(parts[1], SALT_BYTES);
  const expectedHash = decodeBase64Url(parts[2], HASH_BYTES);
  if (!salt || !expectedHash) return false;

  try {
    const derivedHash = (await scrypt(password, salt, HASH_BYTES)) as Buffer;
    return derivedHash.length === expectedHash.length && timingSafeEqual(derivedHash, expectedHash);
  } catch {
    return false;
  }
}
