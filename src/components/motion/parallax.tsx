"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Scrubbed depth: the child drifts by +/- `amount` percent while the wrapper crosses the viewport. */
export function Parallax({
  amount = 12,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { amount?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          root.current!.firstElementChild,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: EASE.linear,
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}
