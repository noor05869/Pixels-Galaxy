import { ArrowRight, Play } from "lucide-react";
import { siteContent } from "@/lib/storefront/content";
import { MediaFrame } from "@/components/ui/MediaFrame";

export function HeroSection() {
  const { hero } = siteContent;
  return <section className="hero"><MediaFrame media={hero.media} priority /><div className="hero-overlay"><p>{hero.eyebrow}</p><h1>{hero.title}</h1><a className="button button-orange" href="#shop">{hero.cta}<ArrowRight /></a><span>{hero.note}</span></div><span className="hero-play" aria-hidden="true"><Play fill="currentColor" /></span></section>;
}
