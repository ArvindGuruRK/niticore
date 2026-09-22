"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Logo's natural ratio (156x38) — the wrapper is sized to match it exactly, so the full mark
// renders with nothing cropped off.
const LOGO_RATIO = "156/38";

/**
 * Closes out the footer: the full Niticore wordmark, shown in full (client feedback: a partially
 * cropped mark read as a rendering bug rather than an intentional bleed). Revealed last, after
 * the link columns above it have settled.
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
