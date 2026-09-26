import { FlipCard } from "@/components/motion/flip-card";
import { Reveal } from "@/components/motion/reveal";
import { CARD_TONES, type CardTone } from "@/lib/card-tones";
import { cn } from "@/lib/utils";

type Track = {
  name: string;
  for: string;
  duration: string;
  format: string;
  description: string;
  audience: string;
  tone: string;
  image: string;
  alt: string;
};

/**
 * docs/content/05 §1: the three Masterclass tracks as flip cards. The front is the card-tone panel
 * with the duration as its hero (4 hours, 2 days, 1 day); tapping turns it over to a photo. Cards
 * tilt toward the pointer. All three are the same height, with the audience line pinned to the bottom.
 * The faces are static (no cursor spotlight): a surface that turns in 3D must not repaint every frame.
 * Photos are placeholder photography (same source as the landing agentic cards) until real ones arrive.
 */
export function Tracks({ tracks }: { tracks: Track[] }) {
  return (
    <Reveal stagger className="grid gap-4 lg:grid-cols-3">
      {tracks.map((t) => {
        const tone = CARD_TONES[t.tone as CardTone];
        return (
          <FlipCard
            key={t.name}
            label={`Show a photo for the ${t.name}`}
            backLabel={`Show the ${t.name} details`}
            front={
              <div
                className={cn(
                  "flex h-full flex-col gap-6 rounded-panel border border-white/10 p-6 shadow-panel sm:p-8",
                  tone.className,
                )}
              >
                <div className="flex flex-col gap-1 pr-12">
                  <h3 className="type-h3 text-fg">{t.name}</h3>
                  <p className="type-body text-fg/80">{t.for}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="type-display -ms-[0.04em] text-fg">{t.duration}</p>
                  <p className="type-small text-fg/80">{t.format}</p>
                </div>
                <p className="type-body text-fg/90">{t.description}</p>
                <p className="type-small mt-auto font-semibold text-fg">{t.audience}</p>
              </div>
            }
            back={
              <div className="relative h-full overflow-hidden rounded-panel border border-white/10 shadow-panel">
                {/* eslint-disable-next-line @next/next/no-img-element -- external placeholder, swap for the real asset later */}
                <img src={t.image} alt={t.alt} decoding="async" className="absolute inset-0 size-full object-cover" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6 sm:p-8">
                  <p className="type-h3 text-fg">{t.name}</p>
                  <p className="type-body text-fg/85">
                    {t.duration} · {t.format}
                  </p>
                </div>
              </div>
            }
          />
        );
      })}
    </Reveal>
  );
}
