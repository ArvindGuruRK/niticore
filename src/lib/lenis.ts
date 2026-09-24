import type Lenis from "lenis";

/** Shared handle to the Lenis instance so components can trigger smooth programmatic scrolls. */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

/**
 * Smooth-scroll to the element with `id`, leaving room for the floating nav. Falls back to native
 * scrolling (instant under reduced motion) when Lenis is off.
 */
export const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) {
    instance.scrollTo(el, { offset: -104 });
    return;
  }
  const smooth = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
};
