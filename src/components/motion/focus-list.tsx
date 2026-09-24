"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FocusItem = {
  /** Short marker before the title, such as "01" */
  meta: string;
  title: string;
  body: string;
};

/**
 * Ordered list that follows the reader: each row brightens while it crosses the middle band of the
 * viewport and dims again once passed, so one row is in focus at a time. The number turns green
 * when its row is lit. Without motion (or JS) every row stays lit.
 */
export function FocusList({ items, className }: { items: FocusItem[]; className?: string }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const rows = gsap.utils.toArray<HTMLElement>("li", root.current);
        rows.forEach((row) => {
          row.dataset.lit = "false";
          ScrollTrigger.create({
            trigger: row,
            start: "top 62%",
            end: "bottom 38%",
            onToggle: (self) => {
              row.dataset.lit = String(self.isActive);
            },
          });
        });
        return () => rows.forEach((row) => (row.dataset.lit = "true"));
      });
    },
    { scope: root },
  );

  return (
    <ol ref={root} className={cn("flex flex-col", className)}>
      {items.map((item) => (
        <li
          key={item.meta}
          data-lit="true"
          className="group grid grid-cols-[3rem_1fr] gap-x-4 gap-y-2 border-t border-line py-8 opacity-35 transition-opacity duration-500 ease-out-expo data-[lit=true]:opacity-100 sm:grid-cols-[4.5rem_1fr] sm:py-10"
        >
          <span className="type-h3 text-fg-subtle transition-colors duration-500 group-data-[lit=true]:text-accent">
            {item.meta}
          </span>
          <h3 className="type-h3 text-fg">{item.title}</h3>
          <p className="type-body col-start-2 max-w-xl">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
