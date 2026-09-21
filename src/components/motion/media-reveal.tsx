"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right";

const HIDDEN: Record<Direction, string> = {
  up: "inset(0% 0% 100% 0%)", // wipes in from the top edge
  down: "inset(100% 0% 0% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};

type MediaRevealProps = ComponentProps<"div"> & {
  direction?: Direction;
  /** Inner scale settles from this value to 1 while the clip opens */
  zoom?: number;
};

/**
 * Clip-path wipe for images, screenshots and panels. The frame opens while its content
 * settles from a slight zoom. Once, on entering the viewport.
 */
export function MediaReveal({ direction = "up", zoom = 1.18, className, children, ...props }: MediaRevealProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const el = root.current!;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
        tl.fromTo(
          el,
          { clipPath: HIDDEN[direction] },
          { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow, ease: EASE.inOut },
        ).fromTo(
          el.firstElementChild,
          { scale: zoom },
          { scale: 1, duration: DUR.slow * 1.3, ease: EASE.out, clearProps: "transform" },
          0,
        );
      });
    },
    { scope: root, dependencies: [direction, zoom] },
  );

  return (
    <div ref={root} data-clip="" className={cn("overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}
