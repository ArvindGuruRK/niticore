"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";

/** Scroll-scrubbed word reveal. Words light up as the paragraph crosses the viewport. */
export function TextReveal({ text, className }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);

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
            scrollTrigger: { trigger: root.current, start: "top 82%", end: "bottom 48%", scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <p ref={root} className={className}>
      {text.split(" ").map((word, i) => (
        <span key={i} data-word="" className="inline-block">
          {word}
          {" "}
        </span>
      ))}
    </p>
  );
}
