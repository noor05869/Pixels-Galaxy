import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { rootMetadata } from "@/lib/seo/metadata";

export const metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-PK"><body><CartProvider><a className="skip-link" href="#main-content">Skip to content</a>{children}<CartDrawer /></CartProvider></body></html>;
}
