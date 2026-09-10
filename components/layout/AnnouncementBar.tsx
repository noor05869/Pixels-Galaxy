import { siteContent } from "@/lib/storefront/content";

export function AnnouncementBar() {
  return <div className="grid min-h-9 grid-cols-[1fr_auto_1fr] items-center bg-[#0a0d12] px-6 py-2 text-[10px] tracking-[.05em] text-[#a9b4bc] max-[850px]:grid-cols-1 max-[850px]:text-center"><div className="flex gap-3.5 max-[850px]:hidden" aria-label="Social channels"><span>f</span><span>◎</span><span>▶</span></div><strong>{siteContent.announcement}</strong><span className="text-right font-[800] max-[850px]:hidden">PAKISTAN (PKR ₨)</span></div>;
}
