import { featuredProduct } from "@/lib/storefront/content";
import { ProductGallery } from "@/components/store/ProductGallery";
import { PurchasePanel } from "@/components/store/PurchasePanel";
import { RotatingBadge } from "@/components/ui/RotatingBadge";
export function FeaturedProduct() { return <section id="featured" className="mx-auto mb-[110px] mt-[70px] grid w-[min(calc(100%_-_48px),1320px)] grid-cols-[1.1fr_.9fr] gap-[55px] max-[900px]:w-[min(calc(100%_-_24px),1320px)] max-[900px]:grid-cols-1"><div className="relative min-[901px]:sticky min-[901px]:top-6 min-[901px]:self-start"><RotatingBadge text="KU STRING • AGES 3+ • PAKISTAN •" /><ProductGallery media={featuredProduct.media} /></div><PurchasePanel product={featuredProduct} /></section>; }
