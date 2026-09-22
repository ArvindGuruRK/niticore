"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Logo's natural ratio (156x38) with the bottom 15% cropped away: 156 / (38 * 0.85)
const CROPPED_RATIO = "156/32.3";

/**
 * Closes out the footer: the full NitiCore wordmark, cropped to its top 85% by the wrapper's
 * aspect ratio (object-top) so it bleeds off the footer's bottom edge instead of sitting as a
 * complete, self-contained logo. Revealed last, after the link columns above it have settled.
 */
export function FooterMark({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          root.current,
          { opacity: 0, y: 56, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: DUR.slow,
            delay: 0.15,
            ease: EASE.out,
            clearProps: "transform",
            scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-anim=""
      aria-hidden
      className={cn("relative mx-auto w-full max-w-5xl overflow-hidden", className)}
      style={{ aspectRatio: CROPPED_RATIO }}
    >
      <Image
        src="/logo/niticore.svg"
        alt=""
        fill
        className="object-cover object-top"
        sizes="(min-width: 1024px) 64rem, 100vw"
      />
    </div>
  );
}
