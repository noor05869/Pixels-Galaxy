import { featuredProduct } from "@/lib/storefront/content";
import { ProductGallery } from "@/components/store/ProductGallery";
import { PurchasePanel } from "@/components/store/PurchasePanel";
import { RotatingBadge } from "@/components/ui/RotatingBadge";
export function FeaturedProduct() { return <section id="featured" className="featured"><div className="featured-gallery-wrap"><RotatingBadge text="KU STRING • AGES 3+ • PAKISTAN •" /><ProductGallery media={featuredProduct.media} /></div><PurchasePanel product={featuredProduct} /></section>; }
