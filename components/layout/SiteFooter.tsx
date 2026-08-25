import Image from "next/image";
import { footerGroups } from "@/lib/storefront/content";
import { NewsletterForm } from "./NewsletterForm";
export function SiteFooter() { return <footer id="footer"><div className="footer-main"><div className="footer-brand"><Image src="/brand/pixels-galaxy-logo.png" alt="Pixels Galaxy" width={230} height={80} /><p>PLAY BEYOND THE SCREEN.</p></div>{footerGroups.map((group) => <nav key={group.title} aria-label={group.title}><h3>{group.title}</h3>{group.links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}</nav>)}<NewsletterForm /></div><div className="footer-bottom"><span>© 2026 Pixels Galaxy</span><span>Pakistan (PKR ₨)</span></div><span id="policies" className="sr-only">Policy pages are coming soon.</span></footer>; }
