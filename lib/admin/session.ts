import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getAdminConfig } from "../config/server";

export const ADMIN_SESSION_COOKIE = "pg_admin";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

const SESSION_DURATION_MS = ADMIN_SESSION_MAX_AGE_SECONDS * 1_000;
const SIGNATURE_BYTES = 32;
const MINIMUM_SECRET_BYTES = 32;
const BASE64URL = /^[A-Za-z0-9_-]+$/;

type SessionPayload = {
  iat: number;
  exp: number;
};

export function adminSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/",
  };
}

function sessionSecret(): string {
  const secret = getAdminConfig().adminSessionSecret;
  if (Buffer.byteLength(secret, "utf8") < MINIMUM_SECRET_BYTES) {
    throw new Error("Server configuration is incomplete");
  }
  return secret;
}

function sign(encodedPayload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(encodedPayload).digest();
}

function decodeSignature(value: string): Buffer | null {
  if (!BASE64URL.test(value)) return null;
  const decoded = Buffer.from(value, "base64url");
  if (decoded.length !== SIGNATURE_BYTES || decoded.toString("base64url") !== value) return null;
  return decoded;
}

function parsePayload(value: string): SessionPayload | null {
  if (!BASE64URL.test(value)) return null;

  try {
    const decoded = Buffer.from(value, "base64url");
    if (decoded.toString("base64url") !== value) return null;
    const payload: unknown = JSON.parse(decoded.toString("utf8"));
    if (!payload || typeof payload !== "object") return null;

    const { iat, exp } = payload as Partial<SessionPayload>;
    if (!Number.isSafeInteger(iat) || !Number.isSafeInteger(exp)) return null;
    if ((exp as number) - (iat as number) !== SESSION_DURATION_MS) return null;
    return { iat: iat as number, exp: exp as number };
  } catch {
    return null;
  }
}

export async function createAdminSession(): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = { iat: now, exp: now + SESSION_DURATION_MS };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encodedPayload, sessionSecret()).toString("base64url");
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    if (token.length > 1_024) return false;
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [encodedPayload, encodedSignature] = parts;
    const providedSignature = decodeSignature(encodedSignature);
    const payload = parsePayload(encodedPayload);
    if (!providedSignature || !payload) return false;

    const expectedSignature = sign(encodedPayload, sessionSecret());
    if (
      providedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(providedSignature, expectedSignature)
    ) {
      return false;
    }

    const now = Date.now();
    return payload.iat <= now && payload.exp > now;
  } catch {
    return false;
  }
}
