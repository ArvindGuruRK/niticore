"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  /** Pixels per second at rest */
  speed?: number;
  direction?: 1 | -1;
  pauseOnHover?: boolean;
  /** Scroll velocity speeds the loop up, and scrolling up reverses it */
  reactToScroll?: boolean;
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

        if (pauseOnHover) {
          const el = root.current!;
          const slow = () => gsap.to(tween, { timeScale: 0, duration: 0.5, overwrite: true });
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
        "overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] motion-reduce:overflow-x-auto",
        className,
      )}
    >
      <div ref={track} className="flex w-max">
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
