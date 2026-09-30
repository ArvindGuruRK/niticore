"use client";

import { useRef } from "react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(DrawSVGPlugin);

// "RKAY" as a hand-written, slanted signature with an underline swoosh, in a 47 x 17 box.
// One path per pen stroke, written in order.
const STROKES = [
  "M2.5 12.5 L4.5 2.5 C9.5 1 11.5 4.2 8.5 6.6 C7.3 7.5 5.4 7.6 4.4 7.2 C6.8 8.6 8.2 10.6 10.2 12.4",
  "M13.8 2.4 L11.8 12.6 M18.2 2.6 C16 5.2 14.4 6.6 12.6 7.3 C14.8 8.2 16.3 10.2 18.2 12.3",
  "M19.6 12.6 C21 9 22.4 5.2 24 2.2 C25 5.6 26 9 27.2 12.4 M21.2 8.6 C23 8.2 24.6 8 26.2 7.9",
  "M28.6 2.4 C29.4 4.4 30.6 6 32 7 M35.6 2.2 C33.8 6 31.8 10 29.2 14.4",
  "M4 15 C14 13.2 28 12.8 44.5 11.4",
];

/**
 * Easter egg: the builder's signature. Its own small box is the only hot spot: hidden until the
 * pointer rests on it, then it rises and writes itself stroke by stroke (and un-writes on leave).
 * Touch has no hover, so a tap on the spot toggles it. Reduced motion shows it still. Violet line
 * art via currentColor; pre-hidden with data-draw.
 */
export function HandSignature({ className }: { className?: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: NO_REDUCE, fine: FINE_POINTER }, (ctx) => {
        const { motion, fine } = ctx.conditions as { motion: boolean; fine: boolean };
        if (!motion) return;
        const spot = root.current!;
        const svg = spot.querySelector("svg")!;
        const q = gsap.utils.selector(svg);

        const sign = gsap
          .timeline({ paused: true })
          .fromTo(svg, { opacity: 0, y: 4 }, { opacity: 0.6, y: 0, duration: 0.5, ease: "power2.out" }, 0)
          .fromTo(
            q("path"),
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 0.35, stagger: 0.18, ease: "power1.inOut" },
            0.1,
          );
        gsap.set(svg, { visibility: "visible" });

        if (!fine) {
          const onTap = () => (sign.progress() > 0 && !sign.reversed() ? sign.reverse() : sign.play());
          spot.addEventListener("click", onTap);
          return () => spot.removeEventListener("click", onTap);
        }

        const onEnter = () => sign.timeScale(1).play();
        const onLeave = () => sign.timeScale(1.6).reverse();
        spot.addEventListener("pointerenter", onEnter);
        spot.addEventListener("pointerleave", onLeave);
        return () => {
          spot.removeEventListener("pointerenter", onEnter);
          spot.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: root },
  );

  return (
    // A little padding around the mark so the hot spot is findable, but only just
    <span ref={root} aria-hidden className={cn("inline-flex p-2", className)}>
      <svg
        data-draw=""
        viewBox="0 0 47 17"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full overflow-visible opacity-60"
      >
        {STROKES.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}
