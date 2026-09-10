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
    <section className="mx-auto mb-[110px] w-[min(calc(100%_-_48px),1320px)] rounded-brand border border-[#2c3943] bg-[#131c24] p-[clamp(34px,5vw,72px)] max-[560px]:mb-[70px] max-[560px]:w-[min(calc(100%_-_24px),1320px)] max-[560px]:px-5 max-[560px]:py-[30px]" aria-labelledby="seo-guide-title">
      <JsonLd data={faqJsonLd} />
      <div className="grid grid-cols-[minmax(0,.85fr)_minmax(280px,1fr)] items-end gap-x-[60px] gap-y-[18px] max-[900px]:grid-cols-1">
        <p className="col-span-full m-0 text-[11px] font-[900] tracking-[.2em] text-orange">{seo.eyebrow}</p>
        <h2 className="m-0 text-[clamp(38px,5vw,70px)] leading-[.95] tracking-[-.045em] text-warm-white" id="seo-guide-title">{seo.heading}</h2>
        <span className="text-base font-[600] leading-[1.7] text-[#b8c4cc]">{seo.introduction}</span>
      </div>

      <div className="mt-[50px] grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[560px]:mt-[34px] max-[560px]:grid-cols-1">
        {seo.features.map((feature) => (
          <article className="rounded-[10px] border border-[#35424c] bg-[#17212b] p-[22px]" key={feature.title}>
            <h3 className="mb-2.5 mt-0 text-base leading-[1.25] text-lime">{feature.title}</h3>
            <p className="m-0 text-[13px] leading-[1.6] text-[#aab4bc]">{feature.text}</p>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-[65px] max-w-[900px] max-[560px]:mt-[45px]">
        <h2 className="mb-[22px] mt-0 text-[clamp(30px,4vw,48px)] tracking-[-.035em] text-warm-white">String Shooter Toy Questions</h2>
        {seo.faqs.map((item) => (
          <details className="border-t border-[#35424c] p-0 last:border-b" key={item.question}>
            <summary className="cursor-pointer py-5 pl-0 pr-[38px] font-[900] leading-[1.4] text-warm-white marker:text-lime">{item.question}</summary>
            <p className="mb-[22px] mt-[-4px] max-w-[760px] leading-[1.7] text-[#b8c4cc]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
