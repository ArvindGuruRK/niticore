"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TimelineItem = {
  title: string;
  body: string;
  /** Small label above the title, such as a stage number or a date */
  meta?: string;
};

/**
 * Vertical progress timeline. A green line fills as you scroll, and each node lights up
 * when the line reaches it. Items are an ordered list. Without motion every node is lit.
 * `numbered` swaps the small dot for a larger node holding the step number (01, 02…), which fills
 * green when lit, on a 2px line; use it instead of a `meta` label, since labels above headings are off-style.
 */
export function Timeline({
  items,
  numbered = false,
  className,
}: {
  items: TimelineItem[];
  numbered?: boolean;
  className?: string;
}) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const list = root.current!;
        const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", list);
        const line = list.querySelector("[data-line]");
        gsap.set(nodes, { attr: { "data-lit": "false" } });

        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: EASE.linear,
            scrollTrigger: { trigger: list, start: "top 60%", end: "bottom 60%", scrub: 0.4 },
          },
        );

        nodes.forEach((node) => {
          ScrollTrigger.create({
            trigger: node,
            start: "top 60%",
            onEnter: () => node.setAttribute("data-lit", "true"),
            onLeaveBack: () => node.setAttribute("data-lit", "false"),
          });
        });
      });
    },
    { scope: root, dependencies: [items.length] },
  );

  return (
    <ol ref={root} className={cn("relative flex flex-col gap-12", numbered ? "pl-[4.5rem]" : "pl-10", className)}>
      <span
        aria-hidden
        className={cn("absolute bottom-2 top-2 bg-line-strong", numbered ? "left-[1.4375rem] w-0.5 rounded-control" : "left-[0.6875rem] w-px")}
      />
      <span
        aria-hidden
        data-line=""
        className={cn("absolute bottom-2 top-2 origin-top bg-accent", numbered ? "left-[1.4375rem] w-0.5 rounded-control" : "left-[0.6875rem] w-px")}
      />
      {items.map((item, i) => (
        <li key={item.title} data-node="" data-lit="true" className="group relative flex max-w-2xl flex-col gap-2">
          {numbered ? (
            <span
              aria-hidden
              className="absolute -left-[4.5rem] -top-1 grid size-12 place-items-center rounded-full border-2 border-line-strong bg-canvas font-display text-[0.9375rem] font-bold tabular-nums text-fg-subtle transition-[border-color,background-color,color,box-shadow,transform] duration-500 ease-out-expo group-data-[lit=true]:scale-105 group-data-[lit=true]:border-accent group-data-[lit=true]:bg-accent group-data-[lit=true]:text-accent-ink group-data-[lit=true]:shadow-accent"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          ) : (
            <span
              aria-hidden
              className="absolute -left-10 top-1.5 grid size-6 place-items-center rounded-full border border-line-strong bg-canvas transition-[border-color,background-color,transform] duration-500 ease-out-expo group-data-[lit=true]:scale-110 group-data-[lit=true]:border-accent group-data-[lit=true]:bg-accent/15"
            >
              <span className="size-2 rounded-full bg-fg-subtle transition-colors duration-500 group-data-[lit=true]:bg-accent" />
            </span>
          )}
          {item.meta && <p className="type-label text-fg-subtle transition-colors duration-500 group-data-[lit=true]:text-accent">{item.meta}</p>}
          <h3 className="type-h3 text-fg">{item.title}</h3>
          <p className="type-body">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
