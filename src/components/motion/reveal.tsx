"use client";

import { useRef, type ComponentProps } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DIST, DUR, EASE, NO_REDUCE, STAGGER } from "@/lib/motion";

type RevealProps = ComponentProps<"div"> & {
  /** Animate direct children in sequence instead of the wrapper as one block */
  stagger?: boolean;
  delay?: number;
};

/** Scroll reveal: fade and rise once when the block enters the viewport. */
export function Reveal({ stagger = false, delay = 0, children, ...props }: RevealProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const targets = stagger ? Array.from(root.current!.children) : [root.current!];
        gsap.fromTo(
          targets,
          { opacity: 0, y: DIST },
          {
            opacity: 1,
            y: 0,
            delay,
            duration: DUR.base,
            ease: EASE.out,
            stagger: STAGGER,
            clearProps: "transform",
            scrollTrigger: { trigger: root.current, start: "top 86%", toggleActions: "play none none none" },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} {...(stagger ? { "data-anim-stagger": "" } : { "data-anim": "" })} {...props}>
      {children}
    </div>
  );
}
