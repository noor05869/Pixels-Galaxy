import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = { metadataBase: new URL(siteUrl), applicationName: "Pixels Galaxy", title: { default: "ZipString Pakistan | Screen-Free Activity Toy for Kids", template: "%s | ZipString Pakistan" }, description: "Shop ZipString in Pakistan, a rechargeable glow-in-the-dark activity toy for kids with 100+ tricks. PKR pricing and delivery across Pakistan.", category: "Kids toys and activity toys", alternates: { canonical: "/" }, openGraph: { title: "ZipString Pakistan | Screen-Free Activity Toy for Kids", description: "Discover a rechargeable glow-in-the-dark toy with 100+ tricks, PKR pricing, and delivery across Pakistan.", url: "/", siteName: "Pixels Galaxy", locale: "en_PK", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZipString Pakistan by Pixels Galaxy" }] }, twitter: { card: "summary_large_image", title: "ZipString Pakistan | Activity Toy for Kids", description: "A screen-free glow-in-the-dark toy with 100+ tricks and delivery across Pakistan.", images: ["/opengraph-image"] }, icons: { icon: "/brand/pixels-galaxy-logo.png" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-PK"><body><CartProvider><a className="skip-link" href="#main-content">Skip to content</a>{children}<CartDrawer /></CartProvider></body></html>;
}
