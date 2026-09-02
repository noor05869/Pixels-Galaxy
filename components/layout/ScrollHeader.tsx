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
  return <div className="scroll-header" data-scroll-state={state}>{children}</div>;
}
