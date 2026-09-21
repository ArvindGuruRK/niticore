import type Lenis from "lenis";

/** Shared handle to the Lenis instance so components can trigger smooth programmatic scrolls. */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;
