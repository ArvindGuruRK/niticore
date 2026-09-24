import type { ReactNode } from "react";
import { Annotate } from "@/components/illustrations/annotate";
import { Sparkle } from "@/components/illustrations/sparkle";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { PageDoodles, type DoodleShape } from "./page-doodles";

/**
 * Inner-page hero, after the Postiz reference: a violet sparkle over a centred display headline, a
 * violet double underline under the key word, and hand-drawn shapes bleeding off both edges. Same
 * flat canvas and grid as the landing hero. No eyebrow and no buttons: "Book a demo" lives in the nav.
 */
export function PageHero({
  title,
  lead,
  doodles,
}: {
  /** Static markup for SplitHeading. Colour the key phrase with text-accent, and put
   *  data-accent on one short inline-block word inside it: that word gets the underline. */
  title: ReactNode;
  lead: string;
  doodles: { left: DoodleShape; right: DoodleShape };
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
      <PageDoodles {...doodles} />

      <div className="px-page">
        <div className="mx-auto flex min-h-[88svh] max-w-7xl items-center justify-center px-4 pb-section pt-[calc(9rem+var(--safe-top))] sm:px-5 sm:pt-40 lg:px-6">
          <div className="flex w-full max-w-5xl flex-col items-center gap-7 text-center">
            <Sparkle size={64} trigger="load" delay={0.5} className="text-tertiary" />
            <Annotate target="[data-accent]" variant="double" delay={1.3} className="w-full">
              <SplitHeading as="h1" by="words" trigger="load" delay={0.15} className="type-display text-fg">
                {title}
              </SplitHeading>
            </Annotate>
            <Reveal delay={0.5}>
              <p className="type-lead max-w-3xl text-[clamp(1.125rem,1rem+0.55vw,1.4375rem)]">{lead}</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Blend the grid into the first section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-canvas"
      />
    </section>
  );
}
