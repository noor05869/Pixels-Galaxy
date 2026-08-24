import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { siteContent } from "@/lib/storefront/content";
export function BrandStory() { return <section id="story" className="story"><MediaFrame media={siteContent.socialTiles[2]} /><div><p>BUILT FOR CURIOUS MINDS</p><h2>ONE BRIGHT IDEA.<br /><em>INFINITE WORLDS.</em></h2><span>Pixels Galaxy turns movement, color, and imagination into play that refuses to sit still.</span><a href="#shop">DISCOVER THE COLLECTION <ArrowRight /></a></div></section>; }
