import type { CartLine } from "@/lib/cart/types";
import type { BundleOffer, Product } from "@/lib/storefront/types";

export const orderStatuses = ["new", "confirmed", "shipped", "completed", "cancelled"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type CheckoutCartItem = Pick<CartLine, "productId" | "bundleId" | "quantity" | "colors">;

export type CheckoutInput = {
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  notes?: string;
  consent: true;
  website?: string;
  expectedTotal: number;
  catalogueRevision: string;
  items: CheckoutCartItem[];
};

export type TrustedOrderItem = {
  productId: Product["id"];
  productName: Product["name"];
  bundleId: BundleOffer["id"];
  bundleLabel: BundleOffer["label"];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  colors?: CartLine["colors"];
};

export type NotificationState = "sent" | "failed";

export type NewOrder = {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: "cod";
  currency: "PKR";
  total: number;
  status: "new";
  items: TrustedOrderItem[];
  notificationState: "failed";
};

export type StoredOrder = Omit<NewOrder, "status" | "notificationState"> & {
  id: string;
  status: OrderStatus;
  notificationState: NotificationState;
  notificationFailure?: string;
  createdAt: string;
  updatedAt: string;
};
