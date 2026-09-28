"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";

/**
 * The hubs as one line of large type. Scrubbed to scroll, the outer cities slide in from their own
 * side and the middle one rises, all brightening as they converge, then settle into a single row
 * with a hairline between them. Stacks on phones (no hairlines).
 */
export function CityBand({ cities }: { cities: readonly string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const scrollTrigger = { trigger: root.current, start: "top bottom", end: "center 55%", scrub: 0.6 };
        const last = cities.length - 1;
        gsap.utils.toArray<HTMLElement>("[data-city]", root.current).forEach((city, i) => {
          const side = i === 0 ? -1 : i === last ? 1 : 0;
          gsap.fromTo(
            city,
            { xPercent: side * 45, yPercent: side === 0 ? 60 : 0, opacity: 0.12 },
            { xPercent: 0, yPercent: 0, opacity: 1, ease: "none", scrollTrigger },
          );
        });
        gsap.fromTo("[data-city-rule]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="overflow-hidden py-4">
      <div className="mx-auto max-w-7xl px-page">
        <p className="flex flex-col items-center justify-center gap-2 text-center lg:flex-row lg:gap-8">
          {cities.map((city, i) => (
            <span key={city} className="flex flex-col items-center gap-2 lg:flex-row lg:gap-8">
              {i > 0 && <span data-city-rule="" aria-hidden className="hidden h-10 w-px bg-line-strong lg:block" />}
              <span data-city="" className="type-hero text-fg">
                {city}
              </span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
