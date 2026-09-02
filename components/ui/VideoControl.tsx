"use client";
import { Pause, Play } from "lucide-react";

export function VideoControl({ videoRef, paused, setPaused, label }: { videoRef: React.RefObject<HTMLVideoElement | null>; paused: boolean; setPaused: (paused: boolean) => void; label: string }) {
  const toggle = async () => { const video = videoRef.current; if (!video) return; if (video.paused) { await video.play(); setPaused(false); } else { video.pause(); setPaused(true); } };
  return <button className="video-control" type="button" aria-label={`${paused ? "Play" : "Pause"} ${label}`} onClick={toggle}>{paused ? <Play fill="currentColor" /> : <Pause fill="currentColor" />}</button>;
}
