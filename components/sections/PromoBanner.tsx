"use client";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { VideoControl } from "@/components/ui/VideoControl";
export function PromoBanner() { const videoRef = useRef<HTMLVideoElement>(null); const [paused,setPaused]=useState(false); return <section className="promo"><video ref={videoRef} className="promo-video" autoPlay muted loop playsInline preload="metadata" onPlay={()=>setPaused(false)} onPause={()=>setPaused(true)}><source src="/videos/main-banner2.mp4" type="video/mp4" /></video><div><h2>THIS IS<br />WONDER</h2><a className="button" href="#featured">SHOP NOW <ArrowRight /></a></div><VideoControl videoRef={videoRef} paused={paused} setPaused={setPaused} label="wonder video" /></section>; }
