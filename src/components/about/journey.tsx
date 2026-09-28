"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DIST, DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

type Stage = {
  name: string;
  title: string;
  line: string;
  items: string[];
  link: { label: string; href: string };
};

const TONES: CardTone[] = ["blue", "violet", "green", "blue"];
/** Height of the docked nav: the pinned block centres in the space below it */
const NAV_H = 88;

/**
 * "One governance journey. Four ways to engage." as a scroll story. From lg the block pins under the
 * nav (centred in the space below it): a rail with one station per stage fills as you scroll, each station lights as it is reached,
 * and the stage panels crossfade in turn (the old one lifts away, the new one rises in). The panels
 * share one grid cell, so the block is exactly one panel tall and fits the screen; keep the section
 * heading outside it. If the block is ever taller than the space under the nav, it pins at the top
 * instead of centring, so it is never cut off. A panel only starts to appear once the previous one
 * has fully gone, so two stages never show through each other. Below lg (and under reduced motion)
 * the panels stack and fade in one by one, with no pinning on touch screens.
 */
export function Journey({ stages }: { stages: Stage[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add(`${NO_REDUCE} and (min-width: 1024px)`, () => {
        const panels = q("[data-panel]");
        const fills = q("[data-station-fill]");
        const labels = q("[data-station-label]");
        const steps = panels.length - 1;

        gsap.set(panels[0], { autoAlpha: 1, y: 0 });
        gsap.set(panels.slice(1), { autoAlpha: 0, y: DIST * 1.5 });
        gsap.set(fills[0], { scale: 1 });
        gsap.set(labels[0], { color: "var(--color-fg)" });

        const tl = gsap.timeline({
          defaults: { ease: EASE.inOut },
          scrollTrigger: {
            trigger: root.current,
            start: () =>
              root.current!.offsetHeight > window.innerHeight - NAV_H - 16
                ? `top ${NAV_H + 8}px`
                : `center ${(window.innerHeight + NAV_H) / 2}px`,
            end: () => `+=${window.innerHeight * 0.85 * steps}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(q("[data-rail-fill]"), { scaleX: 0 }, { scaleX: 1, ease: "none", duration: steps }, 0);
        for (let i = 1; i <= steps; i++) {
          const at = i - 0.45;
          tl.to(panels[i - 1], { autoAlpha: 0, y: -DIST * 1.5, scale: 0.97, duration: 0.14 }, at - 0.14)
            .to(panels[i], { autoAlpha: 1, y: 0, scale: 1, duration: 0.2 }, at)
            .to(fills[i], { scale: 1, duration: 0.25, ease: "back.out(2.5)" }, at)
            .to(labels[i], { color: "var(--color-fg)", duration: 0.25 }, at);
        }
        // Hold on the last stage for a beat before the pin releases
        tl.to({}, { duration: 0.3 });
      });

      mm.add(`${NO_REDUCE} and (max-width: 1023.98px)`, () => {
        q("[data-panel]").forEach((panel) => {
          gsap.fromTo(
            panel,
            { autoAlpha: 0, y: DIST },
            {
              autoAlpha: 1,
              y: 0,
              duration: DUR.base,
              ease: EASE.out,
              clearProps: "transform",
              scrollTrigger: { trigger: panel, start: "top 86%", toggleActions: "play none none none" },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col gap-8">
      {/* Stations rail: desktop with motion only */}
      <div aria-hidden className="relative hidden motion-safe:lg:block">
        <div className="absolute left-[12.5%] right-[12.5%] top-3 h-0.5 rounded-full bg-line-strong">
          <div data-rail-fill="" className="h-full origin-left scale-x-0 rounded-full bg-tertiary" />
        </div>
        <ol className="relative grid grid-cols-4">
          {stages.map((stage) => (
            <li key={stage.name} className="flex flex-col items-center gap-3">
              <span className="grid size-6.5 place-items-center rounded-full border-2 border-line-strong bg-canvas">
                <span data-station-fill="" className="size-3 scale-0 rounded-full bg-tertiary" />
              </span>
              <span data-station-label="" className="type-h4 text-fg-subtle">
                {stage.name}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stages.map((stage, i) => {
          const tone = CARD_TONES[TONES[i % TONES.length]];
          return (
            <article
              key={stage.name}
              data-panel=""
              data-anim=""
              className="bezel motion-safe:lg:col-start-1 motion-safe:lg:row-start-1"
            >
              <div
                className={cn(
                  "group relative grid grid-cols-1 gap-8 rounded-panel p-card shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14",
                  tone.className,
                )}
              >
                <div className="flex flex-col gap-4">
                  <span className="type-h3 tabular-nums text-fg/50">0{i + 1}</span>
                  <h3 className="type-hero text-fg">{stage.name}</h3>
                  <p className="type-h3 text-fg">{stage.title}</p>
                  <p className="type-body text-fg/85">{stage.line}</p>
                </div>
                <div className="flex flex-col gap-6 lg:justify-center">
                  <ul className="flex flex-col gap-3">
                    {stage.items.map((item) => (
                      <li key={item} className="type-body flex items-start gap-3 text-fg">
                        <span aria-hidden className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-white/15">
                          <Check weight="bold" className="size-3" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={stage.link.href}
                    className="inline-flex w-fit items-center gap-3 rounded-control bg-white/10 py-1.5 pl-5 pr-1.5 font-semibold text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] transition-colors duration-300 hover:bg-white/15"
                  >
                    {stage.link.label}
                    <span className="grid size-8 place-items-center rounded-full bg-white/15 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 hover:translate-x-1">
                      <ArrowRight aria-hidden weight="bold" className="size-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
