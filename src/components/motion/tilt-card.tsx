"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TiltCardProps = ComponentProps<"div"> & {
  /** Maximum rotation in degrees */
  max?: number;
};

/**
 * 3D tilt toward the pointer with a moving specular sheen. Springs back on leave.
 * Fine pointers only, off under reduced motion.
 */
export function TiltCard({ max = 9, className, children, ...props }: TiltCardProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        const el = root.current!;
        const sheen = el.querySelector("[data-sheen]");
        gsap.set(el, { transformPerspective: 900 });
        const opts = { duration: 0.5, ease: "power3.out" };
        const rx = gsap.quickTo(el, "rotationX", opts);
        const ry = gsap.quickTo(el, "rotationY", opts);
        const sx = gsap.quickTo(el, "--sx", opts);
        const sy = gsap.quickTo(el, "--sy", opts);

        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width; // 0..1
          const py = (e.clientY - r.top) / r.height;
          ry((px - 0.5) * 2 * max);
          rx((0.5 - py) * 2 * max);
          sx(px * 100);
          sy(py * 100);
        };
        const enter = () => gsap.to(sheen, { opacity: 1, duration: 0.4 });
        const leave = () => {
          rx(0);
          ry(0);
          gsap.to(sheen, { opacity: 0, duration: 0.6 });
        };

        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: root, dependencies: [max] },
  );

  return (
    <div
      ref={root}
      className={cn(
        "relative isolate overflow-hidden rounded-panel border border-line bg-surface p-6 shadow-panel will-change-transform",
        className,
      )}
      {...props}
    >
      <div
        data-sheen=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 [background:radial-gradient(420px_circle_at_calc(var(--sx,50)*1%)_calc(var(--sy,50)*1%),rgb(255_255_255/0.09),transparent_65%)]"
      />
      {children}
    </div>
  );
}
