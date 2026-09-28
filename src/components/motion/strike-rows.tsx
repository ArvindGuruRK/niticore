"use client";

import { useRef } from "react";
import { Check } from "@phosphor-icons/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";

type Row = { before: string; after: string };

/**
 * Before and after, scrubbed to scroll: as each row crosses the screen, the old way is struck through
 * (a line drawn across every line of its text) and dims, while the new way rises in with a violet
 * tick. Rows are separated by hairlines, not boxed. Without motion (or JavaScript) every row shows its
 * finished state. The column labels are read out with each cell for screen readers.
 */
export function StrikeRows({ rows, beforeLabel, afterLabel }: { rows: Row[]; beforeLabel: string; afterLabel: string }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.utils.toArray<HTMLElement>("[data-strike-row]", root.current).forEach((row) => {
          const q = gsap.utils.selector(row);
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: row, start: "top 82%", end: "top 48%", scrub: 0.5 },
            })
            .fromTo(q("[data-before]"), { backgroundSize: "0% 2px", opacity: 1 }, { backgroundSize: "100% 2px", opacity: 0.5 }, 0)
            .fromTo(q("[data-after]"), { opacity: 0.12, y: 18 }, { opacity: 1, y: 0 }, 0.25)
            .fromTo(q("[data-tick]"), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, ease: "back.out(2)" }, 0.45);
        });
      });
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="flex flex-col">
      <li aria-hidden className="hidden grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 pb-5 sm:grid">
        <span className="type-h4 text-fg-subtle">{beforeLabel}</span>
        <span className="type-h4 text-fg">{afterLabel}</span>
      </li>
      {rows.map((row) => (
        <li
          key={row.before}
          data-strike-row=""
          className="grid grid-cols-1 items-baseline gap-x-8 gap-y-3 border-t border-line py-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:py-7"
        >
          <p className="type-body text-fg-muted">
            <span className="sr-only">{beforeLabel}: </span>
            {/* The strike is a background line on the inline text, so it crosses every wrapped line */}
            <span
              data-before=""
              className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_2px] bg-[position:0_55%] bg-no-repeat [box-decoration-break:clone]"
            >
              {row.before}
            </span>
          </p>
          <p data-after="" className="type-h3 flex items-start gap-3 text-fg">
            <span data-tick="" aria-hidden className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-tertiary/15 text-tertiary">
              <Check weight="bold" className="size-3.5" />
            </span>
            <span>
              <span className="sr-only">{afterLabel}: </span>
              {row.after}
            </span>
          </p>
        </li>
      ))}
    </ol>
  );
}
