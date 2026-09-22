import { GovernanceFabric } from "@/components/illustrations/governance-fabric";
import { PinScrub } from "@/components/motion/pin-scrub";
import { Container } from "@/components/ui/container";

/**
 * The 7-Stage Continuous Governance Loop (docs/content/08 §3). PinScrub is documented in
 * motion/pin-scrub.tsx as "base pattern for the 7-stage governance loop" — this is that section.
 * The Governance Fabric canvas is reserved for exactly this kind of split layout (see its own
 * comment and hero/hero.tsx, which explicitly leaves it for "a later section").
 *
 * Each stage's copy is a short punch line (docs/content/02 §2 stage name) followed by 9 supporting
 * lines pulled from that same doc's stage breakdown, pillar, and dashboard sections — 10 lines total,
 * long enough to read as a real explanation while the pin holds it on screen.
 */
const STAGES = [
  {
    title: "Discover",
    lines: [
      "Eliminate all shadow AI across every team, tool, and vendor.",
      "Automated asset registration, code-repo scanners, and API gateways.",
      "Procurement intake forms catch new tools before they go live.",
      "A full inventory of models, weights, parameters, and dependencies.",
      "Datasets tracked by provenance, licensing, and training lineage.",
      "Every AI vendor and SaaS tool scored and registered.",
      "Business owners mapped to every asset from day one.",
      "Agentic AI registration tracks every autonomous operational scope.",
      "One live system of record replaces a dozen spreadsheets.",
      "Inventory feeds straight into classification, with nothing left out.",
    ],
  },
  {
    title: "Classify",
    lines: [
      "Instant risk tiering the moment a new system enters your stack.",
      "Auto-detects EU AI Act Annex III high-risk designations.",
      "Flags GPAI status and local UAE jurisdictional applicability.",
      "Regulatory classification updates automatically as rules change.",
      "No manual spreadsheets, no missed deadlines, no guesswork.",
      "Every system lands on the right compliance track immediately.",
      "Classification evidence feeds straight into the next stage.",
      "Cross-mapped in real time against EU AI Act, ISO 42001, NIST AI RMF.",
      "GDPR and UAE regional regulations checked in the same pass.",
      "Tiering updates automatically the moment your system changes.",
    ],
  },
  {
    title: "Assess",
    lines: [
      "Quantified risk scoring across every dimension that matters.",
      "Multi-dimensional scoring: bias, safety, privacy, hallucination.",
      "Covers robustness, drift, and adversarial resilience too.",
      "Built-in Fundamental Rights Impact Assessment workflows.",
      "Data Protection Impact Assessments run without extra tooling.",
      "DIFC AI Impact Assessments generated the same way.",
      "One assessment engine, every regulatory flavour covered.",
      "Inherent versus residual risk quantified, not just guessed at.",
      "Red-teaming integrations and adversarial stress-test logs included.",
      "Every score ties back to a specific, defensible control.",
    ],
  },
  {
    title: "Govern",
    lines: [
      "Unified controls that satisfy every applicable framework.",
      "One policy gate satisfies multiple statutory requirements at once.",
      "Configurable governance gates enforce separation of duties.",
      "Non-delegatable sign-offs keep accountability with the right owner.",
      "Automated escalation workflows route exceptions to the right desk.",
      "No system ships without its required approvals in place.",
      "Controls stay mapped as regulations evolve, not frozen in time.",
      "Preventing CI/CD deployment without a signed FRIA is standard.",
      "Exception management runs on time-boxed, audit-tracked exemptions.",
      "A single control satisfies EU, ISO, and NIST requirements at once.",
    ],
  },
  {
    title: "Evidence",
    lines: [
      "File once, satisfy everywhere.",
      "Every action generates timestamped, immutable evidence.",
      "Declarations of Conformity assembled automatically.",
      "Technical documentation packages ready for external auditors.",
      "Tamper-evident records survive scrutiny from any regulator.",
      "No duplicated work across overlapping frameworks.",
      "Audit season stops being a fire drill.",
      "Cryptographically chained logs an auditor can independently verify.",
      "Every filing versioned, timestamped, and linked to its control.",
      "Regulator-ready packages export in one click, not one quarter.",
    ],
  },
  {
    title: "Monitor",
    lines: [
      "Continuous surveillance runs long after a model ships.",
      "Real-time tracking of control drift and model decay.",
      "Prompt injection attempts and toxic outputs flagged instantly.",
      "Regulatory amendments tracked across 19 global jurisdictions.",
      "New compliance gaps surface the moment rules shift.",
      "Nothing waits for the next scheduled audit cycle.",
      "Governance keeps pace with production, not the calendar.",
      "Governance Readiness score recalculates in near real time.",
      "An executive attention feed flags what actually needs a decision.",
      "Drift gets caught before it becomes an incident report.",
    ],
  },
  {
    title: "Improve",
    lines: [
      "Prioritised gap closures your board can see.",
      "Continuous gap analysis across every open control.",
      "Remediation roadmaps ranked by real business risk.",
      "Executive-ready readiness trend reporting, always current.",
      "Every fix feeds evidence back into the loop.",
      "Teams know exactly what to close next, and why.",
      "Governance keeps compounding instead of resetting each quarter.",
      "Readiness trend reporting tracks quarter-over-quarter progress.",
      "Closed gaps become new evidence for the next audit cycle.",
      "The loop restarts at Discover, sharper than it started.",
    ],
  },
].map((stage) => ({
  title: stage.title,
  body: (
    <span className="flex flex-col gap-2">
      <span className="text-fg">{stage.lines[0]}</span>
      {stage.lines.slice(1).map((line) => (
        <span key={line} className="text-fg-muted">
          {line}
        </span>
      ))}
    </span>
  ),
}));

export function GovernanceLoop() {
  return (
    <section aria-label="The continuous governance loop" className="relative pb-section">
      <Container>
        <PinScrub
          steps={STAGES}
          minHeight="100dvh"
          topAlign
          background={<GovernanceFabric align="right" className="fabric-mask size-full" />}
        />
      </Container>
    </section>
  );
}
