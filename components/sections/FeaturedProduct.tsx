import { featuredProduct } from "@/lib/storefront/content";
import { ProductGallery } from "@/components/store/ProductGallery";
import { PurchasePanel } from "@/components/store/PurchasePanel";
export function FeaturedProduct() { return <section id="featured" className="featured"><ProductGallery media={featuredProduct.media} /><PurchasePanel product={featuredProduct} /></section>; }
