"use client";
import { Pause, Play } from "lucide-react";

export function VideoControl({ videoRef, paused, setPaused, label }: { videoRef: React.RefObject<HTMLVideoElement | null>; paused: boolean; setPaused: (paused: boolean) => void; label: string }) {
  const toggle = async () => { const video = videoRef.current; if (!video) return; if (video.paused) { await video.play(); setPaused(false); } else { video.pause(); setPaused(true); } };
  return <button className="absolute bottom-[26px] right-[26px] z-[4] grid size-[54px] cursor-pointer place-items-center rounded-full border border-[#43515d] bg-[#17212b] text-lime outline-offset-4 focus-visible:outline-[3px] focus-visible:outline-white [&_svg]:w-5 max-[540px]:size-[46px]" type="button" aria-label={`${paused ? "Play" : "Pause"} ${label}`} onClick={toggle}>{paused ? <Play fill="currentColor" /> : <Pause fill="currentColor" />}</button>;
}
