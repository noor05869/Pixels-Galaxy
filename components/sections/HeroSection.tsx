"use client";
import { ArrowRight, Play } from "lucide-react";
import { siteContent } from "@/lib/storefront/content";
import { useRef, useState } from "react";
import { VideoControl } from "@/components/ui/VideoControl";

export function HeroSection() {
  const { hero } = siteContent;
  const videoRef = useRef<HTMLVideoElement>(null); const [paused, setPaused] = useState(false);
  return <section className="hero"><video ref={videoRef} className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-label="ZipString product video" onPlay={() => setPaused(false)} onPause={() => setPaused(true)}><source src="/videos/main-banner-video.mp4" type="video/mp4" /></video><div className="hero-overlay"><p>{hero.eyebrow}</p><h1>{hero.title}</h1><a className="button button-orange hero-cta" href="#shop">{hero.cta}<ArrowRight /></a><span>{hero.note}</span></div><VideoControl videoRef={videoRef} paused={paused} setPaused={setPaused} label="ZipString video" /></section>;
}
