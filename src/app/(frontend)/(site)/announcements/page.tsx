import type { Metadata } from "next";
import Image from "next/image";
import boothImage from "../../../../../public/event-image/event_stall.png";
import { VisitPass } from "@/components/event/visit-pass";
import { Countdown } from "@/components/motion/countdown";
import { Reveal } from "@/components/motion/reveal";
import { ScrollExpand } from "@/components/motion/scroll-expand";
import { SplitHeading } from "@/components/motion/split-heading";
import { Container } from "@/components/ui/container";
import content from "@/content/event.json";
import { pageMetadata } from "@/lib/site";

const base = pageMetadata("/announcements");

export const metadata: Metadata = {
  ...base,
  openGraph: { ...base.openGraph, images: [{ url: boothImage.src, width: boothImage.width, height: boothImage.height }] },
};

const { event, intro, countdown, booth } = content;

/**
 * /announcements: currently AI Everything Abu Dhabi, linked from the announcement bar. One quiet screen, like Book a demo:
 * the headline and a line on what to expect at the stand (with a countdown beside it on lg), the
 * visit pass (details and actions), then the stand itself. No hero section.
 */
export default function AiEverythingPage() {
  return (
    <section aria-labelledby="event-heading" className="relative isolate">
      <div aria-hidden className="grid-bg absolute inset-x-0 top-0 -z-10 h-[70vh]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[calc(70vh-8rem)] -z-10 h-32 bg-gradient-to-b from-transparent to-canvas"
      />

      <Container className="flex flex-col gap-10 pb-section pt-[calc(8rem+var(--safe-top))] sm:gap-12 sm:pt-36 lg:pt-40">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-4">
            <SplitHeading as="h1" id="event-heading" by="words" trigger="load" className="type-h2 text-fg">
              Meet Niticore at AI Everything <span className="text-accent">Abu Dhabi.</span>
            </SplitHeading>
            <Reveal delay={0.3}>
              <p className="type-lead max-w-2xl">{intro.lead}</p>
            </Reveal>
          </div>
          <Reveal delay={0.5} className="lg:justify-self-end">
            <Countdown
              start={event.start}
              end={event.end}
              label={countdown.before}
              live={countdown.live}
              after={countdown.after}
              dateLabel="6 October 2026, 11:00 Abu Dhabi time"
              className="items-start"
            />
          </Reveal>
        </div>

        <VisitPass />

        <ScrollExpand from={0.9} className="rounded-panel border border-line-strong shadow-panel">
          <Image
            src={boothImage}
            alt={booth.alt}
            placeholder="blur"
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="h-auto w-full"
          />
        </ScrollExpand>
      </Container>
    </section>
  );
}
