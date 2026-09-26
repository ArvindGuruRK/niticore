"use client";

import { useRef } from "react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(DrawSVGPlugin);

// Back bubble (tail bottom-left) with two lines of "text", then a front bubble (tail bottom-right)
// overlapping it. The front bubble is filled with the page colour so the back one's outline passes
// behind it cleanly, like layered paper.
const BACK =
  "M44 16 L130 16 C 138 16, 144 22, 144 30 L 144 78 C 144 86, 138 92, 130 92 L 64 92 L 40 112 L 46 92 C 36 92, 30 86, 30 78 L 30 30 C 30 22, 36 16, 44 16 Z";
const TEXT_1 = "M48 40 L124 40";
const TEXT_2 = "M48 60 L104 60";
const FRONT =
  "M100 74 L172 74 C 180 74, 186 80, 186 88 L 186 128 C 186 136, 180 142, 172 142 L 166 142 L 176 162 L 148 142 L 100 142 C 92 142, 86 136, 86 128 L 86 88 C 86 80, 92 74, 100 74 Z";
const DOTS = [116, 136, 156];

/**
 * Two overlapping speech bubbles: "we'll talk it through". When it plays, the back bubble and its text
 * lines draw themselves, then the front bubble, then three typing dots pop in and keep bouncing in a
 * loop, like a reply being written. Violet line art via currentColor. Hidden until the animation takes
 * over (data-draw); reduced motion shows it finished and still.
 * `trigger="load"` plays it `delay` seconds after the page loads; `trigger="view"` (the default) plays
 * it when it scrolls into view, but never earlier than `delay` seconds after load.
 */
export function ChatBubbles({
  delay = 0.6,
  trigger = "view",
  className,
}: {
  delay?: number;
  trigger?: "load" | "view";
  className?: string;
}) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const q = gsap.utils.selector(root);
        gsap.set(root.current, { visibility: "visible" });
        const dots = q("[data-dot]");
        const front = q("[data-front]");
        const earliest = performance.now() + delay * 1000;
        gsap.set([...q("[data-back]"), ...q("[data-text]"), ...front], { drawSVG: "0%" });
        // The front bubble's page-coloured fill stays off until it starts drawing, so it never hides
        // the back bubble before it exists
        gsap.set(front, { attr: { "fill-opacity": 0 } });
        gsap.set(dots, { scale: 0, transformOrigin: "50% 50%" });

        const tl = gsap
          .timeline({ paused: true })
          .fromTo(q("[data-back]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, ease: "power2.inOut" })
          .fromTo(q("[data-text]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.35, ease: "power2.out", stagger: 0.15 }, "-=0.2")
          .set(front, { attr: { "fill-opacity": 1 } }, "-=0.1")
          .fromTo(front, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, ease: "power2.inOut" }, "<")
          .fromTo(dots, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.1 })
          // Typing: the dots bounce one after another, forever
          .to(dots, { y: -7, duration: 0.32, ease: "sine.out", yoyo: true, repeat: -1, repeatDelay: 0.25, stagger: 0.14 });

        if (trigger === "load") {
          tl.delay(delay).play();
          return;
        }
        // Created last, so an immediate enter (already on screen at load) finds the timeline built
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 85%",
          once: true,
          onEnter: () => tl.delay(Math.max(0, (earliest - performance.now()) / 1000)).restart(true),
        });
      });
    },
    { scope: root, dependencies: [delay, trigger] },
  );

  return (
    <svg
      ref={root}
      data-draw=""
      aria-hidden
      viewBox="24 10 170 158"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("overflow-visible", className)}
    >
      <path data-back="" d={BACK} />
      <path data-text="" d={TEXT_1} />
      <path data-text="" d={TEXT_2} />
      <path data-front="" d={FRONT} fill="var(--color-canvas)" />
      {DOTS.map((cx) => (
        <circle key={cx} data-dot="" cx={cx} cy={108} r={5} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}
