import { GovernanceFabric } from "./governance-fabric";
import { HeroCopy } from "./hero-copy";

/**
 * Hero gutters mirror the nav pill (16/24px outside, 16/20/24px inside, max-w-7xl), so the
 * copy lines up with the logo on the left and the fabric ends at the pill's right edge.
 */
export function Hero() {
  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden">
      <div aria-hidden className="grid-bg absolute inset-0 -z-10" />

      {/* Mobile: fabric sits under the copy. Desktop: fabric owns the right two thirds of the container. */}
      <div className="pointer-events-none absolute inset-0 -z-10 px-4 sm:px-6">
        <div className="relative mx-auto h-full max-w-7xl">
          <GovernanceFabric className="fabric-mask absolute inset-x-0 bottom-0 h-[48%] w-full lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[68%]" />
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <div className="mx-auto flex min-h-[100dvh] max-w-7xl items-start px-4 pb-16 pt-28 sm:px-5 sm:pt-32 lg:items-center lg:px-6 lg:pt-24">
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
