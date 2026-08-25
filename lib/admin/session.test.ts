import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const sessionSecret = "test-session-secret-that-is-longer-than-thirty-two-bytes";

async function loadSessionModule() {
  vi.stubEnv("ADMIN_PASSWORD_HASH", "scrypt$placeholder$placeholder");
  vi.stubEnv("ADMIN_SESSION_SECRET", sessionSecret);
  return import("./session");
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("admin sessions", () => {
  it("creates a signed token with an eight-hour lifetime", async () => {
    const now = Date.UTC(2026, 7, 25, 12, 0, 0);
    vi.spyOn(Date, "now").mockReturnValue(now);
    const { createAdminSession, verifyAdminSession } = await loadSessionModule();

    const token = await createAdminSession();
    const [encodedPayload, signature, extra] = token.split(".");
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

    expect(extra).toBeUndefined();
    expect(signature).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(payload).toEqual({ iat: now, exp: now + 8 * 60 * 60 * 1_000 });
    await expect(verifyAdminSession(token)).resolves.toBe(true);
  });

  it("rejects a token whose signed payload was changed", async () => {
    const { createAdminSession, verifyAdminSession } = await loadSessionModule();
    const token = await createAdminSession();
    const [encodedPayload, signature] = token.split(".");
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...payload, exp: payload.exp + 60_000 }),
    ).toString("base64url");

    await expect(verifyAdminSession(`${tamperedPayload}.${signature}`)).resolves.toBe(false);
  });

  it("rejects an expired token", async () => {
    const issuedAt = Date.UTC(2026, 7, 25, 12, 0, 0);
    vi.spyOn(Date, "now").mockReturnValue(issuedAt);
    const { createAdminSession, verifyAdminSession } = await loadSessionModule();
    const token = await createAdminSession();
    vi.spyOn(Date, "now").mockReturnValue(issuedAt + 8 * 60 * 60 * 1_000 + 1);

    await expect(verifyAdminSession(token)).resolves.toBe(false);
  });

  it.each(["A", "A".repeat(42), "A".repeat(44), "A".repeat(86)])(
    "rejects a non-constant-length signature without throwing: %s",
    async (signature) => {
      const { createAdminSession, verifyAdminSession } = await loadSessionModule();
      const [encodedPayload] = (await createAdminSession()).split(".");

      await expect(verifyAdminSession(`${encodedPayload}.${signature}`)).resolves.toBe(false);
    },
  );

  it("fails closed when session configuration is unavailable", async () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    const { verifyAdminSession } = await import("./session");

    await expect(verifyAdminSession("payload.signature")).resolves.toBe(false);
  });
});
