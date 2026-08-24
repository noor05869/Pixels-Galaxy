"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import type { ProductMedia } from "@/lib/storefront/types";

export function MediaFrame({ media, priority = false, className = "" }: { media: ProductMedia; priority?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`media-frame ${className}`} style={{ aspectRatio: media.aspectRatio, background: `linear-gradient(135deg, ${media.accent}, #071947)` }}>
      {!failed && <Image src={media.poster ?? media.src} alt={media.alt} fill priority={priority} loading={priority ? "eager" : "lazy"} sizes="(max-width: 700px) 92vw, 50vw" onError={() => setFailed(true)} />}
      {failed && <span className="media-fallback">PIXELS<br />GALAXY</span>}
      {media.type === "video" && <span className="play-badge" aria-hidden="true"><Play size={18} fill="currentColor" /></span>}
    </div>
  );
}
