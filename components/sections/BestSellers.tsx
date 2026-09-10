import { products } from "@/lib/storefront/content";
import { ProductCard } from "@/components/store/ProductCard";

export function BestSellers() {
  return <section id="shop" className="mx-auto mb-[22px] w-[min(calc(100%_-_24px),1400px)] rounded-brand border border-[#2c3943] bg-[#17212b] p-[clamp(28px,4vw,65px)] shadow-brand max-[540px]:px-4 max-[540px]:py-7"><h2 className="mb-3.5 mt-0 text-center text-[clamp(34px,4vw,62px)] font-[700] tracking-[-.04em] text-warm-white">SHOP KU STRING IN PAKISTAN</h2><p className="mx-auto mb-7 mt-0 max-w-[760px] text-center font-[600] leading-[1.6] text-[#9ca8b2]">One toy, three colours. Choose blue, green, or pink for PKR 1,999 with Cash on Delivery and delivery across Pakistan.</p><div className="grid animate-[tab-enter_.26s_ease] grid-cols-[minmax(0,440px)] justify-center gap-[18px] motion-reduce:animate-none">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
}
