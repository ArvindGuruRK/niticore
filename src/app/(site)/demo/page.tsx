import { DemoDoodles } from "@/components/demo/demo-doodles";
import { DemoForm } from "@/components/demo/demo-form";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Container } from "@/components/ui/container";
import content from "@/content/demo.json";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Book a demo",
  "Book a 45-minute live platform demo. Bring your AI systems and a certified AI governance specialist will show you where the gaps are.",
);

const { form } = content;

/**
 * Book a demo: just the booking card, straight under the nav. The card's title is the page's h1; the
 * agenda (the five questions the demo answers) sits beside it on lg. Same flat grid canvas as the
 * inner-page heroes, so it still feels part of the site, with a paper plane and a calendar drawn in
 * the margins.
 */
export default function DemoPage() {
  return (
    <section aria-labelledby="book-heading" className="relative isolate">
      <div aria-hidden className="grid-bg absolute inset-x-0 top-0 -z-10 h-[70vh]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[calc(70vh-8rem)] -z-10 h-32 bg-gradient-to-b from-transparent to-canvas"
      />
      <DemoDoodles />

      <Container className="grid gap-10 pb-section pt-[calc(8rem+var(--safe-top))] sm:pt-36 lg:grid-cols-[1.5fr_1fr] lg:gap-16 lg:pt-40">
        <Reveal className="flex flex-col gap-10 rounded-panel border border-line-strong bg-surface p-6 shadow-panel sm:p-10">
          <div className="flex flex-col gap-4">
            <SplitHeading as="h1" id="book-heading" by="words" trigger="load" className="type-h2 text-fg">
              {form.title}
            </SplitHeading>
            <p className="type-lead max-w-2xl">{form.lead}</p>
          </div>
          <DemoForm roles={form.roles} frameworks={form.frameworks} submit={form.submit} />
        </Reveal>

        <Reveal delay={0.2} className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start lg:pt-10">
          <h2 className="type-h3 text-fg">{form.agendaTitle}</h2>
          <ol className="flex flex-col gap-4">
            {form.agenda.map((q, i) => (
              <li key={q} className="flex items-baseline gap-4">
                <span className="type-h4 tabular-nums text-tertiary">{String(i + 1).padStart(2, "0")}</span>
                <span className="type-lead text-fg">{q}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
