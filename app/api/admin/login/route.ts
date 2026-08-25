import { NextResponse } from "next/server";

import { getAdminConfig, getAdminRateLimitConfig } from "../../../../lib/config/server";
import {
  adminLoginClientKey,
  getAdminLoginRateLimiter,
} from "../../../../lib/admin/login-rate-limit";
import type {
  AdminLoginRateLimiter,
  AdminLoginReservation,
} from "../../../../lib/admin/login-rate-limit";
import { verifyPassword } from "../../../../lib/admin/password";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  adminSessionCookieOptions,
  createAdminSession,
} from "../../../../lib/admin/session";

const MAX_PASSWORD_LENGTH = 1_024;
const MAX_LOGIN_BODY_BYTES = 4 * 1_024;
const DUMMY_PASSWORD_HASH = `scrypt$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`;

type LoginHandlerDependencies = {
  authenticate(password: string): Promise<boolean>;
  createSession(): Promise<string>;
  clientKey(request: Request): string;
  rateLimiter: AdminLoginRateLimiter;
  secureCookie: boolean;
};

function jsonResponse(body: Record<string, string | boolean>, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function passwordFrom(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const password = (value as { password?: unknown }).password;
  if (typeof password !== "string" || password.length === 0 || password.length > MAX_PASSWORD_LENGTH) {
    return null;
  }
  return password;
}

async function readLoginBody(request: Request): Promise<string> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_LOGIN_BODY_BYTES) throw new Error("invalid");
  if (!request.body) return "";
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_LOGIN_BODY_BYTES) { await reader.cancel().catch(() => undefined); throw new Error("invalid"); }
    chunks.push(value);
  }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(body);
}

export function createLoginHandler(
  dependencies: LoginHandlerDependencies,
): (request: Request) => Promise<Response> {
  return async (request) => {
    if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
      return jsonResponse({ error: "Invalid sign-in request" }, 400);
    }

    let reservation: AdminLoginReservation | null;
    try {
      reservation = await dependencies.rateLimiter.reserve(dependencies.clientKey(request));
    } catch {
      return jsonResponse({ error: "Unable to sign in" }, 401);
    }
    if (!reservation) return jsonResponse({ error: "Too many sign-in attempts" }, 429);

    async function retainFailedReservation(): Promise<void> {
      try {
        await dependencies.rateLimiter.complete(reservation!, "failure");
      } catch {
        // The pending reservation remains fail-closed until the shared window expires.
      }
    }

    let value: unknown;
    try {
      value = JSON.parse(await readLoginBody(request));
    } catch {
      await retainFailedReservation();
      return jsonResponse({ error: "Invalid sign-in request" }, 400);
    }

    const password = passwordFrom(value);
    if (!password) {
      await retainFailedReservation();
      return jsonResponse({ error: "Invalid sign-in request" }, 400);
    }

    let authenticated = false;
    try {
      authenticated = await dependencies.authenticate(password);
    } catch {
      authenticated = false;
    }

    if (!authenticated) {
      await retainFailedReservation();
      return jsonResponse({ error: "Unable to sign in" }, 401);
    }

    let session: string;
    try {
      session = await dependencies.createSession();
    } catch {
      await retainFailedReservation();
      return jsonResponse({ error: "Unable to sign in" }, 401);
    }

    try {
      await dependencies.rateLimiter.complete(reservation, "success");
    } catch {
      return jsonResponse({ error: "Unable to sign in" }, 401);
    }

    const response = jsonResponse({ ok: true }, 200);
    response.cookies.set(ADMIN_SESSION_COOKIE, session, {
      ...adminSessionCookieOptions(dependencies.secureCookie),
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });
    return response;
  };
}

async function authenticateConfiguredPassword(password: string): Promise<boolean> {
  let encodedHash = DUMMY_PASSWORD_HASH;
  let configured = false;
  try {
    // encodedHash = getAdminConfig().adminPasswordHash;
    encodedHash = process.env.ADMIN_PASSWORD_HASH || " ";
    configured = true;
  } catch {
    // Perform the same expensive password derivation before returning the generic failure.
  }


  const verified = await verifyPassword(password, encodedHash);
  return configured && verified;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { clientIpHeader } = getAdminRateLimitConfig();
    return await createLoginHandler({
      authenticate: authenticateConfiguredPassword,
      createSession: createAdminSession,
      clientKey: (candidate) => adminLoginClientKey(candidate, clientIpHeader),
      rateLimiter: getAdminLoginRateLimiter(),
      secureCookie: process.env.NODE_ENV === "production",
    })(request);
  } catch {
    return jsonResponse({ error: "Unable to sign in" }, 401);
  }
}
