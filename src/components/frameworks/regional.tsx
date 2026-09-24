import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

type Milestone = { date: string; label: string; state: string };
type Jurisdiction = {
  code: string;
  name: string;
  law: string;
  tone: string;
  capabilities: string[];
};

/** In force = green (the obligation is live and met); upcoming = amber (a deadline to prepare for). */
const DOT: Record<string, string> = { active: "bg-status-ok", upcoming: "bg-status-warn" };

/**
 * docs/content/03 §3, the regional moat: an enforcement timeline (what is live, what is next), then
 * one card per jurisdiction in the shared card tones. Enforcement status lives only in the timeline,
 * not repeated on the cards.
 */
export function Regional({ milestones, jurisdictions }: { milestones: Milestone[]; jurisdictions: Jurisdiction[] }) {
  return (
    <div className="flex flex-col gap-12">
      {/* Enforcement timeline: a line through three dated points */}
      <Reveal stagger className="relative grid grid-cols-3 gap-4">
        <span aria-hidden className="absolute left-[16.6%] right-[16.6%] top-[0.4375rem] h-0.5 rounded-control bg-line-strong" />
        {milestones.map((m) => (
          <div key={m.label} className="relative flex flex-col items-center gap-3 text-center">
            <span
              aria-hidden
              className={cn("size-4 rounded-full ring-4 ring-canvas", DOT[m.state])}
            />
            <p className="type-h3 text-fg">{m.date}</p>
            <p className="type-small">{m.label}</p>
          </div>
        ))}
      </Reveal>

      {/* On lg the three cards share row tracks (CSS subgrid): the name block, the law block and the
          list start at the same height in every card, even when one card's text wraps longer. */}
      <Reveal stagger className="grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_auto_1fr]">
        {jurisdictions.map((j) => {
          const tone = CARD_TONES[j.tone as CardTone];
          return (
            <SpotlightCard
              key={j.code}
              light={tone.light}
              solid
              className={cn(
                "flex h-full flex-col gap-6 border-white/10 p-6 sm:p-8 lg:row-span-3 lg:grid lg:grid-rows-subgrid",
                tone.className,
              )}
            >
              <div className="flex flex-col gap-1">
                {/* Pull the display letters back by their side bearing so they line up with the text below */}
                <h3 className="type-display -ms-[0.06em] text-fg">{j.code}</h3>
                <p className="type-body text-fg/80">{j.name}</p>
              </div>
              <p className="type-h4 text-fg">{j.law}</p>
              <ul className="flex flex-col gap-3 self-start">
                {j.capabilities.map((c) => (
                  <li key={c} className="type-body flex gap-3 text-fg/85">
                    <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-fg/70" />
                    {c}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          );
        })}
      </Reveal>
    </div>
  );
}
