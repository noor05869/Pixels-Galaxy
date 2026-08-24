import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const serverEnvironment = {
  NEXT_PUBLIC_SITE_URL: "https://store.example.pk",
  SUPABASE_URL: "https://project-ref.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_test",
  RESEND_API_KEY: "re_test",
  ORDER_NOTIFICATION_EMAIL: "orders@example.pk",
  ORDER_FROM_EMAIL: "Pixels Galaxy Orders <orders@example.pk>",
  ADMIN_PASSWORD_HASH: "scrypt$salt$hash",
  ADMIN_SESSION_SECRET: "a-secure-session-secret-with-32-bytes",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getServerConfig", () => {
  it("waits to reject incomplete provider configuration until it is called", async () => {
    vi.stubEnv("SUPABASE_URL", "");

    const { getServerConfig } = await import("./server");

    expect(() => getServerConfig()).toThrow("Server configuration is incomplete");
  });

  it("returns the configured server values", async () => {
    for (const [key, value] of Object.entries(serverEnvironment)) {
      vi.stubEnv(key, value);
    }

    const { getServerConfig } = await import("./server");

    expect(getServerConfig()).toEqual({
      siteUrl: "https://store.example.pk",
      supabaseUrl: "https://project-ref.supabase.co",
      supabaseSecretKey: "sb_secret_test",
      resendApiKey: "re_test",
      notificationEmail: "orders@example.pk",
      fromEmail: "Pixels Galaxy Orders <orders@example.pk>",
      adminPasswordHash: "scrypt$salt$hash",
      adminSessionSecret: "a-secure-session-secret-with-32-bytes",
    });
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
