import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = { metadataBase: new URL(siteUrl), title: { default: "ZipString Pakistan | Screen Se Bahar, Masti Shuru", template: "%s | ZipString Pakistan" }, description: "ZipString ke saath 100+ glowing tricks seekhein. Screen-free family fun, Pakistan bhar delivery aur asaan returns.", alternates: { canonical: "/" }, openGraph: { title: "ZipString Pakistan | Screen Se Bahar, Masti Shuru", description: "100+ glowing tricks, screen-free family fun aur Pakistan bhar delivery.", url: "/", siteName: "Pixels Galaxy", type: "website", images: ["/opengraph-image"] }, twitter: { card: "summary_large_image", title: "ZipString Pakistan", description: "Screen se bahar, masti shuru." }, icons: { icon: "/brand/pixels-galaxy-logo.png" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-PK"><body><CartProvider><a className="skip-link" href="#main-content">Seedha content par jayein</a>{children}<CartDrawer /></CartProvider></body></html>;
}
