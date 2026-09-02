import { describe, expect, it, vi } from "vitest";
import { CATALOGUE_REVISION } from "../../../lib/orders/pricing";

vi.mock("server-only", () => ({}));

const checkout = {
  customerName: "Ayesha Khan",
  phone: "03324468116",
  email: "ayesha@example.pk",
  city: "Karachi",
  address: "12 Example Street",
  notes: "Please call first",
  consent: true,
  expectedTotal: 899900,
  catalogueRevision: CATALOGUE_REVISION,
  items: [{ productId: "zipstring-original", bundleId: "one", quantity: 1 }],
};

function jsonRequest(value: unknown, headers?: Record<string, string>): Request {
  return new Request("https://store.example.pk/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(value),
  });
}

describe("POST /api/orders", () => {
  it("rejects non-JSON requests with 415 before consuming an attempt", async () => {
    const { createPostHandler } = await import("./handler");
    const attempt = vi.fn(() => true);
    const handler = createPostHandler({
      submitOrder: vi.fn(),
      attempt,
      clientIpHeader: "x-test-client-ip",
    });

    const response = await handler(
      new Request("https://store.example.pk/api/orders", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "not json",
      }),
    );

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toEqual({ error: "JSON content type required" });
    expect(attempt).not.toHaveBeenCalled();
  });

  it("rejects request bodies over 32 KB with 413", async () => {
    const { createPostHandler } = await import("./handler");
    const attempt = vi.fn(() => true);
    const handler = createPostHandler({
      submitOrder: vi.fn(),
      attempt,
      clientIpHeader: "x-test-client-ip",
    });
    const response = await handler(
      new Request("https://store.example.pk/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: "x".repeat(32 * 1024) }),
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "Request body too large" });
    expect(attempt).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid checkout input before consuming an attempt", async () => {
    const { createPostHandler } = await import("./handler");
    const attempt = vi.fn(() => true);
    const handler = createPostHandler({
      submitOrder: vi.fn(),
      attempt,
      clientIpHeader: "x-test-client-ip",
    });

    const response = await handler(jsonRequest({ ...checkout, phone: "123" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid order" });
    expect(attempt).not.toHaveBeenCalled();
  });

  it("allows five attempts per ten minutes and throttles the sixth hashed client key", async () => {
    const { createPostHandler } = await import("./handler");
    const { createMemoryRateLimiter } = await import("../../../lib/orders/rate-limit");
    const attemptedKeys: string[] = [];
    const limiter = createMemoryRateLimiter({ now: () => 1_000 });
    const handler = createPostHandler({
      submitOrder: async () => ({ orderNumber: "PG-ABC234" }),
      attempt: (key) => {
        attemptedKeys.push(key);
        return limiter.attempt(key);
      },
      clientIpHeader: "x-test-client-ip",
    });

    const responses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(
        await handler(jsonRequest(checkout, { "x-test-client-ip": "203.0.113.42" })),
      );
    }

    expect(responses.map((response) => response.status)).toEqual([201, 201, 201, 201, 201, 429]);
    expect(attemptedKeys[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(attemptedKeys[0]).not.toContain("203.0.113.42");
    await expect(responses[5].json()).resolves.toEqual({ error: "Too many order attempts" });
  });

  it("returns a sanitized 503 when configuration or storage fails", async () => {
    const { createPostHandler } = await import("./handler");
    const handler = createPostHandler({
      submitOrder: async () => {
        throw new Error("SUPABASE_SECRET_KEY leaked provider diagnostic");
      },
      attempt: () => true,
      clientIpHeader: "x-test-client-ip",
    });

    const response = await handler(jsonRequest(checkout));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Order service unavailable" });
  });

  it("returns 409 when the trusted server quote rejects a stale client quote", async () => {
    const { createPostHandler } = await import("./handler");
    const { InvalidOrderError } = await import("../../../lib/orders/service");
    const handler = createPostHandler({ submitOrder: async () => { throw new InvalidOrderError(); }, attempt: () => true, clientIpHeader: "x-test-client-ip" });

    const response = await handler(jsonRequest(checkout));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "Cart items changed; review your cart" });
  });

  it("returns 201 with only the public order number", async () => {
    const { createPostHandler } = await import("./handler");
    const handler = createPostHandler({
      submitOrder: async () => ({ orderNumber: "PG-ABC234" }),
      attempt: () => true,
      clientIpHeader: "x-test-client-ip",
    });

    const response = await handler(jsonRequest(checkout));

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ orderNumber: "PG-ABC234" });
  });

  it("ignores caller-controlled forwarding headers when the trusted header is absent", async () => {
    const { createPostHandler } = await import("./handler");
    const { createMemoryRateLimiter } = await import("../../../lib/orders/rate-limit");
    const limiter = createMemoryRateLimiter({ now: () => 1_000 });
    const handler = createPostHandler({
      submitOrder: async () => ({ orderNumber: "PG-ABC234" }),
      attempt: (key) => limiter.attempt(key),
      clientIpHeader: "x-vercel-forwarded-for",
    });

    const responses = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(
        await handler(
          jsonRequest(checkout, {
            "x-forwarded-for": `203.0.113.${attempt + 1}`,
            "x-real-ip": `198.51.100.${attempt + 1}`,
          }),
        ),
      );
    }

    expect(responses.map((response) => response.status)).toEqual([201, 201, 201, 201, 201, 429]);
  });

  it("uses a configured header only when it contains one valid IP token", async () => {
    const { createPostHandler } = await import("./handler");
    const attemptedKeys: string[] = [];
    const handler = createPostHandler({
      submitOrder: async () => ({ orderNumber: "PG-ABC234" }),
      attempt: (key) => {
        attemptedKeys.push(key);
        return true;
      },
      clientIpHeader: "x-vercel-forwarded-for",
    });

    await handler(
      jsonRequest(checkout, {
        "x-vercel-forwarded-for": "203.0.113.42",
        "x-forwarded-for": "198.51.100.1",
      }),
    );
    await handler(
      jsonRequest(checkout, {
        "x-vercel-forwarded-for": "203.0.113.42",
        "x-forwarded-for": "198.51.100.2",
      }),
    );
    await handler(jsonRequest(checkout, { "x-vercel-forwarded-for": "203.0.113.42, 198.51.100.1" }));
    await handler(jsonRequest(checkout, { "x-vercel-forwarded-for": "not-an-ip" }));

    expect(attemptedKeys[0]).toBe(attemptedKeys[1]);
    expect(attemptedKeys[0]).not.toBe(attemptedKeys[2]);
    expect(attemptedKeys[2]).toBe(attemptedKeys[3]);
  });
});

describe("order attempt rate limiter", () => {
  it("blocks attempts that remain inside the sliding window after its original boundary", async () => {
    const { createMemoryRateLimiter } = await import("../../../lib/orders/rate-limit");
    let currentTime = 0;
    const limiter = createMemoryRateLimiter({ limit: 5, windowMs: 10_000, now: () => currentTime });

    expect(limiter.attempt("client-a")).toBe(true);
    currentTime = 9_999;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      expect(limiter.attempt("client-a")).toBe(true);
    }
    currentTime = 10_000;
    expect(limiter.attempt("client-a")).toBe(true);
    expect(limiter.attempt("client-a")).toBe(false);
  });

  it("fails closed for unseen client keys when its bounded map is full", async () => {
    const { createMemoryRateLimiter } = await import("../../../lib/orders/rate-limit");
    const limiter = createMemoryRateLimiter({ maxEntries: 2, now: () => 1_000 });

    expect(limiter.attempt("client-a")).toBe(true);
    expect(limiter.attempt("client-b")).toBe(true);
    expect(limiter.attempt("client-c")).toBe(false);
  });

  it("prunes expired windows before admitting a new attempt", async () => {
    const { createMemoryRateLimiter } = await import("../../../lib/orders/rate-limit");
    let currentTime = 1_000;
    const limiter = createMemoryRateLimiter({ limit: 1, windowMs: 10_000, now: () => currentTime });

    expect(limiter.attempt("client-a")).toBe(true);
    expect(limiter.attempt("client-a")).toBe(false);
    currentTime = 11_000;
    expect(limiter.attempt("client-a")).toBe(true);
  });
});
