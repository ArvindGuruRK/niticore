"use client";

import { Check } from "@phosphor-icons/react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type OrbitStep = {
  title: string;
  /** The question this step answers, shown in the ring's centre and the panel */
  question: string;
  points: string[];
};

const R = 42; // node ring radius, % of the box
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Steps arranged on a loop. A green arc runs from the first node to the active one, and a comet dot
 * travels round the ring to it (always forwards, so 07 → 01 closes the loop instead of rewinding).
 * The centre and the side panel show the active step. While on screen it advances by itself every
 * `interval` seconds, with a progress line filling under the panel; clicking or using the arrow keys
 * takes over, stops the autoplay and hides the line. Follows the WAI-ARIA tabs pattern. Reduced motion: no autoplay, no tweens.
 */
export function OrbitSteps({ steps, interval = 3.5, className }: { steps: OrbitStep[]; interval?: number; className?: string }) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const angle = useRef(0); // comet rotation, cumulative so it only ever moves forwards
  const n = steps.length;
  const timer = useRef<{ tween: gsap.core.Tween; trigger: ScrollTrigger } | null>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const motion = window.matchMedia(NO_REDUCE).matches;
      const d = motion ? DUR.base * 0.7 : 0;
      const target = (360 / n) * active;
      // Forward to the new node: add whole turns until the target is ahead of the current angle
      let next = angle.current - (angle.current % 360) + target;
      if (next < angle.current) next += 360;
      angle.current = next;

      gsap.to(q("[data-comet]"), { rotation: next, duration: d, ease: EASE.inOut, svgOrigin: "200 200", overwrite: true });
      gsap.to(q("[data-arc]"), { strokeDashoffset: 100 - (active / n) * 100, duration: d, ease: EASE.inOut, overwrite: true });
      if (motion) {
        gsap.fromTo(q("[data-swap]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: DUR.base * 0.5, ease: EASE.out, stagger: 0.04 });
      }

      // One autoplay clock at a time. It only counts down while the ring is on screen.
      // The progress line is the clock: when it fills, the next stage comes in.
      timer.current?.trigger.kill();
      timer.current?.tween.kill();
      timer.current = null;
      if (!motion || !auto) return;
      const tween = gsap.fromTo(
        q("[data-timer]"),
        { scaleX: 0 },
        { scaleX: 1, duration: interval, ease: "none", paused: true, onComplete: () => setActive((a) => (a + 1) % n) },
      );
      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: "top 75%",
        end: "bottom 25%",
        onToggle: (self) => (self.isActive ? tween.resume() : tween.pause()),
      });
      if (trigger.isActive) tween.resume();
      timer.current = { tween, trigger };
    },
    { scope: root, dependencies: [active, auto, n, interval] },
  );

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % n
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i - 1 + n) % n
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    choose(next);
    root.current!.querySelector<HTMLElement>(`[data-node="${next}"]`)?.focus();
  };

  const step = steps[active];

  return (
    <div ref={root} className={cn("grid items-center gap-12 lg:grid-cols-2 lg:gap-16", className)}>
      <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[30rem]">
        <svg aria-hidden viewBox="0 0 400 400" className="absolute inset-0 size-full -rotate-90 overflow-visible">
          <circle cx="200" cy="200" r="168" fill="none" stroke="var(--color-line-strong)" strokeWidth="2" />
          <circle
            data-arc=""
            cx="200"
            cy="200"
            r="168"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset="100"
          />
          <g data-comet="">
            <circle cx="368" cy="200" r="16" fill="var(--color-accent)" opacity="0.18" />
            <circle cx="368" cy="200" r="6" fill="var(--color-accent)" />
          </g>
        </svg>

        {/* Centre readout */}
        <div className="absolute inset-[22%] flex flex-col items-center justify-center gap-2 text-center" aria-hidden>
          <p data-swap="" className="type-h3 text-fg sm:type-h2">
            {step.title}
          </p>
          <p data-swap="" className="type-body hidden sm:block">
            {step.question}
          </p>
        </div>

        {/* Nodes: real buttons, placed round the ring from 12 o'clock */}
        <div role="tablist" aria-label="Stages" aria-orientation="horizontal">
          {steps.map((s, i) => {
            const a = ((360 / n) * i - 90) * (Math.PI / 180);
            const selected = i === active;
            return (
              <button
                key={s.title}
                type="button"
                role="tab"
                id={`${uid}-t-${i}`}
                data-node={i}
                aria-selected={selected}
                aria-controls={`${uid}-panel`}
                aria-label={`${pad(i + 1)} ${s.title}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                style={{ left: `${50 + R * Math.cos(a)}%`, top: `${50 + R * Math.sin(a)}%` }}
                className={cn(
                  "absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-xs font-bold tabular-nums transition-colors duration-300 sm:size-12 sm:text-sm",
                  selected
                    ? "border-accent bg-accent text-accent-ink shadow-accent"
                    : i < active
                      ? "border-accent/60 bg-surface text-accent hover:bg-raised"
                      : "border-line-strong bg-surface text-fg-muted hover:border-white/30 hover:text-fg",
                )}
              >
                {pad(i + 1)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-t-${active}`}
        className="flex flex-col gap-5 rounded-panel border border-line bg-surface p-6 shadow-panel sm:p-8"
      >
        <p data-swap="" className="type-label text-fg-subtle">
          {pad(active + 1)} / {pad(n)}
        </p>
        <h3 data-swap="" className="type-h2 text-fg">
          {step.title}
        </h3>
        <p data-swap="" className="type-lead">
          {step.question}
        </p>
        <ul data-swap="" className="flex flex-col gap-3">
          {step.points.map((p) => (
            <li key={p} className="type-body flex gap-3">
              <Check weight="bold" aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
              {p}
            </li>
          ))}
        </ul>
        {auto && (
          <div aria-hidden className="mt-2 h-0.5 w-full overflow-hidden rounded-control bg-white/[0.07]">
            <span data-timer="" className="block h-full origin-left scale-x-0 rounded-control bg-accent" />
          </div>
        )}
      </div>
    </div>
  );
}
