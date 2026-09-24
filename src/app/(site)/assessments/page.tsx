import { AssessmentIndex } from "@/components/assessments/assessment-index";
import { MaturityLadder } from "@/components/assessments/maturity-ladder";
import { ReadinessCheck } from "@/components/assessments/readiness-check";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeader } from "@/components/page/section-header";
import { GetStarted } from "@/components/sections/get-started";
import { Container } from "@/components/ui/container";
import content from "@/content/assessments.json";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Assessments",
  "Six focused AI governance assessments and a 0 to 100 Governance Readiness score, starting with a free 10-minute diagnostic.",
);

const { model, check, suite, cta } = content;

export default function AssessmentsPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Know your risks <span className="text-accent">before they become <span data-accent="" className="inline-block">problems.</span></span>
          </>
        }
        lead="Six focused assessments give you an honest picture of where your AI governance stands, and a clear path to where it needs to be. Start with a free 10-minute readiness score."
        doodles={{ left: "zigzag", right: "petal" }}
      />

      <section aria-labelledby="model-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="model-heading" title={model.title} lead={model.lead} />
          <MaturityLadder levels={model.levels} />
        </Container>
      </section>

      <section id="readiness-check" aria-labelledby="check-heading" className="scroll-mt-28 pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="check-heading" title={check.title} lead={check.lead} />
          <ReadinessCheck levels={model.levels} dimensions={check.dimensions} result={check.result} />
        </Container>
      </section>

      <section aria-labelledby="suite-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="suite-heading" title={suite.title} lead={suite.lead} />
          <AssessmentIndex assessments={suite.assessments} />
        </Container>
      </section>

      <GetStarted title={cta.title} lead={cta.lead} primary={cta.primary} />
    </>
  );
}
