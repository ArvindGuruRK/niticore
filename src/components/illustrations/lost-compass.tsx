"use client";

import { useRef, type CSSProperties } from "react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(DrawSVGPlugin);

// Drawn as a numeral zero: an upright oval face filling a 116 x 130 box, pivot at its centre (58, 65).
// The box height is meant to match the digits' cap height, so the face lines up with the 4s either side.
const TICKS = ["M58 11 L58 18", "M102 65 L95 65", "M58 119 L58 112", "M14 65 L21 65"];
// North half filled, south half open, so the direction reads at a glance
const NORTH = "M58 38 L65.5 65 L50.5 65 Z";
const SOUTH = "M50.5 65 L58 92 L65.5 65";

// The needle turns through CSS (a custom property on a view-box-anchored transform), not GSAP's SVG
// transform maths, so it always spins on the pivot whatever the element's box is at the time.
const NEEDLE_STYLE = {
  transformBox: "view-box",
  transformOrigin: "58px 65px",
  transform: "rotate(var(--angle, 0deg)) scale(var(--size, 1))",
} as CSSProperties;

/**
 * A lost compass drawn as a zero, for the 404 page. On load the face draws itself, the four tick
 * marks follow and the needle spins in, then keeps swinging as if it's hunting for north. On fine
 * pointers the needle turns to follow the cursor, and goes back to searching once the pointer rests.
 * Violet line art via currentColor. Hidden until the animation takes over (data-draw); reduced
 * motion shows it drawn and still, pointing north.
 */
export function LostCompass({ delay = 0.3, className }: { delay?: number; className?: string }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: NO_REDUCE, fine: FINE_POINTER }, (ctx) => {
        const { motion, fine } = ctx.conditions as { motion: boolean; fine: boolean };
        if (!motion) return;
        const svg = root.current!;
        const q = gsap.utils.selector(svg);
        const needle = svg.querySelector<SVGGElement>("[data-needle]")!;
        const state = { angle: 0, size: 1 };
        const apply = () => {
          needle.style.setProperty("--angle", `${state.angle}deg`);
          needle.style.setProperty("--size", `${state.size}`);
        };

        // Every animation is created once, here, and reused: new tweens made from later callbacks or
        // pointer events would pile up in the context (and, via contextSafe, linked the useGSAP and
        // matchMedia contexts into a loop whose revert overflowed the stack).

        // Searching: one repeating tween that swings to a fresh random bearing on every repeat
        const search = gsap.to(state, {
          angle: () => {
            const swing = Math.random() < 0.25 ? gsap.utils.random(150, 210) : gsap.utils.random(35, 100);
            return state.angle + gsap.utils.random([-1, 1]) * swing;
          },
          duration: 1.6,
          ease: "elastic.out(1, 0.45)",
          repeat: -1,
          repeatRefresh: true,
          repeatDelay: 1.4,
          onUpdate: apply,
          paused: true,
        });
        let ready = false; // the intro spin has finished
        const startSearch = () => {
          ready = true;
          search.invalidate().restart();
        };

        gsap.set(svg, { visibility: "visible" });
        gsap
          .timeline({ delay, onComplete: startSearch })
          .fromTo(q("[data-face]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "power2.inOut" }, 0)
          .fromTo(q("[data-dial]"), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" }, 0.7)
          .fromTo(
            state,
            { angle: -300, size: 0 },
            { angle: 40, size: 1, duration: 1.8, ease: "expo.out", onUpdate: apply, immediateRender: true },
            0.8,
          );

        if (!fine) return;

        // Following the cursor: quickTo reuses one tween however often it is called, and one paused
        // delayed call restarts the search once the pointer has been still for a moment
        const point = gsap.quickTo(state, "angle", { duration: 0.9, ease: "expo.out", onUpdate: apply });
        const resume = gsap.delayedCall(2.5, startSearch).pause();
        const onMove = (e: PointerEvent) => {
          // Let the intro spin finish before the needle starts tracking
          if (!ready) return;
          const box = svg.getBoundingClientRect();
          const bearing =
            (Math.atan2(e.clientX - (box.left + box.width / 2), box.top + box.height / 2 - e.clientY) * 180) / Math.PI;
          // Turn the short way round (bearing is degrees clockwise from north)
          const delta = ((((bearing - state.angle) % 360) + 540) % 360) - 180;
          search.pause();
          point(state.angle + delta);
          resume.restart(true);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
    },
    { scope: root, dependencies: [delay] },
  );

  return (
    <svg
      ref={root}
      data-draw=""
      aria-hidden
      viewBox="0 0 116 130"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("overflow-visible", className)}
    >
      <ellipse data-face="" cx={58} cy={65} rx={55} ry={63} strokeWidth={4} />
      {TICKS.map((d) => (
        <path key={d} data-dial="" d={d} strokeWidth={2.5} />
      ))}
      <g data-needle="" style={NEEDLE_STYLE}>
        <path d={NORTH} fill="currentColor" strokeWidth={2.5} />
        <path d={SOUTH} strokeWidth={2.5} />
        <circle cx={58} cy={65} r={3.5} fill="var(--color-canvas)" strokeWidth={2.5} />
      </g>
    </svg>
  );
}
