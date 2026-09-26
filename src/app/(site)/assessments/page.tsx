import { AssessmentIndex } from "@/components/assessments/assessment-index";
import { MaturityLadder } from "@/components/assessments/maturity-ladder";
import { ReadinessCheck } from "@/components/assessments/readiness-check";
import { Timeline } from "@/components/motion/timeline";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeader } from "@/components/page/section-header";
import { GetStarted } from "@/components/sections/get-started";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import content from "@/content/assessments.json";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("/assessments");

const { model, journey, check, suite, cta } = content;

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

      {/* The check's four steps: heading and CTA stay put on the left while the timeline fills on the right */}
      <section aria-labelledby="journey-heading" className="pb-section">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="flex flex-col items-start gap-8 lg:sticky lg:top-32 lg:self-start">
            <SectionHeader id="journey-heading" align="left" title={journey.title} lead={journey.lead} />
            <Button href={journey.cta.href} size="lg" arrow>
              {journey.cta.label}
            </Button>
          </div>
          <Timeline numbered items={journey.steps} className="lg:pt-2" />
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
