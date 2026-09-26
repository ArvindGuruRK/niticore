"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type GridItem = { title: string; body: string };

/**
 * Numbered tiles that light up in order as the grid scrolls through the viewport, like working
 * through a course: tile n is lit once the reader is n/total of the way through. Scrolling back
 * un-lights them. A lit tile gets a violet border and tint, and its number turns green.
 * 1, 2 or 4 across; on phones each tile is a compact row with the number beside the text.
 * Without motion every tile is lit.
 */
export function ProgressGrid({ items, className }: { items: GridItem[]; className?: string }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const tiles = gsap.utils.toArray<HTMLElement>("li", root.current);
        const n = tiles.length;
        const paint = (progress: number) => {
          const lit = Math.round(progress * n);
          tiles.forEach((t, i) => (t.dataset.lit = String(i < lit)));
        };
        paint(0);
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 70%",
          end: "bottom 60%",
          onUpdate: (self) => paint(self.progress),
          onRefresh: (self) => paint(self.progress),
        });
        return () => tiles.forEach((t) => (t.dataset.lit = "true"));
      });
    },
    { scope: root },
  );

  return (
    <ol ref={root} className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item, i) => (
        <li
          key={item.title}
          data-lit="true"
          className="group grid grid-cols-[2.75rem_1fr] gap-x-3 gap-y-1 rounded-panel border-2 border-line bg-surface p-4 transition-colors sm:flex sm:flex-col sm:gap-3 sm:p-5 duration-500 data-[lit=true]:border-tertiary/60 data-[lit=true]:bg-tertiary/[0.07]"
        >
          <span className="type-h3 row-span-2 tabular-nums text-fg-subtle transition-colors duration-500 group-data-[lit=true]:text-accent">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="type-h4 text-fg">{item.title}</h3>
          <p className="type-small">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
