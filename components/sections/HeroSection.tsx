import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { siteContent } from "@/lib/storefront/content";

export function HeroSection() {
  const { hero } = siteContent;
  return <section className="hero">
    <Image className="hero-banner" src="/photos/ku-string-bundle-hero.png" alt="Blue and pink Ku String toys with glowing loop ropes" fill priority sizes="(max-width: 850px) 100vw, 1440px" />
    <div className="hero-overlay">
      <p><span className="hero-live-dot" />{hero.eyebrow}</p>
      <h1>{hero.title}</h1>
      <div className="hero-offer"><span>2 KU STRINGS</span><strong>PKR 3,500</strong><small>Save PKR 498</small></div>
      <span className="hero-deck">{hero.note}</span>
      <a className="button button-orange hero-cta" href="#featured">{hero.cta}<ArrowRight /></a>
    </div>
    <div className="hero-specs" aria-label="Ku string offer highlights"><span><b>01</b>FREE DELIVERY</span><span><b>02</b>MIX ANY COLOURS</span><span><b>03</b>CASH ON DELIVERY</span></div>
  </section>;
}
