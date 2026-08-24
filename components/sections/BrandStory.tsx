import { ArrowRight } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { siteContent } from "@/lib/storefront/content";
import { Reveal } from "@/components/ui/Reveal";
export function BrandStory() { return <section id="story" className="story"><Reveal className="story-media"><MediaFrame media={siteContent.socialTiles[2]} /><MediaFrame media={siteContent.socialTiles[1]} /></Reveal><Reveal delay={140}><div className="story-copy"><p>BACHON KI MASTI KE LIYE</p><h2>EK CHOTI STRING.<br /><em>BEHISAAB FUN.</em></h2><span>ZipString movement, rang aur imagination ko mila kar aisi masti banata hai jo screen se bahar hoti hai.</span><a href="#shop">APNA ZIPSTRING DEKHEIN <ArrowRight /></a></div></Reveal></section>; }
