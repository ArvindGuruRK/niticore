"use client";

import { useRef } from "react";
import { Check } from "@phosphor-icons/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * A checklist that ticks itself off: when it comes on screen, each item's check fills green in turn.
 * It plays every time it is scrolled back into view, re-arming only once it is fully off screen, so
 * it never resets while seen. 1, 2 or 3 across. Without motion every item is ticked.
 */
export function TickList({ items, step = 0.3, className }: { items: string[]; step?: number; className?: string }) {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const rows = gsap.utils.toArray<HTMLElement>("li", root.current);
        const set = (on: boolean) => rows.forEach((r) => (r.dataset.done = String(on)));
        const tl = gsap.timeline({ paused: true });
        rows.forEach((r, i) => {
          tl.call(() => (r.dataset.done = "true"), [], 0.2 + i * step);
          tl.fromTo(r.querySelector("[data-tick]"), { scale: 0.6 }, { scale: 1, duration: 0.4, ease: "back.out(2.4)" }, 0.2 + i * step);
        });
        set(false);
        ScrollTrigger.create({ trigger: root.current, start: "top 75%", onEnter: () => tl.restart() });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          onLeaveBack: () => {
            tl.pause(0);
            set(false);
          },
        });
        return () => set(true);
      });
    },
    { scope: root },
  );

  return (
    <ul ref={root} className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <li
          key={item}
          data-done="true"
          className="group flex items-center gap-4 rounded-panel border border-line bg-surface p-5 shadow-panel"
        >
          <span
            data-tick=""
            className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-line-strong text-transparent transition-colors duration-300 group-data-[done=true]:border-accent group-data-[done=true]:bg-accent group-data-[done=true]:text-accent-ink"
          >
            <Check weight="bold" aria-hidden className="size-4" />
          </span>
          <span className="type-body text-fg">{item}</span>
        </li>
      ))}
    </ul>
  );
}
