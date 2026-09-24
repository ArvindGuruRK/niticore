import { OrbitSteps } from "@/components/motion/orbit-steps";
import { SectionHeader } from "@/components/page/section-header";
import { Container } from "@/components/ui/container";

/** docs/content/02 §2: the 7-stage continuous governance lifecycle. */
const STAGES = [
  {
    title: "Discover",
    question: "What AI exists?",
    points: [
      "Eliminates shadow AI through asset registration, code-repo scanners, API gateways and procurement intake forms.",
      "Catalogs datasets, foundation models, weights, parameters, dependencies and business owners.",
    ],
  },
  {
    title: "Classify",
    question: "What is it?",
    points: [
      "Automated risk tiering and regulatory classification.",
      "Auto-detects EU AI Act Annex III high-risk designations, GPAI status and UAE jurisdictional applicability.",
    ],
  },
  {
    title: "Assess",
    question: "What could go wrong?",
    points: [
      "Multi-dimensional risk scoring: bias, safety, privacy, hallucination, robustness and drift.",
      "Built-in workflows for FRIA, DPIA and DIFC AI Impact Assessments.",
    ],
  },
  {
    title: "Govern",
    question: "What controls apply?",
    points: [
      "Universal control mapping: one policy implementation satisfies multiple statutory requirements.",
      "Configurable gates, separation of duties, non-delegatable sign-offs and automated escalation.",
    ],
  },
  {
    title: "Evidence",
    question: "Can we prove it?",
    points: [
      "File once, satisfy everywhere. Every action generates timestamped, immutable evidence.",
      "Auto-assembles Declarations of Conformity and technical documentation for external auditors.",
    ],
  },
  {
    title: "Monitor",
    question: "Has anything changed?",
    points: [
      "Real-time monitoring for control drift, prompt injection, toxic outputs and model decay.",
      "Tracks regulatory amendments across 19 jurisdictions and flags new compliance gaps.",
    ],
  },
  {
    title: "Improve",
    question: "What needs attention?",
    points: ["Continuous gap analysis and remediation prioritisation.", "Board-level readiness trend reporting."],
  },
];

export function Lifecycle() {
  return (
    <section aria-labelledby="lifecycle-heading" className="pb-section">
      <Container className="flex flex-col gap-12 sm:gap-16">
        <SectionHeader
          id="lifecycle-heading"
          title="Seven stages. One unbroken loop."
          lead="Governance isn't a gate at deployment. Evidence from each stage fuels the next, so every cycle starts sharper than the last."
        />
        <OrbitSteps steps={STAGES} />
      </Container>
    </section>
  );
}
