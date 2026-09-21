"use client";

import { useRef } from "react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(DrawSVGPlugin);

type DrawPathProps = {
  /** SVG path data. Each path is drawn in order. */
  paths: string[];
  viewBox: string;
  /** Tie the draw to scroll instead of playing once on entry */
  scrub?: boolean;
  strokeWidth?: number;
  /** Accessible description. Omit for purely decorative artwork. */
  label?: string;
  className?: string;
};

/**
 * Line-draw for connectors, flow diagrams and underlines. A faint track shows the full route,
 * and the green stroke draws over it. Without motion the finished drawing renders as is.
 */
export function DrawPath({ paths, viewBox, scrub = false, strokeWidth = 2, label, className }: DrawPathProps) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const strokes = gsap.utils.toArray<SVGPathElement>("[data-stroke]", root.current);
        gsap.fromTo(
          strokes,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: scrub ? EASE.linear : EASE.inOut,
            duration: DUR.slow * 1.6,
            stagger: scrub ? 0 : 0.25,
            scrollTrigger: scrub
              ? { trigger: root.current, start: "top 80%", end: "bottom 40%", scrub: 0.6 }
              : { trigger: root.current, start: "top 85%", once: true },
          },
        );
      });
    },
    { scope: root, dependencies: [scrub, paths.join("|")] },
  );

  return (
    <svg
      ref={root}
      viewBox={viewBox}
      fill="none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("h-auto w-full overflow-visible", className)}
    >
      {paths.map((d, i) => (
        <path key={`t${i}`} d={d} stroke="var(--color-line-strong)" strokeWidth={strokeWidth} strokeLinecap="round" />
      ))}
      {paths.map((d, i) => (
        <path
          key={`s${i}`}
          data-stroke=""
          d={d}
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
