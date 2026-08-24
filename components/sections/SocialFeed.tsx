import { siteContent } from "@/lib/storefront/content";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
const labels=["YEH WALA DEKHO","TRICK SEEKHO","APNI COMMUNITY","MASTI DEKHO"];
export function SocialFeed() { return <section className="panel social-feed"><div><h2>HAMARI <em>FEED</em></h2><p>@PixelsGalaxy</p></div><a className="button" href="#footer">HUMEIN FOLLOW KAREIN</a><div className="social-grid">{siteContent.socialTiles.map((tile,index) => <Reveal key={tile.id} delay={index*70}><a className="social-tile" href="#shop"><MediaFrame media={tile} /><span>{labels[index]}</span></a></Reveal>)}</div></section>; }
