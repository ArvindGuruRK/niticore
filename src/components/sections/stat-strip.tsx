import { Annotate } from "@/components/illustrations/annotate";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { WarpHeading } from "@/components/motion/warp-heading";
import { Container } from "@/components/ui/container";

type Stat = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Rendered after the counted value, outside the tween (e.g. "/ 100") */
  trailing?: string;
  label: string;
  tone: "accent" | "tertiary" | "fg";
};

const STATS: Stat[] = [
  {
    // docs/content/02 §2 (Monitor): regulatory amendments tracked across 19 global jurisdictions
    to: 19,
    label: "Global jurisdictions tracked for regulatory amendments",
    tone: "accent",
  },
  {
    to: 5,
    suffix: "×",
    label: "Regulations satisfied per single evidence filing",
    tone: "tertiary",
  },
  {
    to: 78,
    trailing: "/ 100",
    label: "Governance Readiness™ score, board-ready in under 30 seconds",
    tone: "fg",
  },
  {
    to: 94,
    suffix: "%",
    label: "Policy coverage maintained across active production systems",
    tone: "accent",
  },
];

const TONE_CLASS: Record<Stat["tone"], string> = {
  accent: "text-accent",
  tertiary: "text-tertiary",
  fg: "text-fg",
};

function StatCard({ stat }: { stat: Stat }) {
  return (
    <TiltCard max={16} frameClassName="flex-1" className="flex flex-col gap-3">
      <p className={`type-display ${TONE_CLASS[stat.tone]}`}>
        {stat.prefix}
        <CountUp to={stat.to} decimals={stat.decimals} suffix={stat.suffix} />
        {stat.trailing ? <span className="type-h3 ml-1 text-fg-subtle">{stat.trailing}</span> : null}
      </p>
      <p className="type-small text-fg-muted">{stat.label}</p>
    </TiltCard>
  );
}

/**
 * Trust strip, directly below the FrameworkCards marquee ("One governance action. Every framework
 * satisfied."). Reframed from a customer-logo trust bar (we have no public customer base yet) into
 * what the platform itself proves: framework coverage, evidence reuse, and the two live-dashboard
 * figures from the Cockpit Preview content.
 */
export function StatStrip() {
  return (
    <section aria-labelledby="stat-strip-heading" className="pb-section">
      <Container className="flex flex-col items-center gap-4 text-center">
        <Annotate target="[data-accent]" variant="double" trigger="view" delay={0.3}>
          <WarpHeading
            id="stat-strip-heading"
            text="What continuous governance looks like."
            className="type-h2 max-w-2xl text-fg"
          >
            What continuous <span data-accent="">governance</span> looks like.
          </WarpHeading>
        </Annotate>
      </Container>
      <Container className="mt-[var(--spacing-stack)]">
        <Reveal stagger className="flex flex-col gap-4 sm:flex-row">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
