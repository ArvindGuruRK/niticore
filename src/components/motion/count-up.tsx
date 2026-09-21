"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";

/** Number tween that counts from 0 when it enters the viewport. Renders the final value without JS. */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  className,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const format = (v: number) => v.toFixed(decimals) + suffix;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const state = { value: 0 };
        el.current!.textContent = format(0);
        gsap.to(state, {
          value: to,
          duration: DUR.slow * 1.4,
          ease: EASE.out,
          onUpdate: () => {
            el.current!.textContent = format(state.value);
          },
          scrollTrigger: { trigger: el.current, start: "top 90%", toggleActions: "play none none none" },
        });
      });
    },
    { scope: el },
  );

  return (
    <span ref={el} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(to)}
    </span>
  );
}
