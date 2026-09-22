import { Scribble } from "@/components/illustrations/scribble";
import { Accordion } from "@/components/motion/accordion";
import { Reveal } from "@/components/motion/reveal";
import { WarpHeading } from "@/components/motion/warp-heading";
import { Container } from "@/components/ui/container";

/** Sourced from docs/content — 01 (positioning), 02 (architecture), 03 (frameworks),
 *  04 (assessments), 07 (pricing). Nothing here is invented. */
const ITEMS = [
  {
    id: "what-is-niticore",
    title: "What is NitiCore?",
    content:
      "The operating layer for governed AI. NitiCore helps organizations build, deploy, and scale AI with continuous visibility, risk intelligence, controls, and evidence — from idea to production.",
  },
  {
    id: "one-control",
    title: "How does \"do it once, satisfy all\" actually work?",
    content:
      "Universal control mapping: an action performed once in NitiCore — a bias audit, a risk review — is automatically mapped and credited against every statutory obligation it satisfies, eliminating parallel audit trails and cutting governance overhead by more than 50%.",
  },
  {
    id: "frameworks",
    title: "Which frameworks and regulations does NitiCore cover?",
    content:
      "The EU AI Act (2024/1689), ISO/IEC 42001:2023, NIST AI RMF 1.0, GDPR and UK GDPR, plus the UAE and GCC's sovereign frameworks: DIFC Regulation 10, UAE Federal PDPL, and ADGM DPR 2021 (FSRA).",
  },
  {
    id: "agentic-governance",
    title: "How does NitiCore govern autonomous AI agents?",
    content:
      "By governing the agent, not just the model: a cryptographic agent identity and owner, pre-approved autonomy limits and budgets, fine-grained tool and data access, hard guardrails coded into the agent, mandatory human-in-the-loop confirmation gates, and continuous runtime auditing with an instant kill-switch.",
  },
  {
    id: "lifecycle",
    title: "What does the 7-stage governance lifecycle cover?",
    content:
      "Discover (eliminate shadow AI), Classify (risk-tier and tag regulatory scope), Assess (score bias, privacy, security, safety), Govern (apply unified controls), Evidence (file once, satisfy everywhere), Monitor (catch drift and new obligations), and Improve (prioritize remediation) — a closed loop, not a one-time checkpoint.",
  },
  {
    id: "readiness-score",
    title: "What is the Governance Readiness™ score?",
    content:
      "A 0–100 composite score across five maturity levels, from Emerging to Adaptive, broken down into AI Inventory, AI Literacy, Policy Coverage, Risk Assessment, Control Effectiveness, and Evidence Readiness — board-ready in under 30 seconds.",
  },
  {
    id: "assessments",
    title: "What assessments does NitiCore offer?",
    content:
      "Six modular assessments: AI Governance Maturity, AI Use Case, AI Risk, Regulatory Readiness, AI Vendor & Procurement, and AI Impact Assessment — a single artifact that satisfies EU AI Act Article 27 FRIA, GDPR Article 35 DPIA, and DIFC Regulation 10 AI Impact requirements at once.",
  },
  {
    id: "uae-gcc",
    title: "Does NitiCore support UAE and GCC-specific regulation?",
    content:
      "Yes — mainland UAE, DIFC, and ADGM are treated as distinct, first-class jurisdictions, covering DIFC Regulation 10 (in active enforcement since January 2026), the UAE Federal PDPL (federal deadline January 2027), and ADGM DPR 2021, with bilingual Arabic/English policy and evidence filing.",
  },
  {
    id: "pricing",
    title: "How is NitiCore priced?",
    content:
      "A platform tier plus modular framework packs: Foundation (up to 15 AI systems, one framework), Professional (up to 50 systems, all five major frameworks, real-time drift monitoring), and Governed Enterprise (unlimited systems and frameworks, dedicated auditor workspaces and technical TAM).",
  },
  {
    id: "advisory",
    title: "Can we get advisory or training support, not just software?",
    content:
      "Yes. The Masterclass Academy offers role-based enablement for boards, risk officers, legal, and AI engineers, and the Advisory practice runs discovery workshops, governance sprints, and a continuous advisory retainer for framework design, policy authoring, and audit readiness.",
  },
];

/**
 * FAQ, styled after the reference's split layout: a pinned heading on the left, a stack of
 * self-contained accordion cards on the right (Accordion's "separated" variant) — our own visual
 * language throughout (scribbled doodle mark, design-system colors/shape), the reference informed
 * only the placement and structure.
 */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="pb-section">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.62fr_1.7fr] lg:gap-12">
          <div className="flex flex-col items-start lg:sticky lg:top-32 lg:self-start">
            <Scribble target="[data-scribble]" trigger="view" delay={0.3}>
              <WarpHeading id="faq-heading" text="Frequently asked questions" className="type-h2 text-left text-fg">
                <span data-scribble="">
                  Frequently
                  <br />
                  asked
                  <br />
                  questions
                </span>
              </WarpHeading>
            </Scribble>
          </div>

          <Reveal stagger>
            <Accordion items={ITEMS} variant="separated" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
