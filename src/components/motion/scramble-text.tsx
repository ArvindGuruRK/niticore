"use client";

import { useRef } from "react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrambleTextPlugin);

type ScrambleTextProps = {
  text: string;
  /** Character pool the text decodes from */
  chars?: string;
  /** Replay on hover (fine pointers only) */
  replayOnHover?: boolean;
  className?: string;
};

/**
 * Decode effect: characters resolve left to right from noise. Plays once on entering the
 * viewport, and again on hover if enabled. The real text is always in the accessible label.
 */
export function ScrambleText({ text, chars = "01#/<>_", replayOnHover = true, className }: ScrambleTextProps) {
  const root = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const play = () =>
        gsap.to(inner.current, {
          duration: 0.9,
          overwrite: true,
          scrambleText: { text, chars, speed: 0.6, revealDelay: 0.15 },
        });

      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          inner.current,
          { scrambleText: { text: " ", chars } },
          {
            duration: 1.1,
            scrambleText: { text, chars, speed: 0.5, revealDelay: 0.2 },
            scrollTrigger: { trigger: root.current, start: "top 92%", once: true },
          },
        );
      });

      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        if (!replayOnHover) return;
        const el = root.current!;
        el.addEventListener("pointerenter", play);
        return () => el.removeEventListener("pointerenter", play);
      });
    },
    { scope: root, dependencies: [text, chars, replayOnHover] },
  );

  return (
    <span ref={root} aria-label={text} className={cn("inline-block", className)}>
      <span ref={inner} aria-hidden>
        {text}
      </span>
    </span>
  );
}
