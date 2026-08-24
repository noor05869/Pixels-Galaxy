import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = { metadataBase: new URL(siteUrl), title: { default: "ZipString Pakistan | Play Beyond the Screen", template: "%s | ZipString Pakistan" }, description: "Master 100+ glowing ZipString tricks. Screen-free family fun with delivery across Pakistan and easy returns.", alternates: { canonical: "/" }, openGraph: { title: "ZipString Pakistan | Play Beyond the Screen", description: "100+ glowing tricks, screen-free family fun, and delivery across Pakistan.", url: "/", siteName: "Pixels Galaxy", type: "website", images: ["/opengraph-image"] }, twitter: { card: "summary_large_image", title: "ZipString Pakistan", description: "Play beyond the screen." }, icons: { icon: "/brand/pixels-galaxy-logo.png" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-PK"><body><CartProvider><a className="skip-link" href="#main-content">Skip to content</a>{children}<CartDrawer /></CartProvider></body></html>;
}
