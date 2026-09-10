export function Price({ amount, compareAt, currency = "PKR" }: { amount: number; compareAt?: number; currency?: string }) {
  const f = new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 });
  return <span className="flex items-center gap-2 text-[#247e73]"><strong>{f.format(amount / 100)}</strong>{compareAt ? <s className="text-[13px] text-[#8290a8]">{f.format(compareAt / 100)}</s> : null}</span>;
}
