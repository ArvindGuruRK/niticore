import {
  ArrowSquareOut,
  CalendarBlank,
  CalendarPlus,
  Clock,
  MapPin,
  MapTrifold,
  Storefront,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import content from "@/content/event.json";
import { CARD_TONES } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

const { event, visit } = content;

/** One fact on the pass: the icon and label on one line, the value underneath. */
function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <dt className="type-lead flex items-center gap-3 font-semibold text-fg-muted">
        <span aria-hidden className="text-tertiary">
          {icon}
        </span>
        {label}
      </dt>
      {children}
    </div>
  );
}

/**
 * The visit details as a pass: dates, hours and venue with the actions on the left, and a violet
 * stand tile on the right with the two stand numbers set large, since they are what a visitor needs
 * on the show floor.
 */
export function VisitPass() {
  const iconClass = "size-7";

  return (
    <Reveal>
      <div className="rounded-panel border border-line-strong bg-surface p-3 shadow-panel">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_minmax(18rem,24rem)]">
          <div className="flex flex-col justify-between gap-10 p-3 sm:p-6 lg:p-8">
            <dl className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
              <Fact icon={<CalendarBlank weight="duotone" className={iconClass} />} label={visit.datesLabel}>
                <dd className="type-h4 text-fg">{event.dates}</dd>
              </Fact>
              <Fact icon={<Clock weight="duotone" className={iconClass} />} label={visit.hoursLabel}>
                {event.hours.map((h) => (
                  <dd key={h.day} className="flex items-baseline gap-3 whitespace-nowrap">
                    <span className="type-body w-[5.5rem] text-fg-subtle">{h.day}</span>
                    <span className="type-body font-semibold text-fg tabular-nums">{h.time}</span>
                  </dd>
                ))}
                <dd className="type-small text-fg-subtle">{visit.timezone}</dd>
              </Fact>
              <Fact icon={<MapPin weight="duotone" className={iconClass} />} label={visit.venueLabel}>
                <dd className="type-h4 flex flex-col text-fg">
                  <span className="flex items-center gap-3">
                    {event.venueName}
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG from /public/flags, as in PhoneInput */}
                    <img
                      src={`/flags/${event.flag.code}.svg`}
                      alt={event.flag.alt}
                      width={30}
                      height={20}
                      className="h-5 w-[1.875rem] shrink-0 rounded-[3px] object-cover"
                    />
                  </span>
                  <span>{event.venueCity}</span>
                </dd>
              </Fact>
            </dl>

            <div className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
              <Button href="/ai-everything/calendar.ics" download size="lg" variant="secondary">
                <CalendarPlus aria-hidden weight="bold" className="size-4" />
                {visit.calendar}
              </Button>
              <Button href={event.directions} target="_blank" rel="noopener noreferrer" size="lg" variant="secondary">
                <MapTrifold aria-hidden weight="bold" className="size-4" />
                {visit.directionsLabel}
              </Button>
              <Button href={event.website} target="_blank" rel="noopener noreferrer" size="lg" variant="secondary">
                {visit.websiteLabel}
                <ArrowSquareOut aria-hidden weight="bold" className="size-4" />
              </Button>
            </div>
          </div>

          {/* The stand tile: what to look for on the floor */}
          <div
            className={cn(
              CARD_TONES.violet.className,
              "relative isolate flex min-h-64 flex-col justify-between gap-10 overflow-hidden rounded-[calc(var(--radius-panel)-0.25rem)] p-card sm:p-8",
            )}
          >
            <div aria-hidden className="grid-bg absolute inset-0 -z-10 opacity-40" />
            <Storefront
              aria-hidden
              weight="duotone"
              className="absolute -bottom-8 -right-6 -z-10 size-48 text-fg/10"
            />
            <p className="type-h2 text-fg">{visit.standsLabel}</p>
            <p className="flex flex-col gap-1">
              {event.standList.map((stand, i) => (
                <span key={stand} className="flex items-baseline gap-3">
                  <span className="type-h2 text-fg tabular-nums">{stand}</span>
                  {i < event.standList.length - 1 && (
                    <span aria-label="and" className="type-h3 text-fg/50">
                      +
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
