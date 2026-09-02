import { JsonLd } from "@/components/seo/JsonLd";
import { siteContent } from "@/lib/storefront/content";

export function SeoProductGuide() {
  const { seo } = siteContent;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className="seo-guide" aria-labelledby="seo-guide-title">
      <JsonLd data={faqJsonLd} />
      <div className="seo-guide-intro">
        <p>{seo.eyebrow}</p>
        <h2 id="seo-guide-title">{seo.heading}</h2>
        <span>{seo.introduction}</span>
      </div>

      <div className="seo-feature-grid">
        {seo.features.map((feature) => (
          <article key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </div>

      <div className="seo-faqs">
        <h2>String Shooter Toy Questions</h2>
        {seo.faqs.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
