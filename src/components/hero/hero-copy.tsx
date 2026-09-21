"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Annotate } from "@/components/illustrations/annotate";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitHeading } from "@/components/motion/split-heading";
import { ScrambleWord } from "@/components/motion/scramble-word";
import TextType from "@/components/motion/text-type";
import { gsap, useGSAP } from "@/lib/gsap";
import { DIST, DUR, EASE, NO_REDUCE, STAGGER } from "@/lib/motion";

/**
 * Hero descriptions, written from docs/content (landing-page copy, platform, frameworks, agentic AI, cockpit).
 * Each one continues the fixed stem "NitiCore gives you " on the same line, so start them lowercase.
 * The first is the original hero description, word for word. The rest are from the content files.
 * Keep them under 185 characters or the reserved height below will be too short.
 */
const LEAD_PHRASES = [
  "continuous visibility, reusable evidence, and agent guardrails, from first idea to production.",
  "the confidence to build, deploy, and scale AI with multi-framework evidence reuse and autonomous agent guardrails. Governance that moves as fast as your AI.",
  "one governance action that links to the EU AI Act, ISO 42001, NIST AI RMF, GDPR and DIFC Regulation 10, so you file once and satisfy everywhere.",
  "agent governance, not just model governance: control what autonomous agents can execute, access and spend, with hard guardrails and human-in-the-loop gates.",
  "one board-ready Governance Readiness score that turns technical MLOps metrics and complex legal clauses into something management reads in 30 seconds.",
];


/** Hero stack: headline, typed description, CTAs. Nothing else lives up here. */
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
    <div ref={root} className="relative flex w-full max-w-[64rem] flex-col items-center gap-7 text-center">
      <Annotate target="[data-accent]" delay={1.3} className="w-full">
        <SplitHeading as="h1" by="words" trigger="load" delay={0.25} className="type-display text-fg">
          <span className="block">Move fast with AI.</span>
          {" "}
          <span className="block">
            Govern it with{" "}
            <ScrambleWord data-accent="" className="text-accent">
              confidence.
            </ScrambleWord>
          </span>
        </SplitHeading>
      </Annotate>

      {/* Full descriptions typed in place. stableLayout fixes the final line breaks from the first
          character, and the reserved height keeps the buttons still while the copy changes. */}
      <div data-anim="" className="mx-auto w-full max-w-[42rem]">
        <TextType
          as="p"
          prefix="NitiCore gives you "
          typePrefix
          exit="fade"
          text={LEAD_PHRASES}
          typingSpeed={16}
          deletingSpeed={6}
          pauseDuration={3400}
          initialDelay={1100}
          stableLayout
          className="type-lead block min-h-[8em] sm:min-h-[4.8em]"
          cursorCharacter={<span className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] rounded-[1px] bg-accent" />}
        />
      </div>

      <div data-anim="" className="flex flex-wrap items-center justify-center gap-3">
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
