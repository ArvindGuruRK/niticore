"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Pinned horizontal track: vertical scroll drives the cards sideways, with a progress hairline.
 * Only on lg+ screens (1024px and up) without reduced motion. Everywhere else the track is a native,
 * swipeable row, so touch users and keyboard users keep normal scrolling.
 * Give each child a fixed width (for example w-[80vw] lg:w-[26rem] shrink-0).
 */
export function HorizontalScroll({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and (min-width: 1024px)`, () => {
        const distance = () => Math.max(track.current!.scrollWidth - viewport.current!.clientWidth, 0);
        gsap.set(viewport.current, { overflow: "hidden" });

        const tl = gsap.timeline({
          defaults: { ease: EASE.linear },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track.current, { x: () => -distance() }, 0).fromTo(
          root.current!.querySelector("[data-bar]"),
          { scaleX: 0 },
          { scaleX: 1 },
          0,
        );
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={cn("flex flex-col justify-center gap-8 lg:min-h-[100dvh] motion-reduce:lg:min-h-0", className)}
    >
      <div ref={viewport} className="overflow-x-auto pb-2 [scrollbar-width:thin]">
        <div ref={track} className="flex w-max gap-5 pr-4">
          {children}
        </div>
      </div>
      <div className="hidden h-px w-full bg-line-strong lg:block motion-reduce:hidden" aria-hidden>
        <div data-bar="" className="h-full origin-left scale-x-0 bg-accent" />
      </div>
    </div>
  );
}
