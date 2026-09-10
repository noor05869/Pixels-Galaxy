import Link from "next/link";

import { LogoutButton } from "./LogoutButton";

type AdminDashboardHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function AdminDashboardHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
}: AdminDashboardHeaderProps) {
  return (
    <header className="mb-8 flex items-end justify-between gap-[30px] max-[760px]:flex-col max-[760px]:items-start">
      <div className="max-w-[760px]">
        {backHref && backLabel ? <Link className="mb-[22px] inline-block text-[13px] font-[900] text-[#075ebf] underline underline-offset-4 outline-offset-4 focus-visible:outline-4 focus-visible:outline-[#075ebf] focus-visible:shadow-[0_0_0_7px_#fff]" href={backHref}>← {backLabel}</Link> : null}
        <p className="mb-2.5 mt-0 text-xs font-[1000] tracking-[.18em] text-[#087998]">{eyebrow}</p>
        <h1 className="m-0 text-[clamp(42px,6vw,72px)] leading-[.92] tracking-[-.04em] uppercase text-navy max-[760px]:text-[42px]">{title}</h1>
        <p className="mb-0 mt-4 max-w-[640px] font-[700] leading-[1.6] text-[#486080]">{description}</p>
      </div>
      <LogoutButton />
    </header>
  );
}
