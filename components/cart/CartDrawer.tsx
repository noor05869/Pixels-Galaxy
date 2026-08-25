"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { Price } from "@/components/ui/Price";

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
  return <div className="cart-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeCart()}>
    <aside className="cart-drawer" aria-modal="true" role="dialog" aria-labelledby="cart-title">
      <div className="cart-head"><h2 id="cart-title" tabIndex={-1} ref={heading}>YOUR CART</h2><button aria-label="Close cart" onClick={closeCart}><X /></button></div>
      {lines.length === 0 ? <p>Your cart is empty — choose your ZipString.</p> : <div className="cart-lines">{lines.map((line) => <article key={`${line.productId}-${line.bundleId}`} className="cart-line">
        <Image src={line.image} alt="" width={82} height={82} />
        <div><strong>{line.name}</strong><Price amount={line.unitPrice * line.quantity} /><div className="mini-stepper">
          <button aria-label="Decrease quantity" onClick={() => updateQuantity(line.productId, line.bundleId, line.quantity - (line.bundleQuantity ?? 1))}><Minus /></button>
          <span>{line.quantity}</span>
          <button aria-label="Increase quantity" onClick={() => updateQuantity(line.productId, line.bundleId, line.quantity + (line.bundleQuantity ?? 1))}><Plus /></button>
          <button aria-label={`Remove ${line.name}`} onClick={() => removeItem(line.productId, line.bundleId)}><Trash2 /></button>
        </div></div>
      </article>)}</div>}
      {lines.length > 0 ? <Link className="checkout checkout-enabled" href="/checkout" onClick={closeCart}>PROCEED TO CHECKOUT</Link> : <button className="checkout" disabled>CHECKOUT</button>}
      <small>{lines.length > 0 ? "Cash on Delivery across Pakistan." : "Add an item to continue."}</small>
    </aside>
  </div>;
}
