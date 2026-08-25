import { NextResponse } from "next/server";

import { getAdminConfig } from "../../../../lib/config/server";
import { verifyPassword } from "../../../../lib/admin/password";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  adminSessionCookieOptions,
  createAdminSession,
} from "../../../../lib/admin/session";

const MAX_PASSWORD_LENGTH = 1_024;
const FAILURE_LIMIT = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1_000;
const DUMMY_PASSWORD_HASH = `scrypt$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`;

type LoginFailureThrottle = {
  isBlocked(): boolean;
  recordFailure(): void;
  reset(): void;
};

type LoginHandlerDependencies = {
  authenticate(password: string): Promise<boolean>;
  createSession(): Promise<string>;
  throttle: LoginFailureThrottle;
  secureCookie: boolean;
};

type FailureThrottleOptions = {
  now?: () => number;
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

export function createLoginFailureThrottle(
  options: FailureThrottleOptions = {},
): LoginFailureThrottle {
  const now = options.now ?? Date.now;
  let failures: number[] = [];

  function prune(): void {
    const cutoff = now() - FAILURE_WINDOW_MS;
    failures = failures.filter((timestamp) => timestamp > cutoff);
  }

  return {
    isBlocked() {
      prune();
      return failures.length >= FAILURE_LIMIT;
    },
    recordFailure() {
      prune();
      failures.push(now());
    },
    reset() {
      failures = [];
    },
  };
}

export function createLoginHandler(
  dependencies: LoginHandlerDependencies,
): (request: Request) => Promise<Response> {
  return async (request) => {
    let value: unknown;
    try {
      if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
        throw new Error("Invalid content type");
      }
      value = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid sign-in request" }, 400);
    }

    const password = passwordFrom(value);
    if (!password) return jsonResponse({ error: "Invalid sign-in request" }, 400);
    if (dependencies.throttle.isBlocked()) {
      return jsonResponse({ error: "Too many sign-in attempts" }, 429);
    }

    let authenticated = false;
    try {
      authenticated = await dependencies.authenticate(password);
    } catch {
      authenticated = false;
    }

    if (!authenticated) {
      dependencies.throttle.recordFailure();
      return jsonResponse({ error: "Unable to sign in" }, 401);
    }

    try {
      const session = await dependencies.createSession();
      const response = jsonResponse({ ok: true }, 200);
      response.cookies.set(ADMIN_SESSION_COOKIE, session, {
        ...adminSessionCookieOptions(dependencies.secureCookie),
        maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      });
      dependencies.throttle.reset();
      return response;
    } catch {
      dependencies.throttle.recordFailure();
      return jsonResponse({ error: "Unable to sign in" }, 401);
    }
  };
}

async function authenticateConfiguredPassword(password: string): Promise<boolean> {
  let encodedHash = DUMMY_PASSWORD_HASH;
  let configured = false;
  try {
    encodedHash = getAdminConfig().adminPasswordHash;
    configured = true;
  } catch {
    // Perform the same expensive password derivation before returning the generic failure.
  }

  const verified = await verifyPassword(password, encodedHash);
  return configured && verified;
}

const loginFailureThrottle = createLoginFailureThrottle();

export async function POST(request: Request): Promise<Response> {
  return createLoginHandler({
    authenticate: authenticateConfiguredPassword,
    createSession: createAdminSession,
    throttle: loginFailureThrottle,
    secureCookie: process.env.NODE_ENV === "production",
  })(request);
}
