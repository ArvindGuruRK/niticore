"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  /** Pixels per second at rest */
  speed?: number;
  direction?: 1 | -1;
  pauseOnHover?: boolean;
  /** Scroll velocity speeds the loop up, and scrolling up reverses it */
  reactToScroll?: boolean;
  /** Soft fade at both edges. Turn off on a solid bar, where the fade colour would show. */
  fade?: boolean;
  className?: string;
};

/**
 * Seamless loop. The children render twice (the copy is aria-hidden) and the track slides
 * exactly one copy. Duration is recomputed from the measured width on resize.
 * Under reduced motion it becomes a static, horizontally scrollable row.
 */
export function Marquee({
  children,
  speed = 60,
  direction = 1,
  pauseOnHover = true,
  reactToScroll = true,
  fade = true,
  className,
}: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const tween = gsap.fromTo(
          track.current,
          { xPercent: direction === 1 ? 0 : -50 },
          { xPercent: direction === 1 ? -50 : 0, duration: 20, ease: "none", repeat: -1 },
        );
        const fit = () => tween.duration(Math.max(group.current!.getBoundingClientRect().width / speed, 1));
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(group.current!);

        const cleanups: Array<() => void> = [() => ro.disconnect()];

        // Off-screen lanes stop ticking, so they cost nothing while the user is elsewhere on the page
        const io = new IntersectionObserver(([entry]) => tween.paused(!entry.isIntersecting), { rootMargin: "80px" });
        io.observe(root.current!);
        cleanups.push(() => io.disconnect());

        if (reactToScroll) {
          const st = ScrollTrigger.create({
            start: 0,
            end: "max",
            onUpdate: (self) => {
              const boost = Math.min(Math.abs(self.getVelocity()) / 500, 4);
              gsap.to(tween, { timeScale: self.direction * (1 + boost), duration: 0.2, overwrite: true });
              gsap.to(tween, { timeScale: 1, duration: 0.9, delay: 0.2, overwrite: "auto" });
            },
          });
          cleanups.push(() => st.kill());
        }

        // Mouse only: on touch, pointerenter fires as a swipe begins and froze the lane mid-scroll
        if (pauseOnHover && window.matchMedia(FINE_POINTER).matches) {
          const el = root.current!;
          const slow = () => gsap.to(tween, { timeScale: 0, duration: 0.25, overwrite: true });
          const resume = () => gsap.to(tween, { timeScale: 1, duration: 0.5, overwrite: true });
          el.addEventListener("pointerenter", slow);
          el.addEventListener("pointerleave", resume);
          cleanups.push(() => {
            el.removeEventListener("pointerenter", slow);
            el.removeEventListener("pointerleave", resume);
          });
        }

        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root, dependencies: [speed, direction, pauseOnHover, reactToScroll] },
  );

  return (
    <div
      ref={root}
      className={cn(
        "relative overflow-hidden motion-reduce:overflow-x-auto",
        className,
      )}
    >
      {/* Edge fades are overlays, not a mask-image: a mask on the parent repaints every moving frame */}
      {fade && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[8%] bg-gradient-to-r from-canvas to-transparent motion-reduce:hidden"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[8%] bg-gradient-to-l from-canvas to-transparent motion-reduce:hidden"
          />
        </>
      )}
      <div ref={track} className="flex w-max will-change-transform">
        <div ref={group} className="flex shrink-0 items-center">
          {children}
        </div>
        <div className="flex shrink-0 items-center motion-reduce:hidden" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
