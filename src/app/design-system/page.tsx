import type { Metadata } from "next";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CountUp } from "@/components/motion/count-up";
import { FooterMark } from "@/components/motion/footer-mark";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { PinScrub } from "@/components/motion/pin-scrub";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { TextReveal } from "@/components/motion/text-reveal";
import { WarpHeading } from "@/components/motion/warp-heading";
import { DIST, DUR, EASE, STAGGER } from "@/lib/motion";
import { MotionShowcase } from "./showcase";

export const metadata: Metadata = {
  title: "NitiCore Design System",
  robots: { index: false },
};

const INK = [
  { name: "ink-950", role: "Canvas", hex: "#06011F", cls: "bg-ink-950" },
  { name: "ink-900", role: "Surface", hex: "#0C062B", cls: "bg-ink-900" },
  { name: "ink-800", role: "Raised", hex: "#140D3D", cls: "bg-ink-800" },
  { name: "ink-700", role: "Hover fill", hex: "#1D1552", cls: "bg-ink-700" },
  { name: "ink-600", role: "Strong fill", hex: "#2A2170", cls: "bg-ink-600" },
];

const SIGNAL = [
  { name: "signal-200", role: "Tint", hex: "#C5F7CB", cls: "bg-signal-200" },
  { name: "signal-300", role: "Hover", hex: "#8DF09A", cls: "bg-signal-300" },
  { name: "signal-400", role: "Brand accent", hex: "#4AE057", cls: "bg-signal-400" },
  { name: "signal-500", role: "Pressed", hex: "#38C946", cls: "bg-signal-500" },
  { name: "signal-600", role: "Deep", hex: "#27A336", cls: "bg-signal-600" },
];

const AURA = [
  { name: "aura-200", role: "Tint", hex: "#E4DBFF", cls: "bg-aura-200" },
  { name: "aura-300", role: "Soft", hex: "#C9B8FF", cls: "bg-aura-300" },
  { name: "aura-400", role: "Tertiary accent", hex: "#A98BFF", cls: "bg-aura-400" },
  { name: "aura-500", role: "Pressed", hex: "#8B68F5", cls: "bg-aura-500" },
  { name: "aura-600", role: "Deep, fills only", hex: "#6D4AD6", cls: "bg-aura-600" },
];

const TEXT = [
  { name: "fg", role: "Headlines, primary", hex: "#F2F0FB", cls: "bg-fg" },
  { name: "fg-muted", role: "Body copy", hex: "#CBC6E4", cls: "bg-fg-muted" },
  { name: "fg-subtle", role: "Captions", hex: "#A6A1C4", cls: "bg-fg-subtle" },
];

const STATUS = [
  { name: "status-ok", role: "Healthy", hex: "#4AE057", cls: "bg-status-ok" },
  { name: "status-warn", role: "Attention", hex: "#F5B544", cls: "bg-status-warn" },
  { name: "status-risk", role: "High risk", hex: "#FF6B7A", cls: "bg-status-risk" },
];

const TYPE_SCALE = [
  { token: "type-display", spec: "Sora 600 / 44 to 80px / lh 1.04 / -0.04em", cls: "type-display", sample: "Govern AI." },
  { token: "type-hero", spec: "Sora 600 / 36 to 58px / lh 1.08 / -0.035em", cls: "type-hero", sample: "Move fast with AI." },
  {
    token: "type-h2",
    spec: "Sora 600 / 30 to 44px / lh 1.12 / -0.03em",
    cls: "type-h2",
    sample: "Governance that travels with your AI.",
  },
  {
    token: "type-h3",
    spec: "Sora 600 / 22px / lh 1.25 / -0.02em",
    cls: "type-h3",
    sample: "One governance action, five frameworks closed.",
  },
  {
    token: "type-h4",
    spec: "Sora 600 / 18px / lh 1.3 / -0.015em",
    cls: "type-h4",
    sample: "Agent identity and autonomy scope",
  },
  {
    token: "type-lead",
    spec: "Manrope 500 / 17 to 20px / lh 1.6",
    cls: "type-lead max-w-[60ch]",
    sample: "Continuous visibility, reusable evidence, and agent guardrails, from first idea to production.",
  },
  {
    token: "type-body",
    spec: "Manrope 500 / 16px / lh 1.65",
    cls: "type-body max-w-[65ch]",
    sample:
      "Every control links to the frameworks it satisfies, so one piece of evidence closes several requirements at once.",
  },
  {
    token: "type-small",
    spec: "Manrope 500 / 14px / lh 1.6",
    cls: "type-small max-w-[65ch]",
    sample: "Tamper-evident audit dossiers, ready for the regulator the moment they ask.",
  },
  {
    token: "type-caption",
    spec: "Manrope 500 / 13px / lh 1.5 / fg-subtle",
    cls: "type-caption",
    sample: "Updated 4 minutes ago by the model owner",
  },
  {
    token: "type-label",
    spec: "Manrope 700 / 12px / 0.14em / uppercase",
    cls: "type-label text-accent",
    sample: "The operating layer for governed AI",
  },
];

const ANIMATIONS = [
  { name: "Hero load-in", where: "hero/hero-copy", trigger: "Page load", note: "Stagger rise, one element at a time" },
  { name: "Reveal", where: "motion/reveal", trigger: "Enters viewport, once", note: "Fade and rise, single block or staggered children" },
  { name: "Text reveal", where: "motion/text-reveal", trigger: "Scrubbed to scroll", note: "Words light up as the paragraph crosses" },
  { name: "Parallax", where: "motion/parallax", trigger: "Scrubbed to scroll", note: "Depth drift on imagery and panels" },
  { name: "Count up", where: "motion/count-up", trigger: "Enters viewport, once", note: "Scores and metrics tween from zero" },
  { name: "Pin and scrub", where: "motion/pin-scrub", trigger: "Pinned, scrubbed", note: "Base for the 7-stage governance loop" },
  { name: "Magnetic", where: "motion/magnetic", trigger: "Pointer proximity", note: "Primary CTA only, fine pointers" },
  { name: "Back to top", where: "motion/back-to-top", trigger: "Scrubbed ring, shows after 320px", note: "Circle button with page-progress ring, scrolls up via Lenis" },
  { name: "Nav float to dock", where: "site-nav", trigger: "Scrubbed, first 160px", note: "Floating panel widens to a full-width bar" },
  { name: "Smooth scroll", where: "motion/smooth-scroll", trigger: "Always on", note: "Lenis inertia on the GSAP ticker" },
  { name: "Governance Fabric", where: "illustrations/governance-fabric", trigger: "Load, pointer", note: "Canvas network for a later section: assemble, pulses, pointer repel" },
  { name: "Split heading", where: "motion/split-heading", trigger: "Enters viewport, once", note: "Masked line or word rise, re-splits on resize" },
  { name: "Scramble text", where: "motion/scramble-text", trigger: "Enters viewport, hover", note: "Characters decode from noise" },
  { name: "Text type", where: "motion/text-type", trigger: "Load, loops", note: "React Bits typewriter, cursor blink, reduced-motion safe" },
  { name: "Scramble word", where: "motion/scramble-word", trigger: "Hover (fine pointers)", note: "Word scrambles inside split text, width locked" },
  { name: "Media reveal", where: "motion/media-reveal", trigger: "Enters viewport, once", note: "Clip-path wipe with inner zoom settle" },
  { name: "Spotlight card", where: "motion/spotlight-card", trigger: "Pointer", note: "Cursor light on fill and border" },
  { name: "Tilt card", where: "motion/tilt-card", trigger: "Pointer", note: "3D tilt with moving sheen" },
  { name: "Score ring", where: "motion/score-ring", trigger: "Enters viewport, once", note: "Gauge sweep and count, status-coloured" },
  { name: "Bar meter", where: "motion/bar-meter", trigger: "Enters viewport, once", note: "Staggered coverage bars" },
  { name: "Draw path", where: "motion/draw-path", trigger: "Entry or scrubbed", note: "SVG stroke draw for connectors" },
  { name: "Marquee", where: "motion/marquee", trigger: "Always on, scroll velocity", note: "Seamless loop that reacts to scroll speed" },
  { name: "Timeline", where: "motion/timeline", trigger: "Scrubbed", note: "Progress line and lit nodes" },
  { name: "Accordion", where: "motion/accordion", trigger: "Click, keyboard", note: "Height tween, inert when closed" },
  { name: "Tabs", where: "motion/tabs", trigger: "Click, keyboard", note: "Sliding indicator, panel fade-rise" },
  { name: "Horizontal scroll", where: "motion/horizontal-scroll", trigger: "Pinned, scrubbed (lg+)", note: "Vertical scroll drives a sideways track" },
  { name: "Illustrations", where: "illustrations/*", trigger: "Load or enters viewport", note: "Doodle, Sparkle, Flourish, Annotate: self-drawing line art" },
  { name: "Footer mark", where: "motion/footer-mark", trigger: "Enters viewport, once, last in the footer", note: "Rise and settle; mark stays cropped to its top 70% via aspect ratio" },
];

const RESPONSIVE: [string, string, string][] = [
  ["Mobile", "320 to 639px", "Single column. Fabric sits under hero copy. Horizontal scroll is a swipe row. 44px touch targets."],
  ["Large phone", "sm, 640px", "Nav shows the Book a demo button. Gutter keeps growing fluidly."],
  ["Tablet", "md 768 to lg 1023px", "Two and three column grids begin. Nav still uses the menu. No pinned horizontal scroll on touch tablets."],
  ["Desktop", "lg 1024px and up", "Full nav, hero fabric on the right, wide data rows, pinned horizontal scroll."],
  ["px-page", "clamp(1rem, 0.6rem + 1.6vw, 2rem)", "Horizontal gutter. Clears notches through the safe-area tokens."],
  ["py-section", "clamp(4rem, 2.4rem + 6vw, 8rem)", "Vertical rhythm between sections. spacing-stack is the gap inside one."],
  ["Type scale", "clamp() per token", "Headings, lead and display scale fluidly. Body stays 16px."],
  ["Viewport", "dvh, viewport-fit=cover", "Full-height sections use dvh so the mobile URL bar never crops them. ScrollTrigger ignores URL-bar resizes."],
  ["Input", "hover and pointer media", "Pointer effects run on fine pointers only. Hover styles apply on hover-capable devices. Reduced motion removes all movement."],
];

const PIN_STEPS = [
  { title: "Discover", body: "Eliminate shadow AI with a live inventory of models, agents, vendors and data flows." },
  { title: "Classify", body: "Instant risk tiering, with EU AI Act Annex III and high-risk designations tagged for you." },
  { title: "Assess", body: "Quantified scoring across bias, privacy, security, hallucination and safety." },
];

const MOTION_TOKENS: [string, string][] = [
  ["Duration fast", `${DUR.fast}s`],
  ["Duration base", `${DUR.base}s`],
  ["Duration slow", `${DUR.slow}s`],
  ["Stagger", `${STAGGER}s`],
  ["Travel", `${DIST}px`],
  ["Ease out", EASE.out],
  ["Ease in-out", EASE.inOut],
  ["Scrub", "linear, 0.3 to 0.6s lag"],
];

type Swatch = { name: string; role: string; hex: string; cls: string };

function Swatches({ items }: { items: Swatch[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((s) => (
        <div key={s.name} className="flex flex-col gap-3">
          <div className={`${s.cls} h-20 rounded-field border border-line-strong`} />
          <div>
            <p className="text-sm font-bold text-fg">{s.name}</p>
            <p className="type-caption">
              {s.role}
              <br />
              {s.hex}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-line py-14">
      <div className="flex flex-col gap-2">
        <SplitHeading as="h2" className="type-h3 text-fg">
          {title}
        </SplitHeading>
        {note && <p className="type-body max-w-[65ch]">{note}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <>
    <SiteNav />
    <main className="pb-24 pt-28">
      <Container>
        <header className="flex flex-col items-start gap-6 pb-14">
          <Image src="/logo/niticore.svg" alt="NitiCore" width={156} height={38} className="h-9 w-auto" />
          <SplitHeading as="h1" by="words" trigger="load" className="type-hero max-w-3xl">
            Design system
          </SplitHeading>
          <SplitHeading as="p" trigger="load" delay={0.3} className="type-lead max-w-[60ch]">
            Dark by default. Green for action, violet for illustration, on a deep indigo canvas. Sora for headlines, Manrope for everything you
            read. Every value on this page is a token in globals.css or lib/motion.ts.
          </SplitHeading>
        </header>

        <Block
          title="Color"
          note="Brand inputs are canvas #06011F and accent #4AE057. Green is the action colour, violet (aura) is the tertiary accent for illustration and secondary highlights, never buttons. Use semantic roles in components, not raw ramps."
        >
          <div className="flex flex-col gap-8">
            <Swatches items={INK} />
            <Swatches items={SIGNAL} />
            <Swatches items={AURA} />
            <Swatches items={TEXT} />
            <Swatches items={STATUS} />
          </div>
          <p className="type-caption max-w-[65ch]">
            Contrast on canvas: fg 18.1:1, fg-muted 12.3:1, fg-subtle 8.3:1, accent 11.7:1, tertiary 7.6:1. Ink text on the accent
            button passes at 11.7:1. Status colors are for alerts and score states only.
          </p>
        </Block>

        <Block
          title="Typography"
          note="Two families. Sora carries display and headings at 600 with tight tracking. Manrope carries everything you read at 500, a touch heavier than regular so copy stays clear on the dark canvas."
        >
          <div className="flex flex-col divide-y divide-line">
            {TYPE_SCALE.map((t) => (
              <div key={t.token} className="grid gap-3 py-7 md:grid-cols-[15rem_1fr] md:gap-10">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-fg">{t.token}</p>
                  <p className="type-caption">{t.spec}</p>
                </div>
                <SplitHeading as="div" by={t.token === "type-label" ? "words" : "lines"} className={t.cls}>
                  {t.sample}
                </SplitHeading>
              </div>
            ))}
          </div>
        </Block>

        <Block
          title="Buttons"
          note="Pills. Labels stay on one line at every size. One label per intent across the page: Book a demo, Take the assessment."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" arrow>
              Book a demo
            </Button>
            <Button size="lg" variant="secondary">
              Take the assessment
            </Button>
            <Button size="lg" variant="ghost">
              Learn more
            </Button>
            <Button size="md">Book a demo</Button>
            <Button size="md" variant="secondary">
              Take the assessment
            </Button>
            <Button size="md" disabled>
              Disabled
            </Button>
          </div>
          <p className="type-caption">
            Hover lifts 1px and the arrow nudges. Press scales to 0.98. Focus shows a 2px green ring with a 3px offset.
            Tab through to check.
          </p>
        </Block>

        <Block title="Eyebrow" note="Pill label used in the hero. Sections use at most one eyebrow per three sections.">
          <Eyebrow className="self-start">The operating layer for governed AI</Eyebrow>
        </Block>

        <Block title="Shape and elevation" note="One rule set, applied everywhere.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-panel bg-surface p-6 shadow-panel">
              <p className="type-h3">Shape</p>
              <p className="type-body">Controls are pills. Panels are 20px. Form fields are 12px. Nothing else.</p>
            </div>
            <div className="flex flex-col gap-3 rounded-panel border border-accent/30 bg-accent/[0.06] p-6">
              <p className="type-h3">Elevation</p>
              <p className="type-body">
                Shadows are tinted to the canvas hue with a 1px inner highlight. No pure black shadows, no outer neon
                glow.
              </p>
            </div>
          </div>
        </Block>

        <Block
          title="Grid background"
          note="The grid-bg utility: 64px cells, hairline lines at 9% white, radial fade. Put it on an absolute, aria-hidden layer."
        >
          <div className="grid-bg h-40 rounded-panel border border-line" aria-hidden />
        </Block>

        <Block
          title="Motion"
          note="GSAP with ScrollTrigger, and Lenis for smooth scroll on the same ticker. Every animation reads the tokens below and respects prefers-reduced-motion."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MOTION_TOKENS.map(([k, v]) => (
              <div key={k} className="rounded-field border border-line px-4 py-3">
                <p className="type-caption">{k}</p>
                <p className="text-sm font-bold text-fg">{v}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col divide-y divide-line rounded-panel border border-line">
            {ANIMATIONS.map((a) => (
              <div key={a.name} className="grid gap-1 px-5 py-4 lg:grid-cols-[11rem_12rem_13rem_1fr] lg:gap-6">
                <p className="text-sm font-bold text-fg">{a.name}</p>
                <p className="type-caption">{a.where}</p>
                <p className="type-small">{a.trigger}</p>
                <p className="type-small">{a.note}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-12 pt-6">
            <div className="flex flex-col gap-3">
              <p className="type-caption">Reveal (single block)</p>
              <Reveal className="rounded-panel border border-line bg-surface p-6 shadow-panel">
                <p className="type-h3">Rises once when it enters the viewport.</p>
              </Reveal>
            </div>

            <div className="flex flex-col gap-3">
              <p className="type-caption">Reveal (stagger)</p>
              <Reveal stagger className="flex flex-wrap gap-3">
                {["Inventory", "Risk", "Controls", "Evidence", "Monitoring"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-control border border-line-strong px-4 py-2 text-sm font-semibold text-fg"
                  >
                    {chip}
                  </span>
                ))}
              </Reveal>
            </div>

            <div className="flex flex-col gap-3">
              <p className="type-caption">Text reveal (scrubbed)</p>
              <TextReveal
                className="type-h2 max-w-3xl text-fg"
                text="Most AI teams are over-governed on paper and under-governed in practice."
              />
            </div>

            <div className="flex flex-col gap-3">
              <p className="type-caption">Warp heading (hover, fine pointers only)</p>
              <WarpHeading
                as="p"
                className="type-h2 max-w-3xl text-fg"
                text="One governance action. Every framework satisfied."
              />
            </div>

            <div className="flex flex-col gap-3">
              <p className="type-caption">Count up</p>
              <div className="flex flex-wrap items-end gap-10">
                <p className="type-display text-accent">
                  <CountUp to={78} />
                  <span className="type-h3 text-fg-subtle"> / 100</span>
                </p>
                <p className="type-display text-fg">
                  <CountUp to={92.4} decimals={1} suffix="%" />
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="type-caption">Parallax (scrubbed)</p>
              <Parallax amount={14} className="h-64 rounded-panel border border-line">
                <div className="relative h-[140%] w-full">
                  <div aria-hidden className="grid-bg absolute inset-0" />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgb(74_224_87/0.22),transparent_70%)]"
                  />
                </div>
              </Parallax>
            </div>

            <div className="flex flex-col gap-3">
              <p className="type-caption">Footer mark (cropped to top 70%, reveals last)</p>
              <div className="rounded-panel border border-line bg-surface p-6">
                <FooterMark className="w-48" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="type-caption">Magnetic (hover with a mouse)</p>
              <div className="py-4">
                <Magnetic>
                  <Button size="lg" arrow>
                    Book a demo
                  </Button>
                </Magnetic>
              </div>
            </div>
          </div>

          <p className="type-caption max-w-[65ch]">
            Back to top and smooth scroll are live on this page now: scroll down and the progress ring button appears
            at the bottom right. Pin and scrub is the last block below.
          </p>
        </Block>

        <MotionShowcase />

        <Block
          title="Responsive system"
          note="Mobile first. Fluid tokens do most of the work, so breakpoints only change structure, never spacing."
        >
          <div className="flex flex-col divide-y divide-line rounded-panel border border-line">
            {RESPONSIVE.map(([k, v, n]) => (
              <div key={k} className="grid gap-1 px-5 py-4 lg:grid-cols-[11rem_14rem_1fr] lg:gap-6">
                <p className="text-sm font-bold text-fg">{k}</p>
                <p className="type-caption">{v}</p>
                <p className="type-small">{n}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Layout rules" note="Locked so later sections stay consistent with the hero.">
          <ul className="type-body grid list-disc gap-2 pl-5 md:grid-cols-2">
            <li>Container is max-w-7xl with a fluid 16 to 32px gutter (px-page), safe-area aware.</li>
            <li>Hero uses min-h-[100dvh], never h-screen. Top padding is capped at 6rem.</li>
            <li>Nav is one line, 64px tall.</li>
            <li>Breakpoints (mobile first): sm 640, md 768, lg 1024, xl 1280, 2xl 1536. Desktop layout starts at lg.</li>
            <li>Multi-column layouts collapse to one column below 768px. Wide data rows wait for lg.</li>
            <li>Z-index layers: nav 50, scroll progress and mobile menu 60. Nothing else.</li>
            <li>
              Footer uses <code>sticky top-[100dvh]</code>: it rises from behind the last section as you finish
              scrolling, instead of just following the scroll. No extra scroll distance or z-index trick needed.
            </li>
          </ul>
        </Block>

        <section className="border-t border-line pt-14">
          <div className="flex flex-col gap-2 pb-4">
            <h2 className="type-h3 text-fg">Pin and scrub</h2>
            <p className="type-body max-w-[65ch]">
              The block pins at the viewport top and scroll crossfades through the steps. This is the pattern for the
              7-stage governance loop.
            </p>
          </div>
          <PinScrub steps={PIN_STEPS} />
        </section>
      </Container>
    </main>
    </>
  );
}
