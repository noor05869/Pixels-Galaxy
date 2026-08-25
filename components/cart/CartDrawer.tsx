"use client";
import Image from "next/image";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { Price } from "@/components/ui/Price";

export function CartDrawer() { const { lines, isOpen, closeCart, updateQuantity, removeItem } = useCart(); const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (!isOpen) return; heading.current?.focus(); const close = (e: KeyboardEvent) => e.key === "Escape" && closeCart(); addEventListener("keydown", close); return () => removeEventListener("keydown", close); }, [isOpen, closeCart]);
  if (!isOpen) return null;
  return <div className="cart-backdrop" onMouseDown={(e) => e.target === e.currentTarget && closeCart()}><aside className="cart-drawer" aria-modal="true" role="dialog" aria-labelledby="cart-title"><div className="cart-head"><h2 id="cart-title" tabIndex={-1} ref={heading}>YOUR GALAXY BAG</h2><button aria-label="Close cart" onClick={closeCart}><X /></button></div>{lines.length === 0 ? <p>Your bag is waiting for some wonder.</p> : <div className="cart-lines">{lines.map((line) => <article key={`${line.productId}-${line.bundleId}`} className="cart-line"><Image src={line.image} alt="" width={82} height={82} /><div><strong>{line.name}</strong><Price amount={line.unitPrice * line.quantity} /><div className="mini-stepper"><button aria-label="Decrease quantity" onClick={() => updateQuantity(line.productId, line.quantity - 1)}><Minus /></button><span>{line.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(line.productId, line.quantity + 1)}><Plus /></button><button aria-label={`Remove ${line.name}`} onClick={() => removeItem(line.productId)}><Trash2 /></button></div></div></article>)}</div>}<button className="checkout" disabled>CHECKOUT COMING SOON</button><small>Secure payment will be connected in the commerce phase.</small></aside></div>;
}
