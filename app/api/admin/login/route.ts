import { getAdminRateLimitConfig } from "../../../../lib/config/server";
import { adminLoginClientKey, getAdminLoginRateLimiter } from "../../../../lib/admin/login-rate-limit";
import { verifyPassword } from "../../../../lib/admin/password";
import { createAdminSession } from "../../../../lib/admin/session";
import { createLoginHandler, jsonResponse } from "./handler";

const DUMMY_PASSWORD_HASH = `scrypt$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`;

async function authenticateConfiguredPassword(password: string): Promise<boolean> {
  let encodedHash = DUMMY_PASSWORD_HASH;
  let configured = false;
  try {
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
