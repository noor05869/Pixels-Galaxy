import "server-only";
import { z } from "zod";

export type SupabaseConfig = {
  supabaseUrl: string;
  supabaseSecretKey: string;
};

export type NotificationConfig = {
  siteUrl: string;
  resendApiKey: string;
  notificationEmail: string;
  fromEmail: string;
};

export type AdminConfig = {
  adminPasswordHash: string;
  adminSessionSecret: string;
};

export type OrderApiConfig = {
  clientIpHeader: string;
};

const supabaseConfigSchema = z.object({
  supabaseUrl: z.url(),
  supabaseSecretKey: z.string().min(1),
});

const notificationConfigSchema = z.object({
  siteUrl: z.url(),
  resendApiKey: z.string().min(1),
  notificationEmail: z.email(),
  fromEmail: z.string().min(1),
});

const adminConfigSchema = z.object({
  adminPasswordHash: z.string().min(1),
  adminSessionSecret: z.string().min(1),
});

const orderApiConfigSchema = z.object({
  clientIpHeader: z
    .string()
    .trim()
    .regex(/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/)
    .transform((value) => value.toLowerCase()),
});

function parseConfig<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error("Server configuration is incomplete");
  return result.data;
}

export function getSupabaseConfig(): SupabaseConfig {
  return parseConfig(supabaseConfigSchema, {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
  });
}

export function getNotificationConfig(): NotificationConfig {
  return parseConfig(notificationConfigSchema, {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    resendApiKey: process.env.RESEND_API_KEY,
    notificationEmail: process.env.ORDER_NOTIFICATION_EMAIL,
    fromEmail: process.env.ORDER_FROM_EMAIL,
  });
}

export function getAdminConfig(): AdminConfig {
  return parseConfig(adminConfigSchema, {
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
  });
}

export function getOrderApiConfig(): OrderApiConfig {
  return parseConfig(orderApiConfigSchema, {
    clientIpHeader: process.env.ORDER_CLIENT_IP_HEADER,
  });
}
