"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type VerticalTab = {
  id: string;
  /** Tab face: can hold a logo, a name and a sub-line */
  label: ReactNode;
  content: ReactNode;
};

/**
 * Side tabs: a list of options on the left, the selected one raised, and a large panel on the right
 * that fades up on every switch. The panel area keeps the tallest panel's height, so switching
 * never moves the page. From lg the list is centred vertically against the panel, so the space above
 * and below it is even. Stacks (list above panel) below lg.
 * With `interval` (seconds) it advances by itself while on screen, and a green line fills along the
 * bottom of the selected tab as the countdown. It never stops: hovering does not pause it, and a
 * click or the arrow keys just jump to that tab and the countdown carries on from there.
 * `layout="top"` puts the options in a row of tiles above the panel instead (2, 3 or 6 across).
 * Anything marked `data-pop` inside a panel pops in one by one after each switch (chips, badges).
 * WAI-ARIA tabs: roving tabindex, arrow keys (up/down and left/right), Home and End.
 * Reduced motion: no autoplay, and the panel swaps instantly.
 */
export function VerticalTabs({
  tabs,
  label,
  interval,
  layout = "side",
  className,
}: {
  tabs: VerticalTab[];
  label: string;
  interval?: number;
  layout?: "side" | "top";
  className?: string;
}) {
  const top = layout === "top";
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(tabs[0]?.id);
  const first = useRef(true);
  const timer = useRef<{ tween: gsap.core.Tween; trigger: ScrollTrigger } | null>(null);

  useGSAP(
    () => {
      const motion = window.matchMedia(NO_REDUCE).matches;
      if (!first.current && motion) {
        const panel = root.current!.querySelector(`[data-panel="${active}"]`);
        gsap.fromTo(panel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.base * 0.7, ease: EASE.out, clearProps: "transform" });
        const pops = panel?.querySelectorAll("[data-pop]");
        if (pops?.length) {
          gsap.fromTo(
            pops,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)", stagger: 0.07, delay: 0.2, clearProps: "transform" },
          );
        }
      }
      first.current = false;

      // One countdown at a time, restarted on every change of tab. It runs only while on screen.
      timer.current?.trigger.kill();
      timer.current?.tween.kill();
      timer.current = null;
      if (!motion || !interval) return;

      const el = root.current!;
      const tween = gsap.fromTo(
        el.querySelector(`[data-tab="${active}"] [data-progress]`),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: interval,
          ease: "none",
          paused: true,
          onComplete: () =>
            setActive((current) => tabs[(tabs.findIndex((t) => t.id === current) + 1) % tabs.length].id),
        },
      );
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 75%",
        end: "bottom 25%",
        onToggle: (self) => (self.isActive ? tween.resume() : tween.pause()),
      });
      if (trigger.isActive) tween.resume();
      timer.current = { tween, trigger };
    },
    { scope: root, dependencies: [active, interval] },
  );

  const choose = (id: string) => setActive(id);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const n = tabs.length;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? (index + 1) % n
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (index - 1 + n) % n
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    choose(tabs[next].id);
    root.current!.querySelector<HTMLElement>(`[data-tab="${tabs[next].id}"]`)?.focus();
  };

  return (
    <div
      ref={root}
      className={cn(top ? "flex flex-col gap-4" : "grid gap-6 lg:grid-cols-[minmax(0,21rem)_1fr] lg:gap-8", className)}
    >
      <div
        role="tablist"
        aria-label={label}
        aria-orientation={top ? "horizontal" : "vertical"}
        className={top ? "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" : "flex flex-col gap-2 self-start lg:self-center"}
      >
        {tabs.map((tab, i) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`${uid}-t-${tab.id}`}
              data-tab={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${uid}-p-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative overflow-hidden rounded-panel border p-4 text-left transition-colors duration-300",
                selected
                  ? "border-line-strong bg-raised"
                  : top
                    ? "border-line bg-surface hover:border-white/25"
                    : "border-transparent hover:bg-white/[0.04]",
              )}
            >
              {tab.label}
              {selected && Boolean(interval) && (
                <span aria-hidden className="absolute inset-x-5 bottom-2 h-0.5 overflow-hidden rounded-control bg-white/[0.07]">
                  <span data-progress="" className="block h-full origin-left scale-x-0 rounded-control bg-accent" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* All panels stack in one cell: the box keeps the tallest panel's height, so autoplay never
          shifts the page. Inactive panels are invisible and inert, not display: none. */}
      <div className="grid min-w-0">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <div
              key={tab.id}
              id={`${uid}-p-${tab.id}`}
              data-panel={tab.id}
              role="tabpanel"
              aria-labelledby={`${uid}-t-${tab.id}`}
              aria-hidden={!selected}
              inert={!selected}
              tabIndex={selected ? 0 : -1}
              className={cn("col-start-1 row-start-1 min-w-0", !selected && "invisible")}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
