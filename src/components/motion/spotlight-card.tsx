"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Panel with a cursor-following light: a soft green fill glow plus a lit hairline border.
 * The light eases toward the pointer and fades out on leave. Fine pointers only, and
 * nothing renders under reduced motion beyond the plain panel.
 */
export function SpotlightCard({ className, children, ...props }: ComponentProps<"div">) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        const el = root.current!;
        const lights = el.querySelectorAll("[data-light]");
        const x = gsap.quickTo(el, "--mx", { duration: 0.4, ease: "power3.out" });
        const y = gsap.quickTo(el, "--my", { duration: 0.4, ease: "power3.out" });

        const enter = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          gsap.set(el, { "--mx": e.clientX - r.left, "--my": e.clientY - r.top });
          gsap.to(lights, { opacity: 1, duration: 0.4, overwrite: true });
        };
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          x(e.clientX - r.left);
          y(e.clientY - r.top);
        };
        const leave = () => gsap.to(lights, { opacity: 0, duration: 0.6, overwrite: true });

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
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={cn(
        "relative isolate overflow-hidden rounded-panel border border-line bg-surface p-6 shadow-panel",
        className,
      )}
      {...props}
    >
      <div
        data-light=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 [background:radial-gradient(360px_circle_at_calc(var(--mx,0)*1px)_calc(var(--my,0)*1px),rgb(74_224_87/0.13),transparent_70%)]"
      />
      <div
        data-light=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-transparent p-px opacity-0 [background:radial-gradient(240px_circle_at_calc(var(--mx,0)*1px)_calc(var(--my,0)*1px),rgb(74_224_87/0.9),transparent_70%)_border-box] [mask:linear-gradient(#000_0_0)_padding-box,linear-gradient(#000_0_0)] [mask-composite:exclude]"
      />
      {children}
    </div>
  );
}
