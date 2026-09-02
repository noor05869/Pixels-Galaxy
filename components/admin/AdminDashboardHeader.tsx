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
    <header className="admin-page-header">
      <div>
        {backHref && backLabel ? <Link className="admin-back-link" href={backHref}>← {backLabel}</Link> : null}
        <p className="checkout-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <LogoutButton />
    </header>
  );
}
