export function Stars({ rating, count }: { rating: number; count?: number }) {
  return <span className="my-2.5 block font-[900] text-[#1c8f82]" aria-label={`${rating} out of 5 stars${count ? `, ${count} reviews` : ""}`}>★★★★★ {count ? <small className="text-navy">({count.toLocaleString()})</small> : null}</span>;
}
