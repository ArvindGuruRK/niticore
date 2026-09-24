import { Annotate } from "@/components/illustrations/annotate";
import { Drift } from "@/components/illustrations/drift";
import { GovernanceFabric } from "@/components/illustrations/governance-fabric";
import { Flourish } from "@/components/illustrations/flourish";
import { Petal } from "@/components/illustrations/petal";
import { Sparkle } from "@/components/illustrations/sparkle";
import { StarArc } from "@/components/illustrations/star-arc";
import { StarFive } from "@/components/illustrations/star-five";
import { FocusList } from "@/components/motion/focus-list";
import { LogStream } from "@/components/motion/log-stream";
import { EvidenceSimulator } from "@/components/frameworks/evidence-simulator";
import { FlowSteps } from "@/components/motion/flow-steps";
import { VerticalTabs } from "@/components/motion/vertical-tabs";
import { OrbitSteps } from "@/components/motion/orbit-steps";
import { Zigzag } from "@/components/illustrations/zigzag";
import { Accordion } from "@/components/motion/accordion";
import { BarMeter } from "@/components/motion/bar-meter";
import { DrawPath } from "@/components/motion/draw-path";
import { HorizontalScroll } from "@/components/motion/horizontal-scroll";
import { Marquee } from "@/components/motion/marquee";
import { MediaReveal } from "@/components/motion/media-reveal";
import { ScrollExpand } from "@/components/motion/scroll-expand";
import { VideoPlayer } from "@/components/ui/video-player";
import { ScoreRing } from "@/components/motion/score-ring";
import { ScrambleText } from "@/components/motion/scramble-text";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { SplitHeading } from "@/components/motion/split-heading";
import { Tabs } from "@/components/motion/tabs";
import { ScrambleWord } from "@/components/motion/scramble-word";
import TextType from "@/components/motion/text-type";
import { TiltCard } from "@/components/motion/tilt-card";
import { Timeline } from "@/components/motion/timeline";
import { AssessmentIndex } from "@/components/assessments/assessment-index";
import { MaturityLadder } from "@/components/assessments/maturity-ladder";
import { ReadinessCheck } from "@/components/assessments/readiness-check";
import assessments from "@/content/assessments.json";
import { ConfettiDemo } from "./confetti-demo";
import { RadarDemo } from "./radar-demo";

const FRAMEWORKS = ["EU AI Act", "NIST AI RMF", "ISO 42001", "SOC 2", "GDPR", "HIPAA", "DORA", "India DPDP"];

const COVERAGE = [
  { label: "EU AI Act", value: 92 },
  { label: "ISO 42001", value: 78 },
  { label: "NIST AI RMF", value: 64 },
  { label: "SOC 2", value: 41 },
];

const LOOP = [
  { meta: "Stage 01", title: "Discover", body: "A live inventory of every model, agent, vendor and data flow, so shadow AI has nowhere to hide." },
  { meta: "Stage 02", title: "Classify", body: "Instant risk tiering, with EU AI Act Annex III and high-risk designations tagged for you." },
  { meta: "Stage 03", title: "Assess", body: "Quantified scoring across bias, privacy, security, hallucination and safety." },
  { meta: "Stage 04", title: "Control", body: "Guardrails mapped to the frameworks they satisfy, enforced at runtime." },
];

const FAQ = [
  { id: "a", title: "How does one control close several frameworks?", content: "Each control links to every framework requirement it satisfies, so a single piece of evidence is reused across all of them." },
  { id: "b", title: "Can we export an audit dossier?", content: "Yes. Dossiers are tamper-evident and ready for the regulator the moment they ask." },
  { id: "c", title: "Do agents get their own identity?", content: "Every agent has an identity and an autonomy scope, reviewed on the same cadence as models." },
];

const HORIZONTAL = [
  { n: "01", t: "Inventory", d: "Every model, agent and vendor in one live register." },
  { n: "02", t: "Risk tiering", d: "Annex III and high-risk designations tagged on entry." },
  { n: "03", t: "Assessments", d: "Bias, privacy, security and safety scored side by side." },
  { n: "04", t: "Controls", d: "Guardrails linked to the frameworks they satisfy." },
  { n: "05", t: "Evidence", d: "Reusable proof, tamper-evident and audit-ready." },
];

function Demo({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-line py-14">
      <div className="flex flex-col gap-2">
        <SplitHeading as="h2" className="type-h3 text-fg">
          {title}
        </SplitHeading>
        <p className="type-body max-w-[65ch]">{note}</p>
      </div>
      {children}
    </section>
  );
}

/** Live demos of every component in components/motion beyond the original set. */
export function MotionShowcase() {
  return (
    <>
      <Demo
        title="Split heading"
        note="Masked line or word rise, on scroll or on load (trigger prop). Re-splits on resize and after fonts load, so the breaks are always right."
      >
        <SplitHeading className="type-h2 max-w-3xl text-fg">
          One governance action closes five frameworks at once.
        </SplitHeading>
      </Demo>

      <Demo
        title="Text type"
        note="Typewriter text from React Bits (reactbits.dev), adapted to TypeScript and our tokens. Types, holds, deletes and loops through an array. Our additions: stableLayout keeps long text on its final line breaks while typing, prefix keeps a fixed stem, typePrefix types that stem once on load, and the exit prop set to fade fades long text out instead of deleting it. Reserve the height for the longest text so nothing jumps. Reduced motion shows the first text static."
      >
        <TextType
          as="p"
          prefix="Niticore gives you "
          typePrefix
          exit="fade"
          startOnVisible
          text={[
            "agent governance, not just model governance: control what autonomous agents can execute, access and spend, with hard guardrails and human-in-the-loop gates.",
            "one board-ready Governance Readiness score that turns technical MLOps metrics and complex legal clauses into something management reads in 30 seconds.",
          ]}
          typingSpeed={16}
          deletingSpeed={6}
          pauseDuration={2800}
          initialDelay={400}
          stableLayout
          className="type-lead block min-h-[8em] max-w-[42rem] sm:min-h-[4.8em]"
          cursorCharacter={<span className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] rounded-[1px] bg-accent" />}
        />
      </Demo>

      <Demo
        title="Scramble word"
        note="A word that scrambles on hover and resolves back. Made for use inside SplitHeading, where the text is already split. Width is locked while it scrambles. Fine pointers only."
      >
        <SplitHeading className="type-h2 text-fg">
          Govern it with <ScrambleWord className="text-accent">confidence.</ScrambleWord>
        </SplitHeading>
      </Demo>

      <Demo title="Scramble text" note="Decodes from noise on entry, and again on hover with a fine pointer.">
        <p className="type-h2 text-accent">
          <ScrambleText text="Audit-ready in minutes." />
        </p>
      </Demo>

      <Demo title="Media reveal" note="Clip-path wipe with an inner zoom settle. Use for screenshots, dashboards and imagery.">
        <div className="grid gap-4 md:grid-cols-2">
          <MediaReveal direction="up" className="rounded-panel border border-line">
            <div className="relative h-56 bg-surface">
              <div aria-hidden className="grid-bg absolute inset-0" />
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgb(74_224_87/0.2),transparent_70%)]"
              />
              <p className="type-label absolute bottom-5 left-5 text-accent">Direction: up</p>
            </div>
          </MediaReveal>
          <MediaReveal direction="left" className="rounded-panel border border-line">
            <div className="relative h-56 bg-[linear-gradient(135deg,var(--color-ink-700),var(--color-ink-900))]">
              <p className="type-label absolute bottom-5 left-5 text-fg-muted">Direction: left</p>
            </div>
          </MediaReveal>
        </div>
      </Demo>

      <Demo
        title="Scroll expand"
        note="For video and hero media. The frame grows from 82% to full size as it scrolls to the middle of the screen, while the picture settles inside it. Scrubbed, so it reverses on scroll up. The player shows a Watch demo pill when idle and a glass control dock while playing."
      >
        <ScrollExpand className="aspect-video rounded-[2rem] border border-line shadow-panel">
          <VideoPlayer
            sources={[
              { src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm", type: "video/webm" },
              { src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", type: "video/mp4" },
            ]}
          />
        </ScrollExpand>
      </Demo>

      <Demo title="Spotlight card" note="A light follows the cursor and lights the border. Fine pointers only.">
        <div className="grid gap-4 md:grid-cols-3">
          {["Inventory", "Assessments", "Evidence"].map((t) => (
            <SpotlightCard key={t} className="flex flex-col gap-2">
              <p className="type-h4 text-fg">{t}</p>
              <p className="type-small">Move your mouse across the card to see the light follow.</p>
            </SpotlightCard>
          ))}
        </div>
      </Demo>

      <Demo title="Tilt card" note="3D tilt toward the pointer with a moving sheen. Springs back on leave. A still outer frame holds the perspective and reads the pointer while only the inner card rotates, so there is no jitter and no flicker at the edges. Put layout classes (flex-1) on frameClassName.">
        <div className="grid gap-4 md:grid-cols-2">
          <TiltCard className="flex flex-col gap-2">
            <p className="type-h4 text-fg">Governance score</p>
            <p className="type-small">Hover and move across the card.</p>
          </TiltCard>
          <TiltCard max={5} className="flex flex-col gap-2">
            <p className="type-h4 text-fg">Subtle tilt</p>
            <p className="type-small">The max prop caps rotation in degrees.</p>
          </TiltCard>
        </div>
      </Demo>

      <Demo title="Score ring and bar meter" note="Gauge and coverage bars sweep in once. Colour follows the score: ok, warn, risk.">
        <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-wrap gap-6">
            <ScoreRing value={82} />
            <ScoreRing value={58} size={120} label="Coverage" />
            <ScoreRing value={31} size={120} label="Risk" />
          </div>
          <BarMeter rows={COVERAGE} />
        </div>
      </Demo>

      <Demo
        title="Governance fabric"
        note="The spider-web network from the first hero, kept as a reusable canvas component. Nodes assemble, pulses travel the links, the pointer repels nearby nodes. align centres it in a panel or anchors it right for a split layout. Reserved for a later section."
      >
        <div className="relative h-[26rem] overflow-hidden rounded-panel border border-line bg-surface md:h-[34rem]">
          <div aria-hidden className="grid-bg absolute inset-0" />
          <GovernanceFabric align="center" className="absolute inset-0 size-full" />
        </div>
      </Demo>

      <Demo title="Draw path" note="SVG line draw, played once or scrubbed to scroll. Built for connectors and flow diagrams.">
        <DrawPath
          viewBox="0 0 800 120"
          paths={["M4 100 C 140 100, 140 20, 280 20 S 420 100, 560 60 S 700 20, 796 20"]}
          strokeWidth={3}
          className="max-w-3xl"
        />
      </Demo>

      <Demo
        title="Illustrations"
        note="Hand-drawn line art that draws itself with DrawSVG. Doodle is the base. Sparkle, Flourish, StarArc, StarFive, Petal, Zigzag and Annotate are built on it. Drift adds a slow idle bob and sway once a margin shape has drawn in (inner-page heroes: one shape per edge via PageDoodles). Colour comes from currentColor and is always text-tertiary (violet), underlines and marks included. Placement rule: keep them in the page margins, bleeding off the viewport edge, never between content blocks."
      >
        <div className="flex flex-wrap items-center gap-12">
          <Sparkle size={72} className="text-tertiary" />
          <Sparkle size={36} className="text-tertiary" delay={0.3} />
          <Flourish className="w-40 text-tertiary" strokeWidth={2.5} />
          <StarArc className="w-16 text-tertiary" strokeWidth={2.5} delay={0.2} />
          <Drift delay={1.8}>
            <StarFive className="w-28 text-tertiary" delay={0.3} />
          </Drift>
          <Drift delay={2} amount={8}>
            <Petal className="w-28 text-tertiary" delay={0.5} />
          </Drift>
          <Zigzag className="w-32 text-tertiary" delay={0.7} />
          <Annotate target="[data-mark]" trigger="view" delay={0.4} className="type-h2 text-fg">
            <p>
              Governed <span data-mark="" className="inline-block">AI agents</span>
            </p>
          </Annotate>
          <Annotate target="[data-mark]" variant="double" trigger="view" delay={0.6} className="type-h2 text-fg">
            <p>
              Satisfy <span data-mark="" className="inline-block">all.</span>
            </p>
          </Annotate>
        </div>
      </Demo>

      <Demo
        title="Focus list"
        note="Numbered rows that brighten while they cross the middle of the screen and dim once passed, so one row is in focus at a time. The number turns green when lit. Used for the Platform page's five questions."
      >
        <FocusList
          className="max-w-3xl border-b border-line"
          items={[
            { meta: "01", title: "What AI do we actually have?", body: "Models, apps, agents, vendor tools and shadow AI." },
            { meta: "02", title: "What could go wrong?", body: "Privacy leaks, bias, jailbreaks and hallucination." },
            { meta: "03", title: "Who is accountable?", body: "Clear RACI ownership for every system." },
          ]}
        />
      </Demo>

      <Demo
        title="Orbit steps"
        note="Steps on a loop. A green arc and a comet dot travel forwards to the active node; the centre and the panel swap with a fade-rise. Auto-advances every 3.5s while on screen, with a green progress line filling under the panel, until someone clicks or uses the arrow keys. Reduced motion: no autoplay. Used for the 7-stage lifecycle."
      >
        <OrbitSteps
          steps={[
            { title: "Discover", question: "What AI exists?", points: ["Find every model, agent and vendor tool."] },
            { title: "Classify", question: "What is it?", points: ["Automated risk tiering."] },
            { title: "Assess", question: "What could go wrong?", points: ["Multi-dimensional risk scoring."] },
            { title: "Govern", question: "What controls apply?", points: ["One control, many frameworks."] },
            { title: "Evidence", question: "Can we prove it?", points: ["File once, satisfy everywhere."] },
          ]}
        />
      </Demo>

      <Demo
        title="Log stream"
        note="A macOS terminal window (close, minimize, zoom lights) in JetBrains Mono. The command types itself at the prompt, log lines print instantly one by one with an optional time column and a fixed-width level column, a fresh prompt returns with a blinking block cursor, then it clears and loops, only while on screen. Reduced motion shows the finished screen, still. Used for the Platform page's agent run."
      >
        <LogStream
          className="max-w-xl"
          title="agents — niticore watch — zsh"
          command="niticore watch agent"
          lines={[
            { level: "info", text: "agent run started" },
            { level: "allow", text: "database read · within granted privileges" },
            { level: "warn", text: "action exceeds pre-approved authority cap" },
            { level: "block", text: "circuit breaker tripped · action halted" },
          ]}
        />
      </Demo>

      <Demo
        title="Evidence simulator"
        note="One action fans out to many targets: the action pulses, green wires draw to each target in turn (lg+) and each card ticks from Waiting to Satisfied, then the tally rises. Plays each time it scrolls into view, resetting only once fully off screen. Reduced motion shows the finished state. Used on the Frameworks page."
      >
        <EvidenceSimulator
          action={{ title: "Bias audit completed", subject: "Clinical decision model" }}
          targets={[
            { framework: "EU AI Act", clause: "Art. 9 Risk Management", logo: "/eu-iso-act-logos/eu-ai-act.webp" },
            { framework: "ISO/IEC 42001", clause: "§6.1.2 Risk Treatment", logo: "/eu-iso-act-logos/iso-42001.webp" },
            { framework: "NIST AI RMF", clause: "MAP 2.3 & MEASURE 2.6", logo: "/eu-iso-act-logos/nist-rmf.webp" },
            { framework: "GDPR", clause: "Art. 22 Automated Decisions", logo: "/eu-iso-act-logos/gdpr.svg" },
            { framework: "DIFC Reg 10", clause: "AI Impact Assessment", logo: null },
          ]}
          summary={[
            { value: 1, label: "evidence filing" },
            { value: 5, label: "regulations covered" },
            { value: 0, label: "duplicated work" },
          ]}
        />
      </Demo>

      <Demo
        title="Vertical tabs"
        note="Side tabs: the selected option is raised and the panel fades up on each switch. With interval, it advances by itself while on screen (green line filling along the selected tab) and never stops; a click jumps to that tab and the countdown carries on. Arrow keys, Home and End. Stacks below lg. Used for the Frameworks explorer."
      >
        <VerticalTabs
          label="Demo"
          interval={3}
          tabs={["EU AI Act", "ISO/IEC 42001", "NIST AI RMF"].map((name, i) => ({
            id: `demo-${i}`,
            label: <span key={name} className="type-h4 text-fg">{name}</span>,
            content: (
              <div key={name} className="card-blue rounded-panel border border-white/10 p-8">
                <p className="type-h2 text-fg">{name}</p>
              </div>
            ),
          }))}
        />
      </Demo>

      <Demo
        title="Flow steps"
        note="A chain of linked steps. Scrolling fills a green line through the nodes and each node lights as it is reached; scrolling back un-lights them. Horizontal from lg, vertical below. Used for the regulation-to-evidence pipeline."
      >
        <FlowSteps
          steps={[
            { title: "Regulation", body: "Statutory obligation" },
            { title: "Risk", body: "AI failure mode" },
            { title: "Control", body: "Enforceable gate" },
            { title: "Owner", body: "Accountable role" },
            { title: "Evidence", body: "Verifiable artifact" },
          ]}
        />
      </Demo>

      <Demo
        title="Radar chart and live number"
        note="Spider graph that grows out from the centre on first view, then morphs to every new set of values. Rings can mark uneven bands (here the five readiness levels) and one axis can be lit. The live number rolls from its old value to each new one. Reduced motion snaps both. Used in the readiness check."
      >
        <RadarDemo />
      </Demo>

      <Demo
        title="Confetti"
        note="canvas-confetti in the brand palette (violet, signal green, fg white), drawn above the nav. celebrate() fires two cannons from the lower corners, twice. Reserve it for finishing a whole flow, never for single actions. Nothing fires under reduced motion. Used once by the readiness check, when all six questions are answered."
      >
        <ConfettiDemo />
      </Demo>

      <Demo
        title="Maturity ladder"
        note="A signal meter: five equal-width bars, each taller than the last and each in a card tone (violet, blue, green, violet, blue, with the ruler segment matching, glossy with a bright top edge), on a ruler of five equal segments labelled with their score bands. One entrance timeline raises the bars in turn, drops the numbers in, draws the ruler and lifts the panel. Then it plays by itself, climbing one level every few seconds and lighting every bar up to it like signal strength (fills climb bar by bar, the current bar lifts, the ruler fills, the panel fades up); after level 5 it drains back to 1 and loops. It runs whenever it is on screen (hover does not pause it), and a click or arrow key jumps to a level and carries on from there. All five panels share one grid cell, so the card never changes height while it plays. No autoplay under reduced motion. Used on the Assessments page."
      >
        <MaturityLadder levels={assessments.model.levels} />
      </Demo>

      <Demo
        title="Readiness check"
        note="Question card with a live readout. The two panels rise in turn on entry and the answers cascade in. No Next button: picking an answer (click, tap or keys 1 to 5) pops its number, grows its staircase and moves on by itself. Left unanswered for a few seconds, a highlight runs down the answers to invite a pick. Only finishing all six sets off confetti. Progress segments fill and drain, each question slides in from the side you are heading with its answers cascading, the level line flips on every level change, and the radar and score redraw. The result reveals in stages: one bar in five equal level shares, with thin divider lines between them, fills green to the score (placed within its level by how far into the band it is) while the score pin rides its tip, level names centred under their shares in white, then the focus cards rise."
      >
        <ReadinessCheck
          levels={assessments.model.levels}
          dimensions={assessments.check.dimensions}
          result={assessments.check.result}
        />
      </Demo>

      <Demo
        title="Assessment index"
        note="Questions on the left, a sticky spec sheet on the right. Rows slide in one by one on entry and a raised highlight glides between rows with the selection. On lg it plays by itself, moving to the next assessment every few seconds while on screen (hover never pauses it), with a violet countdown line along the highlight; a click restarts it from that row. Each switch fades the sheet up, cascades the deliverables and pops the tags; the clock arc sweeps to the length out of an hour while the minutes roll (the open-ended one is a dashed full ring). Below lg the sheet opens inline under its question."
      >
        <AssessmentIndex assessments={assessments.suite.assessments} />
      </Demo>

      <Demo title="Marquee" note="Seamless loop. Scroll speed pushes it faster and scrolling up reverses it. Hover pauses.">
        <Marquee speed={50}>
          {FRAMEWORKS.map((f) => (
            <span key={f} className="mr-4 rounded-control border border-line-strong px-5 py-2 text-sm font-semibold text-fg">
              {f}
            </span>
          ))}
        </Marquee>
      </Demo>

      <Demo title="Timeline" note="The line fills with scroll and each node lights as it is reached.">
        <Timeline items={LOOP} />
      </Demo>

      <Demo title="Accordion" note="Height and icon tweened by GSAP. Closed panels are inert. Set multiple to allow several open.">
        <Accordion items={FAQ} defaultOpen={["a"]} className="max-w-3xl" />
      </Demo>

      <Demo title="Tabs" note="Sliding pill indicator, fade-rise panel swap, arrow keys, Home and End.">
        <Tabs
          tabs={[
            { id: "disc", label: "Discover", content: <p className="type-body max-w-[60ch]">A live inventory of models, agents, vendors and data flows.</p> },
            { id: "asse", label: "Assess", content: <p className="type-body max-w-[60ch]">Quantified scoring across bias, privacy, security and safety.</p> },
            { id: "evid", label: "Evidence", content: <p className="type-body max-w-[60ch]">Reusable, tamper-evident proof ready for the regulator.</p> },
          ]}
        />
      </Demo>

      <section className="border-t border-line pt-14">
        <div className="flex flex-col gap-2 pb-4">
          <h2 className="type-h3 text-fg">Horizontal scroll</h2>
          <p className="type-body max-w-[65ch]">
            Pins and drives the cards sideways on lg (1024px) and up. On phones and under reduced motion it is a native swipe row.
          </p>
        </div>
        <HorizontalScroll>
          {HORIZONTAL.map((c) => (
            <SpotlightCard key={c.n} className="flex min-h-56 w-[80vw] shrink-0 flex-col justify-between lg:w-[26rem]">
              <p className="type-caption tabular-nums">{c.n}</p>
              <div className="flex flex-col gap-2">
                <p className="type-h3 text-fg">{c.t}</p>
                <p className="type-small">{c.d}</p>
              </div>
            </SpotlightCard>
          ))}
        </HorizontalScroll>
      </section>
    </>
  );
}
