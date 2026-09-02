export function Price({ amount, compareAt, currency = "PKR" }: { amount: number; compareAt?: number; currency?: string }) {
  const f = new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 });
  return <span className="price"><strong>{f.format(amount / 100)}</strong>{compareAt ? <s>{f.format(compareAt / 100)}</s> : null}</span>;
}
