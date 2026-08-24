import "server-only";
import { z } from "zod";

export type ServerConfig = {
  siteUrl: string;
  supabaseUrl: string;
  supabaseSecretKey: string;
  resendApiKey: string;
  notificationEmail: string;
  fromEmail: string;
  adminPasswordHash: string;
  adminSessionSecret: string;
};

const serverConfigSchema = z.object({
  siteUrl: z.url(),
  supabaseUrl: z.url(),
  supabaseSecretKey: z.string().min(1),
  resendApiKey: z.string().min(1),
  notificationEmail: z.email(),
  fromEmail: z.string().min(1),
  adminPasswordHash: z.string().min(1),
  adminSessionSecret: z.string().min(1),
});

export function getServerConfig(): ServerConfig {
  const result = serverConfigSchema.safeParse({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    notificationEmail: process.env.ORDER_NOTIFICATION_EMAIL,
    fromEmail: process.env.ORDER_FROM_EMAIL,
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
  });

  if (!result.success) {
    throw new Error("Server configuration is incomplete");
  }

  return result.data;
}
