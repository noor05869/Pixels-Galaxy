"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCart } from "./CartProvider";
import { Price } from "@/components/ui/Price";
import { cartLineKey } from "@/lib/cart/cart-lines";

const colorText = (colors?: string[]) => colors?.map((color) => color[0].toUpperCase() + color.slice(1)).join(" + ");

export function CartDrawer() {
  const { lines, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const heading = useRef<HTMLHeadingElement>(null);
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return <Dialog.Root open={isOpen} onOpenChange={(nextOpen) => { if (!nextOpen) closeCart(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[200] bg-[rgba(3,7,11,.78)] backdrop-blur-[5px]" /><Dialog.Content className="fixed bottom-0 right-0 top-0 z-[201] flex h-full w-[min(520px,100%)] flex-col overflow-auto bg-[#f6f5ef] p-0 text-ink shadow-none focus:outline-none" onOpenAutoFocus={(event) => { event.preventDefault(); heading.current?.focus(); }}>
      <div className="flex items-center justify-between border-b border-[#d9dedf] px-7 py-[25px] max-[560px]:px-[18px]"><Dialog.Title className="m-0 text-[28px] tracking-[-.04em]" id="cart-title" tabIndex={-1} ref={heading}>YOUR CART</Dialog.Title><Dialog.Close asChild><button className="grid size-[42px] cursor-pointer place-items-center rounded-full border border-[#cfd5d6] bg-transparent text-inherit outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-navy" aria-label="Close cart"><X /></button></Dialog.Close></div>
      {lines.length === 0 ? <div className="m-auto p-[45px] text-center"><p className="mb-2 mt-0 text-2xl font-[900]">Your cart is empty.</p><span className="text-[#657078]">Choose a Ku String colour to get started.</span></div> : <div className="px-7 py-2 max-[560px]:px-[18px]">{lines.map((line) => { const key = cartLineKey(line); return <article key={key} className="grid grid-cols-[104px_minmax(0,1fr)] gap-[18px] border-b border-[#d9dedf] py-5 max-[560px]:grid-cols-[88px_minmax(0,1fr)] max-[560px]:gap-[13px]">
        <div className="overflow-hidden rounded-xl bg-[#dfe8e8]"><Image className="block h-[104px] w-full object-cover max-[560px]:h-[88px]" src={line.image} alt={`${line.name} product`} width={104} height={104} /></div>
        <div className="min-w-0 [&>span:nth-of-type(2)]:text-[#176d65]"><div className="flex items-start justify-between gap-2.5"><strong className="text-[17px] uppercase">{line.name}</strong><button className="grid cursor-pointer place-items-center border-0 bg-transparent text-[#768087] outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-navy [&_svg]:w-[17px]" aria-label={`Remove ${line.name}`} onClick={() => removeItem(key)}><Trash2 /></button></div>
        <span className="mb-2.5 mt-[5px] block text-[11px] font-[900] uppercase tracking-[.08em] text-[#657078]">{colorText(line.colors) ?? line.bundleId.replaceAll("-", " ")}</span><Price amount={line.unitPrice * line.quantity} /><div className="mt-[13px] flex w-max items-center rounded-lg border border-[#cfd5d6] [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-[9px] [&_button]:py-[7px] [&_button]:text-inherit [&_button]:outline-offset-4 [&_button]:focus-visible:outline-[3px] [&_button]:focus-visible:outline-navy [&_button_svg]:w-4 [&_span]:min-w-[26px] [&_span]:text-center [&_span]:text-xs [&_span]:font-[900]">
          <button aria-label="Decrease quantity" onClick={() => updateQuantity(key, line.quantity - (line.bundleQuantity ?? 1))}><Minus /></button>
          <span>{line.quantity}</span>
          <button aria-label="Increase quantity" onClick={() => updateQuantity(key, line.quantity + (line.bundleQuantity ?? 1))}><Plus /></button>
        </div></div>
      </article>})}</div>}
      {lines.length > 0 ? <div className="mt-auto border-t border-[#d9dedf] px-7 pt-5 max-[560px]:px-[18px]"><div className="flex items-center justify-between text-[17px] font-[900] [&>span:last-child]:text-ink"><span>Subtotal</span><Price amount={subtotal} /></div><p className="mb-0 mt-2 text-xs font-[800] text-[#247e73]">Free delivery on your two-piece bundle</p></div> : null}
      {lines.length > 0 ? <Link className="mx-7 mt-[18px] block rounded-lg bg-lime p-[17px] text-center font-[900] text-navy outline-offset-4 hover:bg-[#0bda8f] focus-visible:outline-4 focus-visible:outline-navy focus-visible:shadow-[0_0_0_7px_#fff] max-[560px]:mx-[18px]" href="/checkout" onClick={closeCart}>PROCEED TO CHECKOUT</Link> : <button className="mx-7 mt-[18px] rounded-lg border-0 bg-[#dce3ec] p-[17px] font-[900] text-[#738096] max-[560px]:mx-[18px]" disabled>CHECKOUT</button>}
      <Dialog.Description className="mt-2.5 block pb-6 text-center text-[#657078]">{lines.length > 0 ? "Cash on Delivery across Pakistan." : "Add an item to continue."}</Dialog.Description>
    </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
