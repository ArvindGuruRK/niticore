"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Idle float for margin illustrations: a slow bob and sway that starts once the doodle has drawn in
 * (`delay`), so the hero keeps a little life without anything competing with the copy.
 * Each instance gets a slightly different period, so neighbours never move in step. Off under reduced motion.
 */
export function Drift({
  delay = 0,
  amount = 10,
  className,
  children,
}: {
  delay?: number;
  /** Vertical travel in px; rotation sways by a third of this in degrees */
  amount?: number;
  className?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.to(root.current, {
          y: -amount,
          rotation: amount / 3,
          duration: gsap.utils.random(4.2, 5.6),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay,
        });
      });
    },
    { scope: root, dependencies: [delay, amount] },
  );

  return (
    <div ref={root} aria-hidden className={cn("pointer-events-none", className)}>
      {children}
    </div>
  );
}
