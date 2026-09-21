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
        // Each word's true text is captured once, while it is at rest, and passed to the tween explicitly.
        // "{original}" would be read from the live element, which is scrambled if the tween is restarted.
        const originals = new WeakMap<HTMLElement, string>();
        let run: gsap.core.Timeline | null = null;

        const rest = (targets: HTMLElement[]) => {
          targets.forEach((t) => {
            const o = originals.get(t);
            if (o !== undefined) t.textContent = o;
          });
          el.style.width = "";
        };

        const play = () => {
          // A scramble genuinely in flight is left alone: restarting it re-measured the width and the
          // original text from a half-scrambled word ("confidenuco", and a headline that wrapped to three
          // lines). isActive() is false once a timeline is killed (for example by a SplitText re-split),
          // so unlike a boolean flag this can never get stuck and block later hovers.
          if (run?.isActive()) return;
          const leaves = Array.from(el.querySelectorAll<HTMLElement>("*")).filter(
            (n) => n.children.length === 0 && n.textContent?.trim(),
          );
          const targets = leaves.length ? leaves : [el];
          targets.forEach((t) => {
            if (!originals.has(t)) originals.set(t, t.textContent ?? "");
          });

          rest(targets); // always start, and measure, from the resting text
          el.style.width = `${el.getBoundingClientRect().width}px`;
          const tl = gsap.timeline({ onComplete: () => rest(targets) });
          targets.forEach((t) =>
            tl.to(
              t,
              {
                duration: 0.9,
                scrambleText: { text: originals.get(t) ?? "", chars: "lowerCase", speed: 0.8, revealDelay: 0.1 },
              },
              0,
            ),
          );
          run = tl;
        };
        el.addEventListener("pointerenter", play);
        return () => {
          el.removeEventListener("pointerenter", play);
          run?.kill();
          el.style.width = "";
        };
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
