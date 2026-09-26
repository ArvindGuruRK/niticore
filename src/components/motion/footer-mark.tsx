"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Logo's natural ratio (156x38) — the wrapper is sized to match it exactly, so the full mark
// renders with nothing cropped off.
const LOGO_RATIO = "156/38";

/**
 * Closes out the footer: the full Niticore wordmark, shown in full (client feedback: a partially
 * cropped mark read as a rendering bug rather than an intentional bleed). Three quarters width on
 * phones, where edge to edge read as oversized. Revealed last, after
 * the link columns above it have settled, and again on every return to the footer.
 */
export function FooterMark({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const reveal = gsap.fromTo(
          root.current,
          { opacity: 0, y: 56, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: DUR.slow,
            delay: 0.15,
            ease: EASE.out,
            paused: true,
          },
        );
        // Plays every time the footer is reached, not just once. It re-arms only after the mark has
        // left the screen completely (scrolling back up past it), so it never blinks out while seen.
        ScrollTrigger.create({ trigger: root.current, start: "top 88%", onEnter: () => reveal.restart(true) });
        ScrollTrigger.create({ trigger: root.current, start: "top bottom", onLeaveBack: () => reveal.pause(0) });
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-anim=""
      aria-hidden
      className={cn("relative mx-auto w-3/4 max-w-5xl overflow-hidden sm:w-full", className)}
      style={{ aspectRatio: LOGO_RATIO }}
    >
      <Image
        src="/logo/niticore.svg"
        alt=""
        fill
        className="object-contain object-top"
        sizes="(min-width: 1024px) 64rem, 100vw"
      />
    </div>
  );
}
