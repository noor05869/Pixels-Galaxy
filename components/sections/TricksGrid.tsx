import { Play } from "lucide-react";
import { trickTiles } from "@/lib/storefront/content";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
export function TricksGrid() { return <section id="tricks" className="tricks"><div className="tricks-head"><div><h2>100+ TRICKS</h2><p>Watch, learn, and create a new trick of your own.</p></div><a className="outline-button" href="#shop">START PLAYING</a></div><div className="trick-grid">{trickTiles.map((tile,index) => <Reveal key={tile.id} delay={(index%5)*70} className={tile.size ?? "square"}><article><MediaFrame media={tile} /><video className="trick-video" muted loop playsInline preload="metadata"><source src={`/videos/v${index%4+1}.mp4`} type="video/mp4" /></video><span>{tile.label}</span><i><Play fill="currentColor" /></i></article></Reveal>)}</div></section>; }
