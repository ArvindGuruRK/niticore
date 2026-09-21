"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Panel with a cursor-following light: a soft fill glow plus a lit hairline border. Green by default;
 * pass `light` (space-separated RGB, e.g. "169 139 255") for a different colour. With `solid`, the fill is an
 * opaque disc in that colour with a crisp edge, instead of a soft translucent glow.
 * The light eases toward the pointer and fades out on leave. Fine pointers only, and
 * nothing renders under reduced motion beyond the plain panel.
 */
export function SpotlightCard({
  light,
  solid,
  className,
  style,
  children,
  ...props
}: ComponentProps<"div"> & { light?: string; solid?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        const el = root.current!;
        const lights = el.querySelectorAll("[data-light]");
        const x = gsap.quickTo(el, "--mx", { duration: 0.4, ease: "power3.out" });
        const y = gsap.quickTo(el, "--my", { duration: 0.4, ease: "power3.out" });

        // The pointer position is stored and re-applied every tick while hovered, so the light stays glued
        // to the cursor even when the card itself slides underneath it (marquee lanes), and it lets go the
        // moment the card has moved out from under a stationary pointer.
        let px = 0;
        let py = 0;
        let hovering = false;

        const inside = () => {
          const r = el.getBoundingClientRect();
          return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom ? r : null;
        };
        const follow = () => {
          const r = inside();
          if (!r) return leave();
          x(px - r.left);
          y(py - r.top);
        };
        const enter = (e: PointerEvent) => {
          px = e.clientX;
          py = e.clientY;
          const r = el.getBoundingClientRect();
          gsap.set(el, { "--mx": px - r.left, "--my": py - r.top });
          gsap.to(lights, { opacity: 1, duration: 0.4, overwrite: true });
          if (!hovering) {
            hovering = true;
            gsap.ticker.add(follow);
          }
        };
        const move = (e: PointerEvent) => {
          px = e.clientX;
          py = e.clientY;
        };
        function leave() {
          if (hovering) {
            hovering = false;
            gsap.ticker.remove(follow);
          }
          gsap.to(lights, { opacity: 0, duration: 0.6, overwrite: true });
        }

        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          gsap.ticker.remove(follow);
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={cn(
        "relative isolate overflow-hidden rounded-panel border border-line bg-surface p-6 shadow-panel",
        className,
      )}
      style={light ? ({ ...style, "--light": light } as React.CSSProperties) : style}
      {...props}
    >
      <div
        data-light=""
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 opacity-0",
          solid
            ? "[background:radial-gradient(150px_circle_at_calc(var(--mx,0)*1px)_calc(var(--my,0)*1px),rgb(var(--light,74_224_87))_0,rgb(var(--light,74_224_87))_97%,transparent_100%)]"
            : "[background:radial-gradient(360px_circle_at_calc(var(--mx,0)*1px)_calc(var(--my,0)*1px),rgb(var(--light,74_224_87)/0.13),transparent_70%)]",
        )}
      />
      <div
        data-light=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-transparent p-px opacity-0 [background:radial-gradient(240px_circle_at_calc(var(--mx,0)*1px)_calc(var(--my,0)*1px),rgb(var(--light,74_224_87)/0.9),transparent_70%)_border-box] [mask:linear-gradient(#000_0_0)_padding-box,linear-gradient(#000_0_0)] [mask-composite:exclude]"
      />
      {children}
    </div>
  );
}
