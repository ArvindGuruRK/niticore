"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Doodle } from "./doodle";

// Traced off the reference mark rather than constructed from a perfect ellipse: the pen starts on
// the top-right, runs anticlockwise round a slightly egg-shaped loop — flat across the top, full
// and heavy at the bottom — comes back up the right side, then cuts *inside* the loop and runs
// left as a short horizontal tail tucked under the top arc. The asymmetry is the point; a true
// ellipse reads as a shape, not as a stroke someone drew.
// The box is stretched to fit the phrase, so the viewBox is drawn at roughly a phrase's aspect
// (2.6:1) instead of a word's — a near-square viewBox stretched this wide flattens the stroke into
// something that no longer reads as drawn.
const CIRCLE =
  "M268 16 C 230 6, 148 3, 92 12 C 48 19, 11 38, 8 62 C 5 87, 32 107, 72 117 C 124 129, 232 127, 286 111 C 320 101, 337 82, 333 60 C 331 44, 321 36, 300 33 C 272 29, 224 37, 172 35";
const VB_W = 340;
const VB_H = 130;

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
      // Short phrases need a pad set by the font size, not by their own width, or the ring chokes
      // the word; long ones need a proportional one so it does not swell. Whichever is larger wins.
      const padX = Math.max(r.width * 0.06, fs * 0.5);
      const ringHeight = fs * 1.72;
      const cy = r.top + r.height / 2;
      const boxW = r.width + padX * 2;
      m.style.left = `${r.left - h.left - padX}px`;
      m.style.top = `${cy - h.top - ringHeight / 2}px`;
      m.style.width = `${boxW}px`;
      m.style.height = `${ringHeight}px`;
      // No vector-effect here (see Doodle's `stretch` doc), so stroke-width is a plain SVG user
      // unit that gets scaled by the same non-uniform transform as the path. Divide the target CSS
      // pixel width by the box's average scale factor so the drawn line reads the same thickness
      // regardless of how wide or tall the ring ends up.
      const scale = (boxW / VB_W + ringHeight / VB_H) / 2;
      m.style.setProperty("--circle-sw", `${Math.max(fs * 0.07, 2.5) / scale}`);
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
          className={cn("size-full [&_path]:[stroke-width:var(--circle-sw,6)]", markClassName)}
        />
      </span>
    </div>
  );
}
