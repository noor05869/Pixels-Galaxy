export function Price({ amount, compareAt, currency = "USD" }: { amount: number; compareAt?: number; currency?: string }) {
  const f = new Intl.NumberFormat("en-US", { style: "currency", currency });
  return <span className="price"><strong>{f.format(amount / 100)}</strong>{compareAt ? <s>{f.format(compareAt / 100)}</s> : null}</span>;
}
