"use client";
import { useState } from "react";
import type { ProductMedia } from "@/lib/storefront/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
export function ProductGallery({ media }: { media: ProductMedia[] }) { const [active, setActive] = useState(0); return <div className="product-gallery"><MediaFrame media={media[active]} /><div className="gallery-thumbs">{media.map((item, index) => <button key={item.id} aria-label={`View media ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)}><MediaFrame media={item} /></button>)}</div></div>; }
