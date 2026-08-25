import { Play } from "lucide-react";
import { trickTiles } from "@/lib/storefront/content";
import { MediaFrame } from "@/components/ui/MediaFrame";
export function TricksGrid() { return <section id="tricks" className="tricks"><div className="tricks-head"><div><h2>100+ CHALLENGES</h2><p>Follow the glow, copy the move, then invent your own.</p></div><a className="outline-button" href="#shop">START EXPLORING</a></div><div className="trick-grid">{trickTiles.map((tile) => <article key={tile.id} className={tile.size ?? "square"}><MediaFrame media={tile} /><span>{tile.label}</span><i><Play fill="currentColor" /></i></article>)}</div></section>; }
