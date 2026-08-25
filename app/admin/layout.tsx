import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="checkout-shell">
      <header className="checkout-header">
        <Link href="/" aria-label="Pixels Galaxy storefront">
          <Image
            src="/brand/pixels-galaxy-logo.png"
            alt="Pixels Galaxy"
            width={190}
            height={56}
            priority
          />
        </Link>
        <Link className="checkout-store-link" href="/">
          Storefront
        </Link>
      </header>
      {children}
    </div>
  );
}
