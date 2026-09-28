"use client";

import { useRef } from "react";
import { HourglassMedium, Lightning } from "@phosphor-icons/react";
import { Marquee } from "@/components/motion/marquee";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";

/** Loop speed of both lanes, in pixels per second at rest (scroll velocity boosts both alike) */
const SPEED = 120;

/**
 * The governance gap as two full-width lanes running in opposite directions at the same speed:
 * "Where AI is today" moves right to left as violet pills, "Where governance often is" moves left to
 * right as green pills (the card-violet and card-green tones). Each lane is wider than the screen (a
 * hidden buffer each side), so on top of the loops a scrub can drift the lanes further apart as the
 * section scrolls through. Under reduced motion both lanes are static, swipeable rows (Marquee's
 * fallback) and the scrub is off.
 */
export function SpeedLanes({
  topLabel,
  bottomLabel,
  topItems,
  bottomItems,
}: {
  topLabel: string;
  bottomLabel: string;
  topItems: string[];
  bottomItems: string[];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const scrollTrigger = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 };
        // Each lane drifts the way it already travels
        gsap.fromTo("[data-lane='top']", { xPercent: 5 }, { xPercent: -5, ease: "none", scrollTrigger });
        gsap.fromTo("[data-lane='bottom']", { xPercent: -5 }, { xPercent: 5, ease: "none", scrollTrigger });
      });
    },
    { scope: root },
  );

  const pill =
    "mr-3 inline-flex items-center rounded-control px-5 py-3 font-display text-[clamp(1.0625rem,0.95rem+0.6vw,1.5rem)] font-semibold tracking-tight whitespace-nowrap sm:mr-4 sm:px-7 sm:py-4";

  return (
    <div ref={root} className="relative flex flex-col gap-10 overflow-hidden py-2 sm:gap-14">
      {/* Edge fades on the section: the lanes are wider than the screen, so their own fades sit off-screen */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[8%] bg-gradient-to-r from-canvas to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[8%] bg-gradient-to-l from-canvas to-transparent" />

      <div className="flex flex-col gap-4">
        <p className="type-h4 flex items-center gap-2 px-page text-fg sm:mx-auto sm:w-full sm:max-w-7xl">
          <Lightning aria-hidden weight="fill" className="size-5 text-tertiary" />
          {topLabel}
        </p>
        <div data-lane="top" className="motion-safe:-mx-[12%]">
          {/* direction 1: right to left */}
          <Marquee speed={SPEED} direction={1} pauseOnHover={false} fade={false}>
            {topItems.map((item) => (
              <span
                key={item}
                className={`card-violet border border-white/15 text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] ${pill}`}
              >
                {item}
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="type-h4 flex items-center gap-2 px-page text-fg sm:mx-auto sm:w-full sm:max-w-7xl">
          <HourglassMedium aria-hidden weight="duotone" className="size-5 text-tertiary" />
          {bottomLabel}
        </p>
        <div data-lane="bottom" className="motion-safe:-mx-[12%]">
          {/* direction -1: left to right, same speed */}
          <Marquee speed={SPEED} direction={-1} pauseOnHover={false} fade={false}>
            {bottomItems.map((item) => (
              <span
                key={item}
                className={`card-green border border-white/15 text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] ${pill}`}
              >
                {item}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
