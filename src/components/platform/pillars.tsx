import type { Icon } from "@phosphor-icons/react";
import { Binoculars } from "@phosphor-icons/react/dist/ssr/Binoculars";
import { ChartLineUp } from "@phosphor-icons/react/dist/ssr/ChartLineUp";
import { SealCheck } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/ssr/SlidersHorizontal";
import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { SectionHeader } from "@/components/page/section-header";
import { Container } from "@/components/ui/container";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

type Pillar = { title: string; icon: Icon; tone: CardTone; points: string[] };

/** docs/content/02 §3: the four core platform pillars. */
const PILLARS: Pillar[] = [
  {
    title: "AI Visibility & Discovery",
    icon: Binoculars,
    tone: "blue",
    points: [
      "Enterprise AI system inventory with full lifecycle telemetry",
      "Third-party AI vendor and tool registry, scoring model transparency",
      "Model and dataset registry tracking provenance, licensing and lineage",
      "Agentic AI registration tracking autonomous operational scopes",
    ],
  },
  {
    title: "AI Risk Intelligence",
    icon: ChartLineUp,
    tone: "violet",
    points: [
      "Inherent vs. residual risk quantification",
      "Multi-domain evaluation: fairness, explainability, robustness, privacy, safety",
      "Red-teaming integrations, stress-testing logs and adversarial resilience metrics",
    ],
  },
  {
    title: "Governance Controls & Workflows",
    icon: SlidersHorizontal,
    tone: "green",
    points: [
      "Multi-framework policy orchestration engine",
      "Automated gates, such as blocking CI/CD deployment without a signed FRIA",
      "Time-boxed exemptions with audit-tracked remediation steps",
    ],
  },
  {
    title: "Continuous Assurance & Audit Readiness",
    icon: SealCheck,
    tone: "blue",
    points: [
      "Real-time Governance Readiness™ tracking",
      "Role-based access, including read-only auditor portals",
      "Tamper-evident, cryptographically chained audit logging",
    ],
  },
];

/** 2 × 2 grid in the shared card tones (blue, violet / green, blue), with the same contrast-disc
 *  spotlight as the landing FrameworkCards. No divider lines inside the cards. */
export function Pillars() {
  return (
    <section aria-labelledby="pillars-heading" className="pb-section">
      <Container className="flex flex-col gap-12 sm:gap-16">
        <SectionHeader
          id="pillars-heading"
          title="Four pillars. One platform."
          lead="Everything the loop needs, from finding every AI system to proving it is under control."
        />
        <Reveal stagger className="grid gap-4 md:grid-cols-2">
          {PILLARS.map((pillar, i) => {
            const Glyph = pillar.icon;
            const tone = CARD_TONES[pillar.tone];
            return (
              <SpotlightCard
                key={pillar.title}
                light={tone.light}
                solid
                className={cn("flex h-full flex-col gap-6 border-white/10 p-6 sm:p-8", tone.className)}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-full bg-white/15 text-fg">
                    <Glyph weight="duotone" aria-hidden className="size-6" />
                  </span>
                  <span className="type-h3 tabular-nums text-fg/60">0{i + 1}</span>
                </div>
                <h3 className="type-h3 text-fg">{pillar.title}</h3>
                <ul className="flex flex-col gap-3">
                  {pillar.points.map((point) => (
                    <li key={point} className="type-body flex gap-3 text-fg/85">
                      <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-fg/70" />
                      {point}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}
