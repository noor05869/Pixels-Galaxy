"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import type { ProductMedia } from "@/lib/storefront/types";

export function MediaFrame({ media, priority = false, className = "" }: { media: ProductMedia; priority?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-[#0b2255] ${className}`} style={{ aspectRatio: media.aspectRatio, background: `linear-gradient(135deg, ${media.accent}, #071947)` }}>
      {!failed && <Image className="object-cover" src={media.poster ?? media.src} alt={media.alt} fill priority={priority} loading={priority ? "eager" : "lazy"} sizes="(max-width: 700px) 92vw, 50vw" onError={() => setFailed(true)} />}
      {failed && <span className="absolute inset-0 grid place-items-center text-center text-[32px] font-[1000]">PIXELS<br />GALAXY</span>}
      {media.type === "video" && <span className="pointer-events-none absolute bottom-[26px] right-[26px] z-[3] grid size-[54px] place-items-center rounded-full bg-[#1764d9] text-white" aria-hidden="true"><Play size={18} fill="currentColor" /></span>}
    </div>
  );
}
