"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FlowStep = {
  title: string;
  body: string;
};

/**
 * A chain of linked steps. Scrolling fills a green line through the nodes and each node lights as
 * the line reaches it; scrolling back un-lights them. Runs left to right from lg up, top to bottom
 * below that. Without motion every node is lit.
 */
export function FlowSteps({ steps, className }: { steps: FlowStep[]; className?: string }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const build = (axis: "x" | "y") => {
        const q = gsap.utils.selector(root);
        const nodes = q("[data-node]") as HTMLElement[];
        const lines = q("[data-line]") as HTMLElement[];
        const n = nodes.length;
        // Where each node sits along the line, 0 to 1. Even on lg (equal columns); measured on
        // phones, where steps differ in height, and the line is trimmed to end at the last node.
        let stops = nodes.map((_, i) => i / (n - 1));
        const measure = () => {
          if (axis === "x") return;
          const centre = (el: HTMLElement) => el.offsetTop + 22;
          const top = centre(nodes[0]);
          const length = centre(nodes[n - 1]) - top;
          lines.forEach((l) => gsap.set(l, { top, bottom: "auto", height: length }));
          stops = nodes.map((el) => (centre(el) - top) / length);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(root.current!);

        nodes.forEach((el) => (el.dataset.lit = "false"));
        gsap.fromTo(
          q("[data-fill]"),
          { [axis === "x" ? "scaleX" : "scaleY"]: 0 },
          {
            [axis === "x" ? "scaleX" : "scaleY"]: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top 75%",
              end: axis === "x" ? "bottom 55%" : "bottom 65%",
              scrub: 0.4,
              onUpdate: (self) => {
                nodes.forEach((el, i) => (el.dataset.lit = String(self.progress >= stops[i] - 0.001)));
              },
            },
          },
        );
        return () => {
          ro.disconnect();
          lines.forEach((l) => gsap.set(l, { clearProps: "top,bottom,height" }));
          nodes.forEach((el) => (el.dataset.lit = "true"));
        };
      };
      mm.add(`${NO_REDUCE} and (min-width: 64rem)`, () => build("x"));
      mm.add(`${NO_REDUCE} and (max-width: 63.99rem)`, () => build("y"));
    },
    { scope: root },
  );

  return (
    <ol ref={root} className={cn("relative grid gap-10 lg:grid-cols-5 lg:gap-6", className)}>
      {/* Track and fill run through the node centres: vertical on phones, horizontal on lg */}
      <span
        data-line=""
        aria-hidden
        className="absolute bottom-6 left-[1.375rem] top-6 w-0.5 rounded-control bg-line-strong lg:bottom-auto lg:left-[10%] lg:right-[10%] lg:top-[1.375rem] lg:h-0.5 lg:w-auto"
      />
      <span
        data-line=""
        data-fill=""
        aria-hidden
        className="absolute bottom-6 left-[1.375rem] top-6 w-0.5 origin-top rounded-control bg-accent lg:bottom-auto lg:left-[10%] lg:right-[10%] lg:top-[1.375rem] lg:h-0.5 lg:w-auto lg:origin-left"
      />
      {steps.map((step, i) => (
        <li
          key={step.title}
          data-node=""
          data-lit="true"
          className="group relative grid grid-cols-[2.75rem_1fr] gap-x-5 lg:flex lg:flex-col lg:items-center lg:gap-4 lg:text-center"
        >
          <span className="relative z-10 grid size-11 place-items-center rounded-full border border-line-strong bg-surface text-sm font-bold tabular-nums text-fg-muted transition-all duration-500 group-data-[lit=true]:border-accent group-data-[lit=true]:bg-accent group-data-[lit=true]:text-accent-ink group-data-[lit=true]:shadow-accent">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex flex-col gap-1 pt-2 lg:items-center lg:pt-0">
            <h3 className="type-h3 text-fg">{step.title}</h3>
            <p className="type-body">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
