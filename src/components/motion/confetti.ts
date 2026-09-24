"use client";

import confetti from "canvas-confetti";
import { NO_REDUCE } from "@/lib/motion";

/**
 * Confetti from canvas-confetti, in the brand palette: violet (aura-300/400), signal green
 * (signal-300/400) and the fg white, matching the tokens in globals.css. canvas-confetti takes plain
 * hex strings, so the values are copied here. Nothing fires under reduced motion.
 */
const COLORS = ["#a98bff", "#c9b8ff", "#4ae057", "#8df09a", "#f2f0fb"];

/** Above the nav, on the page's top layer (--z-menu) */
const layer = () =>
  Number(getComputedStyle(document.documentElement).getPropertyValue("--z-menu")) || 60;

const allowed = () => typeof window !== "undefined" && window.matchMedia(NO_REDUCE).matches;

/** A celebration: two cannons fire in from the lower corners, twice. For finishing a flow. */
export function celebrate() {
  if (!allowed()) return;
  const base = {
    particleCount: 70,
    spread: 62,
    startVelocity: 58,
    ticks: 240,
    colors: COLORS,
    zIndex: layer(),
    disableForReducedMotion: true,
  };
  const fire = () => {
    confetti({ ...base, angle: 60, origin: { x: 0, y: 0.8 } });
    confetti({ ...base, angle: 120, origin: { x: 1, y: 0.8 } });
  };
  fire();
  window.setTimeout(fire, 260);
}
