"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * Tabs with a sliding pill indicator and a fade-rise panel swap. Follows the WAI-ARIA tabs
 * pattern: roving tabindex, arrow keys, Home and End. The indicator re-measures on resize.
 * Under reduced motion the indicator jumps and the panel swaps instantly.
 * `align="center"` centres the pill row over the panel (default: left).
 */
export function Tabs({
  tabs,
  align = "start",
  className,
}: {
  tabs: Tab[];
  align?: "start" | "center";
  className?: string;
}) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(tabs[0]?.id);
  const first = useRef(true);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const list = root.current!.querySelector<HTMLElement>("[role=tablist]")!;
      const indicator = list.querySelector("[data-indicator]");
      const place = (animate: boolean) => {
        const tab = list.querySelector<HTMLElement>(`[data-tab="${active}"]`);
        if (!tab) return;
        gsap.to(indicator, {
          x: tab.offsetLeft,
          width: tab.offsetWidth,
          duration: animate && !reduce ? DUR.base * 0.6 : 0,
          ease: EASE.out,
          overwrite: true,
        });
      };
      place(!first.current);

      if (!first.current && !reduce) {
        gsap.fromTo(
          root.current!.querySelector(`[data-content="${active}"]`),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: DUR.base * 0.7, ease: EASE.out, clearProps: "transform" },
        );
      }
      first.current = false;

      const ro = new ResizeObserver(() => place(false));
      ro.observe(list);
      return () => ro.disconnect();
    },
    { scope: root, dependencies: [active] },
  );

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (index + 1) % tabs.length
      : e.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(tabs[next].id);
    root.current!.querySelector<HTMLElement>(`[data-tab="${tabs[next].id}"]`)?.focus();
  };

  return (
    <div ref={root} className={cn("flex flex-col gap-8", className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          "relative inline-flex max-w-full overflow-x-auto rounded-control border border-line bg-white/[0.03] p-1",
          align === "center" ? "self-center" : "self-start",
        )}
      >
        <span
          data-indicator=""
          aria-hidden
          className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-0 rounded-control bg-accent shadow-accent"
        />
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
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "relative z-10 whitespace-nowrap rounded-control px-5 py-2 text-sm font-semibold transition-colors duration-300",
                selected ? "text-accent-ink" : "text-fg-muted hover:text-fg",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${uid}-p-${tab.id}`}
          data-content={tab.id}
          role="tabpanel"
          aria-labelledby={`${uid}-t-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
