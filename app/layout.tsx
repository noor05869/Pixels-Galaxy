import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = { metadataBase: new URL(siteUrl), applicationName: "Pixels Galaxy", title: { default: "Ku string Pakistan | Toy for Ages 3+", template: "%s | Ku string Pakistan" }, description: "Shop Ku string by Pixels Galaxy for PKR 1,999. Available in blue, green, and pink for ages 3+, with Cash on Delivery across Pakistan.", category: "Kids toys", alternates: { canonical: "/" }, openGraph: { title: "Ku string Pakistan | Pixels Galaxy", description: "Choose blue, green, or pink Ku string for PKR 1,999 with delivery across Pakistan.", url: "/", siteName: "Pixels Galaxy", locale: "en_PK", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Ku string Pakistan by Pixels Galaxy" }] }, twitter: { card: "summary_large_image", title: "Ku string Pakistan | Pixels Galaxy", description: "Ku string for ages 3+ in blue, green, and pink with Pakistan-wide delivery.", images: ["/opengraph-image"] }, icons: { icon: "/brand/pixels-galaxy-logo.png" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-PK"><body><CartProvider><a className="skip-link" href="#main-content">Skip to content</a>{children}<CartDrawer /></CartProvider></body></html>;
}
