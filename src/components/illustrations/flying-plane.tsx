"use client";

import { useRef } from "react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(DrawSVGPlugin);

// Drawn to fly leftward: the trail starts on the viewBox's right edge (so, placed flush to the
// viewport's right edge, it comes in from off-screen), loops once and swoops up into the plane's
// tail. The plane's nose points up and to the left, toward the page content.
const TRAIL =
  "M262 170 C 236 172, 214 156, 222 134 C 230 114, 256 124, 246 146 C 234 170, 196 158, 182 132 C 172 114, 164 100, 150 92";
const BODY = "M150 92 L24 34 L96 142 L120 100 Z";
const FOLD = "M120 100 L24 34";
const FLAP = "M120 100 L114 136 L98 116";

/**
 * A paper plane that flies in from the right. On load the plane glides in from off to the right and
 * settles, while its looping trail draws itself behind it from the right edge, so it reads as just
 * having arrived. Violet line art via currentColor. Hidden until the animation takes over (data-draw);
 * reduced motion shows it finished and still.
 */
export function FlyingPlane({ delay = 0.4, className }: { delay?: number; className?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const q = gsap.utils.selector(root);
        gsap.set(root.current, { visibility: "visible" });
        gsap
          .timeline({ delay })
          .fromTo(q("[data-trail]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6, ease: "power2.out" }, 0)
          .fromTo(
            q("[data-plane]"),
            { x: 150, y: 80, rotation: 14, opacity: 0 },
            { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1.6, ease: "power3.out", svgOrigin: "90 90" },
            0,
          )
          // A small bank as it lands, then level
          .to(q("[data-plane]"), { rotation: -4, duration: 0.35, ease: "sine.out", svgOrigin: "90 90" })
          .to(q("[data-plane]"), { rotation: 0, duration: 0.5, ease: "sine.inOut", svgOrigin: "90 90" });
      });
    },
    { scope: root, dependencies: [delay] },
  );

  return (
    <svg
      ref={root}
      data-draw=""
      aria-hidden
      viewBox="0 0 262 180"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("overflow-visible", className)}
    >
      <path data-trail="" d={TRAIL} />
      <g data-plane="">
        <path d={BODY} />
        <path d={FOLD} />
        <path d={FLAP} />
      </g>
    </svg>
  );
}
