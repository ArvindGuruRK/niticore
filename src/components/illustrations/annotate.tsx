"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Doodle } from "./doodle";

// One continuous marker stroke, like a scribble pen: left to right, a sharp snap back on the
// diagonal, then a long run to the right again. DrawSVG follows it as a single pen pass.
const SCRIBBLE = "M0 16 C 180 8, 430 0, 698 2 L 193 48 C 400 42, 650 52, 856 64";
// The viewBox is 860 x 72. The box is always sized to this exact ratio so the drawing scales uniformly.
const VB_W = 860;
const VB_H = 72;

/**
 * Scribble underline that follows a word. Finds the element matching `target` inside the children,
 * measures it, and sizes the scribble from the word's own font size, so the stroke weight and
 * height stay in proportion at every breakpoint. Re-measures on resize and once web fonts load.
 * Decorative, so aria-hidden.
 */
export function Annotate({
  target,
  delay = 1,
  trigger = "load",
  className,
  markClassName,
  children,
}: {
  /** CSS selector for the word to underline, for example "[data-accent]". It must be an inline-block (or block) box so it can be measured, especially inside split text. */
  target: string;
  delay?: number;
  trigger?: "view" | "load";
  className?: string;
  markClassName?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const place = () => {
      const host = root.current;
      const el = host?.querySelector(target);
      const m = mark.current;
      if (!host || !el || !m) return;
      const h = host.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      // Sits inside the word width, starts a little in, hangs just under the baseline
      const w = r.width * 0.9;
      const scale = w / VB_W;
      m.style.left = `${r.left - h.left + r.width * 0.05}px`;
      m.style.top = `${r.bottom - h.top - fs * 0.1}px`;
      m.style.width = `${w}px`;
      m.style.height = `${VB_H * scale}px`;
      // Stroke weight is set in drawing units (screen px divided by scale), so it stays uniform
      m.style.setProperty("--annotate-sw", `${Math.max(fs * 0.065, 3) / scale}`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(root.current!);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
  }, [target]);

  return (
    <div ref={root} className={cn("relative", className)}>
      {children}
      <span ref={mark} aria-hidden className="pointer-events-none absolute">
        <Doodle
          paths={[SCRIBBLE]}
          viewBox={`0 -4 ${VB_W} ${VB_H}`}
          strokeWidth={5}
          trigger={trigger}
          delay={delay}
          duration={1.3}
          className={cn("size-full text-accent [&_path]:[stroke-width:var(--annotate-sw,5)]", markClassName)}
        />
      </span>
    </div>
  );
}
