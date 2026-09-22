"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Plus } from "@phosphor-icons/react/ssr";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  /** Allow several panels open at once */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
  /** "joined" (default) is one bordered box with hairline dividers between rows. "separated"
   *  gives each item its own panel with a gap between them. */
  variant?: "joined" | "separated";
};

/**
 * Disclosure list. Panel height and the plus icon are tweened by GSAP. State lives in React, so
 * aria-expanded is always truthful, and closed panels are inert (out of the tab order).
 * Under reduced motion the change is instant.
 */
export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  className,
  variant = "joined",
}: AccordionProps) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string[]>(defaultOpen.slice(0, multiple ? undefined : 1));

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duration = reduce ? 0 : DUR.base * 0.75;
      items.forEach((item) => {
        const isOpen = open.includes(item.id);
        const panel = root.current!.querySelector(`[data-panel="${item.id}"]`);
        const icon = root.current!.querySelector(`[data-icon="${item.id}"]`);
        gsap.to(panel, { height: isOpen ? "auto" : 0, duration, ease: EASE.out, overwrite: true });
        gsap.to(icon, { rotation: isOpen ? 45 : 0, duration, ease: EASE.out, overwrite: true });
      });
    },
    { scope: root, dependencies: [open.join("|")] },
  );

  const toggle = (id: string) =>
    setOpen((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      return multiple ? [...cur, id] : [id];
    });

  const separated = variant === "separated";

  return (
    <div
      ref={root}
      className={cn(
        "flex flex-col",
        separated ? "gap-4" : "divide-y divide-line rounded-panel border border-line",
        className,
      )}
    >
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const buttonId = `${uid}-b-${item.id}`;
        const panelId = `${uid}-p-${item.id}`;
        return (
          <div
            key={item.id}
            className={cn(separated && "overflow-hidden rounded-panel border border-line bg-white/[0.02] shadow-panel")}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-6 text-left transition-colors hover:bg-white/[0.03]",
                  separated ? "px-6 py-[1.375rem]" : "px-5 py-5",
                )}
              >
                {/* Separated rows carry the FAQ's heavier row type: a touch larger and bold. */}
                <span
                  className={cn(
                    "text-fg",
                    separated
                      ? "font-display text-[1.1875rem] font-bold leading-snug tracking-[-0.015em]"
                      : "type-h4",
                  )}
                >
                  {item.title}
                </span>
                <span
                  data-icon={item.id}
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-accent"
                >
                  <Plus weight="bold" className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              data-panel={item.id}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className="overflow-hidden"
              style={{ height: isOpen ? "auto" : 0 }}
            >
              <div className={cn("type-body pb-6", separated ? "px-6" : "px-5")}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
