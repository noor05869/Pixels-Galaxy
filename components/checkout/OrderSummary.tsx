import Image from "next/image";

import type { CartLine } from "@/lib/cart/types";
import { Price } from "@/components/ui/Price";
import { products } from "@/lib/storefront/content";

export function OrderSummary({ lines }: { lines: CartLine[] }) {
  const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  return (
    <aside className="sticky top-6 rounded-[20px] border border-[#d9e3ef] bg-white p-[clamp(24px,3vw,34px)] shadow-[0_12px_35px_rgba(6,27,67,.08)] max-[820px]:static max-[820px]:row-start-1 max-[560px]:px-[18px] max-[560px]:py-[22px]" aria-labelledby="order-summary-title">
      <p className="mb-[9px] mt-0 text-xs font-[1000] tracking-[.18em] text-[#087998]">YOUR ORDER</p>
      <h2 className="m-0 text-[clamp(25px,3vw,34px)] leading-none uppercase" id="order-summary-title">Order summary</h2>
      <div className="mt-6 border-t border-[#dce5f0]">
        {lines.map((line) => (
          <article className="grid grid-cols-[66px_minmax(0,1fr)_auto] items-center gap-[13px] border-b border-[#dce5f0] py-[18px] max-[560px]:grid-cols-[58px_minmax(0,1fr)] max-[560px]:gap-3 [&>span:last-child]:whitespace-nowrap [&>span:last-child]:text-[13px] max-[560px]:[&>span:last-child]:col-start-2 max-[560px]:[&>span:last-child]:mt-[-5px]" key={`${line.productId}-${line.bundleId}-${line.colors?.join("-") ?? ""}`}>
            <div className="relative size-[66px] max-[560px]:size-[58px]">
              <Image className="size-[66px] rounded-[9px] object-cover max-[560px]:size-[58px]" src={line.image} alt="" width={80} height={80} />
              <span className="absolute right-[-7px] top-[-8px] grid h-[23px] min-w-[23px] place-items-center rounded-full bg-orange px-1.5 text-[11px] font-[1000] text-navy" aria-label={`Quantity ${line.quantity}`}>{line.quantity}</span>
            </div>
            <div className="min-w-0 [&_small]:mt-[5px] [&_small]:block [&_small]:text-[11px] [&_small]:uppercase [&_small]:text-[#718096] [&_strong]:block [&_strong]:text-sm [&_strong]:leading-[1.3]">
              <strong>{line.name}</strong>
              <small>{products.find((product) => product.id === line.productId)?.bundles.find((bundle) => bundle.id === line.bundleId)?.label ?? line.bundleId.replaceAll("-", " ")}</small>
              {line.colors ? <small>{line.colors.map((color) => color[0].toUpperCase() + color.slice(1)).join(" + ")}</small> : null}
            </div>
            <Price amount={line.unitPrice * line.quantity} />
          </article>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4 px-0 pb-2 pt-[22px] text-[17px] font-[1000] [&>span:last-child]:text-xl">
        <span>Total</span>
        <Price amount={total} />
      </div>
      <p className="mb-0 mt-[15px] rounded-[10px] bg-[#e9fff6] p-[13px] text-xs font-[800] leading-[1.5] text-[#25674e]">Cash on Delivery. You will pay when your order arrives.</p>
    </aside>
  );
}
