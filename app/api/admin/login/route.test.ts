import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

function loginRequest(value: unknown): Request {
  return new Request("https://store.example.pk/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof value === "string" ? value : JSON.stringify(value),
  });
}

async function memoryLimiter() {
  const {
    createMemoryAdminLoginRateLimiter,
    createMemoryAdminLoginRateLimitState,
  } = await import("../../../../lib/admin/login-rate-limit");
  const state = createMemoryAdminLoginRateLimitState();
  return {
    limiter: createMemoryAdminLoginRateLimiter({ state, now: () => 1_000 }),
    state,
  };
}

describe("POST /api/admin/login", () => {
  it("returns a generic 400 for malformed request bodies and counts the attempt", async () => {
    const { createLoginHandler } = await import("./handler");
    const { limiter, state } = await memoryLimiter();
    const handler = createLoginHandler({
      authenticate: async () => true,
      createSession: async () => "session-token",
      clientKey: () => "a".repeat(64),
      rateLimiter: limiter,
      secureCookie: true,
    });

    const response = await handler(loginRequest("not-json"));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Invalid sign-in request" });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(state.attempts.size).toBe(1);
  });

  it("rejects a declared oversized body before authentication and counts the attempt", async () => {
    const { createLoginHandler } = await import("./handler");
    const { limiter, state } = await memoryLimiter();
    const authenticate = vi.fn(async () => true);
    const handler = createLoginHandler({ authenticate, createSession: async () => "session", clientKey: () => "a".repeat(64), rateLimiter: limiter, secureCookie: true });
    const request = new Request("https://store.example.pk/api/admin/login", { method: "POST", headers: { "content-type": "application/json", "content-length": "5000" }, body: JSON.stringify({ password: "short" }) });

    const response = await handler(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid sign-in request" });
    expect(authenticate).not.toHaveBeenCalled();
    expect(state.attempts.size).toBe(1);
  });

  it("rejects a streamed oversized body before authentication and counts the attempt", async () => {
    const { createLoginHandler } = await import("./handler");
    const { limiter, state } = await memoryLimiter();
    const authenticate = vi.fn(async () => true);
    const handler = createLoginHandler({ authenticate, createSession: async () => "session", clientKey: () => "a".repeat(64), rateLimiter: limiter, secureCookie: true });
    const request = new Request("https://store.example.pk/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: "x".repeat(5000) }) });

    const response = await handler(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid sign-in request" });
    expect(authenticate).not.toHaveBeenCalled();
    expect(state.attempts.size).toBe(1);
  });

  it("does not publicly distinguish a wrong password from missing configuration", async () => {
    const { createLoginHandler } = await import("./handler");
    const makeHandler = async (authenticate: (password: string) => Promise<boolean>) =>
      createLoginHandler({
        authenticate,
        createSession: async () => "session-token",
        clientKey: () => "a".repeat(64),
        rateLimiter: (await memoryLimiter()).limiter,
        secureCookie: true,
      });

    const wrongPasswordResponse = await (await makeHandler(async () => false))(
      loginRequest({ password: "wrong password" }),
    );
    const missingConfigResponse = await (await makeHandler(async () => {
      throw new Error("ADMIN_PASSWORD_HASH is unavailable");
    }))(loginRequest({ password: "same public result" }));

    expect(missingConfigResponse.status).toBe(wrongPasswordResponse.status);
    expect(missingConfigResponse.status).toBe(401);
    await expect(missingConfigResponse.json()).resolves.toEqual(
      await wrongPasswordResponse.json(),
    );
    expect(missingConfigResponse.headers.get("set-cookie")).toBeNull();
  });

  it("atomically throttles the sixth concurrent request before expensive authentication", async () => {
    const { createLoginHandler } = await import("./handler");
    const { limiter } = await memoryLimiter();
    let releaseAuthentication!: () => void;
    let reportFiveStarted!: () => void;
    let authenticateCalls = 0;
    const authenticationGate = new Promise<void>((resolve) => {
      releaseAuthentication = resolve;
    });
    const fiveStarted = new Promise<void>((resolve) => {
      reportFiveStarted = resolve;
    });
    const handler = createLoginHandler({
      authenticate: async () => {
        authenticateCalls += 1;
        if (authenticateCalls === 5) reportFiveStarted();
        await authenticationGate;
        return false;
      },
      createSession: async () => "session-token",
      clientKey: () => "a".repeat(64),
      rateLimiter: limiter,
      secureCookie: true,
    });

    const pendingResponses = Array.from({ length: 6 }, (_, index) =>
      handler(loginRequest({ password: `wrong-${index}` })),
    );
    await fiveStarted;
    releaseAuthentication();
    const responses = await Promise.all(pendingResponses);

    expect(authenticateCalls).toBe(5);
    expect(responses.map((response) => response.status).sort()).toEqual([401, 401, 401, 401, 401, 429]);
  });

  it("sets the signed session in a secure eight-hour cookie after authentication", async () => {
    const { createLoginHandler } = await import("./handler");
    const { limiter, state } = await memoryLimiter();
    const handler = createLoginHandler({
      authenticate: async (password) => password === "valid password",
      createSession: async () => "signed.session-token",
      clientKey: () => "a".repeat(64),
      rateLimiter: limiter,
      secureCookie: true,
    });

    const response = await handler(loginRequest({ password: "valid password" }));
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(cookie).toContain("pg_admin=signed.session-token");
    expect(cookie).toContain("Max-Age=28800");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie.toLowerCase()).toContain("samesite=strict");
    expect(state.attempts.size).toBe(0);
    expect(state.trustedUntil.get("a".repeat(64))).toBeGreaterThan(1_000);
  });

  it("uses the generic credential failure if session creation is unavailable", async () => {
    const { createLoginHandler } = await import("./handler");
    const { limiter, state } = await memoryLimiter();
    const handler = createLoginHandler({
      authenticate: async () => true,
      createSession: async () => {
        throw new Error("ADMIN_SESSION_SECRET leaked diagnostic");
      },
      clientKey: () => "a".repeat(64),
      rateLimiter: limiter,
      secureCookie: true,
    });

    const response = await handler(loginRequest({ password: "valid password" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unable to sign in" });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(state.attempts.size).toBe(1);
  });

  it("makes unavailable reservation storage indistinguishable from bad credentials", async () => {
    const { createLoginHandler } = await import("./handler");
    let authenticateCalls = 0;
    const handler = createLoginHandler({
      authenticate: async () => {
        authenticateCalls += 1;
        return false;
      },
      createSession: async () => "session-token",
      clientKey: () => "a".repeat(64),
      rateLimiter: {
        async reserve() {
          throw new Error("SUPABASE_SECRET_KEY provider diagnostic");
        },
        async complete() {},
      },
      secureCookie: true,
    });

    const response = await handler(loginRequest({ password: "not-logged" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unable to sign in" });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(authenticateCalls).toBe(0);
  });

  it("uses the generic credential failure and no cookie when successful completion cannot be stored", async () => {
    const { createLoginHandler } = await import("./handler");
    const handler = createLoginHandler({
      authenticate: async () => true,
      createSession: async () => "signed.session-token",
      clientKey: () => "a".repeat(64),
      rateLimiter: {
        async reserve() {
          return { id: "reservation-1" };
        },
        async complete() {
          throw new Error("database unavailable");
        },
      },
      secureCookie: true,
    });

    const response = await handler(loginRequest({ password: "valid password" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unable to sign in" });
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});

describe("POST /api/admin/logout", () => {
  it("expires the admin cookie with the same security attributes", async () => {
    const { createLogoutHandler } = await import("../logout/handler");

    const response = await createLogoutHandler({ secureCookie: true })();
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(cookie).toContain("pg_admin=");
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie.toLowerCase()).toContain("samesite=strict");
  });
});
