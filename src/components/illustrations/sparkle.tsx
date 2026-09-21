"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Doodle } from "./doodle";

const STAR = "M50 3 C54 30 70 46 97 50 C70 54 54 70 50 97 C46 70 30 54 3 50 C30 46 46 30 50 3 Z";

/** Four-point sparkle. Draws itself, then twinkles slowly (scale and turn) once it is in. */
export function Sparkle({
  size = 56,
  delay = 0,
  trigger = "view",
  className,
}: {
  size?: number;
  delay?: number;
  trigger?: "view" | "load";
  className?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.to(root.current, {
          scale: 1.16,
          rotation: 14,
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: delay + 1.6,
        });
      });
    },
    { scope: root, dependencies: [delay] },
  );

  return (
    <span ref={root} aria-hidden className={cn("pointer-events-none inline-block", className)} style={{ width: size, height: size }}>
      <Doodle paths={[STAR]} viewBox="0 0 100 100" strokeWidth={3.5} trigger={trigger} delay={delay} className="size-full" />
    </span>
  );
}
