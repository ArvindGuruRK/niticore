import type { Icon } from "@phosphor-icons/react";
import { Fingerprint } from "@phosphor-icons/react/dist/ssr/Fingerprint";
import { Gauge } from "@phosphor-icons/react/dist/ssr/Gauge";
import { HandPalm } from "@phosphor-icons/react/dist/ssr/HandPalm";
import { Plugs } from "@phosphor-icons/react/dist/ssr/Plugs";
import { Prohibit } from "@phosphor-icons/react/dist/ssr/Prohibit";
import { Waveform } from "@phosphor-icons/react/dist/ssr/Waveform";
import { Circle } from "@/components/illustrations/circle";
import { MediaReveal } from "@/components/motion/media-reveal";
import { Reveal } from "@/components/motion/reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { WarpHeading } from "@/components/motion/warp-heading";
import { Container } from "@/components/ui/container";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

type Pillar = {
  tag: string;
  title: string;
  description: string;
  icon: Icon;
  tone: CardTone;
  /** Placeholder photography standing in for a product screenshot/clip */
  image: string;
  alt: string;
};

/** Every placeholder photo is cropped to the same 4:3 box at the source, so no card's image is
 * naturally taller than another's and every StackCard can share one plain height pattern. */
const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=1200&h=900&fit=crop&auto=format`;

/** The 6 pillars from docs/content/02 §4 and the wireframe's §7, "Dedicated Agentic AI Governance". */
const PILLARS: Pillar[] = [
  {
    tag: "Identity",
    title: "Agent Identity",
    description: "Cryptographic agent ID, verified owner, and delegated role for every autonomous system.",
    icon: Fingerprint,
    tone: "blue",
    image: IMG("1518770660439-4636190af475"),
    alt: "Close-up of code on a dark terminal screen",
  },
  {
    tag: "Autonomy",
    title: "Autonomy Scope",
    description: "Explicit execution boundaries and pre-authorised budgets, set before an agent runs.",
    icon: Gauge,
    tone: "violet",
    image: IMG("1551288049-bebda4e38f71"),
    alt: "Analytics dashboard with charts and metrics",
  },
  {
    tag: "Access",
    title: "Tools & API Access",
    description:
      "Fine-grained endpoint permissions and database privilege locks — an agent only ever reaches what it's scoped to reach.",
    icon: Plugs,
    tone: "green",
    image: IMG("1504384308090-c894fdcc538d"),
    alt: "Server racks in a data centre",
  },
  {
    tag: "Guardrails",
    title: "Hard Guardrails",
    description: "Constraints hardcoded into the agent, not the prompt.",
    icon: Prohibit,
    tone: "blue",
    image: IMG("1550751827-4bd374c3f58b"),
    alt: "Padlock resting on a dark keyboard",
  },
  {
    tag: "Oversight",
    title: "Human-in-the-Loop",
    description: "Automated escalation gates route irreversible actions to a human for confirmation before they execute.",
    icon: HandPalm,
    tone: "violet",
    image: IMG("1521737711867-e3b97375f902"),
    alt: "Two people reviewing a decision together",
  },
  {
    tag: "Telemetry",
    title: "Runtime Telemetry",
    description: "Live execution logs surface behavioural drift instantly, with an instant kill-switch.",
    icon: Waveform,
    tone: "green",
    image: IMG("1526374965328-7f61d4dc18c5"),
    alt: "Streams of green code, matrix-style",
  },
];

/** Badge sized to match the reference: a roomy pill, not a tiny caption chip. */
function Header({ pillar }: { pillar: Pillar }) {
  const Glyph = pillar.icon;
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 py-2 pl-3 pr-4">
      <Glyph weight="fill" className="size-4 text-fg" aria-hidden />
      <TextReveal as="span" text={pillar.tag} className="text-sm font-bold uppercase tracking-wide text-fg" />
    </span>
  );
}

function Title({ pillar }: { pillar: Pillar }) {
  return (
    <div className="flex flex-col gap-2">
      <TextReveal
        as="h3"
        text={pillar.title}
        className="font-display text-4xl font-semibold leading-none tracking-[-0.03em] text-fg"
      />
      <TextReveal text={pillar.description} className="text-base font-medium leading-snug text-fg/85" />
    </div>
  );
}

function Media({ pillar, className }: { pillar: Pillar; className?: string }) {
  return (
    <MediaReveal direction="down" className={cn("min-h-0 rounded-xl", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- external placeholder, swap for the real asset later */}
      <img src={pillar.image} alt={pillar.alt} loading="lazy" className="size-full object-cover" />
    </MediaReveal>
  );
}

/**
 * Vertically stacked card. `imageFirst` flips the media above the text instead of below it, so a
 * paired row can alternate rhythm (text-top / image-top) instead of every card reading identically.
 * Every stack card is h-full with an uncapped min-h media area — every placeholder photo is
 * pre-cropped to the same aspect ratio (see IMG above), so none of them naturally runs taller.
 */
function StackCard({ pillar, imageFirst = false }: { pillar: Pillar; imageFirst?: boolean }) {
  const text = (
    <>
      <Header pillar={pillar} />
      <Title pillar={pillar} />
    </>
  );
  const media = <Media pillar={pillar} className="min-h-44 flex-1 sm:min-h-52" />;
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-panel border border-white/10 p-6 shadow-panel sm:p-7",
        CARD_TONES[pillar.tone].className,
      )}
    >
      {imageFirst ? (
        <>
          {media}
          <div className="flex flex-col gap-4">{text}</div>
        </>
      ) : (
        <>
          {text}
          {media}
        </>
      )}
    </div>
  );
}

/**
 * Full-width card, text left / media right. Unlike StackCard's rows, the text column is vertically
 * centred within the card's height (not top-aligned) — that's the "centre" this card means.
 */
function CenterCard({ pillar }: { pillar: Pillar }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-panel border border-white/10 p-card shadow-panel sm:flex-row sm:items-stretch sm:p-7",
        CARD_TONES[pillar.tone].className,
      )}
    >
      <div className="flex flex-col justify-center gap-4 sm:w-[38%] sm:shrink-0">
        <Header pillar={pillar} />
        <Title pillar={pillar} />
      </div>
      <Media pillar={pillar} className="min-h-52 flex-1 sm:min-h-0" />
    </div>
  );
}

/**
 * Section 6 of docs/content/08: "AI agents don't just predict. They take action." Bento rhythm
 * lifted from the inspiration's "All the tools required..." grid: a wide/narrow pair, then a
 * full-width centred card, repeated. Each row alternates text-top and image-top stack cards instead
 * of repeating the same layout six times, and the two full-width cards centre their content instead
 * of splitting it left/right. Images are placeholder photography (MediaReveal wipes them in
 * bottom-to-top) until real product screenshots or clips replace them. Uses the shared card tones
 * (card-blue / card-violet / card-green).
 */
export function AgenticGovernance() {
  return (
    <section aria-labelledby="agentic-heading" className="pb-section">
      <Container className="flex flex-col items-center text-center">
        <Circle target="[data-circle]" trigger="view" delay={0.3} markClassName="text-tertiary">
          <WarpHeading
            id="agentic-heading"
            text="AI agents don't just predict. They take action."
            className="type-h2 max-w-2xl text-fg"
          >
            <span data-circle="">AI agents</span> don&apos;t just predict. They take action.
          </WarpHeading>
        </Circle>
      </Container>
      <Container className="mt-10 sm:mt-14">
        <Reveal stagger className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <StackCard pillar={PILLARS[0]} />
            </div>
            <div className="lg:col-span-2">
              <StackCard pillar={PILLARS[1]} imageFirst />
            </div>
          </div>
          <CenterCard pillar={PILLARS[2]} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <StackCard pillar={PILLARS[3]} imageFirst />
            </div>
            <div className="lg:col-span-3">
              <StackCard pillar={PILLARS[4]} />
            </div>
          </div>
          <CenterCard pillar={PILLARS[5]} />
        </Reveal>
      </Container>
    </section>
  );
}
