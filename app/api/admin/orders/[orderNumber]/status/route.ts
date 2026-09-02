import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "../../../../../../lib/admin/session";
import { updateOrderStatus } from "../../../../../../lib/orders/repository";
import { createStatusHandler } from "./handler";
import type { StatusRouteContext } from "./handler";

async function authenticateAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return Boolean(token && (await verifyAdminSession(token)));
}

export async function PATCH(request: Request, context: StatusRouteContext): Promise<Response> {
  return createStatusHandler({ authenticate: authenticateAdmin, updateOrderStatus })(request, context);
}
