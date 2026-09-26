import { HorizontalScroll } from "@/components/motion/horizontal-scroll";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

type Area = { name: string; title: string; body: string; points: string[]; tone: string };

/**
 * docs/content/05 §2: the four advisory practice areas, in order, as a pinned sideways track on lg
 * (scrolling down glides the cards across, with a green progress hairline). Only the cards pin, and
 * they are kept compact (h3 titles, tight spacing) so the pinned block fits a laptop screen below the
 * nav. Below lg it is a native swipeable row.
 */
export function PracticeTrack({ areas }: { areas: Area[] }) {
  return (
    <HorizontalScroll>
      {areas.map((a, i) => (
        <article
          key={a.name}
          className={cn(
            "flex w-[85vw] shrink-0 flex-col gap-4 rounded-panel border border-white/10 p-card shadow-panel sm:w-[24rem] sm:p-7 lg:w-[27rem]",
            CARD_TONES[a.tone as CardTone].className,
          )}
        >
          <div className="flex items-baseline justify-between gap-4">
            <p className="type-h4 text-fg">{a.name}</p>
            <span className="type-h3 tabular-nums text-fg/60">{String(i + 1).padStart(2, "0")}</span>
          </div>
          <h3 className="type-h3 text-fg">{a.title}</h3>
          <p className="type-body text-fg/85">{a.body}</p>
          <ul className="mt-auto flex flex-col gap-2.5 pt-2">
            {a.points.map((p) => (
              <li key={p} className="type-small flex gap-3 text-fg">
                <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-fg/70" />
                {p}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </HorizontalScroll>
  );
}
