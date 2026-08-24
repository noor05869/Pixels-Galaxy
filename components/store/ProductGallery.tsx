"use client";
import { useState } from "react";
import type { ProductMedia } from "@/lib/storefront/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function ProductGallery({ media }: { media: ProductMedia[] }) { const [active, setActive] = useState(0); const move=(delta:number)=>setActive((active+delta+media.length)%media.length); return <div className="product-gallery"><div className="gallery-main" key={media[active].id}><MediaFrame media={media[active]} /><button className="gallery-arrow previous" aria-label="Previous product media" onClick={()=>move(-1)}><ChevronLeft /></button><button className="gallery-arrow next" aria-label="Next product media" onClick={()=>move(1)}><ChevronRight /></button></div><p className="sr-only" aria-live="polite">Showing {media[active].alt}</p><div className="gallery-thumbs">{media.map((item, index) => <button key={item.id} aria-label={`View media ${index + 1}`} aria-current={index === active} onClick={() => setActive(index)}><MediaFrame media={item} /></button>)}</div></div>; }
