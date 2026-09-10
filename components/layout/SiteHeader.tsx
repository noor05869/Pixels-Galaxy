"use client";

import Image from "next/image";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCart } from "@/components/cart/CartProvider";

const links = [["Shop", "#featured"], ["Colours", "#featured"], ["Product Info", "#story"], ["Contact", "#footer"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { totalQuantity, openCart } = useCart();
  return <header className="relative z-50 m-0 grid min-h-[88px] w-full grid-cols-[250px_1fr_auto] items-center border-y border-[#2b3641] bg-[rgba(18,25,34,.96)] px-6 py-3 text-warm-white max-[850px]:min-h-[82px] max-[850px]:grid-cols-[1fr_auto] max-[850px]:px-4 max-[850px]:py-2.5">
    <a className="outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white [&_img]:block [&_img]:h-auto [&_img]:w-[210px] [&_img]:[filter:saturate(.78)_brightness(1.08)] max-[850px]:[&_img]:w-[155px]" href="#main-content"><Image src="/brand/pixels-galaxy-logo.png" alt="Pixels Galaxy" width={230} height={80} priority /></a>
    <nav className="flex justify-center gap-[clamp(20px,3vw,48px)] text-xs font-[1000] uppercase tracking-[.08em] max-[850px]:hidden" aria-label="Primary">{links.map(([label, href]) => <a className="rounded-full px-3.5 py-2.5 outline-offset-4 transition-colors duration-[180ms] hover:scale-[1.03] hover:bg-white hover:text-lime focus-visible:scale-[1.03] focus-visible:bg-white focus-visible:text-navy focus-visible:outline-[3px] focus-visible:outline-white" key={label} href={href}>{label}</a>)}</nav>
    <div className="flex gap-[11px]"><button className="relative cursor-pointer border-0 bg-transparent p-2 text-warm-white outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white" aria-label="Open cart" onClick={openCart}><ShoppingBag /><span className="absolute right-[-1px] top-[-1px] grid size-[18px] place-items-center rounded-full bg-lime text-[10px] font-[900] text-navy">{totalQuantity}</span></button><Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><button className="relative hidden cursor-pointer border-0 bg-transparent p-2 text-warm-white outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white max-[850px]:block" aria-label="Open menu"><Menu /></button></Dialog.Trigger><Dialog.Portal><Dialog.Content className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 bg-ink text-[28px] font-[1000] text-warm-white focus:outline-none"><Dialog.Title className="sr-only">Mobile menu</Dialog.Title><Dialog.Close asChild><button className="absolute right-5 top-5 cursor-pointer border-0 bg-transparent p-2 text-warm-white outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white" aria-label="Close menu"><X /></button></Dialog.Close>{links.map(([label, href]) => <a className="outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white" key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}</Dialog.Content></Dialog.Portal></Dialog.Root></div>
  </header>;
}
