"use client";

import Image from "next/image";
import { useRef } from "react";
import { Buildings, Check } from "@phosphor-icons/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";

gsap.registerPlugin(DrawSVGPlugin);

type Target = { framework: string; clause: string; logo: string | null };
type Stat = { value: number; label: string };

// Wires fan out from the action (top centre) to the centre of each of the five columns below
const WIRES = [100, 300, 500, 700, 900].map((x) => `M500 0 C 500 70, ${x} 50, ${x} 120`);

/**
 * "Do it once. Satisfy all." as a live simulation. One governance action sits on top; running it
 * pulses the action, draws a green wire to each framework in turn, and ticks that framework's clause
 * as satisfied, then the tally lands. Plays each time it is scrolled into view (re-arming only once
 * it is fully off screen, so it never resets while seen).
 * Wires show from lg up; below that the cards stack and still tick in order (on phones each card is
 * one compact row). Reduced motion (and no
 * JS) shows the finished state.
 */
export function EvidenceSimulator({
  action,
  targets,
  summary,
}: {
  action: { title: string; subject: string };
  targets: Target[];
  summary: Stat[];
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const q = gsap.utils.selector(root);
        const cards = q("[data-target]");
        const wires = q("[data-wire]");
        const setDone = (el: HTMLElement, done: boolean) => (el.dataset.done = String(done));

        const tl = gsap.timeline({ paused: true });
        tl.call(() => cards.forEach((c) => setDone(c, false)))
          .set(wires, { drawSVG: "0%" })
          .set(q("[data-summary] > *"), { opacity: 0, y: 12 })
          .fromTo(q("[data-action]"), { scale: 1 }, { scale: 1.03, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 });

        wires.forEach((wire, i) => {
          const at = 0.35 + i * 0.28;
          tl.to(wire, { drawSVG: "100%", duration: 0.5, ease: EASE.inOut }, at).call(() => setDone(cards[i], true), [], at + 0.45);
        });
        tl.to(q("[data-summary] > *"), { opacity: 1, y: 0, duration: 0.5, ease: EASE.out, stagger: 0.1 }, "+=0.15");

        // Start from the unrun state; play on entering, reset once the whole block is below the fold
        const reset = () => {
          tl.pause(0);
          cards.forEach((c) => setDone(c, false));
          gsap.set(wires, { drawSVG: "0%" });
          gsap.set(q("[data-summary] > *"), { opacity: 0 });
        };
        reset();
        ScrollTrigger.create({ trigger: root.current, start: "top 65%", onEnter: () => tl.restart() });
        ScrollTrigger.create({ trigger: root.current, start: "top bottom", onLeaveBack: reset });

        return () => cards.forEach((c) => setDone(c, true));
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col items-center">
      {/* The action */}
      <div
        data-action=""
        className="flex w-full max-w-sm flex-col items-center gap-1 rounded-panel border-2 border-line-strong bg-surface p-card text-center shadow-panel sm:p-8"
      >
        <h3 className="type-h3 text-fg">{action.title}</h3>
        <p className="type-body">{action.subject}</p>
      </div>

      {/* Wires (lg+), drawn over a faint track */}
      <svg aria-hidden viewBox="0 0 1000 120" preserveAspectRatio="none" className="hidden h-28 w-full overflow-visible lg:block">
        {WIRES.map((d) => (
          <path key={`t${d}`} d={d} fill="none" stroke="var(--color-line-strong)" strokeWidth="2" />
        ))}
        {WIRES.map((d) => (
          <path key={d} data-wire="" d={d} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
        ))}
      </svg>

      {/* The frameworks it satisfies */}
      <ol className="mt-8 grid w-full gap-3 sm:grid-cols-2 lg:mt-0 lg:grid-cols-5">
        {targets.map((t) => (
          <li
            key={t.framework}
            data-target=""
            data-done="true"
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-0.5 rounded-panel border-2 border-line bg-surface p-4 shadow-panel transition-colors duration-500 data-[done=true]:border-tertiary data-[done=true]:bg-accent/[0.06] sm:flex sm:flex-col sm:items-stretch sm:gap-4 sm:p-5 sm:last:col-span-2 lg:last:col-span-1"
          >
            {/* Phones: one compact row (logo, text, tick). From sm: logo and tick share a top row */}
            <div className="contents sm:flex sm:items-center sm:justify-between sm:gap-3">
              {t.logo ? (
                <Image src={t.logo} alt="" width={112} height={112} className="row-span-2 size-10 object-contain sm:size-12" />
              ) : (
                <Buildings weight="fill" aria-hidden className="row-span-2 size-10 text-fg sm:size-12" />
              )}
              <span className="col-start-3 row-span-2 row-start-1 grid size-8 place-items-center rounded-full border border-line-strong text-transparent transition-all duration-500 group-data-[done=true]:scale-110 group-data-[done=true]:border-accent group-data-[done=true]:bg-accent group-data-[done=true]:text-accent-ink">
                <Check weight="bold" aria-hidden className="size-4" />
              </span>
            </div>
            <div className="col-start-2 row-start-1 flex flex-col gap-0.5 sm:gap-1">
              <h4 className="type-h4 text-fg">{t.framework}</h4>
              <p className="type-small">{t.clause}</p>
            </div>
            <p className="type-small col-start-2 row-start-2 font-semibold sm:mt-auto text-fg-subtle transition-colors duration-500 group-data-[done=true]:text-accent">
              <span className="group-data-[done=true]:hidden">Waiting</span>
              <span className="hidden group-data-[done=true]:inline">Satisfied</span>
            </p>
          </li>
        ))}
      </ol>

      {/* The tally */}
      <dl data-summary="" className="mt-10 grid w-full max-w-2xl grid-cols-3 gap-4 text-center">
        {summary.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <dt className="order-2 type-small">{s.label}</dt>
            <dd className="order-1 type-display text-accent">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
