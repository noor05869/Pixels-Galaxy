import { featuredProduct } from "@/lib/storefront/content";
import { ProductGallery } from "@/components/store/ProductGallery";
import { PurchasePanel } from "@/components/store/PurchasePanel";
import { RotatingBadge } from "@/components/ui/RotatingBadge";
export function FeaturedProduct() { return <section id="featured" className="featured"><div className="featured-gallery-wrap"><RotatingBadge text="PIXELS • GALAXY • BEST SELLER •" /><ProductGallery media={featuredProduct.media} /></div><PurchasePanel product={featuredProduct} /></section>; }
