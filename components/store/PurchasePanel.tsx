"use client";
import { Check, MessageCircle, Minus, Plus, Share2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/storefront/types";
import { createWhatsAppOrderLink } from "@/lib/whatsapp/order-link";
import { Price } from "@/components/ui/Price";
import { Stars } from "@/components/ui/Stars";
import { useCart } from "@/components/cart/CartProvider";

export function PurchasePanel({ product }: { product: Product }) { const [bundle, setBundle] = useState(product.bundles[0]); const [quantity, setQuantity] = useState(bundle.quantity); const [message, setMessage] = useState(""); const { addItem } = useCart();
  const choose = (id: string) => { const next = product.bundles.find((x) => x.id === id)!; setBundle(next); setQuantity(next.quantity); };
  const add = () => { addItem({ productId: product.id, name: product.name, image: product.media[0].src, unitPrice: bundle.unitPrice, quantity, bundleId: bundle.id }); setMessage(`${product.name} added to your bag.`); };
  const whatsappLink = createWhatsAppOrderLink({ productName: product.name, bundleLabel: bundle.label, quantity, total: bundle.unitPrice * quantity });
  const icons = [ShieldCheck, Sparkles, Zap, Check];
  return <div className="purchase-panel"><p className="kicker">PAKISTAN'S FUN TOY</p><h2>{product.name}</h2><Stars rating={product.rating} count={product.reviews} /><p className="product-description">{product.description}</p><div className="benefits">{product.benefits.map((benefit, index) => { const Icon = icons[index]; return <div key={benefit.title}><Icon /><p><strong>{benefit.title}</strong><span>{benefit.text}</span></p></div>; })}</div><p className="stock"><span /> IN STOCK — READY TO SHIP</p><fieldset className="bundles"><legend>CHOOSE YOUR ZIPSTRING</legend>{product.bundles.map((item) => <label key={item.id} className={bundle.id === item.id ? "selected" : ""}><input type="radio" name="bundle" checked={bundle.id === item.id} onChange={() => choose(item.id)} /><span><strong>{item.label}</strong>{item.badge && <small>{item.badge}</small>}</span><Price amount={item.unitPrice} compareAt={item.compareAt} /></label>)}</fieldset><div className="purchase-actions"><div className="quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(99, quantity + 1))}><Plus /></button></div><button className="add-cart" onClick={add}>ADD TO CART</button><a className="whatsapp-buy whatsapp-buy-featured" href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${product.name} on WhatsApp`}><MessageCircle aria-hidden="true" /> BUY ON WHATSAPP</a></div><p className="sr-only" aria-live="polite">{message}</p><button className="share"><Share2 /> Share with friends</button></div>;
}
