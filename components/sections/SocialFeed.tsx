import { siteContent } from "@/lib/storefront/content";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
const labels=["SHOP THE LOOK","SEE THE CHALLENGE","FROM THE COMMUNITY","WATCH THE MAGIC"];
export function SocialFeed() { return <section className="panel social-feed"><div><h2>SHOP THE <em>FEED</em></h2><p>@PixelsGalaxy</p></div><a className="button" href="#footer">FOLLOW THE JOURNEY</a><div className="social-grid">{siteContent.socialTiles.map((tile,index) => <Reveal key={tile.id} delay={index*70}><a className="social-tile" href="#shop"><MediaFrame media={tile} /><span>{labels[index]}</span></a></Reveal>)}</div></section>; }
