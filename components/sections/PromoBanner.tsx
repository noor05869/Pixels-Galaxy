import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { siteContent } from "@/lib/storefront/content";
export function PromoBanner() { return <section className="promo"><MediaFrame media={siteContent.hero.media} /><div><h2>THIS IS<br />WONDER</h2><a className="button" href="#featured">SHOP NOW <ArrowRight /></a></div></section>; }
