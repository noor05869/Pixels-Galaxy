import { ArrowRight, Play } from "lucide-react";
import { siteContent } from "@/lib/storefront/content";

export function HeroSection() {
  const { hero } = siteContent;
  return <section className="hero"><video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-label="Pixels Galaxy product showcase"><source src="/videos/main-banner-video.mp4" type="video/mp4" /></video><div className="hero-overlay"><p>{hero.eyebrow}</p><h1>{hero.title}</h1><a className="button button-orange" href="#shop">{hero.cta}<ArrowRight /></a><span>{hero.note}</span></div><span className="hero-play" aria-hidden="true"><Play fill="currentColor" /></span></section>;
}
