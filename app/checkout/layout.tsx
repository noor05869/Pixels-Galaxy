import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#f3f7fc] text-navy">
      <header className="flex min-h-24 w-full items-center justify-between gap-6 border-b border-[rgba(9,43,112,.12)] bg-panel px-[clamp(20px,4vw,64px)] py-3 max-[560px]:min-h-[78px] max-[560px]:px-4 max-[560px]:py-2.5 [&_img]:block [&_img]:h-auto [&_img]:w-[190px] max-[560px]:[&_img]:w-[145px]">
        <Link className="outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white" href="/" aria-label="Pixels Galaxy home">
          <Image src="/brand/pixels-galaxy-logo.png" alt="Pixels Galaxy" width={230} height={80} priority />
        </Link>
        <Link href="/#featured" className="rounded-full border-2 border-navy px-[18px] py-3 text-xs font-[1000] uppercase outline-offset-4 hover:bg-navy hover:text-white focus-visible:outline-[3px] focus-visible:outline-white max-[560px]:px-3 max-[560px]:py-2.5 max-[560px]:text-[10px]">Return to store</Link>
      </header>
      {children}
    </div>
  );
}
