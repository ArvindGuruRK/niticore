import type { Icon } from "@phosphor-icons/react";
import { Binoculars } from "@phosphor-icons/react/dist/ssr/Binoculars";
import { ChartLineUp } from "@phosphor-icons/react/dist/ssr/ChartLineUp";
import { SlidersHorizontal } from "@phosphor-icons/react/dist/ssr/SlidersHorizontal";
import { CityBand } from "@/components/about/city-band";
import { Journey } from "@/components/about/journey";
import { SpeedLanes } from "@/components/about/speed-lanes";
import { StackCards } from "@/components/motion/stack-cards";
import { StrikeRows } from "@/components/motion/strike-rows";
import { TextReveal } from "@/components/motion/text-reveal";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeader } from "@/components/page/section-header";
import { GetStarted } from "@/components/sections/get-started";
import { Container } from "@/components/ui/container";
import content from "@/content/about.json";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { COMPANY } from "@/lib/company";
import { pageMetadata } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata("/about");

/**
 * The About page as a scroll story. Copy comes only from the client's HTML prototypes and website
 * concept (see _source in about.json). In order: the hero, the gap as two speed lanes, Know / Assess /
 * Act as a sticky card stack, the four-way journey pinned on a stations rail, the traditional approach
 * struck through row by row, the hubs converging into one line, then the closing call to action.
 */
const { hero, gap, philosophy, journey, why, cta } = content;

const PHILOSOPHY: { icon: Icon; tone: CardTone }[] = [
  { icon: Binoculars, tone: "blue" },
  { icon: ChartLineUp, tone: "violet" },
  { icon: SlidersHorizontal, tone: "green" },
];

/** Editorial split used by two sections: the heading sticks on the left while the story scrolls on the right. */
function Split({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div className="lg:sticky lg:top-32 lg:self-start">{header}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        title={
          <>
            AI is moving fast.{" "}
            <span className="text-accent">
              Governance needs to move{" "}
              <span data-accent="" className="inline-block">
                faster.
              </span>
            </span>
          </>
        }
        lead={hero.lead}
        doodles={{ left: "petal", right: "zigzag" }}
        size="hero"
      />

      {/* 1. The gap: the two lanes run in opposite directions */}
      <section aria-labelledby="gap-heading" className="flex flex-col gap-12 pb-section sm:gap-16">
        <Container>
          <SectionHeader id="gap-heading" title={gap.title} lead={gap.lead} align="left" />
        </Container>
        <SpeedLanes topLabel={gap.aiLabel} bottomLabel={gap.governanceLabel} topItems={gap.ai} bottomItems={gap.governance} />
        <Container>
          <TextReveal text={gap.punchline} className="type-statement max-w-4xl text-fg" />
        </Container>
      </section>

      {/* 2. Know / Assess / Act: a sticky stack beside a sticky heading */}
      <section aria-labelledby="philosophy-heading" className="pb-section">
        <Container>
          <Split header={<SectionHeader id="philosophy-heading" title={philosophy.title} lead={philosophy.lead} align="left" />}>
            <StackCards>
              {philosophy.items.map((item, i) => {
                const { icon: Glyph, tone } = PHILOSOPHY[i % PHILOSOPHY.length];
                return (
                  <article key={item.title} className="bezel">
                    <div
                      className={cn(
                        "flex flex-col gap-6 rounded-panel p-card shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] sm:p-8",
                        CARD_TONES[tone].className,
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="grid size-11 place-items-center rounded-full bg-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]">
                          <Glyph aria-hidden weight="duotone" className="size-6 text-fg" />
                        </span>
                        <span className="type-h3 tabular-nums text-fg/60">0{i + 1}</span>
                      </div>
                      <div className="flex flex-col gap-3">
                        <h3 className="type-h2 text-fg">{item.title}</h3>
                        <p className="type-h3 text-fg">{item.subtitle}</p>
                        <p className="type-body max-w-xl text-fg/85">{item.body}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </StackCards>
          </Split>
        </Container>
      </section>

      {/* 3. The journey: pinned on a stations rail */}
      <section aria-labelledby="journey-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="journey-heading" title={journey.title} lead={journey.lead} />
          <Journey stages={journey.stages} />
        </Container>
      </section>

      {/* 4. Bigger than software: the old way struck through, row by row */}
      <section aria-labelledby="why-heading" className="pb-12 sm:pb-16">
        <Container className="flex flex-col gap-16 sm:gap-24">
          <Split header={<SectionHeader id="why-heading" title={why.title} lead={why.lead} align="left" />}>
            <StrikeRows
              rows={why.rows.map(([before, after]) => ({ before, after }))}
              beforeLabel={why.left}
              afterLabel={why.right}
            />
          </Split>
          <TextReveal text={why.statement} className="type-statement mx-auto max-w-3xl text-center text-fg" />
        </Container>
      </section>

      {/* 5. The hubs converge into one line, straight after the statement above */}
      <section aria-label="Offices" className="pb-section">
        <CityBand cities={COMPANY.hubs} />
      </section>

      <GetStarted title={cta.title} lead={cta.lead} primary={cta.primary} secondary={cta.secondary} />
    </>
  );
}
