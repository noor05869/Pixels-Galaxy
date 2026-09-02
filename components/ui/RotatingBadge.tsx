export function RotatingBadge({ text }: { text: string }) { return <span className="rotating-badge" aria-hidden="true"><span>{text}</span><i>✦</i></span>; }
