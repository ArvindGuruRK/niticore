import { BarMeter } from "@/components/motion/bar-meter";
import { MediaReveal } from "@/components/motion/media-reveal";
import { ScoreRing } from "@/components/motion/score-ring";
import { SectionHeader } from "@/components/page/section-header";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/** docs/content/02 §5: the live Governance Health dashboard figures. */
const DOMAINS = [
  { label: "AI Inventory", value: 92 },
  { label: "AI Literacy", value: 84 },
  { label: "Policy Coverage", value: 81 },
  { label: "Risk Assessment", value: 76 },
  { label: "Control Effectiveness", value: 72 },
  { label: "Evidence Readiness", value: 68 },
];

const FEED = [
  { tone: "risk", count: "3", text: "high-risk systems without completed FRIA documentation" },
  { tone: "warn", count: "7", text: "scheduled risk assessments due this quarter" },
  { tone: "warn", count: "12", text: "controls awaiting validated evidence filings" },
  // docs/content/03 §3: the UAE mainland regulatory deadline
  { tone: "warn", count: "Jan 2027", text: "UAE Federal PDPL deadline for mainland AI systems" },
  { tone: "ok", count: "94%", text: "policy coverage across active production systems" },
] as const;

const DOT = { risk: "bg-status-risk", warn: "bg-status-warn", ok: "bg-status-ok" } as const;

/**
 * The executive cockpit as a product panel: readiness and risk rings, the six sub-domains, and the
 * attention feed. Status colours appear only on the feed dots and the score rings, where they are alerts.
 */
export function Cockpit() {
  return (
    <section aria-labelledby="cockpit-heading" className="pb-section">
      <Container className="flex flex-col gap-12 sm:gap-16">
        <SectionHeader
          id="cockpit-heading"
          title="Management sees this in 30 seconds."
          lead="The executive cockpit turns opaque compliance into business intelligence: one score, six domains, and the few things that need a decision."
        />

        <MediaReveal zoom={1.04} className="rounded-panel border border-line-strong bg-surface shadow-panel">
          {/* Three columns, each opened by its title, so the three titles share one row */}
          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[auto_1fr_1fr] lg:gap-12">
            <div className="flex flex-col gap-5 lg:pr-4">
              <p className="type-body font-semibold text-fg">Governance Health</p>
              <div className="flex flex-wrap justify-center gap-6 sm:justify-start lg:flex-col lg:items-center">
                <ScoreRing value={78} label="Governance Readiness™" size={152} />
                <ScoreRing value={31} label="Risk" size={152} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="type-body font-semibold text-fg">Sub-domains</p>
              <BarMeter rows={DOMAINS} className="gap-4" />
            </div>

            <div className="flex flex-col gap-4">
              <p className="type-body font-semibold text-fg">Needs Attention</p>
              <ul className="flex flex-col gap-2.5">
                {FEED.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 rounded-field border border-line bg-raised/60 px-4 py-3"
                  >
                    <span aria-hidden className={cn("mt-2 size-2 shrink-0 rounded-full", DOT[item.tone])} />
                    <p className="type-small">
                      <span className="font-bold text-fg">{item.count}</span> {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </MediaReveal>
      </Container>
    </section>
  );
}
