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
 */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
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
    <ol ref={root} className={cn("relative flex flex-col gap-12 pl-10", className)}>
      <span aria-hidden className="absolute bottom-2 left-[0.6875rem] top-2 w-px bg-line-strong" />
      <span
        aria-hidden
        data-line=""
        className="absolute bottom-2 left-[0.6875rem] top-2 w-px origin-top bg-accent"
      />
      {items.map((item) => (
        <li key={item.title} data-node="" data-lit="true" className="group relative flex max-w-2xl flex-col gap-2">
          <span
            aria-hidden
            className="absolute -left-10 top-1.5 grid size-6 place-items-center rounded-full border border-line-strong bg-canvas transition-[border-color,background-color,transform] duration-500 ease-out-expo group-data-[lit=true]:scale-110 group-data-[lit=true]:border-accent group-data-[lit=true]:bg-accent/15"
          >
            <span className="size-2 rounded-full bg-fg-subtle transition-colors duration-500 group-data-[lit=true]:bg-accent" />
          </span>
          {item.meta && <p className="type-label text-fg-subtle transition-colors duration-500 group-data-[lit=true]:text-accent">{item.meta}</p>}
          <h3 className="type-h3 text-fg">{item.title}</h3>
          <p className="type-body">{item.body}</p>
        </li>
      ))}
    </ol>
  );
}
