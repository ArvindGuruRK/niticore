"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Doodle } from "./doodle";

// One unbroken pen stroke — a flattened zigzag that spirals inward and down, traced off the
// reference mark: a dead-flat run right along the top, a pinched cusp at the right end, a long
// shallow diagonal back to a blunt U-turn at the left, a second shallow pass right to another
// pinched cusp, then a tail that peels away down-left and stops pointing at the floor. Each pass
// is shorter than the last, which is what gives the mark its converging, hand-made look.
const STROKE =
  "M5 6 C 130 4, 290 4, 398 7 C 410 8, 412 15, 396 14 C 320 15, 200 24, 74 33 C 58 34, 56 39, 76 39 C 160 40, 260 44, 358 46 C 372 46, 373 52, 352 51 C 300 53, 262 58, 226 67 C 196 78, 168 90, 166 108";
const VB_W = 410;
const VB_H = 112;

/**
 * Hand-drawn scribble that underlines a heading. Finds the element matching `target` inside the
 * children, measures it, and scales the scribble from the word's own font size so its width always
 * matches the heading it marks. Tertiary (violet) by default — the design system's "illustration
 * and secondary highlight" accent, never the CTA green. Re-measures on resize and once web fonts
 * load. Decorative, so aria-hidden.
 */
export function Scribble({
  target,
  delay = 1,
  trigger = "load",
  triggerSelector,
  start,
  className,
  markClassName,
  children,
}: {
  /** CSS selector for the word/phrase to mark, for example "[data-scribble]". Must be an inline-block (or block) box so it can be measured. */
  target: string;
  delay?: number;
  trigger?: "view" | "load";
  /** See Doodle's `triggerSelector` — required if this mark sits inside a `position: sticky`
   *  ancestor, or ScrollTrigger's start point will be computed from the stuck position instead of
   *  the natural document position. */
  triggerSelector?: string;
  start?: string;
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
      // Slightly narrower than the block it marks — in the reference the stroke stops short of the
      // heading's widest line rather than overrunning it.
      const w = r.width * 0.92;
      const scale = w / VB_W;
      m.style.left = `${r.left - h.left}px`;
      m.style.top = `${r.bottom - h.top + fs * 0.04}px`;
      m.style.width = `${w}px`;
      m.style.height = `${VB_H * scale}px`;
      m.style.setProperty("--scribble-sw", `${Math.max(fs * 0.08, 3) / scale}`);
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
          paths={[STROKE]}
          viewBox={`0 -4 ${VB_W} ${VB_H}`}
          strokeWidth={5}
          trigger={trigger}
          triggerSelector={triggerSelector}
          start={start}
          delay={delay}
          duration={1.4}
          className={cn("size-full text-tertiary [&_path]:[stroke-width:var(--scribble-sw,5)]", markClassName)}
        />
      </span>
    </div>
  );
}
