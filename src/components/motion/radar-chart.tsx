"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Axis = {
  label: string;
  /** 0 to 100, or null while unknown (drawn at the centre, label dimmed) */
  value: number | null;
};

const SIZE = 200; // viewBox is SIZE x SIZE, centred
const R = 100; // outer ring radius in viewBox units; labels sit outside it in HTML

/** Point on axis i of n at `v` (0 to 100), starting at 12 o'clock and going clockwise. */
function point(i: number, n: number, v: number) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const r = (Math.max(0, Math.min(100, v)) / 100) * R;
  // Rounded: server and browser trig can differ in the last digits, which breaks hydration
  const round = (n: number) => Math.round(n * 100) / 100;
  return [round(SIZE / 2 + r * Math.cos(a)), round(SIZE / 2 + r * Math.sin(a))] as const;
}

const polygon = (values: number[]) => values.map((v, i) => point(i, values.length, v).join(",")).join(" ");

/**
 * Spider graph. The shape grows out from the centre the first time it scrolls into view, and after
 * that morphs to every new set of values (the readiness check redraws it on each answer). Rings mark
 * `rings` on the 0 to 100 scale, so uneven rings can show score bands. Axis labels are HTML around
 * the chart, so they stay readable at any size. Pass `active` to light one axis.
 * Reduced motion: values snap.
 */
export function RadarChart({
  axes,
  rings = [25, 50, 75, 100],
  active,
  label,
  className,
}: {
  axes: Axis[];
  rings?: number[];
  active?: number;
  /** Accessible name for the whole chart */
  label: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const n = axes.length;
  const target = axes.map((a) => a.value ?? 0);
  const key = target.join(",");
  // What is currently drawn. GSAP tweens this array and every frame writes it to the SVG.
  const drawn = useRef<number[] | null>(null);
  const seen = useRef(false);

  useGSAP(
    () => {
      const el = root.current!;
      const shape = el.querySelector("[data-shape]")!;
      const dots = el.querySelectorAll<SVGCircleElement>("[data-dot]");
      const draw = (vals: number[]) => {
        shape.setAttribute("points", polygon(vals));
        dots.forEach((d, i) => {
          const [x, y] = point(i, vals.length, vals[i]);
          d.setAttribute("cx", String(x));
          d.setAttribute("cy", String(y));
        });
      };
      const to = key.split(",").map(Number);

      if (!window.matchMedia(NO_REDUCE).matches) {
        drawn.current = to;
        draw(to);
        return;
      }

      const play = () => {
        seen.current = true;
        gsap.to(drawn.current!, {
          endArray: to,
          duration: DUR.base,
          ease: EASE.out,
          overwrite: true,
          onUpdate: () => draw(drawn.current!),
        });
      };

      if (!drawn.current) {
        // First run: start collapsed and grow on first view
        drawn.current = to.map(() => 0);
        draw(drawn.current);
        ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: play });
      } else if (seen.current) {
        play();
      }
    },
    { scope: root, dependencies: [key] },
  );

  return (
    // Padding reserves room for the labels outside the outer ring
    <div role="img" aria-label={label} className={cn("w-full px-[4.25rem] py-10 sm:px-24", className)}>
      <div ref={root} className="relative aspect-square w-full">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="absolute inset-0 size-full overflow-visible">
          {rings.map((r) => (
            <polygon
              key={r}
              points={polygon(axes.map(() => r))}
              fill="none"
              stroke="var(--color-line-strong)"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {axes.map((a, i) => {
            const [x, y] = point(i, n, 100);
            return (
              <line
                key={a.label}
                x1={SIZE / 2}
                y1={SIZE / 2}
                x2={x}
                y2={y}
                stroke={i === active ? "var(--color-tertiary)" : "var(--color-line-strong)"}
                strokeWidth={i === active ? 1.5 : 1}
                vectorEffect="non-scaling-stroke"
                className="transition-[stroke] duration-300"
              />
            );
          })}
          <polygon
            data-shape=""
            points={polygon(target)}
            fill="var(--color-tertiary)"
            fillOpacity="0.22"
            stroke="var(--color-tertiary)"
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {axes.map((a, i) => {
            const [x, y] = point(i, n, target[i]);
            return (
              <circle
                key={a.label}
                data-dot=""
                cx={x}
                cy={y}
                r="3.2"
                fill="var(--color-canvas)"
                stroke="var(--color-tertiary-soft)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className={cn("transition-opacity duration-300", a.value === null && "opacity-0")}
              />
            );
          })}
        </svg>

        {/* Labels: centred above and below, pushed outward on the sides */}
        {axes.map((a, i) => {
          const [x, y] = point(i, n, 114);
          const side = Math.abs(x - SIZE / 2) < 1 ? "mid" : x > SIZE / 2 ? "right" : "left";
          return (
            <span
              key={a.label}
              aria-hidden
              className={cn(
                "absolute w-max max-w-[5.25rem] text-[0.6875rem] font-semibold leading-tight transition-colors duration-300 sm:max-w-[7.5rem] sm:text-[0.8125rem]",
                side === "mid" && "-translate-x-1/2 text-center",
                side === "right" && "text-left",
                side === "left" && "-translate-x-full text-right",
                y < SIZE / 2 - 1 ? "-translate-y-full" : y > SIZE / 2 + 1 ? "" : "-translate-y-1/2",
                i === active ? "text-tertiary-soft" : a.value === null ? "text-fg-subtle/70" : "text-fg-muted",
              )}
              style={{ left: `${(x / SIZE) * 100}%`, top: `${(y / SIZE) * 100}%` }}
            >
              {a.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
