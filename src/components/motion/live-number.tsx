"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";

/**
 * A number that rolls from its previous value to each new one (CountUp counts once from 0 on entry;
 * this follows a value that keeps changing, like a live score). React renders only the first value;
 * after that GSAP owns the text, so React never flashes the final number before the roll.
 * Reduced motion: the number swaps instantly.
 */
export function LiveNumber({ value, className }: { value: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const [initial] = useState(Math.round(value));
  const shown = useRef({ v: initial });

  useGSAP(
    () => {
      const write = () => (el.current!.textContent = String(Math.round(shown.current.v)));
      if (!window.matchMedia(NO_REDUCE).matches) {
        shown.current.v = value;
        write();
        return;
      }
      gsap.to(shown.current, { v: value, duration: DUR.base, ease: EASE.out, overwrite: true, onUpdate: write });
    },
    { dependencies: [value] },
  );

  return (
    <span ref={el} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {initial}
    </span>
  );
}
