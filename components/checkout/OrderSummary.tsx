import Image from "next/image";

import type { CartLine } from "@/lib/cart/types";
import { Price } from "@/components/ui/Price";
import { products } from "@/lib/storefront/content";

export function OrderSummary({ lines }: { lines: CartLine[] }) {
  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  return (
    <aside className="checkout-summary" aria-labelledby="order-summary-title">
      <p className="checkout-kicker">YOUR ORDER</p>
      <h2 id="order-summary-title">Order summary</h2>
      <div className="checkout-summary-lines">
        {lines.map((line) => (
          <article className="checkout-summary-line" key={`${line.productId}-${line.bundleId}`}>
            <div className="checkout-summary-image">
              <Image src={line.image} alt="" width={80} height={80} />
              <span aria-label={`Quantity ${line.quantity}`}>{line.quantity}</span>
            </div>
            <div>
              <strong>{line.name}</strong>
              <small>{products.find((product) => product.id === line.productId)?.bundles.find((bundle) => bundle.id === line.bundleId)?.label ?? line.bundleId.replaceAll("-", " ")}</small>
            </div>
            <Price amount={line.unitPrice * line.quantity} />
          </article>
        ))}
      </div>
      <div className="checkout-total">
        <span>Total</span>
        <Price amount={total} />
      </div>
      <p className="checkout-cod-note">Cash on Delivery. You will pay when your order arrives.</p>
    </aside>
  );
}
