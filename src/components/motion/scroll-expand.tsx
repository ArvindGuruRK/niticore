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

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const el = root.current!;
        const tl = gsap.timeline({
          defaults: { ease: EASE.linear },
          scrollTrigger: { trigger: el, start: "top 96%", end: "top 28%", scrub: 0.6 },
        });
        tl.fromTo(el, { scale: from, y: 48 }, { scale: 1, y: 0 }).fromTo(
          el.firstElementChild,
          { scale: depth },
          { scale: 1 },
          0,
        );
      });
    },
    { scope: root, dependencies: [from, depth] },
  );

  return (
    <div ref={root} className={cn("overflow-hidden will-change-transform", className)} {...props}>
      {children}
    </div>
  );
}
