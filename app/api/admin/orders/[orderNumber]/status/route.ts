import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "../../../../../../lib/admin/session";
import { updateOrderStatus } from "../../../../../../lib/orders/repository";
import { orderStatuses } from "../../../../../../lib/orders/types";
import type { OrderStatus, StoredOrder } from "../../../../../../lib/orders/types";

const ORDER_NUMBER = /^PG-[A-Z0-9]{6}$/;

type StatusRouteContext = {
  params: Promise<{ orderNumber: string }>;
};

type StatusHandlerDependencies = {
  authenticate(): Promise<boolean>;
  updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<StoredOrder>;
};

function jsonResponse(body: Record<string, string>, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function statusFrom(value: unknown): OrderStatus | null {
  if (!value || typeof value !== "object") return null;
  const status = (value as { status?: unknown }).status;
  return typeof status === "string" && orderStatuses.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : null;
}

export function createStatusHandler(
  dependencies: StatusHandlerDependencies,
): (request: Request, context: StatusRouteContext) => Promise<Response> {
  return async (request, context) => {
    try {
      if (!(await dependencies.authenticate())) return jsonResponse({ error: "Unauthorized" }, 401);
    } catch {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { orderNumber } = await context.params;
    if (!ORDER_NUMBER.test(orderNumber)) {
      return jsonResponse({ error: "Invalid order update" }, 400);
    }

    let value: unknown;
    try {
      value = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid order update" }, 400);
    }

    const status = statusFrom(value);
    if (!status) return jsonResponse({ error: "Invalid order update" }, 400);

    try {
      const order = await dependencies.updateOrderStatus(orderNumber, status);
      return jsonResponse(
        {
          orderNumber: order.orderNumber,
          status: order.status,
          updatedAt: order.updatedAt,
        },
        200,
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Order not found") {
        return jsonResponse({ error: "Order not found" }, 404);
      }
      return jsonResponse({ error: "Order service unavailable" }, 503);
    }
  };
}

async function authenticateAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return Boolean(token && (await verifyAdminSession(token)));
}

export async function PATCH(request: Request, context: StatusRouteContext): Promise<Response> {
  return createStatusHandler({
    authenticate: authenticateAdmin,
    updateOrderStatus,
  })(request, context);
}
