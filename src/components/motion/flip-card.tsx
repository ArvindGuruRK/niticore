"use client";

import { useRef, type ReactNode } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FLIP = 0.8; // seconds for a full turn
const LIFT = 70; // px the card rises toward the viewer mid-turn

/**
 * A card that flips over in 3D on tap or click, and tilts toward the pointer.
 *
 * Four layers, because 3D breaks if any ancestor of the flipping element clips or isolates:
 * - frame: never moves; holds the perspective and reads the pointer (no jitter, no edge flicker)
 * - tilter: rotates toward the pointer (fine pointers only)
 * - flipper: turns 0 to 180 degrees on Y and rises toward the viewer mid-turn
 * - two faces stacked in one grid cell with hidden backfaces; the back is pre-rotated 180 degrees.
 *   The card is as tall as the taller face.
 *
 * Built to stay smooth:
 * - The flip runs straight in GSAP from the click handler. No React state, so a tap never re-renders
 *   the card before the animation starts.
 * - Only transforms animate (rotationY and z). The mid-turn lift is a move toward the viewer, not a
 *   scale, so the card is never re-rasterised mid-flip. Both moving layers are promoted up front.
 * - A tap during a flip reverses from wherever the card is, with no competing tweens.
 * - Faces should be static: no per-frame repainting effects (like a cursor spotlight) on a surface
 *   that is turning in 3D.
 *
 * Each face carries a real flip button in its top-right corner for keyboard and screen-reader users;
 * only the visible face is interactive (the hidden one is inert). Its click bubbles to the card, so
 * one press flips once, and focus moves to the other face's button.
 * Reduced motion: no tilt, and the flip swaps faces instantly.
 */
export function FlipCard({
  front,
  back,
  label,
  backLabel = "Flip back",
  max = 8,
  className,
}: {
  front: ReactNode;
  back: ReactNode;
  /** Accessible name of the flip button on the front, e.g. "Show photo" */
  label: string;
  /** Accessible name of the flip button on the back */
  backLabel?: string;
  /** Maximum tilt in degrees */
  max?: number;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const tilter = useRef<HTMLDivElement>(null);
  const flipper = useRef<HTMLDivElement>(null);
  const frontFace = useRef<HTMLDivElement>(null);
  const backFace = useRef<HTMLDivElement>(null);
  const flipped = useRef(false);
  const turn = useRef<gsap.core.Timeline | null>(null);

  // Tilt toward the pointer, plus cleanup of any running turn on unmount
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and ${FINE_POINTER}`, () => {
        const f = frame.current!;
        const opts = { duration: 0.6, ease: "power3.out" };
        const rx = gsap.quickTo(tilter.current, "rotationX", opts);
        const ry = gsap.quickTo(tilter.current, "rotationY", opts);
        const move = (e: PointerEvent) => {
          const r = f.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 2 * max);
          rx((0.5 - (e.clientY - r.top) / r.height) * 2 * max);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        f.addEventListener("pointermove", move);
        f.addEventListener("pointerleave", leave);
        return () => {
          f.removeEventListener("pointermove", move);
          f.removeEventListener("pointerleave", leave);
        };
      });
      return () => turn.current?.kill();
    },
    { scope: frame, dependencies: [max] },
  );

  /** Hand interactivity to the face that is now showing; keep focus with the flip button. */
  const swapFaces = (toBack: boolean) => {
    const show = toBack ? backFace.current! : frontFace.current!;
    const hide = toBack ? frontFace.current! : backFace.current!;
    const hadFocus = hide.contains(document.activeElement);
    hide.inert = true;
    hide.setAttribute("aria-hidden", "true");
    show.inert = false;
    show.removeAttribute("aria-hidden");
    if (hadFocus) show.querySelector<HTMLButtonElement>("[data-flip]")?.focus({ preventScroll: true });
  };

  const flip = () => {
    const toBack = !flipped.current;
    flipped.current = toBack;
    const el = flipper.current!;
    turn.current?.kill();

    if (!window.matchMedia(NO_REDUCE).matches) {
      gsap.set(el, { rotationY: toBack ? 180 : 0, z: 0 });
      swapFaces(toBack);
      return;
    }
    // Reverse from wherever the card is; the lift peaks halfway through the turn
    turn.current = gsap
      .timeline()
      .to(el, { rotationY: toBack ? 180 : 0, duration: FLIP, ease: "power2.inOut" }, 0)
      .to(el, { z: LIFT, duration: FLIP / 2, ease: "sine.out" }, 0)
      .to(el, { z: 0, duration: FLIP / 2, ease: "sine.in" }, FLIP / 2)
      .call(swapFaces, [toBack], FLIP / 2);
  };

  const flipButton = (name: string) => (
    <button
      type="button"
      data-flip=""
      aria-label={name}
      className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/15 text-fg transition-colors duration-300 hover:bg-white/25"
    >
      <ArrowsClockwise weight="bold" aria-hidden className="size-5" />
    </button>
  );

  return (
    <div ref={frame} className={cn("h-full [perspective:1100px]", className)}>
      <div ref={tilter} className="h-full will-change-transform [transform-style:preserve-3d]">
        {/* Pointer convenience; keyboard users flip with the corner button, whose click bubbles here */}
        <div
          ref={flipper}
          onClick={flip}
          className="grid h-full cursor-pointer touch-manipulation will-change-transform [transform-style:preserve-3d]"
        >
          <div
            ref={frontFace}
            className="relative col-start-1 row-start-1 h-full [-webkit-backface-visibility:hidden] [backface-visibility:hidden]"
          >
            {front}
            {flipButton(label)}
          </div>
          <div
            ref={backFace}
            aria-hidden
            inert
            className="relative col-start-1 row-start-1 h-full [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            {back}
            {flipButton(backLabel)}
          </div>
        </div>
      </div>
    </div>
  );
}
