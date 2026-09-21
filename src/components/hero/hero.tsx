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
        <div className="mx-auto flex min-h-[100dvh] max-w-7xl items-center justify-center px-4 pb-52 pt-28 sm:px-5 sm:pb-36 sm:pt-32 lg:px-6 lg:pb-28 lg:pt-28">
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
