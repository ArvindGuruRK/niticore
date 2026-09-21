"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Frameworks", href: "#frameworks" },
  { label: "Assessments", href: "#assessment" },
  { label: "Solutions", href: "#solutions" },
  { label: "Academy & Advisory", href: "#advisory" },
];

/** Scroll distance (px) over which the floating panel docks into a full-width bar. */
const DOCK_DISTANCE = 160;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // Float to dock: as the page scrolls, the panel widens to the full viewport, loses its
  // margin and radius, and keeps only a bottom hairline. Scrubbed, so it reverses on scroll up.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const tl = gsap.timeline({
          defaults: { ease: EASE.linear },
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: `+=${DOCK_DISTANCE}`,
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });
        tl.to(wrap.current, { paddingTop: 0, paddingLeft: 0, paddingRight: 0 }, 0)
          .to(
            box.current,
            {
              maxWidth: () => window.innerWidth,
              borderRadius: 0,
              borderTopColor: "rgba(255,255,255,0)",
              borderLeftColor: "rgba(255,255,255,0)",
              borderRightColor: "rgba(255,255,255,0)",
              backgroundColor: "rgba(6,1,31,0.82)",
              boxShadow: "0 0 0 rgba(2,0,14,0)",
            },
            0,
          );
      });
    },
    { scope: wrap },
  );

  return (
    <header ref={wrap} className="fixed inset-x-0 top-0 z-[var(--z-nav)] px-4 pt-4 sm:px-6">
      <div
        ref={box}
        className="mx-auto w-full max-w-7xl rounded-[2rem] border border-line-strong bg-[rgb(12_6_43/0.62)] shadow-panel backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-5 lg:px-6">
          <Link href="/" aria-label="NitiCore home" className="shrink-0 rounded-control">
            <Image src="/logo/niticore.svg" alt="NitiCore" width={156} height={38} priority className="h-8 w-auto -translate-y-[2px]" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-control px-3.5 py-2 text-sm font-semibold text-fg-muted transition-colors duration-300 hover:bg-white/[0.08] hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button href="#demo" size="md" className="hidden sm:inline-flex">
              Book a demo
            </Button>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="grid size-11 place-items-center rounded-control border border-line-strong text-fg transition-colors hover:bg-white/[0.06] lg:hidden"
            >
              {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line lg:hidden">
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-5">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-field px-3 py-3 text-base font-semibold text-fg-muted hover:bg-white/[0.06] hover:text-fg"
                >
                  {link.label}
                </Link>
              ))}
              <Button href="#demo" size="lg" className="mt-3 sm:hidden" onClick={() => setOpen(false)}>
                Book a demo
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
