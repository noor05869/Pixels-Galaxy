"use client";

import Image from "next/image";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

const links = [["Shop", "#featured"], ["Colours", "#featured"], ["Product Info", "#story"], ["Contact", "#footer"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { totalQuantity, openCart } = useCart();
  return <header className="site-header">
    <a className="brand" href="#main-content"><Image src="/brand/pixels-galaxy-logo.png" alt="Pixels Galaxy" width={230} height={80} priority /></a>
    <nav className="desktop-nav" aria-label="Primary">{links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</nav>
    <div className="header-actions"><button className="utility-action" aria-label="Search coming soon" title="Search coming soon"><Search /></button><button className="utility-action" aria-label="Account coming soon" title="Account coming soon"><User /></button><button className="cart-button" aria-label="Open cart" onClick={openCart}><ShoppingBag /><span className="cart-count">{totalQuantity}</span></button><button className="menu-button" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button></div>
    {open && <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile menu"><button aria-label="Close menu" onClick={() => setOpen(false)}><X /></button>{links.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}</div>}
  </header>;
}
