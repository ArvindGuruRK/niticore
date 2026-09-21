"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE, STAGGER } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

type Row = {
  label: string;
  /** 0 to 100 */
  value: number;
};

/** Horizontal coverage bars. Fills grow left to right in sequence while the numbers count up. */
export function BarMeter({ rows, className }: { rows: Row[]; className?: string }) {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          gsap.utils.toArray("[data-fill]", root.current),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: DUR.slow,
            ease: EASE.out,
            stagger: STAGGER,
            scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
          },
        );
      });
    },
    { scope: root, dependencies: [rows.length] },
  );

  return (
    <ul ref={root} className={cn("flex flex-col gap-5", className)}>
      {rows.map((row) => {
        const v = Math.min(100, Math.max(0, row.value));
        return (
          <li key={row.label} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-semibold text-fg">{row.label}</span>
              <span className="text-sm font-bold text-accent">
                <CountUp to={v} suffix="%" />
              </span>
            </div>
            <div
              role="meter"
              aria-label={row.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={v}
              className="h-2 overflow-hidden rounded-control bg-white/[0.07]"
            >
              <div data-fill="" className="h-full origin-left rounded-control bg-accent" style={{ width: `${v}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
