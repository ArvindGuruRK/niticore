"use client";

import { useRef } from "react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(DrawSVGPlugin);

export type DoodleProps = {
  /** Hand-drawn stroke paths. Drawn in order, one after another. */
  paths: string[];
  viewBox: string;
  strokeWidth?: number;
  /** "load" draws right after mount (hero), "view" draws once when scrolled into view */
  trigger?: "view" | "load";
  delay?: number;
  duration?: number;
  /** Stretch to the box and keep a constant stroke width (used for underlines that follow a word) */
  stretch?: boolean;
  /** Colour comes from currentColor, so set it with a text-* class */
  className?: string;
};

/**
 * Base for every illustration: line art that draws itself with DrawSVG. Decorative only
 * (aria-hidden). Hidden by CSS until GSAP takes over, and shown fully drawn under reduced motion.
 */
export function Doodle({
  paths,
  viewBox,
  strokeWidth = 3,
  trigger = "view",
  delay = 0,
  duration = 1.1,
  stretch = false,
  className,
}: DoodleProps) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.set(root.current, { visibility: "visible" });
        gsap.fromTo(
          gsap.utils.toArray("path", root.current),
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration,
            delay,
            stagger: 0.28,
            ease: "power2.inOut",
            scrollTrigger: trigger === "view" ? { trigger: root.current, start: "top 90%", once: true } : undefined,
          },
        );
      });
    },
    { scope: root, dependencies: [trigger, delay, duration, paths.join("|")] },
  );

  return (
    <svg
      ref={root}
      data-draw=""
      aria-hidden
      viewBox={viewBox}
      fill="none"
      preserveAspectRatio={stretch ? "none" : undefined}
      className={cn("overflow-visible", className)}
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect={stretch ? "non-scaling-stroke" : undefined}
        />
      ))}
    </svg>
  );
}
