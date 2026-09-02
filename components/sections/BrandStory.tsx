import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { siteContent } from "@/lib/storefront/content";
import { Reveal } from "@/components/ui/Reveal";
export function BrandStory() { return <section id="story" className="story"><Reveal className="story-media"><MediaFrame media={siteContent.socialTiles[2]} /><MediaFrame media={siteContent.socialTiles[1]} /></Reveal><Reveal delay={140}><div className="story-copy"><p>KU STRING BY PIXELS GALAXY</p><h2>ONE TOY.<br /><em>THREE COLOURS.</em></h2><span>Ku string is an online-only toy for ages 3+. Choose blue, green, or pink and order for delivery anywhere in Pakistan. Adult supervision is recommended.</span><a href="#featured">BUY KU STRING IN PAKISTAN <ArrowRight /></a></div></Reveal></section>; }
