import Image from "next/image";
import type { Icon } from "@phosphor-icons/react";
import { Bank } from "@phosphor-icons/react/dist/ssr/Bank";
import { Buildings } from "@phosphor-icons/react/dist/ssr/Buildings";
import { Marquee } from "@/components/motion/marquee";
import { SpotlightCard } from "@/components/motion/spotlight-card";

/**
 * Card colours. `base` is the fixed gradient. `light` is the solid disc that follows the cursor, in a
 * contrast colour: violet on green cards, green on violet and blue cards (space-separated RGB).
 * All three sit on the design-system ramps (ink, aura, signal).
 */
const TONES = {
  blue: { base: ["#1a1260", "#2f2a8c"], light: "31 138 49" },
  violet: { base: ["#4a33b8", "#7654e0"], light: "31 138 49" },
  green: { base: ["#0f4a1d", "#1f8a31"], light: "139 104 245" },
} as const;

type Tone = keyof typeof TONES;

type Framework = {
  name: string;
  /** The headline figure on the card: the one fact worth reading at a glance */
  stat: string;
  note: string;
  tone: Tone;
  /** Mark from public/eu-iso-act-logos. Frameworks without one fall back to an icon tile */
  logo?: string;
  icon?: Icon;
};

const L = (file: string) => `/eu-iso-act-logos/${file}`;

/** Row one: the global standards. It travels left to right. */
const GLOBAL: Framework[] = [
  { name: "EU AI Act", stat: "2024/1689", note: "Annex III risk classifier and FRIA templates", tone: "violet", logo: L("eu-ai-act.webp") },
  { name: "ISO/IEC 42001", stat: "Clauses 4–10", note: "Clause-by-clause mapping and audit dry-runs", tone: "blue", logo: L("iso-42001.webp") },
  { name: "NIST AI RMF", stat: "4 functions", note: "Govern, Map, Measure and Manage, cross-mapped to the EU AI Act", tone: "green", logo: L("nist-rmf.webp") },
  { name: "GDPR", stat: "Art. 22", note: "DPIA workflows and automated-decision controls", tone: "violet", logo: L("gdpr.svg") },
  { name: "ISO/IEC 27001", stat: "ISMS", note: "Information security management system controls", tone: "blue", logo: L("iso-27001.webp") },
  { name: "SOC 2", stat: "Type II", note: "Trust services criteria for service organisations", tone: "green", logo: L("soc2.svg") },
  { name: "HIPAA", stat: "US health data", note: "Safeguards for protected health information", tone: "violet", logo: L("hipaa.svg") },
  { name: "PCI-DSS", stat: "Payment cards", note: "Security standard for cardholder data", tone: "blue", logo: L("pci-dss.svg") },
  { name: "NIST CSF", stat: "Cybersecurity", note: "Outcome-based framework for managing cyber risk", tone: "green", logo: L("nist-csf.svg") },
];

/** Row two: regional law and sector rules. It travels right to left. */
const REGIONAL: Framework[] = [
  { name: "DIFC Regulation 10", stat: "Jan 2026", note: "In enforcement. AI Impact Assessment and AI Systems Officer workflows", tone: "green", icon: Buildings },
  { name: "UAE PDPL", stat: "Jan 2027", note: "Federal deadline. GDPR controls cross-mapped to PDPL articles", tone: "violet", logo: L("uae.svg") },
  { name: "ADGM DPR 2021", stat: "FSRA", note: "Algorithmic risk mapping with instant evidence reuse", tone: "blue", icon: Bank },
  { name: "Saudi PDPL", stat: "Saudi Arabia", note: "Personal data protection law of the Kingdom", tone: "green", logo: L("saudi.svg") },
  { name: "Qatar PDPL", stat: "Qatar", note: "Personal data privacy protection law", tone: "violet", logo: L("qatar.svg") },
  { name: "Bahrain PDPL", stat: "Bahrain", note: "Personal data protection law of the Kingdom", tone: "blue", logo: L("bahrain.svg") },
  { name: "DORA", stat: "EU finance", note: "Digital operational resilience for financial entities", tone: "green", logo: L("dora.svg") },
  { name: "CCPA", stat: "California", note: "Consumer privacy rights for California residents", tone: "violet", logo: L("ccpa.svg") },
  { name: "OECD AI Principles", stat: "Trustworthy AI", note: "Intergovernmental principles for responsible AI", tone: "blue", logo: L("oecd.svg") },
  { name: "SR 11-7", stat: "Model risk", note: "US supervisory guidance on model risk management", tone: "green", logo: L("sr-11-7.svg") },
  { name: "SS1/23", stat: "PRA", note: "UK model risk management principles for banks", tone: "violet", logo: L("ss1-23.svg") },
];

const grad = ([a, b]: readonly [string, string]) => `linear-gradient(135deg, ${a}, ${b})`;

function Mark({ f }: { f: Framework }) {
  if (f.logo) {
    return (
      <Image
        src={f.logo}
        alt=""
        width={96}
        height={96}
        className="size-12 shrink-0 object-contain [filter:drop-shadow(0_0_1px_rgb(255_255_255/0.6))] transition-transform duration-300 ease-out-expo group-hover/card:scale-110"
      />
    );
  }
  const Glyph = f.icon!;
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/15 text-fg ring-1 ring-inset ring-white/20 transition-transform duration-300 ease-out-expo group-hover/card:scale-110">
      <Glyph weight="fill" className="size-6" aria-hidden />
    </span>
  );
}

function FrameworkCard({ f }: { f: Framework }) {
  const tone = TONES[f.tone];
  return (
    <li className="group/card mr-3 h-48 w-[17.5rem] shrink-0 sm:mr-4 sm:w-80">
      {/* Spotlight: a solid contrast-coloured disc follows the cursor; the rest of the card keeps its colour */}
      <SpotlightCard
        light={tone.light}
        solid
        className="flex h-full flex-col border-white/10 p-5 shadow-none sm:p-6"
        style={{ backgroundImage: grad(tone.base) }}
      >
        {/* The act comes first: its mark and name lead the card */}
        <div className="flex items-center gap-3">
          <Mark f={f} />
          <h3 className="type-h4 text-fg">{f.name}</h3>
        </div>
        <div className="mt-auto">
          <p className="font-display text-[1.75rem] font-semibold leading-none tracking-[-0.04em] text-fg sm:text-[2rem]">
            {f.stat}
          </p>
          <p className="mt-2 text-sm font-medium leading-snug text-fg/90">{f.note}</p>
        </div>
      </SpotlightCard>
    </li>
  );
}

/** One lane. The set repeats so a single copy is always wider than the screen; repeats are hidden from assistive tech. */
function Lane({ items, reps, direction, speed }: { items: Framework[]; reps: number; direction: 1 | -1; speed: number }) {
  return (
    <Marquee direction={direction} speed={speed} reactToScroll={false} className="py-1">
      {Array.from({ length: reps }, (_, r) => (
        <ul key={r} aria-hidden={r > 0 || undefined} className="flex shrink-0">
          {items.map((f) => (
            <FrameworkCard key={f.name} f={f} />
          ))}
        </ul>
      ))}
    </Marquee>
  );
}

/**
 * The one marquee on the page: two lanes of framework cards moving in opposite directions.
 * Hover pauses a lane. Reduced motion shows static, scrollable rows.
 */
export function FrameworkCards() {
  return (
    <section aria-labelledby="frameworks-heading" className="overflow-hidden pb-section">
      <div className="px-page">
        <h2 id="frameworks-heading" className="type-h2 mx-auto max-w-3xl text-center text-fg">
          One governance action. Every framework satisfied.
        </h2>
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:mt-14 sm:gap-4">
        <Lane items={GLOBAL} reps={2} direction={-1} speed={38} />
        <Lane items={REGIONAL} reps={2} direction={1} speed={38} />
      </div>
    </section>
  );
}
