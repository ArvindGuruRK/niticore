import Image from "next/image";
import { Buildings } from "@phosphor-icons/react/dist/ssr/Buildings";
import { VerticalTabs } from "@/components/motion/vertical-tabs";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

type Framework = {
  id: string;
  name: string;
  reference: string;
  status: string;
  logo: string | null;
  tone: string;
  functions?: string[];
  capabilities: { title: string; body: string }[];
};

/** Framework mark, shown bare (no tile behind it). DIFC has no logo file, so it gets the same
 *  building glyph as the landing cards. */
function Logo({ src, size }: { src: string | null; size: "sm" | "lg" }) {
  const box = size === "sm" ? "size-12" : "size-20";
  return src ? (
    <Image src={src} alt="" width={192} height={192} className={cn("shrink-0 object-contain", box)} />
  ) : (
    <Buildings weight="fill" aria-hidden className={cn("shrink-0 text-fg", box)} />
  );
}

/**
 * The five frameworks from the simulator above (docs/content/03 §2 and §3), one side tab each, the
 * panel in the framework's card tone. Cycles by itself every 3 seconds, without stopping; a click jumps to that framework and carries on.
 */
export function FrameworkExplorer({ frameworks }: { frameworks: Framework[] }) {
  return (
    <VerticalTabs
      label="Frameworks"
      interval={3}
      tabs={frameworks.map((f) => ({
        id: f.id,
        // Keys: these elements are built inside .map() and handed to a client component
        label: (
          <span key={f.id} className="flex items-center gap-4">
            <Logo src={f.logo} size="sm" />
            <span className="flex flex-col">
              <span className="type-h4 text-fg">{f.name}</span>
              <span className="type-small">{f.reference}</span>
            </span>
          </span>
        ),
        content: (
          <div
            key={f.id}
            className={cn(
              "flex h-full flex-col gap-8 rounded-panel border border-white/10 p-card shadow-panel sm:p-10",
              CARD_TONES[f.tone as CardTone].className,
            )}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Logo src={f.logo} size="lg" />
              <div className="flex flex-col gap-1">
                <h3 className="type-h2 text-fg">{f.name}</h3>
                <p className="type-body text-fg/80">{f.reference}</p>
              </div>
            </div>
            <p className="type-lead max-w-2xl text-fg/90">{f.status}</p>
            {f.functions && (
              <ul className="flex flex-wrap gap-2" aria-label="Core functions">
                {f.functions.map((fn) => (
                  <li key={fn} className="rounded-control bg-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wide text-fg">
                    {fn}
                  </li>
                ))}
              </ul>
            )}
            <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {f.capabilities.map((c) => (
                <li key={c.title} className="flex flex-col gap-1.5">
                  <p className="type-h4 text-fg">{c.title}</p>
                  <p className="type-small text-fg/80">{c.body}</p>
                </li>
              ))}
            </ul>
          </div>
        ),
      }))}
    />
  );
}
