"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { featuredProduct } from "@/lib/storefront/content";
import { useCart } from "@/components/cart/CartProvider";
import { Price } from "@/components/ui/Price";

export function QuickPurchaseBar() {
  const [visible, setVisible] = useState(false);
  const { isOpen } = useCart();
  const productImage = featuredProduct.media.find((item) => item.type === "image") ?? featuredProduct.media[0];

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const featured = document.getElementById("featured")?.getBoundingClientRect();
      const footer = document.getElementById("footer")?.getBoundingClientRect();
      setVisible(Boolean(featured && featured.bottom < 120 && footer && footer.top > innerHeight));
      frame = 0;
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", scroll, { passive: true });
    return () => {
      removeEventListener("scroll", scroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const choose = () => {
    const input = document.querySelector<HTMLInputElement>("#featured input[type=radio]");
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => input?.focus(), 450);
  };

  return <aside className="pointer-events-none fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-[120] mx-auto grid max-w-[1000px] translate-y-[130%] grid-cols-[auto_1fr_auto_auto] items-center gap-[13px] rounded-[14px] border border-[#43515d] bg-navy px-2.5 py-[9px] text-white opacity-0 shadow-[0_14px_45px_rgba(0,0,0,.38)] transition-[opacity,transform] duration-[250ms] [transition-timing-function:cubic-bezier(.22,1,.36,1)] data-[visible=true]:pointer-events-auto data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 [&_img]:rounded-lg [&_img]:object-cover [&_button]:min-h-12 [&_button]:rounded-[10px] [&_button]:border-0 [&_button]:bg-lime [&_button]:px-6 [&_button]:font-[1000] [&_button]:text-navy [&_button]:outline-offset-4 [&_button]:focus-visible:outline-[3px] [&_button]:focus-visible:outline-white [&>span]:text-lime max-[900px]:grid-cols-[auto_1fr_auto] max-[900px]:[&>span]:hidden max-[560px]:[&_button]:px-4 max-[560px]:[&_strong]:text-[13px]" data-visible={visible && !isOpen} aria-label="Choose your Ku string colour"><Image src={productImage.poster ?? productImage.src} alt="" width={44} height={44}/><strong>{featuredProduct.name}</strong><Price amount={featuredProduct.price}/><button onClick={choose}>CHOOSE COLOUR</button></aside>;
}
