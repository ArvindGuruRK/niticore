import type { Icon } from "@phosphor-icons/react";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { Code } from "@phosphor-icons/react/dist/ssr/Code";
import { Crown } from "@phosphor-icons/react/dist/ssr/Crown";
import { Gauge } from "@phosphor-icons/react/dist/ssr/Gauge";
import { Gavel } from "@phosphor-icons/react/dist/ssr/Gavel";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Rocket } from "@phosphor-icons/react/dist/ssr/Rocket";
import { Tabs } from "@/components/motion/tabs";

const ICONS: Record<string, Icon> = {
  crown: Crown,
  rocket: Rocket,
  gauge: Gauge,
  gavel: Gavel,
  lock: LockKey,
  code: Code,
  magnifier: MagnifyingGlass,
};

type Persona = {
  id: string;
  tab: string;
  role: string;
  icon: string;
  question: string;
  provides: string[];
};

/**
 * docs/content/06 §2: all seven stakeholder views. A sliding pill picks the seat; the panel leads
 * with that seat's core question as a big quote, then what Niticore gives them. The landing page's
 * persona cards cover four seats briefly; this is the full set.
 */
export function PersonaViews({ personas, providesTitle }: { personas: Persona[]; providesTitle: string }) {
  return (
    <Tabs
      align="center"
      tabs={personas.map((p) => {
        const Glyph = ICONS[p.icon];
        return {
          id: p.id,
          label: p.tab,
          content: (
            <div
              key={p.id}
              className="grid gap-10 rounded-panel border border-line-strong bg-surface p-6 shadow-panel sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14"
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <Glyph weight="duotone" aria-hidden className="size-12 shrink-0 text-tertiary" />
                  <p className="type-h4 text-fg">{p.role}</p>
                </div>
                <blockquote>
                  <p className="type-h2 text-fg">{p.question}</p>
                </blockquote>
              </div>

              <div className="flex flex-col gap-5 lg:pt-2">
                <h3 className="type-h4 text-fg">{providesTitle}</h3>
                <ul className="flex flex-col gap-3">
                  {p.provides.map((item) => (
                    <li key={item} className="flex gap-4 rounded-field bg-raised px-5 py-4">
                      <Check weight="bold" aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
                      <span className="type-body text-fg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ),
        };
      })}
    />
  );
}
