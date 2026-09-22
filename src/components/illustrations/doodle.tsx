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
  /** CSS selector for the element ScrollTrigger should watch, if not the SVG itself. Needed
   *  whenever the SVG lives inside a `position: sticky` ancestor: a stuck element's
   *  getBoundingClientRect() reflects wherever it happens to be pinned, not its natural place in
   *  the document, so ScrollTrigger can compute a start point that's wildly wrong (confirmed: a
   *  scribble nested in a sticky column fired while its heading was still ~2900px below the
   *  viewport). Point this at a stable ancestor instead — the section, say — so document position
   *  stays predictable. */
  triggerSelector?: string;
  delay?: number;
  duration?: number;
  /** ScrollTrigger's "start", e.g. "top 90%" (fires when the trigger's top is 90% down the
   *  viewport — i.e. barely peeking in) or "top 65%" (fires later, once it's substantially
   *  visible). Only used when `trigger` is "view". */
  start?: string;
  /** Gap between each path's start, in seconds. Equal to `duration` draws one stroke fully before
   * the next begins (an even, one-at-a-time build); smaller values let strokes overlap. */
  stagger?: number;
  /** Stretch non-uniformly to fill the box (preserveAspectRatio="none"), for marks whose box aspect
   *  ratio varies per instance (e.g. a ring sized to an arbitrary word/phrase). Do NOT pair this with
   *  a non-scaling stroke: `vector-effect: non-scaling-stroke` makes Chromium compute the dash
   *  pattern in post-transform (screen) space instead of path space, so under a non-uniform scale the
   *  dash percentage no longer matches the fraction of the path actually drawn — segments oriented
   *  along the more-stretched axis reveal faster, and the stroke can look fully drawn well before the
   *  tween reaches 100%. Confirmed empirically: stripping vector-effect fixed a circle mark whose tail
   *  was rendering fully by ~65% progress. Accept a mildly uneven stroke width instead. */
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
  triggerSelector,
  delay = 0,
  duration = 1.1,
  start = "top 90%",
  stagger = 0.28,
  stretch = false,
  className,
}: DoodleProps) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.set(root.current, { visibility: "visible" });
        const triggerEl = (triggerSelector && document.querySelector(triggerSelector)) || root.current;
        gsap.fromTo(
          gsap.utils.toArray("path", root.current),
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration,
            delay,
            stagger,
            ease: "power2.inOut",
            scrollTrigger: trigger === "view" ? { trigger: triggerEl, start, once: true } : undefined,
          },
        );
      });
    },
    { scope: root, dependencies: [trigger, triggerSelector, delay, duration, start, stagger, paths.join("|")] },
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
        />
      ))}
    </svg>
  );
}
