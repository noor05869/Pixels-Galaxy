import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "./session";

export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || !(await verifyAdminSession(token))) redirect("/admin/login");
}
