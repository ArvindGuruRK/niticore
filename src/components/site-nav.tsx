"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { List, X } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";
import { NAV_LINKS as LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Scroll distance (px) over which the floating panel docks into a full-width bar. */
const DOCK_DISTANCE = 160;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const wrap = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // The nav starts below the announcement bar and follows it off the top as the page scrolls.
  // CSS does the math from --scroll-y, so the first paint is already in the right place.
  useEffect(() => {
    const root = document.documentElement;
    let last = -1;
    const onScroll = () => {
      // Past 400px the value is constant; writing a custom property on <html> restyles the page, so skip no-ops
      const v = Math.min(Math.round(window.scrollY), 400);
      if (v === last) return;
      last = v;
      root.style.setProperty("--scroll-y", String(v));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              backgroundColor: "rgba(6,1,31,0.92)",
              boxShadow: "0 0 0 rgba(2,0,14,0)",
            },
            0,
          );
      });
    },
    { scope: wrap },
  );

  return (
    <header
      ref={wrap}
      className="fixed inset-x-0 top-[max(0px,calc(var(--banner-h)_-_var(--scroll-y,0)*1px))] z-[var(--z-nav)] px-page pt-4"
    >
      <div
        ref={box}
        // Explicit rgb() rather than bg-nav/80: the dock animation below tweens this element's
        // backgroundColor with GSAP, which reads the *computed* starting color to interpolate from.
        // Tailwind v4's opacity-modifier shorthand (bg-nav/80) computes to oklab(), which GSAP's
        // color parser misreads as raw 0-255 RGB components — those tiny oklab fractions round down
        // to ~(0,0,0), so the dock tween started from near-black instead of this color, flashing
        // solid black partway through the scroll. rgb() computes to a plain rgba() GSAP parses correctly.
        className="mx-auto w-full max-w-7xl rounded-[2rem] border border-line-strong bg-[rgb(12_6_43/0.8)] shadow-panel backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-5 lg:px-6">
          <Link href="/" aria-label="Niticore home" className="shrink-0 rounded-control">
            <Image src="/logo/niticore.svg" alt="Niticore" width={156} height={38} priority className="h-8 w-auto -translate-y-[2px]" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-control px-3.5 py-2 text-sm font-semibold text-fg-muted transition-colors duration-300 hover:bg-white/[0.08] hover:text-fg",
                  "aria-[current=page]:bg-white/[0.08] aria-[current=page]:text-fg",
                )}
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
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain border-t border-line lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-5">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="tap-target flex items-center rounded-field px-3 py-3 text-base font-semibold text-fg-muted hover:bg-white/[0.06] hover:text-fg aria-[current=page]:bg-white/[0.06] aria-[current=page]:text-fg"
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
