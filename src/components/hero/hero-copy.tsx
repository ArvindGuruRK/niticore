"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Magnetic } from "@/components/motion/magnetic";
import { gsap, useGSAP } from "@/lib/gsap";
import { DIST, DUR, EASE, NO_REDUCE, STAGGER } from "@/lib/motion";

/** Hero stack: eyebrow, headline, subtext, CTAs. Nothing else lives up here. */
export function HeroCopy() {
  const root = useRef<HTMLDivElement>(null);

  // Load-in timeline: each element rises in order so the eye reads top to bottom.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          "[data-anim]",
          { opacity: 0, y: DIST },
          { opacity: 1, y: 0, duration: DUR.base, ease: EASE.out, stagger: STAGGER, delay: 0.1, clearProps: "transform" },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex max-w-[46rem] flex-col items-start gap-7">
      <div data-anim="">
        <Eyebrow>The operating layer for governed AI</Eyebrow>
      </div>

      <h1 data-anim="" className="type-hero text-fg">
        <span className="block">Move fast with AI.</span>
        <span className="block">
          Govern it with <span className="text-accent">confidence.</span>
        </span>
      </h1>

      <p data-anim="" className="type-lead max-w-[38rem]">
        NitiCore gives you continuous visibility, reusable evidence, and agent guardrails, from first idea to
        production.
      </p>

      <div data-anim="" className="flex flex-wrap items-center gap-3">
        <Magnetic>
          <Button href="#demo" size="lg" arrow>
            Book a demo
          </Button>
        </Magnetic>
        <Button href="#assessment" size="lg" variant="secondary">
          Take the assessment
        </Button>
      </div>
    </div>
  );
}
