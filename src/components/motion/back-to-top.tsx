"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "@phosphor-icons/react/ssr";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";

const RADIUS = 21;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SHOW_AFTER = 320; // px scrolled before the button appears

/** Back to top: circular button whose ring fills as the page is read. Scrolls up through Lenis. */
export function BackToTop() {
  const button = useRef<HTMLButtonElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const pathname = usePathname();

  // Page height changes on client-side navigation, so re-measure the scroll range
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;

    const update = (self: ScrollTrigger) => {
      // Ring fill is a progress readout, so it updates even under reduced motion
      gsap.set(ring.current, { strokeDashoffset: CIRCUMFERENCE * (1 - self.progress) });
      const shouldShow = self.scroll() > SHOW_AFTER;
      if (shouldShow === visible) return;
      visible = shouldShow;
      gsap.to(button.current, {
        autoAlpha: shouldShow ? 1 : 0,
        y: shouldShow ? 0 : 12,
        duration: reduce ? 0 : 0.4,
        ease: "expo.out",
        overwrite: true,
      });
    };

    ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: () => ScrollTrigger.maxScroll(window),
      invalidateOnRefresh: true,
      onRefresh: update,
      onUpdate: update,
    });
  });

  const goTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0 });
  };

  return (
    <button
      ref={button}
      type="button"
      aria-label="Back to top"
      onClick={goTop}
      className="invisible fixed bottom-6 right-6 z-[var(--z-menu)] grid size-12 translate-y-3 place-items-center rounded-full border border-white/[0.14] bg-nav/70 text-fg opacity-0 shadow-panel backdrop-blur-xl transition-colors duration-300 hover:text-accent active:scale-[0.96] sm:bottom-8 sm:right-8"
    >
      <svg aria-hidden viewBox="0 0 48 48" className="absolute -inset-px size-[calc(100%+2px)] -rotate-90">
        <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
        <circle
          ref={ring}
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <ArrowUp aria-hidden weight="bold" className="relative size-4" />
    </button>
  );
}
