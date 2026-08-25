import type { StoredOrder } from "../../lib/orders/types";
import {
  formatOrderTimestamp,
  formatPkr,
  notificationLabel,
} from "./orderPresentation";
import { OrderStatusForm } from "./OrderStatusForm";

type OrderDetailProps = {
  order: StoredOrder;
};

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="admin-detail-grid">
      <div className="admin-detail-main">
        <section className="admin-panel" aria-labelledby="delivery-heading">
          <div className="admin-panel-heading">
            <p className="checkout-kicker">Delivery</p>
            <h2 id="delivery-heading">Customer information</h2>
          </div>
          <dl className="admin-detail-list admin-pii">
            <div><dt>Name</dt><dd>{order.customerName}</dd></div>
            <div><dt>Phone</dt><dd><a href={`tel:${order.phone}`}>{order.phone}</a></dd></div>
            {order.email ? <div><dt>Email</dt><dd><a href={`mailto:${order.email}`}>{order.email}</a></dd></div> : null}
            <div><dt>City</dt><dd>{order.city}</dd></div>
            <div><dt>Address</dt><dd><address>{order.address}</address></dd></div>
            {order.notes ? <div className="admin-detail-wide"><dt>Order notes</dt><dd>{order.notes}</dd></div> : null}
          </dl>
        </section>

        <section className="admin-panel" aria-labelledby="items-heading">
          <div className="admin-panel-heading">
            <p className="checkout-kicker">Order snapshot</p>
            <h2 id="items-heading">Items</h2>
            <p>Captured at checkout and cannot be edited.</p>
          </div>
          <ul className="admin-line-items">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.bundleId}`}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.bundleLabel}</span>
                  <span>Quantity {item.quantity}</span>
                </div>
                <dl>
                  <div><dt>Unit price</dt><dd>{formatPkr(item.unitPrice)}</dd></div>
                  <div><dt>Line total</dt><dd>{formatPkr(item.lineTotal)}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
          <div className="admin-order-total"><span>Order total</span><strong>{formatPkr(order.total)}</strong></div>
        </section>
      </div>

      <aside className="admin-detail-aside" aria-label="Order administration">
        <section className="admin-panel">
          <p className="checkout-kicker">Fulfilment</p>
          <h2>Order status</h2>
          <OrderStatusForm orderNumber={order.orderNumber} currentStatus={order.status} />
        </section>

        <section className="admin-panel">
          <p className="checkout-kicker">Record</p>
          <h2>Order details</h2>
          <dl className="admin-record-list">
            <div><dt>Payment</dt><dd>Cash on Delivery</dd></div>
            <div><dt>Currency</dt><dd>{order.currency}</dd></div>
            <div><dt>Email notification</dt><dd>{notificationLabel(order.notificationState)}</dd></div>
            <div><dt>Created</dt><dd>{formatOrderTimestamp(order.createdAt)}</dd></div>
            <div><dt>Last updated</dt><dd>{formatOrderTimestamp(order.updatedAt)}</dd></div>
          </dl>
        </section>
      </aside>
    </div>
  );
}
