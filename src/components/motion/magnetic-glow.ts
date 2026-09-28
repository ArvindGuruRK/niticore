"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";

/**
 * The primary CTA's hover: the whole pill glides toward the cursor (magnetic pull), springing
 * back on leave. A quick press dip rides the same transform, so nothing fights GSAP for the
 * `transform` property. Fine pointers only, off under reduced motion.
 */
export function useMagneticGlow(root: RefObject<HTMLElement | null>, enabled = true) {
  useGSAP(
    () => {
      if (!enabled) return;
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        const el = root.current!;

        const tx = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
        const ty = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
        // quickTo can't drive the `scale` shorthand (GSAP warns "scale not eligible for reset" and
        // skips it), so the press dip tweens scaleX and scaleY together
        const scaleOpts = { duration: 0.3, ease: "power3.out" };
        const sx = gsap.quickTo(el, "scaleX", scaleOpts);
        const sy = gsap.quickTo(el, "scaleY", scaleOpts);
        const scale = (value: number) => {
          sx(value);
          sy(value);
        };

        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          // The pill only travels a fraction of the cursor offset, and less vertically than
          // horizontally, so it reads as a gentle pull rather than chasing the pointer.
          tx((e.clientX - (r.left + r.width / 2)) * 0.22);
          ty((e.clientY - (r.top + r.height / 2)) * 0.4);
        };
        const leave = () => {
          tx(0);
          ty(0);
          scale(1);
        };
        const down = () => scale(0.95);
        const up = () => scale(1);

        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointerup", up);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
          el.removeEventListener("pointerdown", down);
          el.removeEventListener("pointerup", up);
        };
      });
    },
    { scope: root, dependencies: [enabled] },
  );
}
