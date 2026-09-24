import { EvidenceSimulator } from "@/components/frameworks/evidence-simulator";
import { FrameworkExplorer } from "@/components/frameworks/framework-explorer";
import { Regional } from "@/components/frameworks/regional";
import { FlowSteps } from "@/components/motion/flow-steps";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeader } from "@/components/page/section-header";
import { GetStarted } from "@/components/sections/get-started";
import { Container } from "@/components/ui/container";
import content from "@/content/frameworks.json";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Frameworks",
  "One governance action, credited against the EU AI Act, ISO/IEC 42001, NIST AI RMF, GDPR and UAE regulation at once.",
);

const { simulator, explorer, pipeline, regional, cta } = content;

export default function FrameworksPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Do it once. <span data-accent="" className="inline-block text-accent">Satisfy all.</span>
          </>
        }
        lead="Every governance action is mapped and credited against each obligation it satisfies: EU AI Act, ISO/IEC 42001, NIST AI RMF, GDPR and UAE regulation. No parallel audit trails, and governance overhead cut by more than half."
        doodles={{ left: "petal", right: "star" }}
      />

      <section aria-labelledby="simulator-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="simulator-heading" title={simulator.title} lead={simulator.lead} />
          <EvidenceSimulator action={simulator.action} targets={simulator.targets} summary={simulator.summary} />
        </Container>
      </section>

      <section aria-labelledby="explorer-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="explorer-heading" title={explorer.title} lead={explorer.lead} />
          <FrameworkExplorer frameworks={explorer.frameworks} />
        </Container>
      </section>

      <section aria-labelledby="pipeline-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="pipeline-heading" title={pipeline.title} lead={pipeline.lead} />
          <FlowSteps steps={pipeline.steps} />
          <Reveal stagger className="grid gap-4 md:grid-cols-2">
            {pipeline.points.map((point) => (
              <TiltCard key={point} max={6} className="sm:p-8">
                <p className="type-lead text-fg">{point}</p>
              </TiltCard>
            ))}
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="regional-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="regional-heading" title={regional.title} lead={regional.lead} />
          <Regional milestones={regional.milestones} jurisdictions={regional.jurisdictions} />
        </Container>
      </section>

      <GetStarted title={cta.title} lead={cta.lead} />
    </>
  );
}
