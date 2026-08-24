"use client";
import { useState } from "react";
import { products } from "@/lib/storefront/content";
import { ProductCard } from "@/components/store/ProductCard";

export function BestSellers() {
  const [category, setCategory] = useState<"Best Sellers" | "String Packs">("Best Sellers");
  const visible = products.filter((product) => product.category === category);
  return <section id="shop" className="panel shop-panel"><h2>HAMARE BEST SELLERS</h2><div className="tabs" role="tablist" aria-label="Product categories">{(["Best Sellers", "String Packs"] as const).map((item) => <button key={item} role="tab" aria-selected={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="product-grid" key={category}>{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
}
