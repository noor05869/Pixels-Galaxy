import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="checkout-shell">
      <header className="checkout-header">
        <Link href="/" aria-label="Pixels Galaxy home">
          <Image src="/brand/pixels-galaxy-logo.png" alt="Pixels Galaxy" width={230} height={80} priority />
        </Link>
        <Link href="/#featured" className="checkout-store-link">Return to store</Link>
      </header>
      {children}
    </div>
  );
}
