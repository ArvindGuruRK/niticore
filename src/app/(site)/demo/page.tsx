import { DemoForm } from "@/components/demo/demo-form";
import { Reveal } from "@/components/motion/reveal";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { PageHero } from "@/components/page/page-hero";
import { SectionHeader } from "@/components/page/section-header";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import content from "@/content/demo.json";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { pageMetadata } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata(
  "Book a demo",
  "Book a 45-minute live platform demo. Bring your AI systems and a certified AI governance specialist will show you where the gaps are.",
);

const { hero, doors, form } = content;

export default function DemoPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Book a 45-minute <span data-accent="" className="inline-block text-accent">live demo.</span>
          </>
        }
        lead={hero.lead}
        doodles={{ left: "zigzag", right: "star" }}
      />

      {/* The docs' 3-door CTA: pick the path that fits where you are */}
      <section aria-labelledby="doors-heading" className="pb-section">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <SectionHeader id="doors-heading" title={doors.title} lead={doors.lead} />
          <Reveal stagger className="grid gap-4 lg:grid-cols-3">
            {doors.items.map((d) => {
              const tone = CARD_TONES[d.tone as CardTone];
              return (
                <SpotlightCard
                  key={d.stage}
                  light={tone.light}
                  solid
                  className={cn("flex h-full flex-col gap-4 border-white/10 p-6 sm:p-8", tone.className)}
                >
                  <h3 className="type-h3 text-fg">{d.stage}</h3>
                  <p className="type-lead text-fg/90">&ldquo;{d.quote}&rdquo;</p>
                  <Button href={d.href} size="md" arrow variant={d.primary ? "primary" : "secondary"} className="mt-auto self-start">
                    {d.cta}
                  </Button>
                </SpotlightCard>
              );
            })}
          </Reveal>
        </Container>
      </section>

      <section id="book" aria-labelledby="book-heading" className="scroll-mt-28 pb-section">
        <Container className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-10 rounded-panel border border-line-strong bg-surface p-6 shadow-panel sm:p-10">
            <SectionHeader id="book-heading" align="left" title={form.title} lead={form.lead} />
            <DemoForm roles={form.roles} frameworks={form.frameworks} submit={form.submit} />
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
            <h3 className="type-h3 text-fg">{form.agendaTitle}</h3>
            <ol className="flex flex-col gap-4">
              {form.agenda.map((q, i) => (
                <li key={q} className="flex items-baseline gap-4">
                  <span className="type-h4 tabular-nums text-tertiary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="type-lead text-fg">{q}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </>
  );
}
