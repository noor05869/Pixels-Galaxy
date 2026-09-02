import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("atomic admin login reservations", () => {
  it("admits only five concurrent reservations for one client", async () => {
    const {
      createMemoryAdminLoginRateLimiter,
      createMemoryAdminLoginRateLimitState,
    } = await import("./login-rate-limit");
    const state = createMemoryAdminLoginRateLimitState();
    const limiter = createMemoryAdminLoginRateLimiter({ state, now: () => 1_000 });

    const reservations = await Promise.all(
      Array.from({ length: 12 }, () => limiter.reserve("client-a")),
    );

    expect(reservations.filter(Boolean)).toHaveLength(5);
    expect(reservations.filter((reservation) => reservation === null)).toHaveLength(7);
  });

  it("shares limits atomically across limiter instances", async () => {
    const {
      createMemoryAdminLoginRateLimiter,
      createMemoryAdminLoginRateLimitState,
    } = await import("./login-rate-limit");
    const state = createMemoryAdminLoginRateLimitState();
    const firstInstance = createMemoryAdminLoginRateLimiter({ state, now: () => 1_000 });
    const secondInstance = createMemoryAdminLoginRateLimiter({ state, now: () => 1_000 });

    const reservations = await Promise.all([
      ...Array.from({ length: 3 }, () => firstInstance.reserve("client-a")),
      ...Array.from({ length: 3 }, () => secondInstance.reserve("client-a")),
    ]);

    expect(reservations.filter(Boolean)).toHaveLength(5);
    expect(reservations[5]).toBeNull();
  });

  it("preserves trusted recovery capacity when anonymous clients saturate the global ceiling", async () => {
    const {
      createMemoryAdminLoginRateLimiter,
      createMemoryAdminLoginRateLimitState,
    } = await import("./login-rate-limit");
    const state = createMemoryAdminLoginRateLimitState();
    const limiter = createMemoryAdminLoginRateLimiter({
      state,
      now: () => 1_000,
      globalLimit: 2,
      trustedReserve: 1,
    });
    const initialAdminReservation = await limiter.reserve("known-admin-client");
    expect(initialAdminReservation).not.toBeNull();
    await limiter.complete(initialAdminReservation!, "success");

    expect(await limiter.reserve("attacker-a")).not.toBeNull();
    expect(await limiter.reserve("attacker-b")).not.toBeNull();
    expect(await limiter.reserve("new-untrusted-client")).toBeNull();
    expect(await limiter.reserve("known-admin-client")).not.toBeNull();
  });

  it("keeps reservation storage within the global ceiling plus trusted reserve", async () => {
    const {
      createMemoryAdminLoginRateLimiter,
      createMemoryAdminLoginRateLimitState,
    } = await import("./login-rate-limit");
    const state = createMemoryAdminLoginRateLimitState();
    const limiter = createMemoryAdminLoginRateLimiter({
      state,
      now: () => 1_000,
      globalLimit: 3,
      trustedReserve: 2,
    });

    await Promise.all(
      Array.from({ length: 50 }, (_, index) => limiter.reserve(`untrusted-${index}`)),
    );

    expect(state.attempts.size).toBe(3);
  });

  it("caps the recently successful client recovery set", async () => {
    const {
      createMemoryAdminLoginRateLimiter,
      createMemoryAdminLoginRateLimitState,
    } = await import("./login-rate-limit");
    let currentTime = 1_000;
    const state = createMemoryAdminLoginRateLimitState();
    const limiter = createMemoryAdminLoginRateLimiter({
      state,
      now: () => currentTime,
      maxTrustedClients: 3,
    });

    for (let index = 0; index < 8; index += 1) {
      const reservation = await limiter.reserve(`successful-client-${index}`);
      expect(reservation).not.toBeNull();
      await limiter.complete(reservation!, "success");
      currentTime += 1;
    }

    expect(state.trustedUntil.size).toBe(3);
    expect([...state.trustedUntil.keys()]).toEqual([
      "successful-client-5",
      "successful-client-6",
      "successful-client-7",
    ]);
  });

  it("prunes expired attempts before reserving new capacity", async () => {
    const {
      createMemoryAdminLoginRateLimiter,
      createMemoryAdminLoginRateLimitState,
    } = await import("./login-rate-limit");
    let currentTime = 1_000;
    const state = createMemoryAdminLoginRateLimitState();
    const limiter = createMemoryAdminLoginRateLimiter({
      state,
      now: () => currentTime,
      clientLimit: 1,
      windowMs: 15 * 60 * 1_000,
    });

    expect(await limiter.reserve("client-a")).not.toBeNull();
    expect(await limiter.reserve("client-a")).toBeNull();
    currentTime += 15 * 60 * 1_000;
    expect(await limiter.reserve("client-a")).not.toBeNull();
  });
});

describe("trusted admin client identity", () => {
  it("hashes only one valid IP from the configured edge-owned header", async () => {
    const { adminLoginClientKey } = await import("./login-rate-limit");
    const trusted = new Request("https://store.example.pk/api/admin/login", {
      headers: {
        "x-edge-client-ip": "203.0.113.42",
        "x-forwarded-for": "198.51.100.1",
      },
    });
    const spoofed = new Request("https://store.example.pk/api/admin/login", {
      headers: {
        "x-edge-client-ip": "203.0.113.42",
        "x-forwarded-for": "192.0.2.99",
      },
    });

    const firstKey = adminLoginClientKey(trusted, "x-edge-client-ip");
    const secondKey = adminLoginClientKey(spoofed, "x-edge-client-ip");

    expect(firstKey).toBe(secondKey);
    expect(firstKey).toMatch(/^[a-f0-9]{64}$/);
    expect(firstKey).not.toContain("203.0.113.42");
  });

  it("puts missing, invalid, and multi-value edge identities in one fail-closed fallback key", async () => {
    const { adminLoginClientKey } = await import("./login-rate-limit");
    const missing = new Request("https://store.example.pk/api/admin/login", {
      headers: { "x-forwarded-for": "203.0.113.42" },
    });
    const invalid = new Request("https://store.example.pk/api/admin/login", {
      headers: { "x-edge-client-ip": "not-an-ip" },
    });
    const multiple = new Request("https://store.example.pk/api/admin/login", {
      headers: { "x-edge-client-ip": "203.0.113.42, 198.51.100.1" },
    });

    expect(adminLoginClientKey(missing, "x-edge-client-ip")).toBe(
      adminLoginClientKey(invalid, "x-edge-client-ip"),
    );
    expect(adminLoginClientKey(invalid, "x-edge-client-ip")).toBe(
      adminLoginClientKey(multiple, "x-edge-client-ip"),
    );
  });
});

describe("Supabase admin login limiter adapter", () => {
  it("maps reserve and completion to the atomic RPC contract", async () => {
    const calls: Array<{ name: string; args: Record<string, string> }> = [];
    const client = {
      async rpc(name: string, args: Record<string, string>) {
        calls.push({ name, args });
        if (name === "reserve_admin_login_attempt") {
          return { data: [{ allowed: true, reservation_id: "reservation-1" }], error: null };
        }
        return { data: null, error: null };
      },
    };
    const { createSupabaseAdminLoginRateLimiter } = await import("./login-rate-limit");
    const limiter = createSupabaseAdminLoginRateLimiter(client);

    const reservation = await limiter.reserve("a".repeat(64));
    expect(reservation).toEqual({ id: "reservation-1" });
    await limiter.complete(reservation!, "success");

    expect(calls).toEqual([
      {
        name: "reserve_admin_login_attempt",
        args: { p_client_key: "a".repeat(64) },
      },
      {
        name: "complete_admin_login_attempt",
        args: { p_reservation_id: "reservation-1", p_outcome: "success" },
      },
    ]);
  });

  it("throws only a generic error when shared storage is unavailable", async () => {
    const client = {
      async rpc() {
        return { data: null, error: { message: "SUPABASE_SECRET_KEY provider diagnostic" } };
      },
    };
    const { createSupabaseAdminLoginRateLimiter } = await import("./login-rate-limit");
    const limiter = createSupabaseAdminLoginRateLimiter(client);

    await expect(limiter.reserve("a".repeat(64))).rejects.toThrow(
      "Admin sign-in throttle unavailable",
    );
  });
});
