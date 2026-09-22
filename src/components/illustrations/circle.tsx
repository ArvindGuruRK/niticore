"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Doodle } from "./doodle";

// A proper closed ellipse (precise Bezier construction, not a hand-guessed wobble) with a short
// tail that overshoots the start point on close — like a marker circling a word in one continuous
// loop and crossing back over its own start.
const CIRCLE =
  "M100,8 C150.8,8 192,40.2 192,80 C192,119.8 150.8,152 100,152 C49.2,152 8,119.8 8,80 C8,40.2 49.2,8 100,8 C112,4 122,4 130,10";
const VB_W = 200;
const VB_H = 160;

/**
 * Hand-drawn ring that circles a word or short phrase, like marking it up with a marker. Finds the
 * element matching `target` inside the children, measures it, and scales the ring from its bounding
 * box so it stays proportional at every breakpoint. Re-measures on resize and once web fonts load.
 * Decorative, so aria-hidden.
 */
export function Circle({
  target,
  delay = 1,
  trigger = "load",
  className,
  markClassName,
  children,
}: {
  /** CSS selector for the word/phrase to circle, for example "[data-circle]". It must be an inline-block (or block) box so it can be measured. */
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
      // Height comes from the word's own font size, not its line box — a line box includes leading
      // above/below the glyphs that can be much taller than the visible letterforms, which is what
      // made the ring balloon into the next line. Centered on the word's own vertical midpoint.
      const padX = r.width * 0.2;
      const ringHeight = fs * 1.8;
      const cy = r.top + r.height / 2;
      m.style.left = `${r.left - h.left - padX}px`;
      m.style.top = `${cy - h.top - ringHeight / 2}px`;
      m.style.width = `${r.width + padX * 2}px`;
      m.style.height = `${ringHeight}px`;
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
          paths={[CIRCLE]}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          strokeWidth={6}
          trigger={trigger}
          delay={delay}
          duration={1}
          stretch
          className={cn("size-full", markClassName)}
        />
      </span>
    </div>
  );
}
