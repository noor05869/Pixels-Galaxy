import { testimonials } from "@/lib/storefront/content";
import { Stars } from "@/components/ui/Stars";
export function Testimonials() { return <section className="testimonials"><h2>DON&apos;T JUST TAKE<br /><span>OUR WORD FOR IT</span></h2><div className="testimonial-grid">{testimonials.map((item) => <blockquote key={item.name}><strong>{item.name}</strong><Stars rating={item.rating} /><p>{item.quote}</p></blockquote>)}</div></section>; }
