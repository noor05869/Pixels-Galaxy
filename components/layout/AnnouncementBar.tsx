import { siteContent } from "@/lib/storefront/content";

export function AnnouncementBar() {
  return <div className="announcement"><div className="announcement-social" aria-label="Social channels"><span>f</span><span>◎</span><span>▶</span></div><strong>{siteContent.announcement}</strong><span>PAKISTAN (PKR ₨)</span></div>;
}
