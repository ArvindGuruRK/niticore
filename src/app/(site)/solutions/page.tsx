import { TextReveal } from "@/components/motion/text-reveal";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeader } from "@/components/page/section-header";
import { GetStarted } from "@/components/sections/get-started";
import { IndustryExplorer } from "@/components/solutions/industry-explorer";
import { PersonaViews } from "@/components/solutions/persona-views";
import { Container } from "@/components/ui/container";
import content from "@/content/solutions.json";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("/solutions");

const { hero, industries, personas, statement, cta } = content;

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        title={
          <>
            High-stakes AI demands <span className="text-accent">high-rigour <span data-accent="" className="inline-block">governance.</span></span>
          </>
        }
        lead={hero.lead}
        doodles={{ left: "petal", right: "zigzag" }}
      />

      <section aria-labelledby="industries-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="industries-heading" title={industries.title} lead={industries.lead} />
          <IndustryExplorer industries={industries.items} frameworks={industries.frameworks} />
        </Container>
      </section>

      <section aria-labelledby="personas-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="personas-heading" title={personas.title} lead={personas.lead} />
          <PersonaViews personas={personas.items} providesTitle={personas.providesTitle} />
        </Container>
      </section>

      {/* The concept's closing line, lighting up word by word as it scrolls through */}
      <section aria-label="Our view" className="pb-section">
        <Container>
          <figure className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
            <blockquote>
              <TextReveal as="p" text={statement.quote} className="type-h2 text-fg" />
            </blockquote>
            <figcaption className="type-body text-tertiary">{statement.author}</figcaption>
          </figure>
        </Container>
      </section>

      <GetStarted title={cta.title} lead={cta.lead} />
    </>
  );
}
