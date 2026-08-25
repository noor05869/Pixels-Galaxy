import "server-only";

import { createOrderNumber as generateOrderNumber } from "./order-number";
import { sendOrderNotification } from "./notification";
import { priceOrder } from "./pricing";
import {
  createOrder,
  OrderNumberCollisionError,
  setNotificationState,
  type OrdersRepository,
} from "./repository";
import type { NewOrder, StoredOrder } from "./types";
import { parseCheckoutInput } from "./validation";

const MAX_ORDER_NUMBER_ATTEMPTS = 3;

type OrderServiceRepository = Pick<OrdersRepository, "createOrder" | "setNotificationState">;

export type OrderServiceDependencies = {
  repository: OrderServiceRepository;
  notify: (order: StoredOrder) => Promise<void>;
  createOrderNumber: () => string;
};

export class InvalidOrderError extends Error {
  constructor() {
    super("Invalid order");
    this.name = "InvalidOrderError";
  }
}

async function persistWithUniqueOrderNumber(
  orderWithoutNumber: Omit<NewOrder, "orderNumber">,
  dependencies: OrderServiceDependencies,
): Promise<StoredOrder> {
  for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt += 1) {
    try {
      return await dependencies.repository.createOrder({
        ...orderWithoutNumber,
        orderNumber: dependencies.createOrderNumber(),
      });
    } catch (error) {
      if (!(error instanceof OrderNumberCollisionError)) throw error;
      if (attempt === MAX_ORDER_NUMBER_ATTEMPTS - 1) throw new Error("Order storage failed");
    }
  }

  throw new Error("Order storage failed");
}

export function createOrderService(
  dependencies: OrderServiceDependencies,
): (value: unknown) => Promise<{ orderNumber: string }> {
  return async (value) => {
    const input = parseCheckoutInput(value);
    let pricedOrder: ReturnType<typeof priceOrder>;
    try {
      pricedOrder = priceOrder(input.items);
    } catch {
      throw new InvalidOrderError();
    }
    const savedOrder = await persistWithUniqueOrderNumber(
      {
        customerName: input.customerName,
        phone: input.phone,
        ...(input.email ? { email: input.email } : {}),
        city: input.city,
        address: input.address,
        ...(input.notes ? { notes: input.notes } : {}),
        paymentMethod: "cod",
        currency: "PKR",
        total: pricedOrder.total,
        status: "new",
        items: pricedOrder.items,
        notificationState: "failed",
      },
      dependencies,
    );

    try {
      await dependencies.notify(savedOrder);
    } catch {
      // The pessimistic durable state already records this delivery failure.
      return { orderNumber: savedOrder.orderNumber };
    }

    try {
      await dependencies.repository.setNotificationState(savedOrder.id, "sent");
    } catch {
      // Notification bookkeeping is best effort after a durable order and successful send.
    }

    return { orderNumber: savedOrder.orderNumber };
  };
}

const defaultService = createOrderService({
  repository: { createOrder, setNotificationState },
  notify: sendOrderNotification,
  createOrderNumber: generateOrderNumber,
});

export function submitOrder(value: unknown): Promise<{ orderNumber: string }> {
  return defaultService(value);
}
