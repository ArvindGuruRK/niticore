import type { Icon } from "@phosphor-icons/react";
import { Code } from "@phosphor-icons/react/dist/ssr/Code";
import { Crown } from "@phosphor-icons/react/dist/ssr/Crown";
import { Rocket } from "@phosphor-icons/react/dist/ssr/Rocket";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { Container } from "@/components/ui/container";

type Persona = {
  label: string;
  icon: Icon;
  tone: "accent" | "tertiary";
  description: string;
};

/**
 * Card pattern lifted from the inspiration's "Who is Postiz for?" section: a big outline icon,
 * a large title, and a short paragraph — no tabs, no bullet list. Copy is composed from the
 * sourced persona data (06_industry_verticals_and_personas.md §2), not invented.
 */
const PERSONAS: Persona[] = [
  {
    label: "Board & CEO",
    icon: Crown,
    tone: "accent",
    description:
      "Get an executive governance readiness scorecard, brand-risk heat maps, and assurance that every high-risk system complies with the EU AI Act and regional directives.",
  },
  {
    label: "CAIO & CTO",
    icon: Rocket,
    tone: "tertiary",
    description:
      "Wire DevSecOps-native governance gates straight into your CI/CD pipeline, track a unified inventory of every model and agent, and catch drift before it becomes an incident.",
  },
  {
    label: "Risk & Compliance",
    icon: ShieldCheck,
    tone: "accent",
    description:
      "Quantify inherent versus residual risk, get continuous control-effectiveness telemetry, and export regulator-ready evidence dossiers in one click — no spreadsheets.",
  },
  {
    label: "AI Engineers",
    icon: Code,
    tone: "tertiary",
    description:
      "Register models through a clean CLI and API, run pre-built test suites for bias, prompt injection, and hallucination, and know exactly what evidence a model freeze needs.",
  },
];

const TONE_CLASS: Record<Persona["tone"], string> = {
  accent: "text-accent",
  tertiary: "text-tertiary",
};

function PersonaCard({ persona }: { persona: Persona }) {
  const Glyph = persona.icon;
  return (
    <TiltCard className="flex flex-1 flex-col gap-8 p-8 sm:p-10">
      <Glyph weight="light" className={`size-14 shrink-0 ${TONE_CLASS[persona.tone]}`} aria-hidden />
      <div className="flex flex-col gap-3">
        <p className="font-display text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-fg">
          {persona.label}
        </p>
        <p className="type-body">{persona.description}</p>
      </div>
    </TiltCard>
  );
}

/** "Who is this for?" — one outline-icon card per stakeholder, straight from the inspiration's layout. */
export function PersonaSwitcher() {
  return (
    <section aria-labelledby="persona-heading" className="pb-section">
      <Container className="flex flex-col items-center gap-4 text-center">
        <h2 id="persona-heading" className="type-h2 max-w-2xl text-fg">
          One governance layer. Every seat at the table.
        </h2>
      </Container>
      <Container className="mt-10 sm:mt-14">
        <Reveal stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PERSONAS.map((persona) => (
            <PersonaCard key={persona.label} persona={persona} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
