export function SectionHeading({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return <div className="section-heading">{eyebrow && <p>{eyebrow}</p>}<h2>{children}</h2></div>;
}
