import { siteContent } from "@/lib/storefront/content";
import { MediaFrame } from "@/components/ui/MediaFrame";
export function SocialFeed() { return <section className="panel social-feed"><div><h2>SHOP THE <em>FEED</em></h2><p>@PixelsGalaxy</p></div><a className="button" href="#footer">FOLLOW THE JOURNEY</a><div className="social-grid">{siteContent.socialTiles.map((tile) => <MediaFrame key={tile.id} media={tile} />)}</div></section>; }
