import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { siteUrl } from "@/lib/seo/jsonLd";

export const metadata: Metadata = { metadataBase: new URL(siteUrl), applicationName: "Pixels Galaxy", title: { default: "String Shooter Toy Pakistan | Ku String – Pixels Galaxy", template: "%s | Pixels Galaxy Pakistan" }, description: "Buy the Ku String glow-in-the-dark string shooter toy online for PKR 1,999. Ages 3+, three colours and Cash on Delivery across Pakistan.", keywords: ["string shooter toy Pakistan", "flying string toy Pakistan", "glow in the dark string toy", "rope launcher toy Pakistan", "Ku String Pakistan", "kids toys online Pakistan"], category: "Kids toys", alternates: { canonical: "/" }, openGraph: { title: "String Shooter Toy Pakistan | Pixels Galaxy", description: "Shop the rechargeable Ku String flying string toy in blue, green or pink with Cash on Delivery across Pakistan.", url: "/", siteName: "Pixels Galaxy", locale: "en_PK", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Ku String glow-in-the-dark string shooter toy in Pakistan" }] }, twitter: { card: "summary_large_image", title: "String Shooter Toy Pakistan | Pixels Galaxy", description: "Buy the Ku String flying rope launcher toy with nationwide Cash on Delivery.", images: ["/opengraph-image"] }, icons: { icon: "/brand/pixels-galaxy-logo.png" }, robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-PK"><body><CartProvider><a className="skip-link" href="#main-content">Skip to content</a>{children}<CartDrawer /></CartProvider></body></html>;
}
