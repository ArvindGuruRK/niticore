import type { ReactNode } from "react";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Sparkle as SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { Sparkle } from "@/components/illustrations/sparkle";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { COMPANY, LEGAL_NAME, formatLegalDate } from "@/lib/company";
import { LegalToc } from "./legal-toc";

export type LegalSection = {
  /** Anchor id, e.g. "your-rights" */
  id: string;
  title: string;
  body: ReactNode;
};

const ARTICLE_ID = "legal-article";

/**
 * Privacy Policy, Terms and Cookie Policy share this layout, after the Postiz legal pages: a centred
 * hero (grid canvas, sparkle, large white title; nothing drawn under the title) with the date it
 * was last updated, a plain-words summary, then numbered sections separated by hairlines. Beside the text (from lg), a sticky "On this page" list tracks the section being read.
 * The text column stays at a comfortable reading width; copy inside sections uses type-prose.
 */
export function LegalPage({
  title,
  updated,
  intro,
  summary,
  sections,
}: {
  /** Static heading markup, all in text-fg */
  title: ReactNode;
  /** ISO date of the last change */
  updated: string;
  intro: ReactNode;
  /** "The short version": a few plain sentences, each may start with a <strong> lead */
  summary: ReactNode[];
  sections: LegalSection[];
}) {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
        <Container className="pb-14 pt-[calc(9rem+var(--safe-top))] sm:pb-20 sm:pt-44">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <Sparkle size={48} trigger="load" delay={0.4} className="text-tertiary" />
            <SplitHeading as="h1" by="words" trigger="load" delay={0.1} className="type-display text-fg">
              {title}
            </SplitHeading>
            <Reveal delay={0.35}>
              <p className="type-small flex items-center justify-center gap-2">
                <CalendarBlank aria-hidden weight="duotone" className="size-5 text-tertiary" />
                Last updated <time dateTime={updated}>{formatLegalDate(updated)}</time>
              </p>
            </Reveal>
            <Reveal delay={0.45}>
              <div className="type-lead max-w-3xl [&_a]:text-fg [&_a]:underline [&_a]:decoration-tertiary [&_a]:underline-offset-4">
                {intro}
              </div>
            </Reveal>
          </div>
        </Container>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-canvas"
        />
      </section>

      <Container className="pb-section">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-24">
          <LegalToc items={sections.map(({ id, title }) => ({ id, title }))} articleId={ARTICLE_ID} />

          <div className="flex min-w-0 max-w-3xl flex-col gap-12 sm:gap-16">
            <Reveal>
              <aside
                aria-labelledby="summary-heading"
                className="card-violet flex flex-col gap-5 rounded-panel border border-white/10 p-card shadow-panel sm:p-8"
              >
                <h2 id="summary-heading" className="type-h3 flex items-center gap-3 text-fg">
                  <SparkleIcon aria-hidden weight="fill" className="size-6 text-fg" />
                  The short version
                </h2>
                <ul className="flex flex-col gap-3">
                  {summary.map((point, i) => (
                    <li key={i} className="type-body flex gap-3 text-fg/90 [&_strong]:text-fg">
                      <span aria-hidden className="mt-[0.62em] size-1.5 shrink-0 rounded-full bg-fg/70" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </Reveal>

            <article id={ARTICLE_ID} className="flex flex-col">
              {sections.map((section, i) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-32 border-t border-line py-10 first:border-t-0 first:pt-0 sm:py-12"
                >
                  <h2 id={`${section.id}-heading`} className="type-h3 flex gap-3 text-fg sm:gap-4">
                    <span className="tabular-nums text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                    <span>{section.title}</span>
                  </h2>
                  <div className="type-prose mt-5 sm:pl-10">{section.body}</div>
                </section>
              ))}
            </article>

            <Reveal>
              <div className="flex flex-col items-start gap-4 rounded-panel border border-line bg-surface p-card shadow-panel sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex flex-col gap-1">
                  <p className="type-h4 text-fg">Questions about this page?</p>
                  <p className="type-small">Write to {LEGAL_NAME} and we&apos;ll get back to you.</p>
                </div>
                <Button href={`mailto:${COMPANY.email}`} variant="secondary">
                  <EnvelopeSimple aria-hidden weight="bold" className="size-4" />
                  {COMPANY.email}
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </>
  );
}
