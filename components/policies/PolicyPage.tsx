import Image from "next/image";
import Link from "next/link";

import type { PolicyDocument } from "@/lib/policies/content";

export function PolicyPage({ policy }: { policy: PolicyDocument }) {
  return <div className="policy-shell">
    <header className="policy-header">
      <Link href="/" aria-label="Pixels Galaxy home"><Image src="/brand/pixels-galaxy-logo.png" alt="Pixels Galaxy" width={230} height={80} priority /></Link>
      <Link href="/" className="policy-store-link">Back to store</Link>
    </header>
    <main className="policy-page">
      <div className="policy-hero"><p>PIXELS GALAXY POLICIES</p><h1>{policy.title}</h1><span>{policy.description}</span><small>Last updated {policy.updated}</small></div>
      <article className="policy-card">
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
