import type { StoredOrder } from "../../lib/orders/types";
import {
  formatOrderTimestamp,
  formatPkr,
  notificationLabel,
} from "./orderPresentation";
import { OrderStatusForm } from "./OrderStatusForm";
import { provinceNameForCode } from "../../lib/locations/pakistan";

type OrderDetailProps = {
  order: StoredOrder;
};
const panelClass = "rounded-[18px] border border-[#d9e3ef] bg-white p-[clamp(24px,3vw,36px)] shadow-[0_12px_35px_rgba(6,27,67,.07)] [&>h2]:m-0 [&>h2]:text-[clamp(25px,3vw,34px)] [&>h2]:uppercase [&>h2]:text-navy";
const kickerClass = "mb-2.5 mt-0 text-xs font-[1000] tracking-[.18em] text-[#087998]";

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(300px,.65fr)] items-start gap-6 max-[960px]:grid-cols-1">
      <div className="grid gap-6">
        <section className={panelClass} aria-labelledby="delivery-heading">
          <div className="mb-6">
            <p className={kickerClass}>Delivery</p>
            <h2 className="m-0 text-[clamp(25px,3vw,34px)] uppercase text-navy" id="delivery-heading">Customer information</h2>
          </div>
          <dl className="m-0 grid grid-cols-2 gap-x-[30px] gap-y-[22px] [user-select:text] max-[480px]:grid-cols-1 [&_*]:[user-select:text] [&>div]:min-w-0 [&_dt]:mb-1.5 [&_dt]:text-[11px] [&_dt]:font-[900] [&_dt]:uppercase [&_dt]:tracking-[.08em] [&_dt]:text-[#6e8097] [&_dd]:m-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:font-[800] [&_dd]:leading-[1.5] [&_dd]:text-[#203b60] [&_address]:whitespace-pre-wrap [&_address]:not-italic [&_a]:underline [&_a]:underline-offset-3">
            <div><dt>Name</dt><dd>{order.customerName}</dd></div>
            <div><dt>Phone</dt><dd><a href={`tel:${order.phone}`}>{order.phone}</a></dd></div>
            {order.email ? <div><dt>Email</dt><dd><a href={`mailto:${order.email}`}>{order.email}</a></dd></div> : null}
            <div><dt>City</dt><dd>{order.city}</dd></div>
            {order.province ? <div><dt>Province / territory</dt><dd>{provinceNameForCode(order.province)}</dd></div> : null}
            {order.postalCode ? <div><dt>Postal code</dt><dd>{order.postalCode}</dd></div> : null}
            <div><dt>Address</dt><dd><address>{order.address}</address></dd></div>
            {order.landmark ? <div><dt>Landmark</dt><dd>{order.landmark}</dd></div> : null}
            {order.addressType ? <div><dt>Address type</dt><dd>{order.addressType === "home" ? "Home" : "Office"}</dd></div> : null}
            {order.notes ? <div className="col-span-full max-[480px]:col-span-1"><dt>Order notes</dt><dd>{order.notes}</dd></div> : null}
          </dl>
        </section>

        <section className={panelClass} aria-labelledby="items-heading">
          <div className="mb-6">
            <p className={kickerClass}>Order snapshot</p>
            <h2 className="m-0 text-[clamp(25px,3vw,34px)] uppercase text-navy" id="items-heading">Items</h2>
            <p className="mb-0 mt-2.5 text-[13px] leading-[1.5] text-[#667991]">Captured at checkout and cannot be edited.</p>
          </div>
          <ul className="m-0 grid list-none gap-3.5 p-0 [&>li]:grid [&>li]:grid-cols-[minmax(0,1fr)_auto] [&>li]:gap-[22px] [&>li]:rounded-[13px] [&>li]:border [&>li]:border-[#dce5f0] [&>li]:bg-[#f8fbff] [&>li]:p-5 max-[760px]:[&>li]:grid-cols-1 [&>li>div]:grid [&>li>div]:gap-1.5 [&_strong]:text-[17px] [&_span]:text-xs [&_span]:font-[700] [&_span]:text-[#667991] [&_dl]:m-0 [&_dl]:grid [&_dl]:grid-cols-[repeat(2,auto)] [&_dl]:gap-6 [&_dl]:text-right max-[760px]:[&_dl]:text-left max-[480px]:[&_dl]:grid-cols-1 [&_dt]:mb-1.5 [&_dt]:text-[11px] [&_dt]:font-[900] [&_dt]:uppercase [&_dt]:tracking-[.08em] [&_dt]:text-[#6e8097] [&_dd]:m-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:font-[800] [&_dd]:leading-[1.5] [&_dd]:text-[#203b60]">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.bundleId}-${item.colors?.join("-") ?? ""}`}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.bundleLabel}</span>
                  {item.colors ? <span>Colours: {item.colors.join(" + ")}</span> : null}
                  <span>Quantity {item.quantity}</span>
                </div>
                <dl>
                  <div><dt>Unit price</dt><dd>{formatPkr(item.unitPrice)}</dd></div>
                  <div><dt>Line total</dt><dd>{formatPkr(item.lineTotal)}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
          <div className="mt-[22px] flex items-center justify-between gap-[18px] border-t-2 border-[#dce5f0] pt-[22px] text-[19px] font-[1000]"><span>Order total</span><strong>{formatPkr(order.total)}</strong></div>
        </section>
      </div>

      <aside className="grid gap-6 max-[960px]:grid-cols-2 max-[760px]:grid-cols-1" aria-label="Order administration">
        <section className={panelClass}>
          <p className={kickerClass}>Fulfilment</p>
          <h2>Order status</h2>
          <OrderStatusForm orderNumber={order.orderNumber} currentStatus={order.status} />
        </section>

        <section className={panelClass}>
          <p className={kickerClass}>Record</p>
          <h2>Order details</h2>
          <dl className="mt-[22px] grid gap-[18px] [&>div]:min-w-0 [&>div]:border-b [&>div]:border-[#e0e8f1] [&>div]:pb-4 [&>div:last-child]:border-b-0 [&>div:last-child]:pb-0 [&_dt]:mb-1.5 [&_dt]:text-[11px] [&_dt]:font-[900] [&_dt]:uppercase [&_dt]:tracking-[.08em] [&_dt]:text-[#6e8097] [&_dd]:m-0 [&_dd]:[overflow-wrap:anywhere] [&_dd]:font-[800] [&_dd]:leading-[1.5] [&_dd]:text-[#203b60]">
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
