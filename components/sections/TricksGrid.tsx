import { Play } from "lucide-react";
import { trickTiles } from "@/lib/storefront/content";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
export function TricksGrid() { return <section id="tricks" className="tricks"><div className="tricks-head"><div><h2>KU STRING IN MOTION</h2><p>See the product videos before choosing your colour.</p></div><a className="outline-button" href="#featured">CHOOSE A COLOUR</a></div><div className="trick-grid">{trickTiles.map((tile,index) => <Reveal key={tile.id} delay={(index%5)*70} className={tile.size ?? "square"}><article><MediaFrame media={tile} /><video className="trick-video" muted loop playsInline preload="metadata"><source src={`/videos/v${index%4+1}.mp4`} type="video/mp4" /></video><span>KU STRING VIDEO {String(index + 1).padStart(2, "0")}</span><i><Play fill="currentColor" /></i></article></Reveal>)}</div></section>; }
