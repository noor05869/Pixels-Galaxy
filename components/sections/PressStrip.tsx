import { siteContent } from "@/lib/storefront/content";
export function PressStrip() { const items = [...siteContent.press, ...siteContent.press]; return <section className="press-strip" aria-label="As seen in"><div className="press-track">{items.map((name, index) => <strong key={`${name}-${index}`} aria-hidden={index >= siteContent.press.length}>{name}</strong>)}</div></section>; }
