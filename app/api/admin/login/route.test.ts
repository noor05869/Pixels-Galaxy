import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

function loginRequest(value: unknown): Request {
  return new Request("https://store.example.pk/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof value === "string" ? value : JSON.stringify(value),
  });
}

describe("POST /api/admin/login", () => {
  it("returns a generic 400 for malformed request bodies", async () => {
    const { createLoginFailureThrottle, createLoginHandler } = await import("./route");
    const handler = createLoginHandler({
      authenticate: async () => true,
      createSession: async () => "session-token",
      throttle: createLoginFailureThrottle(),
      secureCookie: true,
    });

    const response = await handler(loginRequest("not-json"));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "Invalid sign-in request" });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("does not publicly distinguish a wrong password from missing configuration", async () => {
    const { createLoginFailureThrottle, createLoginHandler } = await import("./route");
    const makeHandler = (authenticate: (password: string) => Promise<boolean>) =>
      createLoginHandler({
        authenticate,
        createSession: async () => "session-token",
        throttle: createLoginFailureThrottle(),
        secureCookie: true,
      });

    const wrongPasswordResponse = await makeHandler(async () => false)(
      loginRequest({ password: "wrong password" }),
    );
    const missingConfigResponse = await makeHandler(async () => {
      throw new Error("ADMIN_PASSWORD_HASH is unavailable");
    })(loginRequest({ password: "same public result" }));

    expect(missingConfigResponse.status).toBe(wrongPasswordResponse.status);
    expect(missingConfigResponse.status).toBe(401);
    await expect(missingConfigResponse.json()).resolves.toEqual(
      await wrongPasswordResponse.json(),
    );
    expect(missingConfigResponse.headers.get("set-cookie")).toBeNull();
  });

  it("throttles the sixth request after five failures in fifteen minutes", async () => {
    let currentTime = 1_000;
    const { createLoginFailureThrottle, createLoginHandler } = await import("./route");
    const throttle = createLoginFailureThrottle({ now: () => currentTime });
    const handler = createLoginHandler({
      authenticate: async () => false,
      createSession: async () => "session-token",
      throttle,
      secureCookie: true,
    });

    const responses: Response[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(await handler(loginRequest({ password: `wrong-${attempt}` })));
    }

    expect(responses.map((response) => response.status)).toEqual([401, 401, 401, 401, 401, 429]);
    await expect(responses[5].json()).resolves.toEqual({ error: "Too many sign-in attempts" });

    currentTime += 15 * 60 * 1_000;
    expect((await handler(loginRequest({ password: "try-again" }))).status).toBe(401);
  });

  it("sets the signed session in a secure eight-hour cookie after authentication", async () => {
    const { createLoginFailureThrottle, createLoginHandler } = await import("./route");
    const handler = createLoginHandler({
      authenticate: async (password) => password === "valid password",
      createSession: async () => "signed.session-token",
      throttle: createLoginFailureThrottle(),
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
  });

  it("uses the generic credential failure if session creation is unavailable", async () => {
    const { createLoginFailureThrottle, createLoginHandler } = await import("./route");
    const handler = createLoginHandler({
      authenticate: async () => true,
      createSession: async () => {
        throw new Error("ADMIN_SESSION_SECRET leaked diagnostic");
      },
      throttle: createLoginFailureThrottle(),
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
    const { createLogoutHandler } = await import("../logout/route");

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
