"use client";
import { MessageCircle, Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import type { Product } from "@/lib/storefront/types";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Price } from "@/components/ui/Price";
import { Stars } from "@/components/ui/Stars";
import { useCart } from "@/components/cart/CartProvider";
import { createWhatsAppOrderLink } from "@/lib/whatsapp/order-link";
export function ProductCard({ product }: { product: Product }) { const video = useRef<HTMLVideoElement>(null); const [playing, setPlaying] = useState(false); const media = product.media.find((item) => item.type === "image") ?? product.media[0]; const { addItem } = useCart();
  const enter = async () => { if (!media.hoverVideo || matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return; try { await video.current?.play(); setPlaying(true); } catch {} };
  const leave = () => { if (!video.current) return; video.current.pause(); video.current.currentTime = 0; setPlaying(false); };
  const action = () => { if (media.actionLabel === "ADD TO CART") addItem({ productId: product.id, name: product.name, image: media.src, unitPrice: product.price, quantity: 1, bundleId: "card" }); else document.querySelector("#featured input")?.scrollIntoView({ behavior: "smooth", block: "center" }); };
  const actionText = media.actionLabel === "ADD TO CART" ? "ADD TO CART" : "VIEW KU STRING";
  const whatsappLink = createWhatsAppOrderLink({ productName: product.name, bundleLabel: product.bundles[0]?.label ?? "Standard", quantity: 1, total: product.price });
  return <article className="product-card" onPointerEnter={enter} onPointerLeave={leave} onFocus={enter} onBlur={leave}><div className="card-media"><MediaFrame media={media} />{media.hoverVideo && <video ref={video} className="card-hover-video" muted loop playsInline preload="metadata" aria-label={`${product.name} demonstration`}><source src={media.hoverVideo} type="video/mp4" /></video>}<span className="card-play-state" aria-hidden="true">{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</span><button className="card-action" onClick={action}>{actionText}</button>{product.badge && <span className="product-badge">{product.badge}</span>}</div><div className="product-copy"><h3>{product.name}</h3><Price amount={product.price} compareAt={product.compareAt} />{product.reviews > 0 && <Stars rating={product.rating} count={product.reviews} />}<div className="swatches" aria-label="Available colours">{product.swatches.map((color) => <span key={color} style={{ background: color }} />)}</div><a className="whatsapp-buy whatsapp-buy-card" href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${product.name} on WhatsApp`}><MessageCircle aria-hidden="true" /> BUY ON WHATSAPP</a></div></article>; }
