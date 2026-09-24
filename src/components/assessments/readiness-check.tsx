"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowCounterClockwise, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { celebrate } from "@/components/motion/confetti";
import { LiveNumber } from "@/components/motion/live-number";
import { RadarChart } from "@/components/motion/radar-chart";
import { Button } from "@/components/ui/button";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToId } from "@/lib/lenis";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { answerScore, levelFor, SELECT_ASSESSMENT, type Level } from "@/lib/readiness";
import { cn } from "@/lib/utils";

type Dimension = {
  id: string;
  name: string;
  question: string;
  options: string[];
  focus: string;
  next: { label: string; href: string };
};

type ResultCopy = {
  fullCheck: string;
  primary: { label: string; href: string };
  gapAnalysis: string;
};

const ADVANCE_MS = 520; // pause after a pick so the choice registers before moving on
const NUDGE_AFTER = 3; // seconds without an answer before the options start inviting a pick

/**
 * The quick Governance Readiness™ check (docs/content/04 §3). One question per score dimension, each
 * answer describing one of the five maturity levels. The readout beside it (the score, the level and
 * a radar across the six dimensions) redraws on every answer, and the last step turns the card into
 * a result: where you sit on the 0 to 100 ruler, what the next level asks of you, and the two weakest
 * dimensions with where to go next.
 *
 * Input: there is no Next button. Picking an answer (click, tap, or keys 1 to 5) moves on by itself,
 * also when you pick again on a question you went back to.
 * Arrow keys move between answers without moving on (native radios); Enter then moves on. Back steps
 * back, and the progress segments jump to any answered question. Confetti fires only once, when all
 * six are answered and the result comes in; individual picks have none.
 * If a question sits unanswered, a soft highlight runs down the answers every few seconds to invite
 * a pick.
 */
export function ReadinessCheck({
  levels,
  dimensions,
  result,
}: {
  levels: Level[];
  dimensions: Dimension[];
  result: ResultCopy;
}) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const n = dimensions.length;
  const [answers, setAnswers] = useState<(number | null)[]>(() => dimensions.map(() => null));
  const [step, setStep] = useState(0); // 0..n-1 questions, n = result
  const direction = useRef(1);
  const timer = useRef<number | undefined>(undefined);
  const first = useRef(true);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const scores = answers.map((a) => (a === null ? null : answerScore(levels, a)));
  const answered = scores.filter((s): s is number => s !== null);
  const score = answered.length ? Math.round(answered.reduce((t, s) => t + s, 0) / answered.length) : 0;
  const level = levelFor(levels, score);
  const done = step === n;
  const firstOpen = answers.indexOf(null);

  const go = (to: number) => {
    window.clearTimeout(timer.current);
    direction.current = to >= step ? 1 : -1;
    setStep(Math.max(0, Math.min(n, to)));
  };

  /** Record an answer without moving on (arrow keys between radios) */
  const select = (i: number, option: number) => setAnswers((cur) => cur.map((a, j) => (j === i ? option : a)));

  /** A deliberate pick: record it and move on after a beat */
  const pick = (i: number, option: number) => {
    select(i, option);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => go(i + 1), ADVANCE_MS);
  };

  const reset = () => {
    setAnswers(dimensions.map(() => null));
    go(0);
  };

  // Entrance on first view: the card and the readout rise in turn, then the answers cascade in
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const q = gsap.utils.selector(root);
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 78%", once: true } })
          .fromTo(
            q("[data-panel]"),
            { opacity: 0, y: 48 },
            { opacity: 1, y: 0, duration: DUR.slow, ease: EASE.out, stagger: 0.16, clearProps: "transform" },
          )
          .fromTo(
            q("[data-option]"),
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: DUR.base * 0.7, ease: EASE.out, stagger: 0.06, clearProps: "transform" },
            "-=0.8",
          );
      });
    },
    { scope: root },
  );

  // Progress: each segment fills when its question is answered or open, and drains on a restart
  const progressKey = `${answers.map((a) => (a === null ? "-" : a)).join("")}|${step}`;
  useGSAP(
    () => {
      const motion = window.matchMedia(NO_REDUCE).matches;
      root.current!.querySelectorAll("[data-seg]").forEach((seg, i) => {
        gsap.to(seg, {
          scaleX: answers[i] !== null || i === step ? 1 : 0,
          duration: motion ? DUR.base * 0.8 : 0,
          ease: EASE.out,
          overwrite: true,
        });
      });
    },
    { scope: root, dependencies: [progressKey] },
  );

  // Stage change: slide the new content in from the side you are heading, cascade the answers, and
  // move focus to it
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const stage = root.current!.querySelector<HTMLElement>("[data-stage]");
      stage?.focus({ preventScroll: true });
      if (step === n && direction.current > 0) celebrate();
      if (!window.matchMedia(NO_REDUCE).matches || !stage) return;
      gsap.fromTo(
        stage.children,
        { opacity: 0, x: 32 * direction.current },
        { opacity: 1, x: 0, duration: DUR.base * 0.6, ease: EASE.out, stagger: 0.05, clearProps: "transform" },
      );
      gsap.fromTo(
        stage.querySelectorAll("[data-option]"),
        { opacity: 0, x: 20 * direction.current },
        { opacity: 1, x: 0, duration: DUR.base * 0.6, ease: EASE.out, stagger: 0.05, delay: 0.08, clearProps: "transform" },
      );
    },
    { scope: root, dependencies: [step] },
  );

  // Readout: the level line flips in whenever the level changes
  const levelKey = answered.length ? level.level : 0;
  const firstLevel = useRef(true);
  useGSAP(
    () => {
      if (firstLevel.current) {
        firstLevel.current = false;
        return;
      }
      if (!window.matchMedia(NO_REDUCE).matches) return;
      gsap.fromTo(
        root.current!.querySelectorAll("[data-levelline] > *"),
        { opacity: 0, y: 12, rotateX: -60 },
        { opacity: 1, y: 0, rotateX: 0, duration: DUR.base * 0.7, ease: EASE.out, stagger: 0.06, clearProps: "transform" },
      );
    },
    { scope: root, dependencies: [levelKey] },
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (done || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = Number(e.key);
    if (Number.isInteger(k) && k >= 1 && k <= dimensions[step].options.length) {
      e.preventDefault();
      pick(step, k - 1);
      return;
    }
    // Enter moves on from an answer chosen with the arrow keys
    if (e.key === "Enter" && answers[step] !== null && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
      pick(step, answers[step]!);
    }
  };

  // Links to the assessment suite on this page select that assessment; others navigate
  const follow = (e: MouseEvent, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const id = href.slice(1);
    window.dispatchEvent(new CustomEvent(SELECT_ASSESSMENT, { detail: id.replace(/^assessment-/, "") }));
    scrollToId(id);
  };

  const rings = [...levels.slice(1).map((l) => l.min), 100];
  const weakest = done
    ? dimensions
        .map((d, i) => ({ d, s: scores[i] ?? 0, i }))
        .sort((a, b) => a.s - b.s || a.i - b.i)
        .slice(0, 2)
    : [];
  const nextLevel = levels[level.level] as Level | undefined;

  return (
    <div
      ref={root}
      data-anim-stagger=""
      className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8"
    >
      {/* Question card, then the result */}
      <div
        data-panel=""
        className="rounded-panel border border-line-strong bg-surface p-5 shadow-panel sm:p-8"
        onKeyDown={onKeyDown}
      >
        {/* Progress: one segment per dimension; each is a button back to its question */}
        <div className="flex items-center justify-between gap-4">
          <p className="type-small font-semibold text-fg">
            {done ? "Your result" : `${dimensions[step].name}, question ${step + 1} of ${n}`}
          </p>
          {/* Phones: the readout sits below the card, so keep the running score in view here */}
          <p className={cn("type-small font-semibold lg:hidden", answered.length ? "text-fg" : "text-fg-subtle")}>
            {answered.length ? `Score ${score}, ${level.name}` : "No answers yet"}
          </p>
        </div>
        <ol className="mt-3 flex gap-1.5" aria-label="Questions">
          {dimensions.map((d, i) => {
            // Any answered question, plus the first one still open
            const reachable = answers[i] !== null || i === firstOpen || i === step;
            return (
              <li key={d.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(i)}
                  disabled={!reachable}
                  aria-label={`Question ${i + 1}: ${d.name}${answers[i] !== null ? ", answered" : ""}`}
                  aria-current={i === step ? "step" : undefined}
                  className="group flex h-6 w-full items-center disabled:cursor-default"
                >
                  <span className="relative h-1.5 w-full overflow-hidden rounded-control bg-white/[0.09]">
                    <span
                      data-seg=""
                      className={cn(
                        "absolute inset-0 origin-left rounded-control transition-colors duration-300",
                        i === step ? "bg-fg" : "bg-tertiary group-hover:bg-tertiary-soft",
                      )}
                      style={{ transform: "scaleX(0)" }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div data-stage="" tabIndex={-1} className="mt-6 flex flex-col outline-none sm:mt-8">
          {!done ? (
            <Question
              key={step}
              uid={uid}
              dimension={dimensions[step]}
              value={answers[step]}
              onSelect={(option) => select(step, option)}
              onPick={(option) => pick(step, option)}
            />
          ) : (
            <Result
              levels={levels}
              score={score}
              level={level}
              nextLevel={nextLevel}
              weakest={weakest}
              copy={result}
              follow={follow}
            />
          )}

          {/* Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            {!done ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => go(step - 1)}
                  disabled={step === 0}
                  className={cn("-ml-3", step === 0 && "invisible")}
                >
                  <ArrowLeft weight="bold" aria-hidden className="size-4" />
                  Back
                </Button>
                <span className="type-caption">
                  Pick an answer to continue
                  <span className="hidden [@media(pointer:fine)]:inline">, or press 1 to 5</span>
                </span>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={reset} className="-ml-3">
                  <ArrowCounterClockwise weight="bold" aria-hidden className="size-4" />
                  Start again
                </Button>
                <Button href={result.primary.href} arrow>
                  {result.primary.label}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live readout */}
      <aside
        data-panel=""
        aria-label="Your readiness score"
        className="flex flex-col rounded-panel border border-line bg-surface/60 p-5 shadow-panel sm:p-8 lg:sticky lg:top-28"
      >
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="flex flex-col gap-1">
            <p className="type-small font-semibold text-fg">Governance Readiness™</p>
            <p className="flex items-baseline gap-1.5">
              <LiveNumber
                value={score}
                className={cn(
                  "type-display leading-none transition-colors duration-300",
                  answered.length ? "text-fg" : "text-fg-subtle/60",
                )}
              />
              <span className="type-body font-semibold text-fg-subtle">/ 100</span>
            </p>
          </div>
          <div data-levelline="" className="flex flex-col items-start gap-1 [perspective:400px] sm:items-end">
            {answered.length ? (
              <>
                <p className="type-h4 text-fg">
                  Level {level.level}, {level.name}
                </p>
                <p className="type-caption">
                  {answered.length === n ? "Across all six dimensions" : `From ${answered.length} of ${n} answers`}
                </p>
              </>
            ) : (
              <p className="type-caption sm:text-right">Your score builds as you answer.</p>
            )}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {answered.length ? `Score ${score} out of 100, level ${level.level}, ${level.name}.` : ""}
        </p>

        <RadarChart
          label={`Readiness by dimension: ${dimensions
            .map((d, i) => `${d.name} ${scores[i] ?? "not answered"}`)
            .join(", ")}`}
          axes={dimensions.map((d, i) => ({ label: d.name, value: scores[i] }))}
          rings={rings}
          active={done ? undefined : step}
          className="mx-auto mt-4 max-w-[30rem]"
        />
        <p className="type-caption text-center">Rings mark where each maturity level begins.</p>
      </aside>
    </div>
  );
}

/** Mini staircase: `level` of five bars lit, the same shape as the maturity ladder */
function Stairs({ level, className }: { level: number; className?: string }) {
  return (
    <span aria-hidden className={cn("flex h-5 items-end gap-[2px]", className)}>
      {[1, 2, 3, 4, 5].map((b) => (
        <span
          key={b}
          data-stair=""
          className={cn(
            "w-[3px] origin-bottom rounded-[1px] transition-colors duration-300",
            b <= level ? "bg-current" : "bg-white/15",
          )}
          style={{ height: `${20 + b * 16}%` }}
        />
      ))}
    </span>
  );
}

function Question({
  uid,
  dimension,
  value,
  onSelect,
  onPick,
}: {
  uid: string;
  dimension: Dimension;
  value: number | null;
  /** Arrow keys between radios: record only */
  onSelect: (option: number) => void;
  /** Click or tap: record and move on */
  onPick: (option: number) => void;
}) {
  const name = `${uid}-${dimension.id}`;
  const root = useRef<HTMLFieldSetElement>(null);
  const firstPick = useRef(true);

  // Invite a pick: while the question is unanswered and on screen, a highlight runs down the answers
  // every few seconds. It stops for good once the pointer enters the answers or one is picked.
  useGSAP(
    () => {
      if (value !== null || !window.matchMedia(NO_REDUCE).matches) return;
      const el = root.current!;
      const glows = el.querySelectorAll("[data-glow]");
      const chips = el.querySelectorAll("[data-chip]");
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.4, delay: NUDGE_AFTER });
      tl.to(glows, { opacity: 1, duration: 0.35, ease: "power2.out", stagger: 0.12 })
        .to(chips, { scale: 1.14, duration: 0.2, ease: "power2.out", stagger: 0.12, yoyo: true, repeat: 1 }, 0)
        .to(glows, { opacity: 0, duration: 0.5, ease: "power2.in", stagger: 0.12 }, 0.35);
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        end: "bottom 15%",
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
      if (st.isActive) tl.play();
      const stop = () => {
        tl.kill();
        st.kill();
        gsap.to(glows, { opacity: 0, duration: 0.2 });
        gsap.set(chips, { scale: 1 });
      };
      el.addEventListener("pointerenter", stop, { once: true });
      return () => el.removeEventListener("pointerenter", stop);
    },
    { scope: root, dependencies: [value], revertOnUpdate: true },
  );

  // A pick pops its number and grows its staircase bar by bar
  useGSAP(
    () => {
      if (firstPick.current) {
        firstPick.current = false;
        return;
      }
      if (value === null || !window.matchMedia(NO_REDUCE).matches) return;
      const option = root.current!.querySelector(`[data-option="${value}"]`);
      if (!option) return;
      gsap.fromTo(option.querySelector("[data-chip]"), { scale: 0.55 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
      gsap.fromTo(
        option.querySelectorAll("[data-stair]"),
        { scaleY: 0 },
        { scaleY: 1, duration: 0.45, ease: EASE.out, stagger: 0.05 },
      );
      gsap.fromTo(option, { scale: 0.985 }, { scale: 1, duration: 0.4, ease: "back.out(2)", clearProps: "transform" });
    },
    { scope: root, dependencies: [value] },
  );

  return (
    <fieldset ref={root} className="min-w-0">
      <legend className="type-h3 w-full text-fg">{dimension.question}</legend>
      <div className="mt-5 flex flex-col gap-2.5">
        {dimension.options.map((option, i) => {
          const id = `${name}-${i}`;
          const checked = value === i;
          return (
            <label
              key={option}
              data-option={i}
              htmlFor={id}
              onClick={(e) => {
                // A label click also clicks its radio, which bubbles back here; count it once. Keyboard
                // selection clicks the radio directly, so it lands only in onChange.
                if ((e.target as HTMLElement).tagName === "INPUT") return;
                onPick(i);
              }}
              className={cn(
                "group relative flex min-h-14 cursor-pointer items-center gap-4 rounded-field border px-4 py-3 transition-[background-color,border-color] duration-200",
                checked
                  ? "border-accent bg-accent/[0.07]"
                  : "border-line-strong bg-raised/40 hover:border-white/25 hover:bg-raised/80",
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                checked={checked}
                onChange={() => onSelect(i)}
                className="peer sr-only"
              />
              {/* Nudge highlight, raised by the invite-a-pick timeline */}
              <span
                aria-hidden
                data-glow=""
                className="pointer-events-none absolute -inset-px rounded-field border border-tertiary bg-tertiary/[0.08] opacity-0"
              />
              <span
                data-chip=""
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold tabular-nums transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60",
                  checked ? "border-accent bg-accent text-accent-ink" : "border-line-strong text-fg-subtle group-hover:text-fg",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("type-body flex-1", checked && "text-fg")}>{option}</span>
              <Stairs level={i + 1} className={cn("shrink-0", checked ? "text-tertiary-soft" : "text-tertiary/60")} />
              <span className="sr-only">(maturity level {i + 1})</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Result({
  levels,
  score,
  level,
  nextLevel,
  weakest,
  copy,
  follow,
}: {
  levels: Level[];
  score: number;
  level: Level;
  nextLevel: Level | undefined;
  weakest: { d: Dimension; s: number }[];
  copy: ResultCopy;
  follow: (e: MouseEvent, href: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);

  // The bar gives each level an equal share. The score sits in its level's share as far as it is
  // into that level's band: 82 is 80% through Measurable (70 to 84). The fill and the pin both stop
  // there.
  const reached = levels.indexOf(level);
  const within = (score - level.min) / (level.max - level.min + 1);
  const position = ((reached + within) / levels.length) * 100;

  // Staged reveal: the headline, then the green fill runs to the score with the score pin riding
  // its tip, then the next level and the focus cards rise in
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (!window.matchMedia(NO_REDUCE).matches) {
        gsap.set(q("[data-rfill]"), { scaleX: 1 });
        return;
      }
      const travel = 0.35 + (position / 100) * 1.3;
      const pin = q("[data-marker]")[0];
      gsap
        .timeline({ delay: 0.1 })
        .fromTo(
          q("[data-part]"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: DUR.base, ease: EASE.out, stagger: 0.12, clearProps: "transform" },
        )
        .fromTo(q("[data-rfill]"), { scaleX: 0 }, { scaleX: 1, duration: travel, ease: "power2.inOut" }, 0.3)
        .fromTo(pin, { x: -pin.offsetLeft, opacity: 0 }, { x: 0, opacity: 1, duration: travel, ease: "power2.inOut" }, 0.3)
        .fromTo(q("[data-marker-tag]"), { scale: 0.6 }, { scale: 1, duration: 0.45, ease: "back.out(3)" }, 0.3 + travel - 0.1)
        .fromTo(
          q("[data-focus]"),
          { opacity: 0, y: 24, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: DUR.base, ease: EASE.out, stagger: 0.12, clearProps: "transform" },
          "-=0.6",
        );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col gap-8">
      <div data-part="" className="flex flex-col gap-2">
        <h3 className="type-h3 text-fg">
          You are at Level {level.level}, <span className="text-tertiary-soft">{level.name}</span>
        </h3>
        <p className="type-body">
          {level.summary} {level.traits}
        </p>
      </div>

      {/* Where the score sits: one bar in five equal level shares, a green fill running to the score
          (a score colour, status-ok), thin divider lines between the shares, the score pin at the
          end of the fill, and each level's name centred under its share */}
      <div data-part="" className="flex flex-col gap-2 pt-8" aria-hidden>
        <div className="relative">
          <div className="relative h-2 rounded-control bg-white/[0.09]">
            <span
              data-rfill=""
              className="absolute inset-y-0 left-0 origin-left rounded-control bg-status-ok"
              style={{ width: `${position}%` }}
            />
            {levels.slice(1).map((l, i) => (
              <span
                key={l.level}
                className="absolute -inset-y-1.5 w-0.5 -translate-x-1/2 rounded-control bg-fg/80"
                style={{ left: `${((i + 1) / levels.length) * 100}%` }}
              />
            ))}
          </div>
          {/* Zero-width anchor at the score; its children centre on it by overflowing evenly, so no
              CSS translate is needed (GSAP clears translate when it moves the pin) */}
          <span data-marker="" className="absolute bottom-0 flex w-0 flex-col items-center" style={{ left: `${position}%` }}>
            <span
              data-marker-tag=""
              className="mb-1.5 rounded-control bg-fg px-2 py-0.5 text-xs font-bold tabular-nums text-canvas"
            >
              {score}
            </span>
            <span className="h-4 w-0.5 shrink-0 rounded-control bg-fg" />
          </span>
        </div>
        <div className="grid grid-cols-5 text-xs font-semibold text-fg">
          {levels.map((l) => (
            <span key={l.level} className="min-w-0 truncate text-center">
              <span className="sm:hidden">{l.level}</span>
              <span className="hidden sm:inline">{l.name}</span>
            </span>
          ))}
        </div>
      </div>

      {nextLevel && (
        <div data-part="" className="flex flex-col gap-1.5">
          <h4 className="type-h4 text-fg">
            To reach Level {nextLevel.level}, {nextLevel.name}
          </h4>
          <p className="type-body">{nextLevel.traits}</p>
        </div>
      )}

      <div data-part="" className="flex flex-col gap-3">
        <h4 className="type-h4 text-fg">Where to focus first</h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          {weakest.map(({ d, s }) => (
            <li key={d.id} data-focus="" className="flex flex-col gap-2 rounded-field border border-line bg-raised/50 p-4">
              <p className="flex items-baseline justify-between gap-3">
                <span className="type-small font-bold text-fg">{d.name}</span>
                <span className="type-small font-bold tabular-nums text-fg-subtle">{s}</span>
              </p>
              <p className="type-small">{d.focus}</p>
              {/* White and bold like the headings; the arrow flows with the text so it stays beside
                  the last word when the label wraps */}
              <Link
                href={d.next.href}
                onClick={(e) => follow(e, d.next.href)}
                className="group mt-auto self-start pt-1 text-sm font-bold text-fg transition-colors duration-200 hover:text-fg-muted"
              >
                {d.next.label}
                <ArrowRight
                  weight="bold"
                  aria-hidden
                  className="ml-1.5 inline size-3.5 align-[-0.15em] transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p data-part="" className="type-small">
        {copy.fullCheck} {copy.gapAnalysis}
      </p>
    </div>
  );
}
