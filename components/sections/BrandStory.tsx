import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { siteContent } from "@/lib/storefront/content";
import { Reveal } from "@/components/ui/Reveal";
export function BrandStory() { return <section id="story" className="story"><Reveal className="story-media"><MediaFrame media={siteContent.socialTiles[2]} /><MediaFrame media={siteContent.socialTiles[1]} /></Reveal><Reveal delay={140}><div className="story-copy"><p>SCREEN-FREE PLAY FOR KIDS</p><h2>ONE LITTLE STRING.<br /><em>ENDLESS FUN.</em></h2><span>ZipString combines movement, colour, and imagination in an interactive activity toy made for active play at home or with friends.</span><a href="#shop">BUY ZIPSTRING IN PAKISTAN <ArrowRight /></a></div></Reveal></section>; }
