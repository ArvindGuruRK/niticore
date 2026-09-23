import { HeroCopy } from "./hero-copy";
import { HeroDoodles } from "./hero-doodles";

/**
 * Centred hero. Copy sits on the middle axis under the nav pill, with hand-drawn line art in the
 * side margins (see HeroDoodles). The governance fabric is not used here: it lives in
 * components/illustrations for a later section.
 */
export function Hero() {
  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden">
      <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
      <HeroDoodles />

      <div className="px-page">
        {/* Mobile-only top padding adds --safe-top on top of the base 7rem (now 9rem): the nav's own
            position already grows with the notch (see --banner-h), so without matching that here, a
            notched phone (e.g. iPhone 12) shrinks the visual gap by however much the notch eats — the
            heading reads as stuck to the navbar even though desktop/tablet (sm:/lg:, no notch math
            needed) look fine. The extra +2rem on top of that is genuine breathing room, not just the
            safe-area fix. */}
        <div className="mx-auto flex min-h-[100dvh] max-w-7xl items-center justify-center px-4 pb-52 pt-[calc(9rem+var(--safe-top))] sm:px-5 sm:pb-36 sm:pt-32 lg:px-6 lg:pb-28 lg:pt-28">
          <HeroCopy />
        </div>
      </div>

      {/* Blend the hero into the ticker below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-canvas"
      />
    </section>
  );
}
