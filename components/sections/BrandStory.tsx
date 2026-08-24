import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { siteContent } from "@/lib/storefront/content";
import { Reveal } from "@/components/ui/Reveal";
export function BrandStory() { return <section id="story" className="story"><Reveal className="story-media"><MediaFrame media={siteContent.socialTiles[2]} /><MediaFrame media={siteContent.socialTiles[1]} /></Reveal><Reveal delay={140}><div className="story-copy"><p>MADE FOR ACTIVE PLAY</p><h2>ONE LITTLE STRING.<br /><em>ENDLESS FUN.</em></h2><span>ZipString combines movement, colour, and imagination to create play that goes beyond the screen.</span><a href="#shop">DISCOVER ZIPSTRING <ArrowRight /></a></div></Reveal></section>; }
