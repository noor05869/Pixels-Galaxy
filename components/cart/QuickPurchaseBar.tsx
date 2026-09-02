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

  return <aside className="quick-purchase" data-visible={visible && !isOpen} aria-label="Choose your Ku string colour"><Image src={productImage.poster ?? productImage.src} alt="" width={44} height={44}/><strong>{featuredProduct.name}</strong><Price amount={featuredProduct.price}/><button onClick={choose}>CHOOSE COLOUR</button></aside>;
}
