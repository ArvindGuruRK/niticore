"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE, STAGGER } from "@/lib/motion";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import type { Level } from "@/lib/readiness";
import { cn } from "@/lib/utils";

/** Bar height, lowest to highest: rises evenly like a signal meter */
const height = (i: number) => `${34 + i * 16.5}%`;

/** Each bar's colour: the three card tones in turn, in the Frameworks explorer's order */
const TONES: CardTone[] = ["violet", "blue", "green", "violet", "blue"];
const toneOf = (i: number) => CARD_TONES[TONES[i % TONES.length]].className;

/** Seconds each level stays lit before the meter climbs to the next */
const INTERVAL = 2.8;

/**
 * The Governance Readiness™ model as a signal meter: five equal-width bars, each taller than the
 * last, standing on a ruler of five equal segments labelled with each level's score band.
 * It plays by itself: after the entrance it climbs from level 1 to 5, one level every INTERVAL
 * seconds, lighting every bar up to the current level like signal strength (the fills climb bar by
 * bar, the current bar lifts, the ruler fills to it, the detail panel fades up). After level 5 it
 * drains from the top back to level 1 and climbs again.
 * Autoplay runs whenever the meter is on screen, hover or not. A click or the arrow keys jump to a
 * level, and the climb carries on from that level with a fresh interval.
 * All five detail panels share one grid cell, so the card keeps the tallest panel's height and the
 * page below never moves while it plays.
 * Entrance (one timeline, on first view): the bars rise from the ruler in turn, their numbers drop
 * in, the ruler draws across, the panel rises, then level 1 lights.
 * WAI-ARIA tabs (arrow keys, Home, End). Below md the bars show only the level number; the name is
 * in the panel. Reduced motion: no autoplay, and every change is instant.
 */
export function MaturityLadder({ levels }: { levels: Level[] }) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const previous = useRef<number | null>(null);
  const entered = useRef(false);
  // The level to light once the entrance ends (a click can land while it is still playing)
  const wanted = useRef(0);
  // Autoplay: one pending step at a time, running only while on screen
  const timer = useRef<gsap.core.Tween | null>(null);
  const onScreen = useRef(false);

  const sync = () => {
    if (!timer.current) return;
    if (onScreen.current) timer.current.resume();
    else timer.current.pause();
  };

  /** Queue the next climb (level 5 loops back to 1). Replaces any step already queued. */
  const schedule = () => {
    timer.current?.kill();
    timer.current = gsap.delayedCall(INTERVAL, () => setActive((a) => (a + 1) % levels.length));
    sync();
  };

  useEffect(() => () => void timer.current?.kill(), []);

  /** Light bars 0..to. With `animate` false it snaps. Falling drains from the top bar down. */
  const light = (to: number, animate: boolean) => {
    const q = gsap.utils.selector(root);
    const fills = q("[data-fill]");
    const bars = q("[data-bar]");
    const from = previous.current ?? -1;
    const down = to < from;
    const duration = animate ? DUR.base * 0.7 : 0;

    fills.forEach((fill, i) => {
      const lit = i <= to;
      // Wave order: bottom bar first when rising, top bar first when falling
      const order = down ? Math.max(0, from - i) : Math.max(0, i - Math.max(0, from));
      gsap.to(fill, {
        scaleY: lit ? 1 : 0,
        opacity: 1,
        duration,
        delay: animate ? order * 0.07 : 0,
        ease: lit ? EASE.out : EASE.inOut,
        overwrite: true,
      });
      gsap.to(bars[i], {
        scaleX: lit ? 1 : 0,
        duration,
        delay: animate ? order * 0.06 : 0,
        ease: EASE.out,
        overwrite: true,
      });
    });

    // The chosen bar lifts off the ruler and settles
    if (animate) {
      gsap.fromTo(
        q(`[data-index="${to}"]`),
        { y: 0 },
        { y: -10, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1, overwrite: "auto" },
      );
    }
    previous.current = to;
  };

  // Entrance, then the first lit state
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(NO_REDUCE, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
          onComplete: () => {
            entered.current = true;
            light(wanted.current, true);
            schedule();
          },
        });

        tl.fromTo(
          q("[data-step]"),
          { opacity: 0, scaleY: 0.08 },
          { opacity: 1, scaleY: 1, duration: DUR.slow, ease: EASE.out, stagger: STAGGER * 1.5, clearProps: "transform" },
        )
          .fromTo(
            q("[data-num]"),
            { opacity: 0, y: -18 },
            { opacity: 1, y: 0, duration: DUR.base, ease: "back.out(2)", stagger: STAGGER },
            "-=0.9",
          )
          .fromTo(
            q("[data-track]"),
            { scaleX: 0 },
            { scaleX: 1, duration: DUR.base, ease: EASE.out, stagger: STAGGER * 0.8 },
            "-=0.8",
          )
          .fromTo(
            q("[data-range]"),
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: DUR.base * 0.6, ease: EASE.out, stagger: STAGGER * 0.8 },
            "<0.15",
          )
          .fromTo(
            q("[data-detail]"),
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: DUR.base, ease: EASE.out, clearProps: "transform" },
            "-=0.5",
          );

        // Autoplay only while the meter is on screen
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 85%",
          end: "bottom 15%",
          onToggle: (self) => {
            onScreen.current = self.isActive;
            sync();
          },
        });
        return () => {
          timer.current?.kill();
          timer.current = null;
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        entered.current = true;
        light(wanted.current, false);
      });
    },
    { scope: root },
  );

  // Every change of level after the entrance, from autoplay or from a click
  useGSAP(
    () => {
      wanted.current = active;
      if (!entered.current || previous.current === active) return;
      const motion = window.matchMedia(NO_REDUCE).matches;
      light(active, motion);
      if (!motion) return;
      schedule();
      gsap.fromTo(
        root.current!.querySelectorAll(`[data-level-panel="${active}"] [data-part]`),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: DUR.base * 0.7, ease: EASE.out, stagger: 0.06, clearProps: "transform" },
      );
    },
    { scope: root, dependencies: [active] },
  );

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const n = levels.length;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? Math.min(i + 1, n - 1)
      : e.key === "ArrowLeft" || e.key === "ArrowDown" ? Math.max(i - 1, 0)
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    root.current!.querySelector<HTMLElement>(`[data-index="${next}"]`)?.focus();
  };

  return (
    <div ref={root} className="flex flex-col gap-8 sm:gap-10">
      <div className="flex flex-col gap-3">
        {/* Bars */}
        <div
          role="tablist"
          aria-label="Governance Readiness levels"
          data-anim-stagger=""
          className="grid h-60 grid-cols-5 items-end gap-1.5 sm:h-72 sm:gap-2.5 lg:h-80 lg:gap-3"
        >
          {levels.map((l, i) => {
            const selected = i === active;
            const lit = i <= active;
            return (
              <button
                key={l.level}
                id={`${uid}-t-${i}`}
                data-step=""
                data-index={i}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${uid}-panel`}
                aria-label={`Level ${l.level}, ${l.name}, scores ${l.min} to ${l.max}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  "group relative isolate flex min-w-0 origin-bottom flex-col items-start overflow-hidden rounded-t-[0.875rem] rounded-b-md border p-2.5 text-left transition-[border-color,box-shadow] duration-300 md:p-4",
                  selected ? "border-white/20 shadow-panel" : "border-line hover:border-line-strong",
                )}
                style={{ height: height(i) }}
              >
                {/* Unlit base, and the coloured fill that GSAP raises and drains. The fill is glossy: a
                    white wash fading down from the top and a bright top edge. */}
                <span
                  aria-hidden
                  className="absolute inset-0 -z-20 bg-raised/60 transition-colors duration-300 group-hover:bg-raised"
                />
                <span
                  aria-hidden
                  data-fill=""
                  className={cn(
                    "absolute inset-0 -z-10 origin-bottom overflow-hidden shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]",
                    toneOf(i),
                  )}
                  style={{ transform: "scaleY(0)" }}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.2),rgb(255_255_255/0.04)_45%,transparent_70%)]" />
                </span>
                <span aria-hidden className="flex w-full flex-col gap-1">
                  <span
                    data-num=""
                    className={cn(
                      "type-h3 leading-none transition-colors duration-300 md:type-h2 md:leading-none",
                      lit ? "text-fg" : "text-fg-muted group-hover:text-fg",
                    )}
                  >
                    {l.level}
                  </span>
                  <span
                    className={cn(
                      "hidden truncate text-sm font-semibold transition-colors duration-300 md:block lg:text-base",
                      lit ? "text-fg" : "text-fg-subtle group-hover:text-fg-muted",
                    )}
                  >
                    {l.name}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Ruler: five equal segments under the five bars, each labelled with its band */}
        <div aria-hidden className="grid grid-cols-5 gap-1.5 sm:gap-2.5 lg:gap-3">
          {levels.map((l, i) => (
            <div key={l.level} className="flex min-w-0 flex-col gap-2">
              <span data-track="" className="relative h-1.5 origin-left overflow-hidden rounded-control bg-white/[0.09]">
                <span
                  data-bar=""
                  className={cn("absolute inset-0 origin-left rounded-control", toneOf(i))}
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
              <span
                data-range=""
                className={cn(
                  "truncate text-xs font-semibold tabular-nums transition-colors duration-500",
                  i <= active ? "text-tertiary-soft" : "text-fg-subtle",
                )}
              >
                {l.min}–{l.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail: every level's panel sits in the same grid cell, only the current one visible */}
      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-t-${active}`}
        data-detail=""
        data-anim=""
        className="grid rounded-panel border border-line bg-surface p-6 shadow-panel sm:p-8"
      >
        {levels.map((l, i) => {
          const shown = i === active;
          return (
            <div
              key={l.level}
              data-level-panel={i}
              aria-hidden={!shown}
              inert={!shown}
              className={cn("flex flex-col gap-6 [grid-area:1/1] sm:gap-8", !shown && "invisible")}
            >
              <div
                data-part=""
                className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <h3 className="type-h3 text-fg">
                  Level {l.level}, {l.name}
                </h3>
                <p className="type-small font-semibold text-tertiary-soft">
                  Scores {l.min} to {l.max}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 md:gap-10">
                <div data-part="" className="flex flex-col gap-2">
                  <h4 className="type-h4 text-fg">What it looks like</h4>
                  <p className="type-body">
                    {l.summary} {l.traits}
                  </p>
                </div>
                <div data-part="" className="flex flex-col gap-2">
                  <h4 className="type-h4 text-fg">In the platform</h4>
                  <p className="type-body">{l.platform}</p>
                  {l.note && <p className="type-body font-semibold text-tertiary-soft">{l.note}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
