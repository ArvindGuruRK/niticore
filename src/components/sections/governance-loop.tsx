import { GovernanceFabric } from "@/components/illustrations/governance-fabric";
import { PinScrub } from "@/components/motion/pin-scrub";
import { Container } from "@/components/ui/container";

/**
 * The 7-Stage Continuous Governance Loop (docs/content/08 §3). PinScrub is documented in
 * motion/pin-scrub.tsx as "base pattern for the 7-stage governance loop" — this is that section.
 * The Governance Fabric canvas is reserved for exactly this kind of split layout (see its own
 * comment and hero/hero.tsx, which explicitly leaves it for "a later section").
 *
 * Each stage's copy is a short punch line (docs/content/02 §2 stage name), bright, opening a single
 * flowing paragraph — not a list of bullet lines — so the pin reads as a quick, intuitive explanation
 * rather than a wall of points.
 */
const STAGES = [
  {
    title: "Discover",
    lead: "Eliminate shadow AI across every team, tool, and vendor.",
    rest: "Automated registration pulls in every model, dataset, and agentic system alongside code-repo scanners and procurement intake, mapping each asset to a business owner from day one — one live system of record instead of a dozen spreadsheets.",
  },
  {
    title: "Classify",
    lead: "Instant risk tiering the moment a new system enters your stack.",
    rest: "Systems are cross-mapped in real time against EU AI Act Annex III, GPAI status, ISO 42001, NIST AI RMF, and UAE regional rules, with tiering updating automatically as regulations change — no manual spreadsheets, no missed deadlines.",
  },
  {
    title: "Assess",
    lead: "Quantified risk scoring across every dimension that matters.",
    rest: "One engine covers bias, safety, privacy, hallucination, robustness, drift, and adversarial resilience, running Fundamental Rights, Data Protection, and DIFC AI Impact Assessments out of the box so every score ties back to a defensible control.",
  },
  {
    title: "Govern",
    lead: "Unified controls that satisfy every applicable framework at once.",
    rest: "Configurable gates enforce separation of duties and non-delegatable sign-offs, routing exceptions to the right desk automatically — no system ships without its required approvals, including a signed FRIA before CI/CD deployment.",
  },
  {
    title: "Evidence",
    lead: "File once, satisfy everywhere.",
    rest: "Every action generates timestamped, cryptographically chained evidence, with Declarations of Conformity and audit-ready documentation assembled automatically so regulator-ready packages export in one click, not one quarter.",
  },
  {
    title: "Monitor",
    lead: "Continuous surveillance runs long after a model ships.",
    rest: "Control drift, model decay, prompt injection, and toxic outputs are flagged in real time, regulatory amendments are tracked across 19 jurisdictions, and an executive attention feed surfaces what actually needs a decision.",
  },
  {
    title: "Improve",
    lead: "Prioritised gap closures your board can see.",
    rest: "Continuous gap analysis ranks remediation by real business risk, feeding every fix back into the loop as new evidence — readiness trends stay current quarter over quarter, and the cycle restarts at Discover, sharper than it started.",
  },
].map((stage) => ({
  title: stage.title,
  body: (
    <p>
      <span className="text-fg">{stage.lead} </span>
      <span className="text-fg-muted">{stage.rest}</span>
    </p>
  ),
}));

export function GovernanceLoop() {
  return (
    <section aria-label="The continuous governance loop" className="relative pb-section">
      <Container>
        <PinScrub
          steps={STAGES}
          minHeight="100dvh"
          background={<GovernanceFabric align="right" className="fabric-mask size-full" />}
        />
      </Container>
    </section>
  );
}
