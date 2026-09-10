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
    <span className="inline-flex min-h-7 items-center whitespace-nowrap rounded-full bg-[#eaf1f8] px-2.5 py-[5px] text-[11px] font-[900] text-[#34506f] data-[status=cancelled]:bg-[#ffe5e7] data-[status=cancelled]:text-[#922630] data-[status=completed]:bg-[#ddf8eb] data-[status=completed]:text-[#22684b] data-[status=confirmed]:bg-[#dff1ff] data-[status=confirmed]:text-[#075b91] data-[status=new]:bg-[#fff2d8] data-[status=new]:text-[#805214] data-[status=shipped]:bg-[#e8e3ff] data-[status=shipped]:text-[#4a3c98]" data-status={order.status}>
      {orderStatusLabel(order.status)}
    </span>
  );
}

function NotificationBadge({ order }: { order: StoredOrder }) {
  return (
    <span className="inline-flex min-h-7 items-center whitespace-nowrap rounded-full bg-[#eaf1f8] px-2.5 py-[5px] text-[11px] font-[900] text-[#34506f] data-[state=failed]:bg-[#ffe5e7] data-[state=failed]:text-[#922630] data-[state=sent]:bg-[#ddf8eb] data-[state=sent]:text-[#22684b]" data-state={order.notificationState}>
      {notificationLabel(order.notificationState)}
    </span>
  );
}

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <section className="rounded-[18px] border border-[#d9e3ef] bg-white p-[clamp(28px,5vw,54px)] text-center shadow-[0_12px_35px_rgba(6,27,67,.07)] [&_h2]:m-0 [&_h2]:text-[clamp(27px,4vw,38px)] [&_h2]:uppercase [&_h2]:text-navy [&_p]:mx-auto [&_p]:mb-0 [&_p]:mt-3 [&_p]:max-w-[600px] [&_p]:font-[700] [&_p]:leading-[1.6] [&_p]:text-[#5d718c]" aria-labelledby="orders-empty-title">
        <h2 id="orders-empty-title">No orders yet</h2>
        <p>New Cash on Delivery orders will appear here.</p>
      </section>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[18px] border border-[#d9e3ef] bg-white shadow-[0_12px_35px_rgba(6,27,67,.07)] max-[760px]:overflow-visible max-[760px]:border-0 max-[760px]:bg-transparent max-[760px]:shadow-none">
      <table className="w-full min-w-[1060px] border-collapse text-left text-[13px] text-[#223d62] max-[760px]:hidden [&_th]:border-b [&_th]:border-[#e0e8f1] [&_th]:bg-[#eaf3fc] [&_th]:px-[15px] [&_th]:py-[18px] [&_th]:align-middle [&_th]:text-left [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-[.08em] [&_th]:text-[#4c627f] [&_td]:border-b [&_td]:border-[#e0e8f1] [&_td]:px-[15px] [&_td]:py-[18px] [&_td]:align-middle [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover]:bg-[#f8fbff]">
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
                <Link className="font-[1000] text-[#075ebf] underline decoration-2 underline-offset-4 outline-offset-3 focus-visible:outline-4 focus-visible:outline-[#075ebf] focus-visible:shadow-[0_0_0_7px_#fff]" href={`/admin/orders/${order.orderNumber}`}>
                  {order.orderNumber}
                </Link>
              </td>
              <td>{formatOrderDate(order.createdAt)}</td>
              <td className="[user-select:text] [&_*]:[user-select:text]">{order.customerName}</td>
              <td>{order.city}</td>
              <td className="[user-select:text] [&_*]:[user-select:text]">
                <a href={`tel:${order.phone}`}>{order.phone}</a>
              </td>
              <td>{formatPkr(order.total)}</td>
              <td><NotificationBadge order={order} /></td>
              <td><StatusBadge order={order} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="m-0 hidden list-none p-0 max-[760px]:grid max-[760px]:gap-3.5 max-[760px]:[&>li]:rounded-[15px] max-[760px]:[&>li]:border max-[760px]:[&>li]:border-[#d9e3ef] max-[760px]:[&>li]:bg-white max-[760px]:[&>li]:p-5 max-[760px]:[&>li]:shadow-[0_8px_24px_rgba(6,27,67,.07)]" aria-label="Cash on Delivery orders, newest first">
        {orders.map((order) => (
          <li key={order.id}>
            <div className="flex items-center justify-between gap-3.5 border-b border-[#e0e8f1] pb-[15px]">
              <Link className="font-[1000] text-[#075ebf] underline decoration-2 underline-offset-4 outline-offset-3 focus-visible:outline-4 focus-visible:outline-[#075ebf] focus-visible:shadow-[0_0_0_7px_#fff]" href={`/admin/orders/${order.orderNumber}`}>
                {order.orderNumber}
              </Link>
              <StatusBadge order={order} />
            </div>
            <dl className="mt-[18px] grid grid-cols-2 gap-4 max-[480px]:grid-cols-1 [&>div]:min-w-0 [&_dt]:text-[10px] [&_dt]:font-[900] [&_dt]:uppercase [&_dt]:tracking-[.08em] [&_dt]:text-[#6e8097] [&_dd]:mb-0 [&_dd]:mt-[5px] [&_dd]:[overflow-wrap:anywhere] [&_dd]:text-[13px] [&_dd]:font-[800] [&_dd]:text-[#203b60]">
              <div><dt>Created</dt><dd>{formatOrderDate(order.createdAt)}</dd></div>
              <div><dt>Customer</dt><dd className="[user-select:text] [&_*]:[user-select:text]">{order.customerName}</dd></div>
              <div><dt>City</dt><dd>{order.city}</dd></div>
              <div><dt>Phone</dt><dd className="[user-select:text] [&_*]:[user-select:text]"><a href={`tel:${order.phone}`}>{order.phone}</a></dd></div>
              <div><dt>Total</dt><dd>{formatPkr(order.total)}</dd></div>
              <div><dt>Notification</dt><dd><NotificationBadge order={order} /></dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
