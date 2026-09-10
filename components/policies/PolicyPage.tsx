import Image from "next/image";
import Link from "next/link";

import type { PolicyDocument } from "@/lib/policies/content";

export function PolicyPage({ policy }: { policy: PolicyDocument }) {
  return <div className="min-h-screen bg-shell text-warm-white">
    <header className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 p-6 [&_img]:block [&_img]:h-auto [&_img]:w-[190px]">
      <Link className="outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white" href="/" aria-label="Pixels Galaxy home"><Image src="/brand/pixels-galaxy-logo.png" alt="Pixels Galaxy" width={230} height={80} priority /></Link>
      <Link href="/" className="rounded-[7px] border border-[#43515d] px-[18px] py-3 text-xs font-[900] uppercase text-lime outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white">Back to store</Link>
    </header>
    <main className="mx-auto mb-[90px] mt-[30px] w-[min(calc(100%_-_32px),980px)]">
      <div className="rounded-t-[14px] border border-[#35424c] bg-[linear-gradient(135deg,#17212b,#102b32)] p-[clamp(30px,6vw,70px)]"><p className="mb-4 mt-0 text-[11px] font-[900] tracking-[.2em] text-lime">PIXELS GALAXY POLICIES</p><h1 className="m-0 text-[clamp(42px,7vw,76px)] leading-[.95] tracking-[-.05em]">{policy.title}</h1><span className="mt-[22px] block max-w-[680px] text-[17px] leading-[1.65] text-[#b8c4cc]">{policy.description}</span><small className="mt-[22px] block text-[#7f909c]">Last updated {policy.updated}</small></div>
      <article className="rounded-b-[14px] border border-t-0 border-[#d9dedf] bg-[#f6f5ef] p-[clamp(28px,6vw,70px)] text-[#203b60] [&_section+section]:mt-[42px] [&_section+section]:border-t [&_section+section]:border-[#d9dedf] [&_section+section]:pt-[38px] [&_h2]:mb-4 [&_h2]:mt-0 [&_h2]:text-[clamp(24px,3vw,34px)] [&_h2]:tracking-[-.025em] [&_h2]:text-ink [&_p]:my-2.5 [&_p]:leading-[1.75] [&_li]:leading-[1.75] [&_li+li]:mt-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_dl]:mt-[22px] [&_dl]:overflow-hidden [&_dl]:rounded-[10px] [&_dl]:border [&_dl]:border-[#d9dedf] [&_dl>div]:grid [&_dl>div]:grid-cols-2 [&_dl>div+div]:border-t [&_dl>div+div]:border-[#d9dedf] [&_dt]:m-0 [&_dt]:bg-[#eaf3fc] [&_dt]:px-[18px] [&_dt]:py-[15px] [&_dt]:font-[900] [&_dd]:m-0 [&_dd]:bg-white [&_dd]:px-[18px] [&_dd]:py-[15px]">
        {policy.sections.map((section) => <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
          {section.steps && <ol>{section.steps.map((item) => <li key={item}>{item}</li>)}</ol>}
          {section.table && <dl>{section.table.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>}
        </section>)}
      </article>
    </main>
  </div>;
}
