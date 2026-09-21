"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ScrollExpandProps = ComponentProps<"div"> & {
  /** Frame scale at the start of the scrub. It grows to 1 as the frame reaches the middle of the screen */
  from?: number;
  /** Inner content starts this much larger and settles to 1, so the picture drifts inside the frame */
  depth?: number;
};

/**
 * Scrubbed expand for video and hero media. The frame starts small and lifted, then grows to full size
 * as it scrolls toward the middle of the viewport, while the content inside settles back for depth.
 * Tied to scroll position (reversible), unlike MediaReveal which plays once and is meant for images.
 */
export function ScrollExpand({ from = 0.82, depth = 1.14, className, children, ...props }: ScrollExpandProps) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const el = frame.current!;
        // The trigger is the untransformed wrapper, so its measured position never includes the scale
        // and offset being animated. scrub is true: Lenis already smooths the scroll, and a second
        // layer of scrub smoothing made the frame lag behind and then catch up (felt as a jerk).
        const tl = gsap.timeline({
          defaults: { ease: EASE.linear },
          scrollTrigger: { trigger: root.current, start: "top 96%", end: "top 28%", scrub: true },
        });
        tl.fromTo(el, { scale: from, y: 48, force3D: true }, { scale: 1, y: 0 }).fromTo(
          el.firstElementChild,
          { scale: depth, force3D: true },
          { scale: 1 },
          0,
        );
      });
    },
    { scope: root, dependencies: [from, depth] },
  );

  return (
    <div ref={root} {...props}>
      <div ref={frame} className={cn("overflow-hidden [backface-visibility:hidden]", className)}>
        {children}
      </div>
    </div>
  );
}
