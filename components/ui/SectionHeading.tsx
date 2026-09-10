export function SectionHeading({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return <div>{eyebrow && <p className="font-[900] tracking-[.15em] text-orange">{eyebrow}</p>}<h2 className="m-0 text-[clamp(38px,5vw,72px)] font-[700] leading-[.92] tracking-[-.045em]">{children}</h2></div>;
}
