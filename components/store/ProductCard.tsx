import type { Product } from "@/lib/storefront/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Price } from "@/components/ui/Price";
import { Stars } from "@/components/ui/Stars";
export function ProductCard({ product }: { product: Product }) { return <article className="product-card"><div className="card-media"><MediaFrame media={product.media[0]} />{product.badge && <span className="product-badge">{product.badge}</span>}</div><div className="product-copy"><h3>{product.name}</h3><Price amount={product.price} compareAt={product.compareAt} /><Stars rating={product.rating} count={product.reviews} /><div className="swatches" aria-label="Available colors">{product.swatches.map((color) => <span key={color} style={{ background: color }} />)}</div></div></article>; }
