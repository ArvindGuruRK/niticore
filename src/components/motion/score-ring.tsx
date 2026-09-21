"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

type ScoreRingProps = {
  /** 0 to 100 */
  value: number;
  label?: string;
  size?: number;
  className?: string;
};

/** Status color is derived from the score: 75+ ok, 50+ warn, below that risk. */
function tone(value: number) {
  if (value >= 75) return "var(--color-status-ok)";
  if (value >= 50) return "var(--color-status-warn)";
  return "var(--color-status-risk)";
}

/**
 * Readiness gauge. The arc sweeps to the score while the number counts up, once, on entry.
 * The arc uses pathLength=100 so the dash math is just the score itself.
 */
export function ScoreRing({ value, label = "Readiness score", size = 176, className }: ScoreRingProps) {
  const root = useRef<HTMLDivElement>(null);
  const v = Math.min(100, Math.max(0, value));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          root.current!.querySelector("[data-arc]"),
          { strokeDashoffset: 100 },
          {
            strokeDashoffset: 100 - v,
            duration: DUR.slow * 1.4,
            ease: EASE.out,
            scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
          },
        );
      });
    },
    { scope: root, dependencies: [v] },
  );

  return (
    <div
      ref={root}
      role="img"
      aria-label={`${label}: ${Math.round(v)} out of 100`}
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-line)" strokeWidth="6" />
        <circle
          data-arc=""
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={tone(v)}
          strokeWidth="6"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - v}
        />
      </svg>
      {/* Text scales with the ring, not the viewport, so it always fits inside the arc */}
      <div className="relative flex max-w-[70%] flex-col items-center text-center" aria-hidden>
        <p
          className="font-display font-semibold leading-none tracking-[-0.04em] text-fg"
          style={{ fontSize: size * 0.3 }}
        >
          <CountUp to={v} />
        </p>
        <p className="mt-1 font-medium leading-tight text-fg-subtle" style={{ fontSize: Math.max(11, size * 0.075) }}>
          {label}
        </p>
      </div>
    </div>
  );
}
