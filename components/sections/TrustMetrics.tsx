import { Award, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { trustMetrics } from "@/lib/storefront/content";
const icons = [ShieldCheck, Sparkles, Globe2, Award];
export function TrustMetrics() { return <section className="trust-grid" aria-label="Why Pixels Galaxy">{trustMetrics.map((item, index) => { const Icon = icons[index]; return <article key={item.value}><Icon /><strong>{item.value}</strong><span>{item.label}</span></article>; })}</section>; }
