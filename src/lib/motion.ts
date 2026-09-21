/** Motion tokens. Every GSAP animation in the site reads from here. */
export const DUR = { fast: 0.35, base: 0.8, slow: 1.2 } as const;
export const EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  linear: "none",
} as const;
export const STAGGER = 0.09;
export const DIST = 28; // px of travel for rise-in reveals
export const NO_REDUCE = "(prefers-reduced-motion: no-preference)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
