"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, FINE_POINTER, NO_REDUCE } from "@/lib/motion";

/**
 * A spotlight fill that expands from wherever the cursor enters a pill and collapses back
 * to wherever it leaves. Sets `data-filled` on the root while it is open, so the label can
 * flip colour. Fine pointers only, off under reduced motion.
 *
 * Animates `clip-path: circle(<px> at <px> <px>)` directly (GSAP interpolates the numbers
 * in matching complex-value strings). Pixel units, not `%`, since percentage radius isn't
 * relative to the box diagonal — pixels let the circle fully clear every corner from an
 * off-centre entry point.
 */
export function useFillHover(
  root: RefObject<HTMLElement | null>,
  fill: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useGSAP(
    () => {
      if (!enabled) return;
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        const el = root.current!;
        const layer = fill.current!;
        const circle = (x: number, y: number, r: number) => `circle(${r}px at ${x}px ${y}px)`;

        const point = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          // Farthest corner from the point, so the circle fully covers the pill.
          const dx = Math.max(x, r.width - x);
          const dy = Math.max(y, r.height - y);
          return { x, y, radius: Math.hypot(dx, dy) };
        };

        const enter = (e: PointerEvent) => {
          const { x, y, radius } = point(e);
          el.dataset.filled = "";
          gsap.set(layer, { clipPath: circle(x, y, 0) });
          gsap.to(layer, { clipPath: circle(x, y, radius), duration: DUR.fast, ease: EASE.out, overwrite: true });
        };
        const leave = (e: PointerEvent) => {
          const { x, y } = point(e);
          delete el.dataset.filled;
          gsap.to(layer, { clipPath: circle(x, y, 0), duration: DUR.fast, ease: EASE.out, overwrite: true });
        };

        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointerleave", leave);
          delete el.dataset.filled;
        };
      });
    },
    { dependencies: [enabled] },
  );
}
