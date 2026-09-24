"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Level = "info" | "ok" | "allow" | "warn" | "block" | "escalate";

type LogLine = {
  /** Optional clock time in the gutter, e.g. "14:02:11" */
  time?: string;
  level: Level;
  text: string;
};

/** Fixed-width level column, like a real CLI log. Status colours mark the verdicts, which is what they are for. */
const LEVEL: Record<Level, { label: string; className: string }> = {
  info: { label: "INFO", className: "text-fg-subtle" },
  ok: { label: "OK", className: "text-status-ok" },
  allow: { label: "ALLOW", className: "text-status-ok" },
  warn: { label: "WARN", className: "text-status-warn" },
  block: { label: "BLOCK", className: "text-status-risk" },
  escalate: { label: "ESCAL", className: "text-status-warn" },
};

function Prompt({ cwd }: { cwd: string }) {
  return (
    <>
      <span className="text-tertiary">{cwd}</span> <span className="text-accent">❯</span>{" "}
    </>
  );
}

/**
 * A macOS terminal window running a command. The command types itself at the prompt, the log prints
 * line by line (instantly, the way a real terminal writes, not faded), a fresh prompt returns with a
 * blinking block cursor, then the screen clears and the run starts again. Loops only while on screen.
 * JetBrains Mono with ligatures off, so code reads exactly as typed. Reduced motion: the finished
 * screen, still, with no blink.
 */
export function LogStream({
  title,
  cwd = "~/agents",
  command,
  lines,
  step = 0.55,
  className,
}: {
  /** Window title, centred in the title bar like macOS Terminal */
  title: string;
  cwd?: string;
  command: string;
  lines: LogLine[];
  /** Seconds between log lines */
  step?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const q = gsap.utils.selector(root);
        const typed = q("[data-typed]")[0];
        const rows = q("[data-line]");
        const typingCaret = q("[data-caret='typing']");
        const endPrompt = q("[data-end]");
        // The command is real text that grows one character at a time, so the caret after it
        // moves with it. (Hiding pre-rendered letters would keep their width and strand the caret.)
        const typing = { chars: 0 };
        const render = () => {
          typed.textContent = command.slice(0, Math.round(typing.chars));
        };
        const hide = () => {
          typing.chars = 0;
          render();
          gsap.set([...rows, ...endPrompt], { autoAlpha: 0 });
          gsap.set(typingCaret, { autoAlpha: 1 });
        };
        hide();

        const tl = gsap.timeline({
          repeat: -1,
          paused: true,
          scrollTrigger: { trigger: root.current, start: "top 80%", end: "bottom top", toggleActions: "play pause resume pause" },
        });
        // Caret blinks at the empty prompt, holds solid while keys are pressed, then Enter
        const blink = (on: boolean) => typingCaret.forEach((c) => c.classList.toggle("motion-safe:animate-blink", on));
        tl.call(blink, [false], 0.9)
          .to(typing, { chars: command.length, duration: command.length * 0.045, ease: "none", onUpdate: render }, 0.9)
          .call(blink, [true])
          .set(typingCaret, { autoAlpha: 0 }, "+=0.4")
          // Output lands a beat after Enter, then each line at a slightly uneven cadence
          .to(rows, { autoAlpha: 1, duration: 0, stagger: { each: step, ease: "power1.in" } }, "+=0.25")
          .set(endPrompt, { autoAlpha: 1 }, `+=${step}`)
          .call(hide, [], "+=3.2")
          .to({}, { duration: 0.45 });
      });
    },
    { scope: root, dependencies: [command, step] },
  );

  return (
    <div
      ref={root}
      className={cn(
        "overflow-hidden rounded-field border border-line-strong bg-canvas font-mono shadow-panel [font-variant-ligatures:none]",
        className,
      )}
    >
      {/* Title bar: traffic lights left, title centred */}
      <div className="relative flex h-10 items-center bg-surface px-4">
        <span aria-hidden className="flex gap-2">
          <span className="size-3 rounded-full bg-window-close" />
          <span className="size-3 rounded-full bg-window-minimize" />
          <span className="size-3 rounded-full bg-window-zoom" />
        </span>
        <p className="pointer-events-none absolute inset-x-20 truncate text-center font-sans text-[0.8125rem] font-semibold text-fg-subtle">
          {title}
        </p>
      </div>

      <div className="overflow-x-auto p-4 text-[0.8125rem] leading-[1.75] sm:p-6 sm:text-[0.9375rem] xl:text-base">
        <div className="min-w-max">
          <p className="text-fg">
            <Prompt cwd={cwd} />
            <span className="sr-only">{command}</span>
            <span data-typed="" aria-hidden>
              {command}
            </span>
            <span
              data-caret="typing"
              aria-hidden
              className="invisible inline-block h-[1.15em] w-[0.6em] translate-y-[0.2em] bg-fg motion-safe:animate-blink"
            />
          </p>

          <ol className="mt-1">
            {lines.map((line, i) => {
              const level = LEVEL[line.level];
              return (
                <li key={i} data-line="" className="whitespace-pre">
                  {line.time && (
                    <>
                      <span className="text-fg-subtle/70">{line.time}</span>
                      {"  "}
                    </>
                  )}
                  <span className={cn("inline-block w-[6ch] font-bold", level.className)}>{level.label}</span>
                  {" "}
                  <span className="text-fg-muted">{line.text}</span>
                </li>
              );
            })}
          </ol>

          <p data-end="" className="text-fg">
            <Prompt cwd={cwd} />
            <span
              aria-hidden
              className="inline-block h-[1.15em] w-[0.6em] translate-y-[0.2em] bg-fg motion-safe:animate-blink"
            />
          </p>
        </div>
      </div>
    </div>
  );
}
