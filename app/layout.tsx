import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = { metadataBase: new URL(siteUrl), title: { default: "Pixels Galaxy | Play Beyond the Screen", template: "%s | Pixels Galaxy" }, description: "Discover bright, kinetic play made for curious minds.", alternates: { canonical: "/" }, openGraph: { title: "Pixels Galaxy | Play Beyond the Screen", description: "Bright, kinetic play made for curious minds.", url: "/", siteName: "Pixels Galaxy", type: "website", images: ["/opengraph-image"] }, twitter: { card: "summary_large_image", title: "Pixels Galaxy", description: "Play beyond the screen." }, icons: { icon: "/brand/pixels-galaxy-logo.png" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CartProvider><a className="skip-link" href="#main-content">Skip to content</a>{children}<CartDrawer /></CartProvider></body></html>;
}
