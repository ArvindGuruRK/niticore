"use client";

import { useRef, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";

/**
 * Scroll-scrubbed word reveal. Words light up as the text crosses the viewport. Renders a `<p>` by
 * default; pass `as` (e.g. "h3") to keep heading semantics while reusing the same word-by-word scrub.
 */
export function TextReveal({ text, className, as = "p" }: { text: string; className?: string; as?: ElementType }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          root.current!.querySelectorAll("[data-word]"),
          { opacity: 0.22 },
          {
            opacity: 1,
            ease: EASE.linear,
            stagger: 0.12,
            scrollTrigger: {
              trigger: root.current,
              start: "top 82%",
              end: "bottom 48%",
              scrub: true,
              // Without this, an instance far down the page keeps the pixel offsets it was mounted
              // with; as earlier sections' images/fonts settle and push content down, that offset
              // drifts further out of sync the lower the instance sits — this recalculates on refresh.
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  const Tag = as;

  return (
    // text-wrap: normal overrides the base layer's `balance`/`pretty` on h1-h4/p — those algorithms
    // re-measure and re-break text, which (combined with inline-block word spans) collapses the gap
    // between words. The spans below stay inline (not inline-block) for the same reason: an
    // inline-block box treats its own trailing space as being at its own edge rather than mid-line,
    // so browsers can trim it — plain inline spans don't have that edge and keep the space.
    <Tag ref={root} className={className} style={{ textWrap: "normal" }}>
      {text.split(" ").map((word, i) => (
        <span key={i} data-word="">
          {word}
          {" "}
        </span>
      ))}
    </Tag>
  );
}
