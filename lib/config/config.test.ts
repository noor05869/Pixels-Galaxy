import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const serverEnvironmentKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "RESEND_API_KEY",
  "ORDER_NOTIFICATION_EMAIL",
  "ORDER_FROM_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_SESSION_SECRET",
  "ADMIN_CLIENT_IP_HEADER",
  "ORDER_CLIENT_IP_HEADER",
] as const;

function clearServerEnvironment(): void {
  for (const key of serverEnvironmentKeys) vi.stubEnv(key, "");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("server configuration by responsibility", () => {
  it("loads Supabase settings without requiring notification or admin settings", async () => {
    clearServerEnvironment();
    vi.stubEnv("SUPABASE_URL", "https://project-ref.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test");
    const { getSupabaseConfig } = await import("./server");

    expect(getSupabaseConfig()).toEqual({
      supabaseUrl: "https://project-ref.supabase.co",
      supabaseSecretKey: "sb_secret_test",
    });
  });

  it("loads notification settings without requiring Supabase or admin settings", async () => {
    clearServerEnvironment();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://store.example.pk");
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("ORDER_NOTIFICATION_EMAIL", "orders@example.pk");
    vi.stubEnv("ORDER_FROM_EMAIL", "Pixels Galaxy Orders <orders@example.pk>");
    const { getNotificationConfig } = await import("./server");

    expect(getNotificationConfig()).toEqual({
      siteUrl: "https://store.example.pk",
      resendApiKey: "re_test",
      notificationEmail: "orders@example.pk",
      fromEmail: "Pixels Galaxy Orders <orders@example.pk>",
    });
  });

  it("loads admin settings without requiring provider settings", async () => {
    clearServerEnvironment();
    vi.stubEnv("ADMIN_PASSWORD_HASH", "scrypt$salt$hash");
    vi.stubEnv("ADMIN_SESSION_SECRET", "a-secure-session-secret-with-32-bytes");
    const { getAdminConfig } = await import("./server");

    expect(getAdminConfig()).toEqual({
      adminPasswordHash: "scrypt$salt$hash",
      adminSessionSecret: "a-secure-session-secret-with-32-bytes",
    });
  });

  it("normalizes the configured trusted client IP header", async () => {
    clearServerEnvironment();
    vi.stubEnv("ORDER_CLIENT_IP_HEADER", "X-Vercel-Forwarded-For");
    const { getOrderApiConfig } = await import("./server");

    expect(getOrderApiConfig()).toEqual({ clientIpHeader: "x-vercel-forwarded-for" });
  });

  it("loads the admin trusted client identity header independently", async () => {
    clearServerEnvironment();
    vi.stubEnv("ADMIN_CLIENT_IP_HEADER", "X-Edge-Client-IP");
    const { getAdminRateLimitConfig } = await import("./server");

    expect(getAdminRateLimitConfig()).toEqual({ clientIpHeader: "x-edge-client-ip" });
  });

  it("returns one generic error for an incomplete responsibility", async () => {
    clearServerEnvironment();
    const { getSupabaseConfig } = await import("./server");

    expect(() => getSupabaseConfig()).toThrow("Server configuration is incomplete");
  });
});

describe("whatsappNumber", () => {
  it("removes non-digits from the public setting", async () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+92 (332) 446-8116");

    const { whatsappNumber } = await import("./public");

    expect(whatsappNumber).toBe("923324468116");
  });

  it("uses the Pakistan fallback when the public setting is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");

    const { whatsappNumber } = await import("./public");

    expect(whatsappNumber).toBe("923324468116");
  });
});
