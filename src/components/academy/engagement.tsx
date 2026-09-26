import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { cn } from "@/lib/utils";

/** Node colours along the line: green, soft violet, violet (matching the gradient beneath them) */
const NODE = ["bg-accent", "bg-tertiary-soft", "bg-tertiary"];

type Model = { name: string; duration: string; kind: string; idealFor: string; outcome: string; cta: string };

/**
 * docs/content/05 §3: three engagement models, ordered by commitment (half-day, 6–8 weeks, monthly).
 * A line runs above the cards on lg so the step up in commitment reads as a scale: a brand gradient from
 * green (accent) through soft violet to violet (tertiary), each node the colour at its point on the line.
 * Brand colours, not status colours: the models are steps, not states.
 * Cards tilt toward the pointer. Every CTA leads to Book a demo.
 */
export function Engagement({ models }: { models: Model[] }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Commitment scale (lg): a line through one violet node above each card */}
      <div aria-hidden className="relative hidden grid-cols-3 gap-4 lg:grid">
        <span className="absolute left-[16.6%] right-[16.6%] top-1/2 h-0.5 -translate-y-1/2 rounded-control bg-gradient-to-r from-accent via-tertiary-soft to-tertiary" />
        {models.map((m, i) => (
          <span key={m.name} className={cn("relative mx-auto size-4 rounded-full ring-4 ring-canvas", NODE[i])} />
        ))}
      </div>

      <Reveal stagger className="grid gap-4 lg:grid-cols-3">
        {models.map((m) => (
          <TiltCard key={m.name} max={6} className="flex flex-col gap-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <p className="type-hero -ms-[0.03em] text-tertiary">{m.duration}</p>
              <p className="type-small">{m.kind}</p>
            </div>
            <h3 className="type-h3 text-fg">{m.name}</h3>
            <div className="flex flex-col gap-1">
              <p className="type-small font-semibold text-fg">Ideal for</p>
              <p className="type-body">{m.idealFor}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="type-small font-semibold text-fg">Outcome</p>
              <p className="type-body">{m.outcome}</p>
            </div>
            <Link
              href="/demo"
              className="group mt-auto inline-flex w-fit items-center gap-2 rounded-control text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
            >
              {m.cta}
              <ArrowRight weight="bold" aria-hidden className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" />
            </Link>
          </TiltCard>
        ))}
      </Reveal>
    </div>
  );
}
