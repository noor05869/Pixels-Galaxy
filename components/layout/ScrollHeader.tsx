"use client";
import { useEffect, useRef, useState } from "react";

export function ScrollHeader({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"top" | "shown" | "hidden">("top");
  const previous = useRef(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const current = window.scrollY;
      const delta = current - previous.current;
      setState((value) => {
        const next = current < 80 ? "top" : delta > 12 ? "hidden" : delta < -8 ? "shown" : value;
        return value === next ? value : next;
      });
      previous.current = current;
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <div className="sticky top-0 z-[80] will-change-transform transition-[transform,filter] duration-[260ms] [transition-timing-function:cubic-bezier(.22,1,.36,1)] data-[scroll-state=hidden]:-translate-y-[110%] data-[scroll-state=shown]:translate-y-0 data-[scroll-state=shown]:drop-shadow-[0_10px_18px_rgba(2,16,50,.25)] motion-reduce:transition-none" data-scroll-state={state}>{children}</div>;
}
