import { siteContent } from "@/lib/storefront/content";
export function PressStrip() { return <section className="press-strip" aria-label="As seen in">{siteContent.press.map((name) => <strong key={name}>{name}</strong>)}</section>; }
