"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** One clock for every Countdown on the page: whole seconds, so the snapshot only changes once a second. */
const subscribe = (tick: () => void) => {
  const id = window.setInterval(tick, 1000);
  return () => window.clearInterval(id);
};
const now = () => Math.floor(Date.now() / 1000);
// The server can't know the viewer's clock, so it renders the placeholder and the client fills in.
const serverNow = () => null;

const UNITS = [
  { label: "Days", seconds: 86400, mod: Infinity },
  { label: "Hours", seconds: 3600, mod: 24 },
  { label: "Minutes", seconds: 60, mod: 60 },
  { label: "Seconds", seconds: 1, mod: 60 },
] as const;

/**
 * Live countdown to `start`. Each unit is a tile, and a digit rolls down into place when its value
 * changes. Between `start` and `end` it shows `live`, after `end` it shows `after`. Dates are ISO
 * strings with an offset, so the count is right in every time zone. Reduced motion swaps the roll
 * for a plain change. Screen readers get the target date as text rather than a ticking number.
 */
export function Countdown({
  start,
  end,
  label,
  live,
  after,
  dateLabel,
  className,
}: {
  start: string;
  end: string;
  /** Shown above the tiles while counting, e.g. "Doors open in" */
  label: string;
  live: string;
  after: string;
  /** Human-readable date for assistive tech, e.g. "6 October 2026, 11:00 Abu Dhabi time" */
  dateLabel: string;
  className?: string;
}) {
  const t = useSyncExternalStore(subscribe, now, serverNow);
  const from = Date.parse(start) / 1000;
  const to = Date.parse(end) / 1000;

  if (t !== null && t >= to) return <p className={cn("type-lead text-fg", className)}>{after}</p>;
  if (t !== null && t >= from) return <p className={cn("type-lead text-fg", className)}>{live}</p>;

  const left = t === null ? null : from - t;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <p className="type-body font-semibold text-fg-muted">
        {label}
        <span className="sr-only"> {dateLabel}</span>
      </p>
      <div aria-hidden className="grid grid-cols-4 gap-2 sm:gap-3">
        {UNITS.map((u) => (
          <Tile
            key={u.label}
            label={u.label}
            value={left === null ? null : Math.floor(left / u.seconds) % u.mod}
          />
        ))}
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number | null }) {
  const digits = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (value === null) return;
    // The first real value arrives straight after hydration; only later changes roll.
    if (first.current) {
      first.current = false;
      return;
    }
    if (!window.matchMedia(NO_REDUCE).matches) return;
    const tween = gsap.fromTo(
      digits.current,
      { yPercent: -70, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: DUR.fast, ease: EASE.out },
    );
    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <div className="flex min-w-[4.25rem] flex-col items-center gap-1 rounded-panel border border-line-strong bg-surface px-3 py-3 shadow-panel sm:min-w-24 sm:px-5 sm:py-4">
      <span className="overflow-hidden">
        <span ref={digits} className="type-h2 block text-fg tabular-nums">
          {value === null ? "--" : String(value).padStart(2, "0")}
        </span>
      </span>
      <span className="type-caption">{label}</span>
    </div>
  );
}
