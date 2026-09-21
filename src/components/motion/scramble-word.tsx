"use client";

import { useRef, type ComponentProps } from "react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * A word that scrambles on hover and resolves back to itself. Built to live inside SplitHeading,
 * where the text has already been split into DOM words: it scrambles the leaf element in place
 * and restores the original text, so it never fights SplitText. The width is locked while it
 * scrambles, so a centred headline does not jitter. Fine pointers only, off under reduced motion.
 */
export function ScrambleWord({ className, children, ...props }: ComponentProps<"span">) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        const el = root.current!;
        const play = () => {
          const leaves = Array.from(el.querySelectorAll<HTMLElement>("*")).filter(
            (n) => n.children.length === 0 && n.textContent?.trim(),
          );
          const targets = leaves.length ? leaves : [el];
          el.style.width = `${el.getBoundingClientRect().width}px`;
          gsap.to(targets, {
            duration: 0.9,
            overwrite: true,
            scrambleText: { text: "{original}", chars: "lowerCase", speed: 0.8, revealDelay: 0.1 },
            onComplete: () => {
              el.style.width = "";
            },
          });
        };
        el.addEventListener("pointerenter", play);
        return () => el.removeEventListener("pointerenter", play);
      });
    },
    { scope: root },
  );

  return (
    <span ref={root} className={cn("inline-block whitespace-nowrap", className)} {...props}>
      {children}
    </span>
  );
}
