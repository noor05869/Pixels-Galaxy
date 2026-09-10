import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { rootMetadata } from "@/lib/seo/metadata";

export const metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-PK" className="overflow-x-clip scroll-smooth motion-reduce:scroll-auto"><body className="m-0 overflow-x-clip bg-shell bg-[radial-gradient(circle_at_78%_4%,rgba(45,126,132,.2),transparent_28%),linear-gradient(180deg,#0d1118,#101720_55%,#0d1118)] font-sans text-warm-white"><CartProvider><a className="fixed left-2 top-2 z-[999] -translate-y-[150%] rounded-lg bg-white px-[18px] py-3 text-[#001c54] outline-offset-4 focus:translate-y-0 focus-visible:outline-[3px] focus-visible:outline-white" href="#main-content">Skip to content</a>{children}<CartDrawer /></CartProvider></body></html>;
}
