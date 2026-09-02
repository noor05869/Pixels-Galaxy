"use client";
import { Check, MessageCircle, Minus, Plus, Share2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/storefront/types";
import { createWhatsAppOrderLink } from "@/lib/whatsapp/order-link";
import { Price } from "@/components/ui/Price";
import { Stars } from "@/components/ui/Stars";
import { useCart } from "@/components/cart/CartProvider";
import { kuStringColors, type KuStringColor } from "@/lib/cart/types";

const colorLabel = (color: KuStringColor) => color[0].toUpperCase() + color.slice(1);

export function PurchasePanel({ product }: { product: Product }) {
  const [bundle, setBundle] = useState(product.bundles.find((item) => item.id === "pick-any-two") ?? product.bundles[0]);
  const [quantity, setQuantity] = useState(bundle.quantity);
  const [colors, setColors] = useState<[KuStringColor, KuStringColor]>(["blue", "pink"]);
  const [message, setMessage] = useState("");
  const { addItem } = useCart();
  const choose = (id: string) => { const next = product.bundles.find((item) => item.id === id)!; setBundle(next); setQuantity(next.quantity); };
  const selectedColors = bundle.id === "pick-any-two" ? colors : undefined;
  const bundleLabel = selectedColors ? `${bundle.label} (${selectedColors.map(colorLabel).join(" + ")})` : bundle.label;
  const productImage = product.media.find((item) => item.type === "image")?.src ?? product.media[0].poster ?? product.media[0].src;
  const add = () => { addItem({ productId: product.id, name: product.name, image: productImage, unitPrice: bundle.unitPrice, quantity, bundleId: bundle.id, bundleQuantity: bundle.quantity, ...(selectedColors ? { colors: selectedColors } : {}) }); setMessage(`${product.name} added to your bag.`); };
  const whatsappLink = createWhatsAppOrderLink({ productName: product.name, bundleLabel, quantity, total: bundle.unitPrice * quantity });
  const icons = [ShieldCheck, Sparkles, Zap, Check];
  return <div className="purchase-panel"><p className="kicker">STRING SHOOTER TOY • AGES 3+</p><h2>{product.name}</h2>{product.reviews > 0 && <Stars rating={product.rating} count={product.reviews} />}<p className="product-description">{product.description}</p>
    <div className="benefits">{product.benefits.map((benefit, index) => { const Icon = icons[index]; return <div key={benefit.title}><Icon /><p><strong>{benefit.title}</strong><span>{benefit.text}</span></p></div>; })}</div>
    <p className="stock"><span /> 502 PIECES IN TOTAL STOCK</p>
    <fieldset className="bundles"><legend>CHOOSE YOUR OPTION</legend>{product.bundles.map((item) => <label key={item.id} className={bundle.id === item.id ? "selected" : ""}><input type="radio" name="bundle" checked={bundle.id === item.id} onChange={() => choose(item.id)} /><span><strong>{item.label}</strong>{item.badge && <small>{item.badge}</small>}</span><Price amount={item.unitPrice * item.quantity} compareAt={item.compareAt ? item.compareAt * item.quantity : undefined} /></label>)}</fieldset>
    {bundle.id === "pick-any-two" ? <fieldset className="bundle-colors"><legend>PICK BOTH COLOURS</legend>{colors.map((color, index) => <label key={index}><span>{index === 0 ? "First Ku String" : "Second Ku String"}</span><select value={color} onChange={(event) => setColors((current) => current.map((value, colorIndex) => colorIndex === index ? event.target.value as KuStringColor : value) as [KuStringColor, KuStringColor])}>{kuStringColors.map((option) => <option key={option} value={option}>{colorLabel(option)}</option>)}</select></label>)}</fieldset> : null}
    <div className="purchase-actions"><div className="quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(bundle.quantity, quantity - bundle.quantity))}><Minus /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(Math.floor(99 / bundle.quantity) * bundle.quantity, quantity + bundle.quantity))}><Plus /></button></div><button className="add-cart" onClick={add}>ADD TO CART</button><a className="whatsapp-buy whatsapp-buy-featured" href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${product.name} on WhatsApp`}><MessageCircle aria-hidden="true" /> BUY ON WHATSAPP</a></div>
    <p className="sr-only" aria-live="polite">{message}</p><button className="share"><Share2 /> Share with friends</button>
  </div>;
}
