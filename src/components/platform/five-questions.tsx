import { FocusList } from "@/components/motion/focus-list";
import { SectionHeader } from "@/components/page/section-header";
import { Container } from "@/components/ui/container";

/** docs/content/02 §1: the five questions the platform's control loop answers. */
const QUESTIONS = [
  {
    meta: "01",
    title: "What AI do we actually have?",
    body: "A full inventory of models, internal applications, autonomous agents, SaaS vendor tools, embedded APIs and shadow AI.",
  },
  {
    meta: "02",
    title: "What could go wrong?",
    body: "Systematic assessment of privacy leaks, demographic bias, jailbreaks, hallucination, runaway autonomy and regulatory fines.",
  },
  {
    meta: "03",
    title: "Who is accountable?",
    body: "Clear RACI ownership: Business Owner, Model Owner, Risk Officer, Compliance Counsel, Technical Lead and Human Reviewer.",
  },
  {
    meta: "04",
    title: "Are we compliant?",
    body: "Real-time cross-mapping across the EU AI Act, ISO/IEC 42001, NIST AI RMF, GDPR and UAE regulation (DIFC, ADGM, PDPL).",
  },
  {
    meta: "05",
    title: "Can we prove it?",
    body: "Cryptographically verifiable audit trails, versioned policies, approval sign-offs and regulator-ready evidence exports.",
  },
];

/** Sticky heading on the left (lg+), questions on the right lighting up one at a time as they are read. */
export function FiveQuestions() {
  return (
    <section aria-labelledby="questions-heading" className="pb-section">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader
            id="questions-heading"
            align="left"
            title="Five questions every board asks."
            lead="Niticore turns governance anxiety into an operating loop that answers each one, continuously, with evidence behind every answer."
          />
        </div>
        <FocusList items={QUESTIONS} className="border-b border-line" />
      </Container>
    </section>
  );
}
