export function Stars({ rating, count }: { rating: number; count?: number }) {
  return <span className="stars" aria-label={`${rating} out of 5 stars${count ? `, ${count} reviews` : ""}`}>★★★★★ {count ? <small>({count.toLocaleString()})</small> : null}</span>;
}
