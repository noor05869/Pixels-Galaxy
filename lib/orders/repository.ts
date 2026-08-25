import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerConfig } from "../config/server";

import type { NewOrder, NotificationState, OrderStatus, StoredOrder, TrustedOrderItem } from "./types";

export type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string;
  notes: string | null;
  payment_method: "cod";
  currency: "PKR";
  total: number;
  status: OrderStatus;
  items: TrustedOrderItem[];
  notification_state: NotificationState;
  notification_failure: string | null;
  created_at: string;
  updated_at: string;
};

export type NewOrderRow = Omit<OrderRow, "id" | "created_at" | "updated_at">;

export type OrdersDataSource = {
  insert(row: NewOrderRow): Promise<OrderRow>;
  selectMany(ordering: { column: "created_at"; ascending: false }): Promise<OrderRow[]>;
  selectByOrderNumber(orderNumber: string): Promise<OrderRow | null>;
  updateStatus(orderNumber: string, status: OrderStatus): Promise<OrderRow | null>;
  updateNotificationState(
    id: string,
    state: "sent" | "failed",
    failureNote: string | null,
  ): Promise<void>;
};

export type OrdersRepository = {
  createOrder(order: NewOrder): Promise<StoredOrder>;
  listOrders(): Promise<StoredOrder[]>;
  getOrderByNumber(orderNumber: string): Promise<StoredOrder | null>;
  updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<StoredOrder>;
  setNotificationState(
    id: string,
    state: "sent" | "failed",
    failureNote?: string,
  ): Promise<void>;
};

function toOrderRow(order: NewOrder): NewOrderRow {
  return {
    order_number: order.orderNumber,
    customer_name: order.customerName,
    phone: order.phone,
    email: order.email ?? null,
    city: order.city,
    address: order.address,
    notes: order.notes ?? null,
    payment_method: order.paymentMethod,
    currency: order.currency,
    total: order.total,
    status: order.status,
    items: order.items,
    notification_state: order.notificationState,
    notification_failure: null,
  };
}

function toStoredOrder(row: OrderRow): StoredOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    phone: row.phone,
    ...(row.email === null ? {} : { email: row.email }),
    city: row.city,
    address: row.address,
    ...(row.notes === null ? {} : { notes: row.notes }),
    paymentMethod: row.payment_method,
    currency: row.currency,
    total: row.total,
    status: row.status,
    items: row.items,
    notificationState: row.notification_state,
    ...(row.notification_failure === null ? {} : { notificationFailure: row.notification_failure }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeFailureNote(failureNote?: string): string | null {
  if (!failureNote) return null;

  const sanitized = failureNote.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
  return sanitized ? sanitized.slice(0, 300) : null;
}

export function createOrdersRepository(dataSource: OrdersDataSource): OrdersRepository {
  return {
    async createOrder(order) {
      return toStoredOrder(await dataSource.insert(toOrderRow(order)));
    },
    async listOrders() {
      const rows = await dataSource.selectMany({ column: "created_at", ascending: false });
      return rows.map(toStoredOrder);
    },
    async getOrderByNumber(orderNumber) {
      const row = await dataSource.selectByOrderNumber(orderNumber);
      return row === null ? null : toStoredOrder(row);
    },
    async updateOrderStatus(orderNumber, status) {
      const row = await dataSource.updateStatus(orderNumber, status);
      if (row === null) throw new Error("Order not found");

      return toStoredOrder(row);
    },
    async setNotificationState(id, state, failureNote) {
      await dataSource.updateNotificationState(
        id,
        state,
        state === "failed" ? sanitizeFailureNote(failureNote) : null,
      );
    },
  };
}

function createSupabaseDataSource(): OrdersDataSource {
  const config = getServerConfig();
  const client = createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });

  return {
    async insert(row) {
      const { data, error } = await client.from("orders").insert(row).select().single();
      if (error || !data) throw new Error("Order storage failed");

      return data as OrderRow;
    },
    async selectMany(ordering) {
      const { data, error } = await client.from("orders").select().order(ordering.column, {
        ascending: ordering.ascending,
      });
      if (error || !data) throw new Error("Order storage failed");

      return data as OrderRow[];
    },
    async selectByOrderNumber(orderNumber) {
      const { data, error } = await client
        .from("orders")
        .select()
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (error) throw new Error("Order storage failed");

      return data as OrderRow | null;
    },
    async updateStatus(orderNumber, status) {
      const { data, error } = await client
        .from("orders")
        .update({ status })
        .eq("order_number", orderNumber)
        .select()
        .maybeSingle();
      if (error) throw new Error("Order storage failed");

      return data as OrderRow | null;
    },
    async updateNotificationState(id, state, failureNote) {
      const { error } = await client
        .from("orders")
        .update({ notification_state: state, notification_failure: failureNote })
        .eq("id", id);
      if (error) throw new Error("Order storage failed");
    },
  };
}

let defaultRepository: OrdersRepository | undefined;

function getDefaultRepository(): OrdersRepository {
  defaultRepository ??= createOrdersRepository(createSupabaseDataSource());
  return defaultRepository;
}

export function createOrder(order: NewOrder): Promise<StoredOrder> {
  return getDefaultRepository().createOrder(order);
}

export function listOrders(): Promise<StoredOrder[]> {
  return getDefaultRepository().listOrders();
}

export function getOrderByNumber(orderNumber: string): Promise<StoredOrder | null> {
  return getDefaultRepository().getOrderByNumber(orderNumber);
}

export function updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<StoredOrder> {
  return getDefaultRepository().updateOrderStatus(orderNumber, status);
}

export function setNotificationState(
  id: string,
  state: "sent" | "failed",
  failureNote?: string,
): Promise<void> {
  return getDefaultRepository().setNotificationState(id, state, failureNote);
}
