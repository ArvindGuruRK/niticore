"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TiltCardProps = ComponentProps<"div"> & {
  /** Maximum rotation in degrees */
  max?: number;
  /** Classes for the outer frame, which is the layout item (e.g. flex-1 inside a flex row) */
  frameClassName?: string;
};

const SHEEN = 420; // sheen radius, px

/**
 * 3D tilt toward the pointer with a moving specular sheen. Springs back on leave.
 * Fine pointers only, off under reduced motion.
 *
 * Two layers, so the tilt stays smooth:
 * - The outer frame never moves. It holds the CSS perspective, is what gets measured, and is what
 *   listens to the pointer. Measuring the tilted card itself fed its own rotation back into the next
 *   reading (jitter), and as a tilted edge swung away from the cursor the browser fired pointerleave,
 *   snapped the card flat, then re-entered (flicker at the edges).
 * - The inner card only rotates. Its sheen is moved with transforms rather than by repainting a
 *   gradient each frame, so the effect stays on the compositor.
 * Perspective lives on the frame as plain CSS, so a parent Reveal clearing transforms can't flatten it.
 */
export function TiltCard({ max = 9, className, frameClassName, children, ...props }: TiltCardProps) {
  const frame = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        const f = frame.current!;
        const el = card.current!;
        const sheen = el.querySelector<HTMLElement>("[data-sheen]")!;
        const tilt = { duration: 0.6, ease: "power3.out" };
        const rx = gsap.quickTo(el, "rotationX", tilt);
        const ry = gsap.quickTo(el, "rotationY", tilt);
        const glide = { duration: 0.35, ease: "power3.out" };
        const sx = gsap.quickTo(sheen, "x", glide);
        const sy = gsap.quickTo(sheen, "y", glide);

        const read = (e: PointerEvent) => {
          const r = f.getBoundingClientRect(); // the frame is never transformed, so this is stable
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          return { x, y, px: x / r.width, py: y / r.height };
        };
        const move = (e: PointerEvent) => {
          const { x, y, px, py } = read(e);
          ry((px - 0.5) * 2 * max);
          rx((0.5 - py) * 2 * max);
          sx(x);
          sy(y);
        };
        const enter = (e: PointerEvent) => {
          // Start the sheen under the cursor instead of gliding in from the corner
          const { x, y } = read(e);
          gsap.set(sheen, { x, y });
          gsap.to(sheen, { opacity: 1, duration: 0.4, overwrite: "auto" });
          move(e);
        };
        const leave = () => {
          rx(0);
          ry(0);
          gsap.to(sheen, { opacity: 0, duration: 0.6, overwrite: "auto" });
        };

        f.addEventListener("pointerenter", enter);
        f.addEventListener("pointermove", move);
        f.addEventListener("pointerleave", leave);
        return () => {
          f.removeEventListener("pointerenter", enter);
          f.removeEventListener("pointermove", move);
          f.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: frame, dependencies: [max] },
  );

  return (
    <div ref={frame} className={cn("h-full [perspective:900px]", frameClassName)}>
      <div
        ref={card}
        className={cn(
          "relative isolate h-full overflow-hidden rounded-panel border border-line bg-surface p-card shadow-panel will-change-transform",
          className,
        )}
        {...props}
      >
        <div
          data-sheen=""
          aria-hidden
          className="pointer-events-none absolute -z-10 rounded-full opacity-0 [background:radial-gradient(circle,rgb(255_255_255/0.09),transparent_65%)]"
          style={{ width: SHEEN * 2, height: SHEEN * 2, left: -SHEEN, top: -SHEEN }}
        />
        {children}
      </div>
    </div>
  );
}
