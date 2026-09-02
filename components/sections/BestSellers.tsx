import { products } from "@/lib/storefront/content";
import { ProductCard } from "@/components/store/ProductCard";

export function BestSellers() {
  return <section id="shop" className="panel shop-panel"><h2>SHOP KU STRING IN PAKISTAN</h2><p className="shop-intro">One toy, three colours. Choose blue, green, or pink for PKR 1,999 with Cash on Delivery and delivery across Pakistan.</p><div className="product-grid product-grid-single">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
}
