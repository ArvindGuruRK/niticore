"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { Check } from "@phosphor-icons/react";
import { LiveNumber } from "@/components/motion/live-number";
import { Button } from "@/components/ui/button";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToId } from "@/lib/lenis";
import { DUR, EASE, NO_REDUCE, STAGGER } from "@/lib/motion";
import { SELECT_ASSESSMENT } from "@/lib/readiness";
import { cn } from "@/lib/utils";

/** Seconds each assessment stays selected before autoplay moves to the next */
const INTERVAL = 3.5;
/** Autoplay runs where the sheet sits beside the list; below lg it opens inline and would move the page */
const WIDE = "(min-width: 64rem)";

type Assessment = {
  id: string;
  number: string;
  name: string;
  question: string;
  format: string;
  /** Length in minutes, or null for the open-ended regulatory-grade assessment */
  minutes: number | null;
  deliverables: string[];
  tagsTitle: string | null;
  tags: string[];
  cta: { label: string; href: string };
};

/**
 * The six assessments, led by the question each one answers. The list of questions sits on the left;
 * the selected assessment's spec sheet sits beside it (sticky on lg), opened by a clock dial that
 * fills to its length in minutes, so the jump from the 10-minute diagnostic to the deep assessments
 * is visible at a glance. Below lg the sheet opens inline under the selected question.
 *
 * Motion (GSAP): on first view the rows slide in one by one and the sheet rises. A raised highlight
 * glides from row to row with the selection. On every switch the sheet's parts fade up, the
 * deliverables cascade, the tags pop in, and the clock arc and its minutes roll to the new length.
 *
 * Autoplay (lg and up, where the sheet sits beside the list): it moves to the next assessment every
 * INTERVAL seconds while on screen, looping 06 back to 01, and hover never pauses it. A thin violet
 * line fills along the bottom of the highlight as the countdown. A click (or a link from the
 * readiness check) selects that assessment and the countdown restarts from there. Below lg the
 * sheet opens inline under its row, so autoplay stays off there. No autoplay under reduced motion.
 *
 * Another part of the page can select an assessment with the SELECT_ASSESSMENT window event, and a
 * `#assessment-<id>` hash selects one on load.
 */
export function AssessmentIndex({ assessments }: { assessments: Assessment[] }) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(assessments[0].id);
  const first = useRef(true);
  // Autoplay countdown: the tween that fills the line and, on completion, selects the next row
  const countdown = useRef<gsap.core.Tween | null>(null);
  const onScreen = useRef(false);

  const syncCountdown = () => {
    if (!countdown.current) return;
    if (onScreen.current) countdown.current.resume();
    else countdown.current.pause();
  };

  useEffect(() => () => void countdown.current?.kill(), []);

  useEffect(() => {
    const pick = (id: string) => {
      if (assessments.some((a) => a.id === id)) setActive(id);
    };
    const fromHash = () => pick(window.location.hash.replace(/^#assessment-/, ""));
    const fromEvent = (e: Event) => pick((e as CustomEvent<string>).detail);
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener(SELECT_ASSESSMENT, fromEvent);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener(SELECT_ASSESSMENT, fromEvent);
    };
  }, [assessments]);

  // Entrance: rows slide in from the left in turn, the highlight settles, the sheet rises
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const q = gsap.utils.selector(root);
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 78%", once: true } })
          .fromTo(
            q("[data-row]"),
            { opacity: 0, x: -36 },
            { opacity: 1, x: 0, duration: DUR.base, ease: EASE.out, stagger: STAGGER, clearProps: "transform" },
          )
          .fromTo(q("[data-highlight]"), { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: DUR.base, ease: EASE.out }, 0.3)
          .fromTo(
            q("[data-sheet-col]"),
            { opacity: 0, y: 48 },
            { opacity: 1, y: 0, duration: DUR.slow, ease: EASE.out, clearProps: "transform" },
            0.15,
          );

        // Autoplay only while the list is on screen
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 80%",
          end: "bottom 20%",
          onToggle: (self) => {
            onScreen.current = self.isActive;
            syncCountdown();
          },
        });
      });
    },
    { scope: root },
  );

  // The highlight glides to the selected row; the switch animates the sheet. The row's button is
  // measured, not the li, so an inline sheet opening below it (phones) doesn't stretch the highlight.
  useGSAP(
    () => {
      const el = root.current!;
      const highlight = el.querySelector<HTMLElement>("[data-highlight]")!;
      const list = el.querySelector<HTMLElement>("[data-list]")!;
      const motion = window.matchMedia(NO_REDUCE).matches;
      const place = (animate: boolean) => {
        const button = el.querySelector<HTMLElement>(`[data-row-button="${active}"]`);
        if (!button) return;
        gsap.to(highlight, {
          y: button.offsetTop,
          height: button.offsetHeight,
          duration: animate ? DUR.base * 0.75 : 0,
          ease: EASE.out,
          overwrite: "auto",
        });
      };
      place(motion && !first.current);

      // Keep it glued to the row as the layout changes (fonts, resizes, the inline sheet)
      const ro = new ResizeObserver(() => place(false));
      ro.observe(list);

      if (!first.current && motion) {
        const q = gsap.utils.selector(el);
        gsap.fromTo(
          q(`[data-row-button="${active}"] [data-q]`),
          { x: 10 },
          { x: 0, duration: DUR.base * 0.7, ease: EASE.out, clearProps: "transform" },
        );
        gsap.fromTo(
          q("[data-sheet] > *"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: DUR.base * 0.7, ease: EASE.out, stagger: 0.07, clearProps: "transform" },
        );
        gsap.fromTo(
          q("[data-deliverable]"),
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: DUR.base * 0.6, ease: EASE.out, stagger: 0.06, delay: 0.15, clearProps: "transform" },
        );
        gsap.fromTo(
          q("[data-tag]"),
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.5)", stagger: 0.04, delay: 0.25, clearProps: "transform" },
        );
      }
      first.current = false;

      // Restart the countdown for the newly selected row (hover never pauses it)
      countdown.current?.kill();
      countdown.current = null;
      const line = el.querySelector("[data-countdown]");
      gsap.set(line, { scaleX: 0 });
      if (motion && window.matchMedia(WIDE).matches) {
        countdown.current = gsap.to(line, {
          scaleX: 1,
          duration: INTERVAL,
          ease: "none",
          paused: true,
          onComplete: () =>
            setActive((cur) => assessments[(assessments.findIndex((a) => a.id === cur) + 1) % assessments.length].id),
        });
        syncCountdown();
      }

      return () => ro.disconnect();
    },
    { scope: root, dependencies: [active] },
  );

  const current = assessments.find((a) => a.id === active)!;
  const panelIds = `${uid}-sheet ${uid}-sheet-inline`;

  return (
    <div ref={root} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
      <div data-list="" className="relative isolate">
        {/* Raised highlight behind the selected row; GSAP sets its offset and height */}
        <div
          aria-hidden
          data-highlight=""
          data-anim=""
          className="absolute inset-x-0 top-0 -z-10 rounded-panel border border-line-strong bg-raised shadow-panel"
        >
          {/* Autoplay countdown (lg+) */}
          <span className="absolute inset-x-5 bottom-2 hidden h-0.5 overflow-hidden rounded-control bg-white/[0.07] lg:block">
            <span
              data-countdown=""
              className="block h-full origin-left rounded-control bg-tertiary"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
        </div>
        <ol data-anim-stagger="" className="flex flex-col gap-1.5">
          {assessments.map((a) => {
            const selected = a.id === active;
            return (
              <li key={a.id} data-row="" id={`assessment-${a.id}`} className="scroll-mt-28">
                <button
                  type="button"
                  data-row-button={a.id}
                  aria-expanded={selected}
                  aria-controls={panelIds}
                  onClick={() => setActive(a.id)}
                  className={cn(
                    "group relative flex w-full items-start gap-4 rounded-panel p-4 text-left transition-colors duration-300 sm:gap-5 sm:p-5",
                    !selected && "hover:bg-white/[0.03]",
                  )}
                >
                  <span
                    className={cn(
                      "pt-1 text-sm font-bold tabular-nums transition-colors duration-300",
                      selected ? "text-tertiary-soft" : "text-fg-subtle",
                    )}
                  >
                    {a.number}
                  </span>
                  <span data-q="" className="flex min-w-0 flex-1 flex-col gap-1">
                    <span
                      className={cn(
                        "type-h4 transition-colors duration-300 sm:type-h3",
                        selected ? "text-fg" : "text-fg-muted group-hover:text-fg",
                      )}
                    >
                      {a.question}
                    </span>
                    <span className="type-caption">{a.name}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 pt-1 text-sm font-semibold transition-colors duration-300",
                      selected ? "text-fg" : "text-fg-subtle",
                    )}
                  >
                    {a.minutes ? `${a.minutes} min` : "Deep"}
                  </span>
                </button>

                {/* Below lg the sheet opens under its question */}
                {selected && (
                  <div id={`${uid}-sheet-inline`} className="pb-2 pt-2 lg:hidden">
                    <Sheet a={a} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div id={`${uid}-sheet`} data-sheet-col="" data-anim="" className="hidden lg:sticky lg:top-28 lg:block">
        <Sheet a={current} />
      </div>
    </div>
  );
}

function Sheet({ a }: { a: Assessment }) {
  const onCta = (e: MouseEvent) => {
    if (!a.cta.href.startsWith("#")) return;
    e.preventDefault();
    scrollToId(a.cta.href.slice(1));
  };

  return (
    <div data-sheet="" className="flex flex-col gap-7 rounded-panel border border-line-strong bg-surface p-6 shadow-panel sm:p-8">
      <div className="flex flex-col gap-5">
        <h3 className="type-h3 text-fg">{a.name}</h3>
        <div className="flex items-center gap-5">
          <ClockDial minutes={a.minutes} />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="type-h4 text-fg">{a.minutes ? `${a.minutes} minutes` : "In depth"}</p>
            <p className="type-small">{a.format}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="type-h4 text-fg">What you get</h4>
        <ul className="flex flex-col gap-2.5">
          {a.deliverables.map((d) => (
            <li key={d} data-deliverable="" className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-tertiary/15 text-tertiary-soft">
                <Check weight="bold" aria-hidden className="size-3" />
              </span>
              <span className="type-body">{d}</span>
            </li>
          ))}
        </ul>
      </div>

      {a.tags.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="type-small font-semibold text-fg">{a.tagsTitle}</h4>
          <ul className="flex flex-wrap gap-2">
            {a.tags.map((t) => (
              <li
                key={t}
                data-tag=""
                className="rounded-control border border-line-strong bg-raised/60 px-3.5 py-1.5 text-sm font-semibold text-fg-muted"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Button href={a.cta.href} onClick={onCta} arrow>
          {a.cta.label}
        </Button>
      </div>
    </div>
  );
}

/** Trig results can differ in the last digits between the server and the browser, which breaks
 *  hydration. Two decimals is plenty for an 80-unit viewBox. */
const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Clock face whose arc fills to the assessment's length out of an hour. The regulatory-grade
 * assessment has no set length, so it shows a full, dashed ring. GSAP sweeps the arc in the first
 * time the dial is seen, then rolls it (and the minutes) between lengths as the selection changes.
 */
function ClockDial({ minutes }: { minutes: number | null }) {
  const root = useRef<HTMLSpanElement>(null);
  const seen = useRef(false);
  const fill = minutes ? Math.min(60, minutes) : 60;

  useGSAP(
    () => {
      const arc = root.current!.querySelector("[data-arc]");
      const to = { strokeDashoffset: 60 - fill };
      if (!window.matchMedia(NO_REDUCE).matches) {
        gsap.set(arc, to);
        return;
      }
      const sweep = () => {
        seen.current = true;
        gsap.to(arc, { ...to, duration: DUR.slow, ease: EASE.out, overwrite: true });
      };
      if (seen.current) sweep();
      else ScrollTrigger.create({ trigger: root.current, start: "top 90%", once: true, onEnter: sweep });
    },
    { scope: root, dependencies: [fill] },
  );

  return (
    <span ref={root} aria-hidden className="relative grid size-20 shrink-0 place-items-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 size-full -rotate-90">
        {/* Hour ticks */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={round(40 + Math.cos(a) * 36)}
              y1={round(40 + Math.sin(a) * 36)}
              x2={round(40 + Math.cos(a) * 39)}
              y2={round(40 + Math.sin(a) * 39)}
              stroke="var(--color-line-strong)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
        <circle cx="40" cy="40" r="29" fill="none" stroke="var(--color-line)" strokeWidth="6" />
        {/* Starts empty; GSAP owns the offset from here on */}
        <circle
          data-arc=""
          cx="40"
          cy="40"
          r="29"
          fill="none"
          stroke="var(--color-tertiary)"
          strokeWidth="6"
          strokeLinecap={minutes ? "round" : "butt"}
          pathLength={60}
          strokeDasharray={minutes ? "60" : "2.2 1.55"}
          strokeDashoffset={60}
        />
      </svg>
      <span className="relative flex flex-col items-center leading-none">
        {minutes ? (
          <>
            <LiveNumber value={minutes} className="font-display text-xl font-semibold tracking-[-0.03em] text-fg" />
            <span className="mt-0.5 text-[0.6875rem] font-semibold text-fg-subtle">min</span>
          </>
        ) : (
          <span className="font-display text-sm font-semibold text-fg">Deep</span>
        )}
      </span>
    </span>
  );
}
