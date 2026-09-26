import { Engagement } from "@/components/academy/engagement";
import { PracticeTrack } from "@/components/academy/practice-track";
import { Tracks } from "@/components/academy/tracks";
import { ProgressGrid } from "@/components/motion/progress-grid";
import { TickList } from "@/components/motion/tick-list";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeader } from "@/components/page/section-header";
import { GetStarted } from "@/components/sections/get-started";
import { Container } from "@/components/ui/container";
import content from "@/content/academy.json";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Academy & Advisory",
  "AI governance masterclasses for boards, operators and builders, and expert-led advisory that configures governance straight into Niticore.",
);

const { hero, tracks, curriculum, outcomes, practice, engage, cta } = content;

export default function AcademyAdvisoryPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Don&apos;t just use AI. <span className="text-accent">Understand how to <span data-accent="" className="inline-block">govern</span> it.</span>
          </>
        }
        lead={hero.lead}
        doodles={{ left: "star", right: "petal" }}
      />

      <section aria-labelledby="tracks-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="tracks-heading" title={tracks.title} lead={tracks.lead} />
          <div className="flex flex-col gap-5">
            <Tracks tracks={tracks.items} />
            <p className="type-caption text-center">{tracks.flipHint}</p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="curriculum-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="curriculum-heading" title={curriculum.title} lead={curriculum.lead} />
          <ProgressGrid items={curriculum.modules} />
        </Container>
      </section>

      <section aria-labelledby="outcomes-heading" className="pb-section">
        <Container className="flex flex-col gap-10">
          <SectionHeader id="outcomes-heading" title={outcomes.title} />
          <TickList items={outcomes.items} />
        </Container>
      </section>

      {/* The heading scrolls normally; only the card track pins, so the pinned block always fits the screen.
          The track sits in a plain block (not the flex container) so its pin always reserves scroll space. */}
      <section aria-labelledby="practice-heading" className="pb-section">
        <Container className="flex flex-col gap-10">
          <SectionHeader id="practice-heading" title={practice.title} lead={practice.lead} />
          <div>
            <PracticeTrack areas={practice.areas} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="engage-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="engage-heading" title={engage.title} lead={engage.lead} />
          <Engagement models={engage.models} />
        </Container>
      </section>

      <GetStarted title={cta.title} lead={cta.lead} primary={cta.primary} />
    </>
  );
}
