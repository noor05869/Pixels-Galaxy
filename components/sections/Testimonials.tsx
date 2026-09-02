import { testimonials } from "@/lib/storefront/content";
import { Stars } from "@/components/ui/Stars";
import { Reveal } from "@/components/ui/Reveal";
export function Testimonials() { return <section className="testimonials"><h2>DON'T TAKE OUR WORD FOR IT.<br /><span>TAKE THEIRS.</span></h2><div className="testimonial-grid">{testimonials.map((item,index) => <Reveal key={item.name} delay={index*70}><blockquote><strong>{item.name}</strong><Stars rating={item.rating} /><p>{item.quote}</p></blockquote></Reveal>)}</div></section>; }
