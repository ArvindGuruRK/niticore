"use client";

import { Children, useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Where the first card sticks (clear of the docked nav), and how far each later card sits below it. */
const TOP_REM = 7.5;
const STEP_REM = 1.75;

/**
 * Sticky scroll stack: from lg, each card sticks near the top and the next one slides up over it,
 * while the card underneath settles back (scales down and dims under a veil), scrubbed to scroll. A
 * short offset per card leaves each earlier card's top edge peeking out, like a deck. Below lg (and under reduced
 * motion) the cards are a plain stack with no sticking: no pinned-feeling scroll on touch screens.
 */
export function StackCards({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const cards = Children.toArray(children);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and (min-width: 1024px)`, () => {
        const slots = gsap.utils.toArray<HTMLElement>("[data-stack-slot]", root.current);
        slots.forEach((slot, i) => {
          const next = slots[i + 1];
          if (!next) return;
          const scrollTrigger = {
            trigger: next,
            start: "top bottom",
            end: () => `top ${(TOP_REM + (i + 1) * STEP_REM) * 16}px`,
            scrub: 0.4,
            invalidateOnRefresh: true,
          };
          gsap.to(slot.querySelector("[data-stack-card]"), { scale: 0.92, ease: "none", transformOrigin: "50% 0%", scrollTrigger });
          // Dimmed with a canvas-coloured veil, not opacity: a see-through card showed the one beneath it
          gsap.to(slot.querySelector("[data-stack-veil]"), { opacity: 0.6, ease: "none", scrollTrigger });
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("flex flex-col gap-4 lg:gap-[16vh]", className)}>
      {cards.map((card, i) => (
        <div
          key={i}
          data-stack-slot=""
          className="lg:sticky"
          style={{ top: `${TOP_REM + i * STEP_REM}rem` }}
        >
          <div data-stack-card="" className="relative">
            {card}
            <div
              data-stack-veil=""
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[calc(var(--radius-panel)+0.5rem)] bg-canvas opacity-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
