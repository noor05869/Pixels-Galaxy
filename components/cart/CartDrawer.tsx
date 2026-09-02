"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { Price } from "@/components/ui/Price";
import { cartLineKey } from "@/lib/cart/cart-lines";

const colorText = (colors?: string[]) => colors?.map((color) => color[0].toUpperCase() + color.slice(1)).join(" + ");

export function CartDrawer() {
  const { lines, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    heading.current?.focus();
    const close = (event: KeyboardEvent) => event.key === "Escape" && closeCart();
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [isOpen, closeCart]);
  if (!isOpen) return null;
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return <div className="cart-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeCart()}>
    <aside className="cart-drawer" aria-modal="true" role="dialog" aria-labelledby="cart-title">
      <div className="cart-head"><h2 id="cart-title" tabIndex={-1} ref={heading}>YOUR CART</h2><button aria-label="Close cart" onClick={closeCart}><X /></button></div>
      {lines.length === 0 ? <div className="cart-empty"><p>Your cart is empty.</p><span>Choose a Ku String colour to get started.</span></div> : <div className="cart-lines">{lines.map((line) => { const key = cartLineKey(line); return <article key={key} className="cart-line">
        <div className="cart-line-image"><Image src={line.image} alt={`${line.name} product`} width={104} height={104} /></div>
        <div className="cart-line-copy"><div className="cart-line-title"><strong>{line.name}</strong><button className="cart-remove" aria-label={`Remove ${line.name}`} onClick={() => removeItem(key)}><Trash2 /></button></div>
        <span className="cart-line-meta">{colorText(line.colors) ?? line.bundleId.replaceAll("-", " ")}</span><Price amount={line.unitPrice * line.quantity} /><div className="mini-stepper">
          <button aria-label="Decrease quantity" onClick={() => updateQuantity(key, line.quantity - (line.bundleQuantity ?? 1))}><Minus /></button>
          <span>{line.quantity}</span>
          <button aria-label="Increase quantity" onClick={() => updateQuantity(key, line.quantity + (line.bundleQuantity ?? 1))}><Plus /></button>
        </div></div>
      </article>})}</div>}
      {lines.length > 0 ? <div className="cart-totals"><div><span>Subtotal</span><Price amount={subtotal} /></div><p>Free delivery on your two-piece bundle</p></div> : null}
      {lines.length > 0 ? <Link className="checkout checkout-enabled" href="/checkout" onClick={closeCart}>PROCEED TO CHECKOUT</Link> : <button className="checkout" disabled>CHECKOUT</button>}
      <small>{lines.length > 0 ? "Cash on Delivery across Pakistan." : "Add an item to continue."}</small>
    </aside>
  </div>;
}
