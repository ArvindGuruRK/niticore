import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";
import { Bank } from "@phosphor-icons/react/dist/ssr/Bank";
import { Buildings } from "@phosphor-icons/react/dist/ssr/Buildings";
import { Cpu } from "@phosphor-icons/react/dist/ssr/Cpu";
import { GlobeHemisphereEast } from "@phosphor-icons/react/dist/ssr/GlobeHemisphereEast";
import { Heartbeat } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { Scales } from "@phosphor-icons/react/dist/ssr/Scales";
import { Umbrella } from "@phosphor-icons/react/dist/ssr/Umbrella";
import { VerticalTabs } from "@/components/motion/vertical-tabs";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

const ICONS: Record<string, Icon> = {
  bank: Bank,
  heartbeat: Heartbeat,
  scales: Scales,
  umbrella: Umbrella,
  cpu: Cpu,
  globe: GlobeHemisphereEast,
};

type Framework = { id: string; name: string; logo: string | null; icon?: string };

/** Framework marks: the logo files in public/eu-iso-act-logos; DIFC and ADGM have none, so they use
 *  the same building and bank glyphs as the landing framework cards. */
const MARK_ICONS: Record<string, Icon> = { buildings: Buildings, bank: Bank };

function Mark({ f }: { f: Framework }) {
  if (f.logo) return <Image src={f.logo} alt="" width={48} height={48} className="size-6 shrink-0 object-contain" />;
  const Glyph = f.icon ? MARK_ICONS[f.icon] : null;
  return Glyph ? <Glyph weight="fill" aria-hidden className="size-5 shrink-0" /> : null;
}

type Industry = {
  id: string;
  name: string;
  icon: string;
  tone: string;
  tagline: string;
  description: string;
  useCases: string[];
  frameworks: string[];
  also: string;
};

/**
 * docs/content/06 §1 plus the concept's Industries page: six industry tiles over one panel. The panel
 * shows the industry's story and use cases, and the full framework set (each chip with its logo)
 * with the ones that apply lit up. The lit chips pop in one by one on every switch, so the
 * difference between industries reads at a glance. Cycles every 4 seconds, never stops; a click jumps to that industry and carries on.
 */
export function IndustryExplorer({ industries, frameworks }: { industries: Industry[]; frameworks: Framework[] }) {
  return (
    <VerticalTabs
      label="Industries"
      layout="top"
      interval={4}
      tabs={industries.map((ind) => {
        const Glyph = ICONS[ind.icon];
        return {
          id: ind.id,
          label: (
            <span key={ind.id} className="flex flex-col gap-3">
              <Glyph weight="duotone" aria-hidden className="size-8 text-tertiary" />
              <span className="type-h4 text-fg">{ind.name}</span>
            </span>
          ),
          content: (
            <div
              key={ind.id}
              className={cn(
                "grid h-full gap-10 rounded-panel border border-white/10 p-6 shadow-panel sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14",
                CARD_TONES[ind.tone as CardTone].className,
              )}
            >
              <div className="flex flex-col gap-5">
                <Glyph weight="duotone" aria-hidden className="size-14 text-fg" />
                <h3 className="type-h2 text-fg">{ind.name}</h3>
                <p className="type-lead text-fg">{ind.tagline}</p>
                <p className="type-body text-fg/80">{ind.description}</p>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <h4 className="type-h4 text-fg">Critical AI use cases</h4>
                  <ul className="flex flex-col gap-3">
                    {ind.useCases.map((u) => (
                      <li key={u} className="type-body flex gap-3 text-fg/85">
                        <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-fg/70" />
                        {u}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="type-h4 text-fg">Frameworks that apply</h4>
                  {/* The whole set, every time: applicable ones lit and popping in, the rest dimmed */}
                  <ul className="flex flex-wrap gap-2">
                    {frameworks.map((f) => {
                      const on = ind.frameworks.includes(f.id);
                      return (
                        <li
                          key={f.id}
                          data-pop={on ? "" : undefined}
                          className={cn(
                            "inline-flex h-10 items-center gap-2 rounded-control border pl-2.5 pr-4 text-sm font-semibold",
                            on ? "border-white/30 bg-white/20 text-fg" : "border-white/10 text-fg/40",
                          )}
                        >
                          {/* Lit chips show the mark in full colour; dimmed ones fade it with the label */}
                          <span className={cn("grid place-items-center", !on && "opacity-40 grayscale")}>
                            <Mark f={f} />
                          </span>
                          {f.name}
                          {!on && <span className="sr-only">(not a primary framework)</span>}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="type-small text-fg/75">{ind.also}</p>
                </div>
              </div>
            </div>
          ),
        };
      })}
    />
  );
}
