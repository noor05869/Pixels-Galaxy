import Link from "next/link";

import type { StoredOrder } from "../../lib/orders/types";
import {
  formatOrderDate,
  formatPkr,
  notificationLabel,
  orderStatusLabel,
} from "./orderPresentation";

type OrdersTableProps = {
  orders: StoredOrder[];
};

function StatusBadge({ order }: { order: StoredOrder }) {
  return (
    <span className="admin-status" data-status={order.status}>
      {orderStatusLabel(order.status)}
    </span>
  );
}

function NotificationBadge({ order }: { order: StoredOrder }) {
  return (
    <span className="admin-notification" data-state={order.notificationState}>
      {notificationLabel(order.notificationState)}
    </span>
  );
}

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <section className="admin-empty" aria-labelledby="orders-empty-title">
        <h2 id="orders-empty-title">No orders yet</h2>
        <p>New Cash on Delivery orders will appear here.</p>
      </section>
    );
  }

  return (
    <div className="admin-orders-surface">
      <table className="admin-orders-table">
        <caption className="sr-only">Cash on Delivery orders, newest first</caption>
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Created</th>
            <th scope="col">Customer</th>
            <th scope="col">City</th>
            <th scope="col">Phone</th>
            <th scope="col">Total</th>
            <th scope="col">Notification</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link className="admin-order-link" href={`/admin/orders/${order.orderNumber}`}>
                  {order.orderNumber}
                </Link>
              </td>
              <td>{formatOrderDate(order.createdAt)}</td>
              <td className="admin-pii">{order.customerName}</td>
              <td>{order.city}</td>
              <td className="admin-pii">
                <a href={`tel:${order.phone}`}>{order.phone}</a>
              </td>
              <td>{formatPkr(order.total)}</td>
              <td><NotificationBadge order={order} /></td>
              <td><StatusBadge order={order} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="admin-order-cards" aria-label="Cash on Delivery orders, newest first">
        {orders.map((order) => (
          <li key={order.id}>
            <div className="admin-order-card-heading">
              <Link className="admin-order-link" href={`/admin/orders/${order.orderNumber}`}>
                {order.orderNumber}
              </Link>
              <StatusBadge order={order} />
            </div>
            <dl>
              <div><dt>Created</dt><dd>{formatOrderDate(order.createdAt)}</dd></div>
              <div><dt>Customer</dt><dd className="admin-pii">{order.customerName}</dd></div>
              <div><dt>City</dt><dd>{order.city}</dd></div>
              <div><dt>Phone</dt><dd className="admin-pii"><a href={`tel:${order.phone}`}>{order.phone}</a></dd></div>
              <div><dt>Total</dt><dd>{formatPkr(order.total)}</dd></div>
              <div><dt>Notification</dt><dd><NotificationBadge order={order} /></dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
